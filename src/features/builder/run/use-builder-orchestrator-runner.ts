import { useCallback } from 'react';
import type { ChatMessage } from '@/hooks/useChatHistory';
import type { PipelineMode, BuilderContext as AgentBuilderContext } from '@/hooks/useUnifiedOrchestrator';
import type { ProjectStructure } from '@/types/project';

type ProjectType = 'website' | 'tma';

type LastPreprocessResult = {
  language?: string;
  forceDeepReview?: boolean;
  minQualityScore?: number;
  recreateFromScratch?: boolean;
  planDetailLevel?: 'none' | 'micro' | 'standard' | 'detailed' | null;
  planTaskLimit?: number | null;
};

type BuilderWindow = Window & {
  __lastPreprocessResult?: LastPreprocessResult;
};

const PROJECT_SESSION_STORAGE_PREFIX = 'builder.projectSession';

function getProjectSessionStorageKey(projectId: string): string {
  return `${PROJECT_SESSION_STORAGE_PREFIX}:${projectId}`;
}

function getOrCreateProjectSessionId(projectId?: string): string | null {
  if (!projectId || typeof window === 'undefined') return null;
  const storageKey = getProjectSessionStorageKey(projectId);
  try {
    const existing = window.localStorage.getItem(storageKey)?.trim();
    if (existing) return existing;
    const next =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `ps_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(storageKey, next);
    return next;
  } catch {
    return `ps_${projectId}`;
  }
}

function detectConversationLanguageLocal(text: string): string {
  if (/[а-яё]/i.test(text)) {
    if (/[їієґ]/i.test(text)) return 'uk';
    return 'ru';
  }
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  if (/[\u3040-\u30ff]/.test(text)) return 'ja';
  if (/[\uac00-\ud7af]/.test(text)) return 'ko';
  if (/[\u0600-\u06ff]/.test(text)) return 'ar';
  return 'en';
}

function buildConversationState(messages: ChatMessage[], latestUserRequest: string, conversationLanguage?: string) {
  const userMessages = messages.filter((message) => message.role === 'user');
  const assistantMessages = messages.filter((message) => message.role === 'assistant');
  const projectGoal = userMessages[0]?.content?.slice(0, 240) || latestUserRequest.slice(0, 240);
  const previousUserRequest =
    userMessages.length > 0 ? userMessages[userMessages.length - 1]?.content?.slice(0, 240) : undefined;
  const lastAssistantMessage =
    assistantMessages.length > 0
      ? assistantMessages[assistantMessages.length - 1]?.content?.slice(0, 240)
      : undefined;
  const activeIssue =
    /(шаблон|плохо|хуйня|не то|передел|лучше|улучш|дизайн|крив|слаб)/i.test(latestUserRequest)
      ? latestUserRequest.slice(0, 240)
      : lastAssistantMessage
      ? `Refine current project based on last result: ${lastAssistantMessage.slice(0, 160)}`
      : undefined;

  return {
    latestUserRequest: latestUserRequest.slice(0, 240),
    previousUserRequest,
    lastAssistantMessage,
    projectGoal,
    activeIssue,
    conversationLanguage:
      conversationLanguage ||
      detectConversationLanguageLocal(userMessages[0]?.content || latestUserRequest),
  };
}

export interface BuilderRunAgentOptions {
  processedPrompt: string;
  complexity: 'low' | 'medium' | 'high';
  actionType: string | null;
  targetType: string;
  initialFiles: Record<string, string>;
  initialPackages: string[];
  reviewOptions?: { forceDeepReview?: boolean; minQualityScore?: number };
  attachedImages?: string[];
  planDetailLevel?: 'none' | 'micro' | 'standard' | 'detailed';
  planTaskLimit?: number;
}

interface UseBuilderOrchestratorRunnerParams {
  messages: ChatMessage[];
  reactProject: ProjectStructure | null;
  project: { id?: string; name?: string } | null;
  projectType: ProjectType;
  userId?: string;
  resetOrchestrator: () => void;
  runOrchestrator: (
    prompt: string,
    initialFiles?: Record<string, string>,
    initialPackages?: string[],
    runOptions?: {
      mode?: PipelineMode;
      projectId?: string;
      userId?: string;
      builderContext?: AgentBuilderContext;
      persistRun?: boolean;
      attachedImages?: string[];
    }
  ) => Promise<void>;
  startRunSession: () => string;
  createPersistedRun?: (payload: {
    runId: string;
    status?: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    prompt?: string;
    mode?: string | null;
    builderContext?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    startedAt?: string | null;
  }) => Promise<unknown>;
  setCurrentMode: (mode: PipelineMode | null) => void;
}

export function useBuilderOrchestratorRunner({
  messages,
  reactProject,
  project,
  projectType,
  userId,
  resetOrchestrator,
  runOrchestrator,
  startRunSession,
  createPersistedRun,
  setCurrentMode,
}: UseBuilderOrchestratorRunnerParams) {
  const analyzePromptComplexity = useCallback((text: string): 'low' | 'medium' | 'high' => {
    try {
      const wordCount = text.trim().split(/\s+/).length;

      const highPatterns = /api|database|auth|payment|admin|dashboard|realtime|websocket|supabase|integration|booking|appointment|reservation|calendar|schedule|запис|бронир|расписан/i;
      if (highPatterns.test(text) || wordCount > 50) {
        return 'high';
      }

      const mediumPatterns = /компонент|страниц|форм|таблиц|список|галере|слайдер|component|page|form|table|list|gallery|slider|section|секци/i;
      if (mediumPatterns.test(text) || wordCount > 15) {
        return 'medium';
      }

      return 'low';
    } catch (err) {
      console.warn('analyzePromptComplexity error:', err);
      return 'medium';
    }
  }, []);

  const runAgentWithContext = useCallback(async ({
    processedPrompt,
    complexity,
    actionType,
    targetType,
    initialFiles,
    initialPackages,
    reviewOptions,
    attachedImages,
    planDetailLevel,
    planTaskLimit,
  }: BuilderRunAgentOptions) => {
    const firstMessage = messages.length > 0 ? messages[0] : null;
    const recentMessages = messages.slice(-5);
    const runtimeWindow = window as BuilderWindow;

    let fullPrompt = processedPrompt;
    const isContinueCommand = /продолж|continue|resume|дальше|go on|keep going/i.test(processedPrompt);
    const recreateFromScratch = Boolean(
      runtimeWindow.__lastPreprocessResult?.recreateFromScratch
    );
    const hasExistingFiles = Object.keys(initialFiles || {}).length > 0;
    const runKind: 'initial' | 'iterative' =
      hasExistingFiles && !recreateFromScratch ? 'iterative' : 'initial';
    const projectSessionId = getOrCreateProjectSessionId(project?.id);

    if (isContinueCommand && firstMessage && firstMessage.role === 'user') {
      fullPrompt = `Продолжи работу над проектом. 

ОРИГИНАЛЬНЫЙ ЗАПРОС (что нужно создать): "${firstMessage.content}"

Проект уже начат. Нужно создать полноценный сайт с нуля или продолжить то что было начато.
Если App.tsx пустой или содержит только Hello World - создай полноценный сайт согласно оригинальному запросу.
Создай все необходимые компоненты: Header, Hero секцию, секции с контентом, Footer.`;

      console.log('📝 Expanded continue prompt with original context:', firstMessage.content.slice(0, 50));
    }

    console.log('🤖 runAgentWithContext called:', {
      prompt: fullPrompt.slice(0, 50),
      originalPrompt: processedPrompt.slice(0, 30),
      complexity,
      actionType,
      filesCount: Object.keys(initialFiles).length,
      isContinueCommand,
      reviewOptions,
      imagesCount: attachedImages?.length || 0,
    });

    const messageContext = firstMessage
      ? [firstMessage.content.slice(0, 200), ...recentMessages.map((m) => m.content.slice(0, 100))]
      : recentMessages.map((m) => m.content.slice(0, 100));

    const agentContext: AgentBuilderContext = {
      environment: 'builder',
      hasProject: !!reactProject && reactProject.files.length > 0,
      projectName: project?.name,
      projectId: project?.id,
      projectType,
      existingFiles: reactProject?.files.map((f) => f.path).slice(0, 30),
      recentMessages: messageContext,
      conversationState: buildConversationState(
        messages,
        fullPrompt,
        runtimeWindow.__lastPreprocessResult?.language
      ),
      currentFocus: 'chat',
      projectSessionId: projectSessionId || undefined,
      runKind,
      preprocessedIntent: actionType ? {
        actionType: actionType as AgentBuilderContext['preprocessedIntent']['actionType'],
        target: targetType as 'code',
        complexity,
        language: runtimeWindow.__lastPreprocessResult?.language,
        forceDeepReview: reviewOptions?.forceDeepReview,
        minQualityScore: reviewOptions?.minQualityScore,
        recreateFromScratch: runtimeWindow.__lastPreprocessResult?.recreateFromScratch,
        planDetailLevel,
        planTaskLimit,
      } : undefined,
    };

    const effectiveComplexity = isContinueCommand ? 'medium' : complexity;
    const modeMap: Record<string, PipelineMode> = {
      low: isContinueCommand ? 'low' : 'light',
      medium: 'medium',
      high: 'high',
    };
    const mode = modeMap[effectiveComplexity] || 'medium';

    console.log(`🚀 Routing to unified orchestrator, mode: ${mode}, images: ${attachedImages?.length || 0}`);
    resetOrchestrator();
    setCurrentMode(mode);
    const runId = startRunSession();
    if (project?.id && createPersistedRun) {
      void createPersistedRun({
        runId,
        status: 'running',
        prompt: fullPrompt,
        mode,
        builderContext: agentContext as unknown as Record<string, unknown>,
        metadata: {
          projectSessionId: projectSessionId || undefined,
          runKind,
          attachedImagesCount: attachedImages?.length || 0,
        },
        startedAt: new Date().toISOString(),
      });
    }
    await runOrchestrator(fullPrompt, initialFiles, initialPackages, {
      mode,
      projectId: project?.id,
      userId,
      persistRun: Boolean(project?.id),
      builderContext: agentContext,
      attachedImages,
    });
  }, [
    messages,
    project,
    projectType,
    reactProject,
    resetOrchestrator,
    runOrchestrator,
    setCurrentMode,
    startRunSession,
    createPersistedRun,
    userId,
  ]);

  return {
    analyzePromptComplexity,
    runAgentWithContext,
  };
}
