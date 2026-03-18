import { useCallback } from 'react';
import { toast } from 'sonner';
import { toUserFacingGenerationError } from './user-facing-error';
import type { ChatMessage } from '@/hooks/useChatHistory';
import type {
  BuilderContext,
  PreprocessedPrompt,
  AttachedFileMetadata,
} from '@/hooks/usePromptPreprocessor';
import type { UploadedFile } from '@/hooks/useFileUpload';
import type { ClarificationQuestion, ClarificationResult } from '@/types/clarification';
import type { ProjectStructure } from '@/types/project';
import { CREDITS_ESTIMATED_RESERVE } from '@/lib/credits-pricing';
import type { BuilderRunAgentOptions } from './use-builder-orchestrator-runner';

type ProjectType = 'website' | 'tma';

interface LastPreprocessResult {
  language?: string;
  forceDeepReview?: boolean;
  minQualityScore?: number;
  recreateFromScratch?: boolean;
  planDetailLevel?: 'none' | 'micro' | 'standard' | 'detailed' | null;
  planTaskLimit?: number | null;
}

type BuilderWindow = Window & {
  __lastPreprocessResult?: LastPreprocessResult;
};

function buildFallbackClarificationQuestions(prompt: string): ClarificationQuestion[] {
  const value = prompt.toLowerCase();

  if (/интернет-магазин|магазин|store|shop|ecommerce/.test(value)) {
    return [
      {
        id: 'store_style',
        question: 'Какой стиль нужен для магазина?',
        options: ['Современный', 'Минималистичный', 'Премиальный', 'Яркий'],
        allowCustom: true,
      },
      {
        id: 'store_scope',
        question: 'Что включить в первую версию?',
        options: ['Каталог + корзина', 'Каталог + карточка товара + корзина', 'Полный flow с checkout'],
        allowCustom: true,
      },
      {
        id: 'store_hero',
        question: 'Что показать на первом экране?',
        options: ['Баннер с CTA', 'Хиты продаж', 'Категории', 'Акции'],
        allowCustom: true,
      },
    ];
  }

  if (/лендинг|landing|сайт|website/.test(value)) {
    return [
      {
        id: 'site_style',
        question: 'Какой визуальный стиль нужен?',
        options: ['Минималистичный', 'Современный', 'Премиальный', 'Яркий'],
        allowCustom: true,
      },
      {
        id: 'site_sections',
        question: 'Какие секции критичны в первой версии?',
        options: ['Hero', 'Преимущества', 'Отзывы', 'Тарифы', 'Контакты'],
        allowMultiple: true,
        allowCustom: true,
      },
    ];
  }

  if (/приложени|app\b|сервис|dashboard|дашборд/.test(value)) {
    return [
      {
        id: 'app_priority',
        question: 'Что важнее в первой версии?',
        options: ['Главный экран', 'Навигация', 'Авторизация', 'Основной сценарий пользователя'],
        allowMultiple: true,
        allowCustom: true,
      },
      {
        id: 'app_style',
        question: 'Какой нужен визуальный тон?',
        options: ['Сдержанный', 'Технологичный', 'Яркий', 'Премиальный'],
        allowCustom: true,
      },
    ];
  }

  return [];
}

function shouldAskFallbackClarification(params: {
  prompt: string;
  hasProject: boolean;
  hasAttachedFiles: boolean;
  actionType?: string | null;
  targetType?: string | null;
}): boolean {
  if (params.hasProject || params.hasAttachedFiles) return false;
  if (params.actionType && !['create', 'add', 'improve', 'other'].includes(params.actionType)) return false;

  const text = params.prompt.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 10) return false;

  if (!/(интернет-магазин|магазин|store|shop|ecommerce|лендинг|landing|сайт|website|приложени|app\b|сервис|dashboard|дашборд)/i.test(text)) {
    return false;
  }

  if (/(в стиле|цвет|палитр|бренд|по референсу|как на|с анимац|dark|light|checkout|stripe|supabase)/i.test(text)) {
    return false;
  }

  return !params.targetType || ['project', 'page', 'code', 'other'].includes(params.targetType);
}

export interface BuilderIntentIndicator {
  actionType: string;
  target: string;
  complexity: 'low' | 'medium' | 'high';
}

export interface PendingSubmitData {
  prompt: string;
  processedPrompt: string;
  complexity: 'low' | 'medium' | 'high';
  planDetailLevel?: 'none' | 'micro' | 'standard' | 'detailed';
  planTaskLimit?: number;
  actionType: string | null;
  initialFiles: Record<string, string>;
  initialPackages: string[];
}

interface UseBuilderSubmitFlowParams {
  prompt: string;
  isGenerating: boolean;
  isPreprocessing: boolean;
  user: { id?: string } | null;
  messages: ChatMessage[];
  project: { id?: string; name?: string } | null;
  projectType: ProjectType;
  reactProject: ProjectStructure | null;
  fileUpload: {
    files: UploadedFile[];
    hasFiles: boolean;
    clearFiles: () => void;
    buildFileContext: () => string;
  };
  ensureAuthedProject: (projectName?: string) => Promise<{ id?: string } | null>;
  hasCredits: (credits: number) => boolean;
  addMessage: (
    message: { role: 'user' | 'assistant' | 'system'; content: string; metadata?: Record<string, unknown> },
    pid?: string
  ) => Promise<unknown>;
  setMessages: (messages: ChatMessage[]) => void;
  setPrompt: (prompt: string) => void;
  preprocess: (
    prompt: string,
    context?: BuilderContext,
    options?: { attachedFiles?: AttachedFileMetadata[] }
  ) => Promise<PreprocessedPrompt>;
  analyzePromptComplexity: (text: string) => 'low' | 'medium' | 'high';
  runAgentWithContext: (options: BuilderRunAgentOptions) => Promise<void>;
  intentIndicator: BuilderIntentIndicator | null;
  setIntentIndicator: (indicator: BuilderIntentIndicator | null) => void;
  pendingSubmitData: PendingSubmitData | null;
  setPendingSubmitData: (data: PendingSubmitData | null) => void;
  setClarificationQuestions: (questions: ClarificationQuestion[] | string[]) => void;
  setShowClarification: (show: boolean) => void;
}

function toAttachedFilesMetadata(files: UploadedFile[]): AttachedFileMetadata[] {
  return files.map((file) => ({
    type: file.type,
    name: file.name,
    url: file.url && !file.url.startsWith('data:') ? file.url : undefined,
    preview: file.preview?.slice(0, 500),
  }));
}

function buildConversationState(
  messages: ChatMessage[],
  latestUserRequest: string,
  conversationLanguage?: string
): NonNullable<BuilderContext['conversationState']> {
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
    /(шаблон|плохо|хуйня|не то|передел|лучше|улучш|дизайн|крив|слаб|верстк|layout|типограф|отступ|съехал|съехало|почин|исправ)/i.test(latestUserRequest)
      ? latestUserRequest.slice(0, 240)
      : lastAssistantMessage
      ? `Refine current project based on last result: ${lastAssistantMessage.slice(0, 160)}`
      : undefined;

  const resolvedLanguage =
    conversationLanguage ||
    (/[а-яё]/i.test(userMessages[0]?.content || latestUserRequest)
      ? /[їієґ]/i.test(userMessages[0]?.content || latestUserRequest)
        ? 'uk'
        : 'ru'
      : /[\u4e00-\u9fff]/.test(userMessages[0]?.content || latestUserRequest)
        ? 'zh'
        : /[\u3040-\u30ff]/.test(userMessages[0]?.content || latestUserRequest)
          ? 'ja'
          : /[\uac00-\ud7af]/.test(userMessages[0]?.content || latestUserRequest)
            ? 'ko'
            : /[\u0600-\u06ff]/.test(userMessages[0]?.content || latestUserRequest)
              ? 'ar'
              : 'en');

  return {
    latestUserRequest: latestUserRequest.slice(0, 240),
    previousUserRequest,
    lastAssistantMessage,
    projectGoal,
    activeIssue,
    conversationLanguage: resolvedLanguage,
  };
}

export function useBuilderSubmitFlow({
  prompt,
  isGenerating,
  isPreprocessing,
  user,
  messages,
  project,
  projectType,
  reactProject,
  fileUpload,
  ensureAuthedProject,
  hasCredits,
  addMessage,
  setMessages,
  setPrompt,
  preprocess,
  analyzePromptComplexity,
  runAgentWithContext,
  intentIndicator,
  setIntentIndicator,
  pendingSubmitData,
  setPendingSubmitData,
  setClarificationQuestions,
  setShowClarification,
}: UseBuilderSubmitFlowParams) {
  const handleClarificationComplete = useCallback(async (result: ClarificationResult) => {
    setShowClarification(false);
    setClarificationQuestions([]);

    if (!pendingSubmitData) return;

    const clarificationText = result.formattedText ||
      result.answers
        .map((answer) => {
          const answerParts: string[] = [];
          if (answer.selectedOptions.length > 0) {
            answerParts.push(answer.selectedOptions.join(', '));
          }
          if (answer.customAnswer?.trim()) {
            answerParts.push(answer.customAnswer.trim());
          }
          return answerParts.join('; ');
        })
        .filter(Boolean)
        .join('\n');

    const clarifiedPrompt = clarificationText
      ? `${pendingSubmitData.processedPrompt}\n\nУточнения пользователя:\n${clarificationText}`
      : pendingSubmitData.processedPrompt;

    if (project?.id && clarificationText) {
      await addMessage({ role: 'user', content: `Уточнения:\n${clarificationText}` }, project.id);
    }

    await runAgentWithContext({
      processedPrompt: clarifiedPrompt,
      complexity: pendingSubmitData.complexity,
      actionType: pendingSubmitData.actionType,
      targetType: 'code',
      initialFiles: pendingSubmitData.initialFiles,
      initialPackages: pendingSubmitData.initialPackages,
      planDetailLevel: pendingSubmitData.planDetailLevel,
      planTaskLimit: pendingSubmitData.planTaskLimit,
    });

    setPendingSubmitData(null);
    setTimeout(() => setIntentIndicator(null), 2000);
  }, [
    addMessage,
    pendingSubmitData,
    project?.id,
    projectType,
    runAgentWithContext,
    setClarificationQuestions,
    setIntentIndicator,
    setPendingSubmitData,
    setShowClarification,
  ]);

  const handleClarificationSkip = useCallback(async () => {
    setShowClarification(false);
    setClarificationQuestions([]);

    if (!pendingSubmitData) return;

    await runAgentWithContext({
      processedPrompt: pendingSubmitData.processedPrompt,
      complexity: pendingSubmitData.complexity,
      actionType: pendingSubmitData.actionType,
      targetType: 'code',
      initialFiles: pendingSubmitData.initialFiles,
      initialPackages: pendingSubmitData.initialPackages,
      planDetailLevel: pendingSubmitData.planDetailLevel,
      planTaskLimit: pendingSubmitData.planTaskLimit,
    });

    setPendingSubmitData(null);
    setTimeout(() => setIntentIndicator(null), 2000);
  }, [
    addMessage,
    pendingSubmitData,
    project?.id,
    projectType,
    runAgentWithContext,
    setClarificationQuestions,
    setIntentIndicator,
    setPendingSubmitData,
    setShowClarification,
  ]);

  const handleSubmit = useCallback(async () => {
    console.log('📤 handleSubmit called', {
      prompt: prompt.slice(0, 30),
      isGenerating,
      isPreprocessing,
      hasUser: !!user,
    });

    if (!prompt.trim() && !fileUpload.hasFiles) {
      console.log('⚠️ Empty prompt and no files, skipping');
      return;
    }

    if (isGenerating) {
      console.log('⚠️ Already generating, skipping');
      toast.info('Генерация уже идёт');
      return;
    }

    if (isPreprocessing) {
      console.log('⚠️ Preprocessing in progress, skipping');
      return;
    }

    if (!user) {
      console.log('⚠️ No user, showing auth gate');
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      };
      setMessages([...messages, userMessage]);
      setPrompt('');
      return;
    }

    const ensuredProject = await ensureAuthedProject(prompt.slice(0, 48));
    const pid = ensuredProject?.id || project?.id;
    if (!pid) {
      console.error('❌ No project ID available');
      toast.error('Не удалось создать проект', {
        description: 'Попробуйте обновить страницу или войти заново',
      });
      setPrompt(prompt);
      return;
    }

    if (!hasCredits(CREDITS_ESTIMATED_RESERVE)) {
      toast.error('Недостаточно кредитов', {
        description: `Нужно минимум ${CREDITS_ESTIMATED_RESERVE} кредитов для запуска`,
      });
      return;
    }

    const attachedFilesMetadata = toAttachedFilesMetadata(fileUpload.files);
    const hasAttachedFiles = attachedFilesMetadata.length > 0;
    const attachedImageUrls = fileUpload.files
      .filter((file) => file.type === 'image' && file.url)
      .map((file) => file.url as string);

    const fileContext = fileUpload.buildFileContext();
    const currentPrompt = prompt + fileContext;
    setPrompt('');
    fileUpload.clearFiles();

    await addMessage({ role: 'user', content: currentPrompt }, pid);

    const initialFiles = reactProject
      ? Object.fromEntries(reactProject.files.map((file) => [file.path, file.content]))
      : {};
    const initialPackages = reactProject?.dependencies ? Object.keys(reactProject.dependencies) : [];

    const builderContext: BuilderContext = {
      environment: 'builder',
      hasProject: !!reactProject && reactProject.files.length > 0,
      projectName: project?.name,
      projectType,
      existingFiles: reactProject?.files.map((file) => file.path).slice(0, 20),
      recentActions: messages.slice(-3).map((message) =>
        message.role === 'user' ? message.content.slice(0, 50) : 'AI response'
      ),
      conversationState: buildConversationState(
        messages,
        currentPrompt,
        (window as BuilderWindow).__lastPreprocessResult?.language
      ),
    };

    let processedPrompt = currentPrompt;
    let aiSuggestedComplexity: 'low' | 'medium' | 'high' | null = null;
    let actionType: string | null = null;
    let targetType = 'code';
    let planDetailLevel: 'none' | 'micro' | 'standard' | 'detailed' | null = null;
    let planTaskLimit: number | null = null;

    try {
      const preprocessResult = await preprocess(currentPrompt, builderContext, {
        attachedFiles: attachedFilesMetadata,
      });

      if (preprocessResult.cleaned) {
        processedPrompt = preprocessResult.cleaned;
        aiSuggestedComplexity = preprocessResult.suggestedComplexity;
        actionType = preprocessResult.actionType;
        targetType = preprocessResult.target;
        planDetailLevel = preprocessResult.planDetailLevel;
        planTaskLimit = preprocessResult.planTaskLimit;

        const runtimeWindow = window as BuilderWindow;
        runtimeWindow.__lastPreprocessResult = {
          language: preprocessResult.language,
          forceDeepReview: preprocessResult.forceDeepReview,
          minQualityScore: preprocessResult.minQualityScore,
          recreateFromScratch: preprocessResult.recreateFromScratch,
          planDetailLevel: preprocessResult.planDetailLevel,
          planTaskLimit: preprocessResult.planTaskLimit,
        };

        setIntentIndicator({
          actionType: preprocessResult.actionType,
          target: preprocessResult.target,
          complexity: preprocessResult.suggestedComplexity,
        });

        if (preprocessResult.needsClarification && preprocessResult.clarifyingQuestions?.length) {
          const complexity = aiSuggestedComplexity || analyzePromptComplexity(processedPrompt);
          setPendingSubmitData({
            prompt: currentPrompt,
            processedPrompt,
            complexity,
            planDetailLevel: preprocessResult.planDetailLevel,
            planTaskLimit: preprocessResult.planTaskLimit,
            actionType,
            initialFiles,
            initialPackages,
          });
          setClarificationQuestions(preprocessResult.clarifyingQuestions);
          setShowClarification(true);
          return;
        }

        if (
          shouldAskFallbackClarification({
            prompt: currentPrompt,
            hasProject: Boolean(reactProject?.files.length),
            hasAttachedFiles,
            actionType,
            targetType,
          })
        ) {
          const fallbackQuestions = buildFallbackClarificationQuestions(currentPrompt);
          if (fallbackQuestions.length > 0) {
            const complexity = aiSuggestedComplexity || analyzePromptComplexity(processedPrompt);
            setPendingSubmitData({
              prompt: currentPrompt,
              processedPrompt,
              complexity,
              planDetailLevel: preprocessResult.planDetailLevel,
              planTaskLimit: preprocessResult.planTaskLimit,
              actionType,
              initialFiles,
              initialPackages,
            });
            setClarificationQuestions(fallbackQuestions);
            setShowClarification(true);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Preprocessing failed, using original prompt:', err);
    }

    let localComplexity: 'low' | 'medium' | 'high' = 'medium';
    let complexity: 'low' | 'medium' | 'high' = 'medium';

    try {
      localComplexity = analyzePromptComplexity(processedPrompt);
      complexity = aiSuggestedComplexity || localComplexity;
    } catch (err) {
      console.warn('Complexity analysis failed:', err);
      complexity = aiSuggestedComplexity || 'medium';
    }

    const runtimeWindow = window as BuilderWindow;
    const reviewOptions = {
      forceDeepReview: runtimeWindow.__lastPreprocessResult?.forceDeepReview ?? false,
      minQualityScore: runtimeWindow.__lastPreprocessResult?.minQualityScore ?? 70,
    };

    try {
      await runAgentWithContext({
        processedPrompt,
        complexity,
        actionType,
        targetType,
        initialFiles,
        initialPackages,
        reviewOptions,
        attachedImages: attachedImageUrls,
        planDetailLevel: planDetailLevel || undefined,
        planTaskLimit: planTaskLimit || undefined,
      });
    } catch (agentErr) {
      console.error('❌ Agent execution failed:', agentErr);
      const safeError = toUserFacingGenerationError(
        agentErr instanceof Error ? agentErr.message : String(agentErr || '')
      );
      toast.error('Ошибка генерации', {
        description: safeError,
      });
    }

    if (intentIndicator) {
      setTimeout(() => setIntentIndicator(null), 2000);
    }
  }, [
    addMessage,
    analyzePromptComplexity,
    ensureAuthedProject,
    fileUpload,
    hasCredits,
    intentIndicator,
    isGenerating,
    isPreprocessing,
    messages,
    preprocess,
    project?.id,
    project?.name,
    projectType,
    prompt,
    reactProject,
    runAgentWithContext,
    setClarificationQuestions,
    setIntentIndicator,
    setMessages,
    setPendingSubmitData,
    setPrompt,
    setShowClarification,
    user,
  ]);

  return {
    handleSubmit,
    handleClarificationComplete,
    handleClarificationSkip,
  };
}
