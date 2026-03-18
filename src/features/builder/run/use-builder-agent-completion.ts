import { useCallback, type MutableRefObject } from 'react';
import type { ProjectStructure } from '@/types/project';
import type { AgentStep } from '@/hooks/useUnifiedOrchestrator';
import type { ChatMessage } from '@/hooks/useChatHistory';
import type { ProjectVersion } from '@/hooks/useProjectVersions';
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

function inferProjectLabel(prompt?: string): string {
  const value = String(prompt || '').toLowerCase();
  if (/интернет-магазин|магазин|store|shop|ecommerce/.test(value)) return 'интернет-магазин';
  if (/лендинг|landing/.test(value)) return 'лендинг';
  if (/dashboard|дашборд/.test(value)) return 'дашборд';
  if (/портфолио|portfolio/.test(value)) return 'портфолио';
  if (/приложени|app\b|сервис/.test(value)) return 'приложение';
  if (/сайт|website/.test(value)) return 'сайт';
  return 'проект';
}

function sanitizeCompletionHeadline(value?: string): string | null {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  if (/^generation complete$/i.test(text)) return null;
  if (/\.tsx\b|\.ts\b|\.jsx\b|\.js\b/i.test(text)) return null;
  if (/основные компоненты|adk sequentialagent|generate operations|critic review/i.test(text)) return null;
  if (text.length < 24) return null;
  if (!/[.!?…]$/.test(text)) return null;
  return text;
}

function buildUserFacingCompletionMessage(params: {
  lastUserMsg?: string;
  fileCount: number;
  hadExistingFiles: boolean;
  backendCompleteStepText?: string;
  creditsWarning?: string;
}): string {
  const projectLabel = inferProjectLabel(params.lastUserMsg);
  const safeHeadline = sanitizeCompletionHeadline(params.backendCompleteStepText);
  const headline = safeHeadline || (
    params.hadExistingFiles
      ? `Обновил текущий ${projectLabel}.`
      : `Собрал первый вариант ${projectLabel}.`
  );

  const details = [
    params.fileCount > 0
      ? 'Уже есть рабочая структура интерфейса и основные пользовательские сценарии.'
      : 'Подготовил рабочий каркас и базовую структуру проекта.',
    projectLabel === 'интернет-магазин'
      ? 'Дальше можно точечно доработать каталог, карточку товара, корзину и оформление заказа.'
      : 'Если нужно, дальше можно точечно доработать стиль, контент и отдельные экраны.',
  ];

  return formatRunFinalMessage({
    headline,
    details,
    extraNote: params.creditsWarning,
  });
}

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
  ) => Promise<ChatMessage | null>;
  saveAgentResponse: (
    content: string,
    agentSteps: Array<Record<string, unknown>>,
    additionalMetadata?: Record<string, unknown>,
    pid?: string
  ) => Promise<ChatMessage | null>;
  spendCreditsByTokens: (tokens: number, reason: string) => Promise<number | null>;
  spendCredits: (amount: number, reason: string) => Promise<boolean>;
  runStartedAtRef: MutableRefObject<number | null>;
  currentRunIdRef: MutableRefObject<string | null>;
  runStatsRef: MutableRefObject<RunStats>;
  updatePersistedRun: (
    runId: string,
    payload: {
      status?: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
      summary?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
      versionId?: string | null;
      latestMessageId?: string | null;
      completedAt?: string | null;
    }
  ) => Promise<unknown>;
  replacePersistedRunEvents: (
    runId: string,
    events: Array<{
      seq?: number;
      eventType: string;
      label: string;
      status: 'info' | 'success' | 'error';
      phase?: string | null;
      toolName?: string | null;
      path?: string | null;
      payload?: Record<string, unknown>;
      createdAt?: string | number | null;
    }>
  ) => Promise<unknown>;
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
  updatePersistedRun,
  replacePersistedRunEvents,
  resetSession,
}: UseBuilderAgentCompletionParams) {
  return useCallback(async (files: Record<string, string>, steps?: AgentStep[]) => {
    const filesCreatedList = Object.keys(files);
    const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content;
    const runId = currentRunIdRef.current;
    const stepList = dedupeAgentSteps(steps || []);
    const persistedStepList = stepList.filter((step) => {
      if (!step || step.type === 'internal_event') return false;
      if (step.type === 'text' || step.type === 'thinking') return false;
      if (step.type === 'phase' || step.type === 'validation') return false;
      if (step.type === 'tool_call') return false;
      if (step.type === 'tool_result') {
        const data = step.data as { path?: string; action?: string } | undefined;
        return Boolean(data?.path || data?.action);
      }
      return true;
    });
    const hadExistingFiles = Boolean(reactProject?.files && reactProject.files.length > 0);

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
    if (chargedCredits == null) {
      extraNote = `Списание кредитов не подтверждено. Плановый расход: ${estimatedCredits}.`;
    }

    const versionLabel = hadExistingFiles
      ? `Итерация: ${filesCreatedCount} файлов`
      : `Первая генерация: ${filesCreatedCount} файлов`;
    const version = await createProjectVersion(files, versionLabel);
    const versionDiff = buildVersionDiff(version as ProjectVersion | null);
    const versionRef = version
      ? {
          id: String(version.id || ''),
          number: Number(version.version_number || 0),
          createdAt: String(version.created_at || ''),
          message: String(version.message || ''),
        }
      : null;
    const fileOpsCount = versionDiff?.filesChanged.length || runStatsRef.current.fileOps;
    const timeline = normalizeAgentStepsToTimeline(persistedStepList);
    const backendCompleteStepText = [...persistedStepList]
      .reverse()
      .find((step) => step.type === 'complete' && typeof step.content === 'string' && step.content.trim())
      ?.content?.trim();

    const summaryContent = buildUserFacingCompletionMessage({
      lastUserMsg,
      fileCount: filesCreatedCount,
      hadExistingFiles,
      backendCompleteStepText,
      creditsWarning: extraNote,
    });

    if (persistedStepList.length > 0) {
      const telemetrySteps = persistedStepList.map((step) => {
        const data = step.data as
          | { path?: string; action?: string; errorCode?: string; stage?: string; shortReason?: string }
          | undefined;
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
            ...((data as Record<string, unknown>) || {}),
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
      });
      const savedMessage = await saveAgentResponse(
        summaryContent,
        persistedStepList,
        {
          model: 'gemini-routing',
          duration: runDurationMs,
          chatUiEventContractVersion: CHAT_UI_EVENT_CONTRACT_VERSION,
          runId,
          chatTimeline: timeline,
          telemetrySteps,
          versionDiff,
          versionRef,
          runSummary: buildRunSummary({
              status: 'success',
              stats: { steps: persistedStepList.length, tools: toolCount, fileOps: fileOpsCount },
              workedSeconds,
              creditsUsed,
              totalTokens: tokenUsage.totalTokens,
          }),
        },
        projectId
      );
      if (runId) {
        const runSummary = buildRunSummary({
          status: 'success',
          stats: { steps: persistedStepList.length, tools: toolCount, fileOps: fileOpsCount },
          workedSeconds,
          creditsUsed,
          totalTokens: tokenUsage.totalTokens,
        });
        await updatePersistedRun(runId, {
          status: 'completed',
          summary: runSummary as unknown as Record<string, unknown>,
          metadata: {
            versionDiff,
            versionRef,
          },
          versionId: versionRef?.id || null,
          latestMessageId: savedMessage?.id || null,
          completedAt: new Date().toISOString(),
        });
        await replacePersistedRunEvents(
          runId,
          timeline.map((event, index) => ({
            seq: index + 1,
            eventType: event.eventType,
            label: event.label,
            status: event.status,
            phase: event.phase || null,
            toolName: event.toolName || null,
            path: event.path || null,
            createdAt: event.timestamp,
            payload: {},
          }))
        );
      }
    } else {
      const runSummary = buildRunSummary({
        status: 'success',
        stats: { steps: 0, tools: 0, fileOps: fileOpsCount },
        workedSeconds,
        creditsUsed,
        totalTokens: tokenUsage.totalTokens,
      });
      const savedMessage = await addMessage(
        {
          role: 'assistant',
          content: summaryContent,
          metadata: {
            chatUiEventContractVersion: CHAT_UI_EVENT_CONTRACT_VERSION,
            runId,
            versionDiff,
            versionRef,
            runSummary,
          },
        },
        projectId
      );
      if (runId) {
        await updatePersistedRun(runId, {
          status: 'completed',
          summary: runSummary as unknown as Record<string, unknown>,
          metadata: {
            versionDiff,
            versionRef,
          },
          versionId: versionRef?.id || null,
          latestMessageId: savedMessage?.id || null,
          completedAt: new Date().toISOString(),
        });
        await replacePersistedRunEvents(runId, []);
      }
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
    updatePersistedRun,
    replacePersistedRunEvents,
    spendCredits,
    spendCreditsByTokens,
  ]);
}
