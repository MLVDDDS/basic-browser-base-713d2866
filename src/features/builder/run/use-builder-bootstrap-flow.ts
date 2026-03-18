import { useCallback, useEffect, useRef } from 'react';
import type { ChatMessage } from '@/hooks/useChatHistory';
import type { PipelineMode } from '@/hooks/useUnifiedOrchestrator';
import type { Project } from '@/hooks/useProject';

type ProjectType = 'website' | 'tma';

interface PendingProjectState {
  prompt: string;
  [key: string]: unknown;
}

interface UseBuilderBootstrapFlowParams {
  authLoading: boolean;
  pendingLoaded: boolean;
  isNewProject: boolean;
  user: { id?: string } | null;
  initialPromptFromState?: string;
  isGuestFromState?: boolean;
  pendingProject: PendingProjectState | null;
  projectType: ProjectType;
  savePendingProject: (payload: {
    prompt: string;
    projectType: ProjectType;
    libraries: string[];
    template: string | null;
    style: string | null;
  }) => void;
  clearPendingProject: () => void;
  setMessages: (messages: ChatMessage[]) => void;
  setIsGuestMode: (value: boolean) => void;
  setShowAuthGate: (value: boolean) => void;
  setGuestFakeProgress: (value: number) => void;
  createProject: (payload: { name: string; type: ProjectType }) => Promise<Project | null>;
  addMessage: (
    message: { role: 'user' | 'assistant' | 'system'; content: string },
    pid?: string
  ) => Promise<ChatMessage | null>;
  setProject: (project: Project | null) => void;
  runOrchestrator: (
    prompt: string,
    initialFiles?: Record<string, string>,
    initialPackages?: string[],
    runOptions?: { mode?: PipelineMode; projectId?: string; userId?: string }
  ) => Promise<void>;
}

export function useBuilderBootstrapFlow({
  authLoading,
  pendingLoaded,
  isNewProject,
  user,
  initialPromptFromState,
  isGuestFromState,
  pendingProject,
  projectType,
  savePendingProject,
  clearPendingProject,
  setMessages,
  setIsGuestMode,
  setShowAuthGate,
  setGuestFakeProgress,
  createProject,
  addMessage,
  setProject,
  runOrchestrator,
}: UseBuilderBootstrapFlowParams) {
  const guestIntervalRef = useRef<number | null>(null);
  const guestStartedRef = useRef(false);
  const authGateShownRef = useRef(false);
  const initialPromptProcessedRef = useRef(false);

  const clearGuestInterval = useCallback(() => {
    if (guestIntervalRef.current) {
      window.clearInterval(guestIntervalRef.current);
      guestIntervalRef.current = null;
    }
  }, []);

  const runAuthenticatedBootstrap = useCallback(
    async (promptToRun: string) => {
      const userMessage: ChatMessage = {
        id: `pending_${Date.now()}`,
        role: 'user',
        content: promptToRun,
        timestamp: new Date(),
      };
      setMessages([userMessage]);

      const created = await createProject({
        name: promptToRun.slice(0, 48) || 'Новый проект',
        type: projectType,
      });

      if (!created) return;

      const savedMessage = await addMessage({ role: 'user', content: promptToRun }, created.id);
      if (savedMessage) {
        setMessages([savedMessage]);
      }

      setProject(created);

      await runOrchestrator(promptToRun, {}, [], {
        mode: 'low',
        projectId: created.id,
        userId: user?.id,
      });

      window.history.replaceState({ projectType, keepRunning: true }, '', `/builder/${created.id}`);
    },
    [addMessage, createProject, projectType, runOrchestrator, setMessages, setProject, user?.id]
  );

  useEffect(() => {
    return () => {
      clearGuestInterval();
    };
  }, [clearGuestInterval]);

  useEffect(() => {
    if (authLoading || !pendingLoaded || !isNewProject) return;

    if (user && initialPromptFromState && !initialPromptProcessedRef.current) {
      initialPromptProcessedRef.current = true;
      void runAuthenticatedBootstrap(initialPromptFromState);
      return;
    }

    if (user && pendingProject && !initialPromptProcessedRef.current) {
      initialPromptProcessedRef.current = true;
      guestStartedRef.current = false;
      authGateShownRef.current = false;
      setIsGuestMode(false);
      setShowAuthGate(false);

      const resumePrompt = pendingProject.prompt;
      clearPendingProject();
      void runAuthenticatedBootstrap(resumePrompt);
      return;
    }

    const promptToUse = initialPromptFromState || pendingProject?.prompt;
    const isGuest = !user && (isGuestFromState || !!pendingProject);

    if (!isGuest || !promptToUse || guestStartedRef.current) return;

    guestStartedRef.current = true;
    setIsGuestMode(true);

    if (!pendingProject) {
      savePendingProject({
        prompt: promptToUse,
        projectType,
        libraries: [],
        template: null,
        style: null,
      });
    }

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: `${now}_user`,
      role: 'user',
      content: promptToUse,
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: `${now}_assistant`,
      role: 'assistant',
      content: 'Окей, начинаю сборку. Сначала проанализирую промпт…',
      timestamp: new Date(),
    };

    let localMessages: ChatMessage[] = [userMessage, assistantMessage];
    setMessages(localMessages);

    setGuestFakeProgress(0);
    let currentProgress = 0;
    let step = 0;

    const steps = [
      'Разбираю требования и структуру страницы…',
      'Собираю компоненты (Hero, Features, Pricing, Signup)…',
      'Подбираю стили и адаптив…',
      'Готовлю файлы проекта и зависимости…',
    ];

    clearGuestInterval();
    guestIntervalRef.current = window.setInterval(() => {
      currentProgress += Math.random() * 8 + 2;
      if (currentProgress > 35) currentProgress = 35;
      setGuestFakeProgress(currentProgress);

      if (!authGateShownRef.current && currentProgress >= 10) {
        authGateShownRef.current = true;
        setShowAuthGate(true);
      }

      if (currentProgress >= (step + 1) * 8 && step < steps.length) {
        step += 1;
        const idx = localMessages.findIndex((m) => m.id === assistantMessage.id);
        if (idx !== -1) {
          const base = 'Окей, начинаю сборку.\n\n';
          const bullets = steps.slice(0, step).map((s) => `• ${s}`).join('\n');
          localMessages = localMessages.map((m, i) =>
            i === idx
              ? {
                  ...m,
                  content:
                    base +
                    bullets +
                    (authGateShownRef.current
                      ? '\n\nЧтобы продолжить — войдите или зарегистрируйтесь.'
                      : ''),
                }
              : m
          );
          setMessages(localMessages);
        }
      }

      if (currentProgress >= 35) {
        clearGuestInterval();
        if (!authGateShownRef.current) {
          authGateShownRef.current = true;
          setShowAuthGate(true);
        }
      }
    }, 400);
  }, [
    authLoading,
    clearGuestInterval,
    clearPendingProject,
    initialPromptFromState,
    isGuestFromState,
    isNewProject,
    pendingLoaded,
    pendingProject,
    projectType,
    runAuthenticatedBootstrap,
    savePendingProject,
    setGuestFakeProgress,
    setIsGuestMode,
    setMessages,
    setShowAuthGate,
    user,
  ]);
}
