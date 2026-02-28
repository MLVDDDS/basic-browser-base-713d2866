import { useCallback, type MutableRefObject } from 'react';
import type { ProjectStructure } from '@/types/project';
import type { AgentStep } from '@/hooks/useUnifiedOrchestrator';
import type { ChatMessage } from '@/hooks/useChatHistory';
import {
  CHAT_UI_EVENT_CONTRACT_VERSION,
  buildVersionDiff,
  dedupeAgentSteps,
  extractTokenUsageFromSteps,
  normalizeAgentStepsToTimeline,
} from '@/lib/chat-ui-event-contract';
import {
  CREDITS_ESTIMATED_RESERVE,
  calculateCreditsFromTokens,
} from '@/lib/credits-pricing';
import {
  buildRunSummary,
  computeWorkedSeconds,
  formatRunFinalMessage,
  type RunStats,
} from '@/features/builder/run/run-execution';
import { mapRecordToProjectFiles } from '@/features/builder/utils/project-files';
import { buildProjectStructure } from '@/lib/code-generator';

type ProjectType = 'website' | 'tma';

interface UseBuilderAgentCompletionParams {
  projectId?: string;
  projectName?: string;
  projectType: ProjectType;
  messages: ChatMessage[];
  reactProject: ProjectStructure | null;
  setHasContent: (value: boolean) => void;
  setReactProject: (project: ProjectStructure) => void;
  fetchSmartSuggestions: (params: {
    projectType: ProjectType;
    existingFiles: string[];
    lastUserMessage?: string;
    hasCompletedBuild: boolean;
  }) => void;
  createProjectVersion: (files: Record<string, string>, label: string) => Promise<{
    version_number?: number;
    [key: string]: unknown;
  } | null>;
  addMessage: (
    message: {
      role: 'assistant' | 'system' | 'user';
      content: string;
      metadata?: Record<string, unknown>;
    },
    pid?: string
  ) => Promise<unknown>;
  saveAgentResponse: (
    content: string,
    agentSteps: Array<Record<string, unknown>>,
    additionalMetadata?: Record<string, unknown>,
    pid?: string
  ) => Promise<unknown>;
  spendCreditsByTokens: (tokens: number, reason: string) => Promise<number | null>;
  spendCredits: (amount: number, reason: string) => Promise<boolean>;
  runStartedAtRef: MutableRefObject<number | null>;
  currentRunIdRef: MutableRefObject<string | null>;
  runStatsRef: MutableRefObject<RunStats>;
  resetSession: () => void;
}

export function useBuilderAgentCompletion({
  projectId,
  projectName,
  projectType,
  messages,
  reactProject,
  setHasContent,
  setReactProject,
  fetchSmartSuggestions,
  createProjectVersion,
  addMessage,
  saveAgentResponse,
  spendCreditsByTokens,
  spendCredits,
  runStartedAtRef,
  currentRunIdRef,
  runStatsRef,
  resetSession,
}: UseBuilderAgentCompletionParams) {
  return useCallback(async (files: Record<string, string>, steps?: AgentStep[]) => {
    const filesCreatedList = Object.keys(files);
    const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content;
    const runId = currentRunIdRef.current;
    const stepList = dedupeAgentSteps(steps || []);

    setHasContent(true);

    fetchSmartSuggestions({
      projectType,
      existingFiles: reactProject?.files.map((f) => f.path) || [],
      lastUserMessage: lastUserMsg,
      hasCompletedBuild: true,
    });

    const incomingFiles = mapRecordToProjectFiles(files, {
      variant: 'full',
      includeEntryPoint: true,
    });
    const structure = buildProjectStructure(incomingFiles, projectName || 'generated-app');
    setReactProject(structure);

    if (!projectId) {
      resetSession();
      return;
    }

    const filesCreatedCount = filesCreatedList.length;
    const toolCalls = stepList.filter((step) => step.type === 'tool_call');
    const toolCount = toolCalls.length;
    const runDurationMs = runStartedAtRef.current
      ? Math.max(0, Date.now() - runStartedAtRef.current)
      : Date.now() - (stepList[0]?.timestamp || Date.now());
    const workedSeconds = Math.max(1, Math.round(runDurationMs / 1000));
    const tokenUsage = extractTokenUsageFromSteps(stepList);

    let chargedCredits: number | null = null;
    if (tokenUsage.totalTokens > 0) {
      chargedCredits = await spendCreditsByTokens(tokenUsage.totalTokens, 'agent_generation');
    } else {
      const fallbackCharged = await spendCredits(CREDITS_ESTIMATED_RESERVE, 'agent_generation');
      chargedCredits = fallbackCharged ? CREDITS_ESTIMATED_RESERVE : null;
    }

    const creditsUsed = chargedCredits ?? 0;
    const estimatedCredits = calculateCreditsFromTokens(tokenUsage.totalTokens);

    let extraNote: string | undefined;
    if (filesCreatedList.length > 0) {
      const keyFiles = filesCreatedList
        .filter((f) => f.includes('App.') || f.includes('Hero') || f.includes('Header') || f.includes('Pricing'))
        .slice(0, 3);
      if (keyFiles.length > 0) {
        extraNote = `Основные компоненты: ${keyFiles.map((f) => f.split('/').pop()).join(', ')}`;
      }
    }
    if (chargedCredits == null) {
      extraNote = `${extraNote ? `${extraNote}\n` : ''}Списание кредитов не подтверждено. Плановый расход: ${estimatedCredits}.`;
    }

    const version = await createProjectVersion(files, `Автосохранение: ${filesCreatedCount} файлов`);
    const versionDiff = buildVersionDiff(version);
    const fileOpsCount = versionDiff?.filesChanged.length || runStatsRef.current.fileOps;
    const timeline = normalizeAgentStepsToTimeline(stepList);

    const headline = filesCreatedCount > 0
      ? `✅ Готово! Создано ${filesCreatedCount} файл${filesCreatedCount === 1 ? '' : filesCreatedCount < 5 ? 'а' : 'ов'}.`
      : '✅ Готово!';

    const summaryContent = formatRunFinalMessage({
      headline,
      extraNote,
    });

    if (stepList.length > 0) {
      await saveAgentResponse(
        summaryContent,
        stepList.map((step) => {
          const data = step.data as { path?: string; action?: string } | undefined;
          const args = step.args as { path?: string } | undefined;
          const path = data?.path || args?.path;
          const action = data?.action;

          const stepType = step.type as
            | 'thinking'
            | 'tool_call'
            | 'tool_result'
            | 'text'
            | 'phase'
            | 'plan'
            | 'validation'
            | 'error'
            | 'complete'
            | 'epic'
            | 'story'
            | 'task'
            | 'intake';

          return {
            id: step.id,
            type: stepType,
            name: step.name || '',
            content: step.content || '',
            args: {
              ...((step.args as Record<string, unknown>) || {}),
              path,
              action,
            },
            success: step.success ?? true,
            timestamp: step.timestamp,
            duration: step.duration || 0,
            phase: step.phase,
            epicId: step.epicId,
            storyId: step.storyId,
            progress: step.progress,
          };
        }),
        {
          model: 'gemini-2.0-flash',
          duration: runDurationMs,
          chatUiEventContractVersion: CHAT_UI_EVENT_CONTRACT_VERSION,
          runId,
          chatTimeline: timeline,
          versionDiff,
          runSummary: buildRunSummary({
            status: 'success',
            stats: { steps: stepList.length, tools: toolCount, fileOps: fileOpsCount },
            workedSeconds,
            creditsUsed,
            totalTokens: tokenUsage.totalTokens,
          }),
        },
        projectId
      );
    } else {
      await addMessage(
        {
          role: 'assistant',
          content: summaryContent,
          metadata: {
            chatUiEventContractVersion: CHAT_UI_EVENT_CONTRACT_VERSION,
            runId,
            versionDiff,
            runSummary: buildRunSummary({
              status: 'success',
              stats: { steps: 0, tools: 0, fileOps: fileOpsCount },
              workedSeconds,
              creditsUsed,
              totalTokens: tokenUsage.totalTokens,
            }),
          },
        },
        projectId
      );
    }

    resetSession();
  }, [
    addMessage,
    createProjectVersion,
    currentRunIdRef,
    fetchSmartSuggestions,
    messages,
    projectId,
    projectName,
    projectType,
    reactProject?.files,
    resetSession,
    runStartedAtRef,
    runStatsRef,
    saveAgentResponse,
    setHasContent,
    setReactProject,
    spendCredits,
    spendCreditsByTokens,
  ]);
}
