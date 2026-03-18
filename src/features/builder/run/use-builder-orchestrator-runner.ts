import { useCallback } from 'react';
import type { ChatMessage } from '@/hooks/useChatHistory';
import type { PipelineMode, BuilderContext as AgentBuilderContext } from '@/hooks/useUnifiedOrchestrator';
import type { ProjectStructure } from '@/types/project';

type ProjectType = 'website' | 'tma';

type LastPreprocessResult = {
  forceDeepReview?: boolean;
  minQualityScore?: number;
  recreateFromScratch?: boolean;
  planDetailLevel?: 'none' | 'micro' | 'standard' | 'detailed' | null;
  planTaskLimit?: number | null;
};

type BuilderWindow = Window & {
  __lastPreprocessResult?: LastPreprocessResult;
};

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
      attachedImages?: string[];
    }
  ) => Promise<void>;
  startRunSession: () => string;
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
  setCurrentMode,
}: UseBuilderOrchestratorRunnerParams) {
  const analyzePromptComplexity = useCallback((text: string): 'low' | 'medium' | 'high' => {
    try {
      const wordCount = text.trim().split(/\s+/).length;

      const highPatterns = /api|database|auth|payment|admin|dashboard|realtime|websocket|supabase|integration/i;
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

    let fullPrompt = processedPrompt;
    const isContinueCommand = /продолж|continue|resume|дальше|go on|keep going/i.test(processedPrompt);

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

    const runtimeWindow = window as BuilderWindow;
    const agentContext: AgentBuilderContext = {
      environment: 'builder',
      hasProject: !!reactProject && reactProject.files.length > 0,
      projectName: project?.name,
      projectId: project?.id,
      projectType,
      existingFiles: reactProject?.files.map((f) => f.path).slice(0, 30),
      recentMessages: messageContext,
      currentFocus: 'chat',
      preprocessedIntent: actionType ? {
        actionType: actionType as AgentBuilderContext['preprocessedIntent']['actionType'],
        target: targetType as 'code',
        complexity,
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
    startRunSession();
    await runOrchestrator(fullPrompt, initialFiles, initialPackages, {
      mode,
      projectId: project?.id,
      userId,
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
    userId,
  ]);

  return {
    analyzePromptComplexity,
    runAgentWithContext,
  };
}
