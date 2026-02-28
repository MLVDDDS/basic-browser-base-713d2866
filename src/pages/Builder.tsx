import { useState, useCallback, useRef, useEffect, Profiler, ProfilerOnRenderCallback } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAutoHealing } from '@/hooks/useAutoHealing';
import { useProject, ReactProjectFile, Project } from '@/hooks/useProject';
import { useProjectGenerator } from '@/hooks/useProjectGenerator';
import { useProjectCache } from '@/hooks/useProjectCache';
import { useBuilderHistory } from '@/hooks/useBuilderHistory';
import { useProjectVersions } from '@/hooks/useProjectVersions';
import { useCredits } from '@/hooks/useCredits';
import { useAuth } from '@/contexts/AuthContext';
import { useOrchestratorWithLogging } from '@/hooks/useOrchestratorWithLogging';
import { PipelineMode, PipelinePhase } from '@/hooks/useUnifiedOrchestrator';
import { useChatHistory, ChatMessage } from '@/hooks/useChatHistory';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { usePendingProject } from '@/hooks/usePendingProject';
import { usePromptPreprocessor } from '@/hooks/usePromptPreprocessor';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { ProjectStructure } from '@/types/project';
import type { ClarificationQuestion } from '@/types/clarification';
import {
  CHAT_UI_EVENT_CONTRACT_VERSION,
} from '@/lib/chat-ui-event-contract';
import {
  buildRunSummary,
  computeWorkedSeconds,
  formatRunFinalMessage,
} from '@/features/builder/run/run-execution';
import { useRunLifecycle } from '@/features/builder/run/use-run-lifecycle';
import { toast } from 'sonner';
import { useLocation, useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { useAutofixOrchestrator } from '@/hooks/useAutofixOrchestrator';
import { BuilderWorkspace } from '@/features/builder/layout/BuilderWorkspace';
import { BuilderAuxOverlays } from '@/features/builder/layout/BuilderAuxOverlays';
import { useBuilderAgentCompletion } from '@/features/builder/run/use-builder-agent-completion';
import { useBuilderBootstrapFlow } from '@/features/builder/run/use-builder-bootstrap-flow';
import { useBuilderOrchestratorRunner } from '@/features/builder/run/use-builder-orchestrator-runner';
import {
  useBuilderSubmitFlow,
  type BuilderIntentIndicator,
  type PendingSubmitData,
} from '@/features/builder/run/use-builder-submit-flow';
import { useBuilderProjectMaintenance } from '@/features/builder/run/use-builder-project-maintenance';
import { useBuilderStopAction } from '@/features/builder/run/use-builder-stop-action';
import { useBuilderEffects } from '@/features/builder/actions/use-builder-effects';
import { useBuilderSurfaceActions } from '@/features/builder/actions/use-builder-surface-actions';

type ProjectType = 'website' | 'tma';
type ViewMode = 'desktop' | 'tablet' | 'mobile';

// Import smart suggestions hook
import { useSmartSuggestions, getInitialSuggestions } from '@/hooks/useSmartSuggestions';

interface AISuggestion {
  id: string;
  text: string;
  type: 'improve' | 'add' | 'fix' | 'effect';
  priority: 'high' | 'medium' | 'low';
}

interface BuilderNavState {
  projectType?: ProjectType;
  prompt?: string;
  libraries?: string[];
  template?: string | null;
  isGuest?: boolean;
}

const Builder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  
  const initialNavStateRef = useRef<BuilderNavState | null>(
    (location.state as BuilderNavState | null) ?? null
  );
  
  const navState = initialNavStateRef.current;
  const projectTypeFromState = navState?.projectType;
  const initialPromptFromState = navState?.prompt;
  const isGuestFromState = navState?.isGuest;
  
  const projectTypeFromQuery = searchParams.get('type') as ProjectType | null;
  const projectTypeFromId = id === 'tma' ? 'tma' : null;
  const isNewProject = id === 'new' || !id;
  
  // projectType state - can be updated when project loads from database
  const [projectType, setProjectType] = useState<ProjectType>(
    projectTypeFromState || projectTypeFromQuery || projectTypeFromId || 'website'
  );

  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [prompt, setPrompt] = useState('');
  const [hasContent, setHasContent] = useState(false);
  
  // Smart LLM-based suggestions
  const smartSuggestions = useSmartSuggestions();
  const { suggestions: smartSuggestionItems, fetchSuggestions: fetchSmartSuggestions } = smartSuggestions;
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(() => getInitialSuggestions());
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Sync smart suggestions when they change
  useEffect(() => {
    if (smartSuggestionItems.length > 0) {
      setSuggestions(smartSuggestionItems);
    }
  }, [smartSuggestionItems]);
  
  const [libraryCategory, setLibraryCategory] = useState<string>('all');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  const [tmaScale, setTmaScale] = useState(1);
  
  const [intentIndicator, setIntentIndicator] = useState<BuilderIntentIndicator | null>(null);
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestion[] | string[]>([]);
  const [showClarification, setShowClarification] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<PendingSubmitData | null>(null);
  
  // Autofix Orchestrator (replaces legacy smartDebugSession)
  const autofix = useAutofixOrchestrator();
  
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestFakeProgress, setGuestFakeProgress] = useState(0);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const { pendingProject, savePendingProject, clearPendingProject, isLoaded: pendingLoaded } = usePendingProject();
  
  const {
    credits,
    useCredits: spendCredits,
    useCreditsByTokens: spendCreditsByTokens,
    hasCredits,
  } = useCredits();
  
  const {
    project,
    isPublishing,
    createProject,
    saveProject,
    publishProject,
    setProject,
  } = useProject(isNewProject ? undefined : id);
  
  // Sync projectType with loaded project from database
  useEffect(() => {
    if (project?.type && project.type !== projectType) {
      console.log(`[Builder] Syncing projectType from DB: ${project.type}`);
      setProjectType(project.type as ProjectType);
    }
  }, [project?.type, projectType]);
  
  const chatHistory = useChatHistory({ projectId: project?.id, autoLoad: true });
  const { messages, addMessage, saveAgentResponse, setMessages } = chatHistory;
  
  const realtimeMessagesRef = useRef(messages);
  realtimeMessagesRef.current = messages;
  
  useRealtimeChat({
    projectId: project?.id,
    enabled: !!project?.id && !!user,
    onNewMessage: (msg) => {
      const current = realtimeMessagesRef.current;
      if (!current.some((m) => m.id === msg.id)) {
        setMessages([...current, msg]);
      }
    },
  });
  
  const {
    project: reactProject,
    isGenerating: isProjectGenerating,
    setProject: setReactProject,
  } = useProjectGenerator();
  
  const projectCache = useProjectCache();
  const [showCacheRestore, setShowCacheRestore] = useState(false);
  
  const builderHistory = useBuilderHistory({ maxSize: 50 });
  const projectVersions = useProjectVersions(project?.id || '');
  const {
    versions,
    isLoading: isVersionsLoading,
    createVersion: createProjectVersion,
    fetchVersions: fetchProjectVersions,
    restoreVersion: restoreProjectVersion,
  } = projectVersions;
  
  // File upload hook for chat attachments
  const fileUpload = useFileUpload();
  const {
    runStartedAtRef,
    currentRunIdRef,
    runStatsRef,
    startRunSession,
    resetSession,
    trackStep,
    trackFileChange,
    mergePendingFiles,
    clearPendingFiles,
    markTerminated,
    consumeTerminated,
    clearTerminated,
  } = useRunLifecycle();
  const [currentMode, setCurrentMode] = useState<PipelineMode | null>(null);
  const [currentPhase, setCurrentPhase] = useState<PipelinePhase | null>(null);

  const handleAgentComplete = useBuilderAgentCompletion({
    projectId: project?.id,
    projectName: project?.name,
    projectType,
    messages,
    reactProject: reactProject as ProjectStructure | null,
    setHasContent,
    setReactProject: (nextProject) => setReactProject(nextProject),
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
  });
  
  const orchestrator = useOrchestratorWithLogging({
    onStep: (step) => {
      trackStep(step);
    },
    onFileChange: (file) => {
      trackFileChange(file);
    },
    onPhaseChange: (phase, model) => {
      setCurrentPhase(phase);
      console.log(`[Orchestrator] Phase: ${phase} (${model})`);
    },
    onComplete: (state) => {
      console.log('[Orchestrator] Complete:', Object.keys(state.files).length, 'files');
      setCurrentMode(null);
      setCurrentPhase(null);
      clearTerminated();

      if (!state.completed) {
        resetSession(true);
        return;
      }
      
      const allFiles = mergePendingFiles(state.files);

      if (Object.keys(allFiles).length === 0) {
        toast.error('Пустой результат генерации', {
          description: 'Модель не вернула изменения. Попробуйте перезапустить генерацию с более конкретным запросом.',
        });
        resetSession(true);
        return;
      }
      
      void handleAgentComplete(allFiles, state.steps);
      clearPendingFiles();
    },
    onError: (error) => {
      console.error('[Orchestrator] Error:', error);
      toast.error('Ошибка генерации', { description: error });
      setCurrentMode(null);
      setCurrentPhase(null);
      clearPendingFiles();
      const workedSeconds = computeWorkedSeconds(runStartedAtRef.current);
      const stepsCount = runStatsRef.current.steps;
      const toolCount = runStatsRef.current.tools;
      const fileOpsCount = runStatsRef.current.fileOps;
      const runId = currentRunIdRef.current;

      const wasCancelled = consumeTerminated();
      resetSession();

      if (!wasCancelled && project?.id) {
        const content = formatRunFinalMessage({
          headline: '❌ Ошибка генерации',
          errorText: error,
          extraNote: 'Попробуйте переформулировать запрос или повторить попытку.',
        });

        addMessage({
          role: 'assistant',
          content,
          metadata: {
            chatUiEventContractVersion: CHAT_UI_EVENT_CONTRACT_VERSION,
            runId,
            runSummary: buildRunSummary({
              status: 'failed',
              stats: { steps: stepsCount, tools: toolCount, fileOps: fileOpsCount },
              workedSeconds,
              creditsUsed: 0,
              totalTokens: 0,
            }),
          },
        }, project.id);
      }
    },
  });
  
  useEffect(() => {
    if (project?.id) {
      fetchProjectVersions();
    }
  }, [project?.id, fetchProjectVersions]);
  
  const [autoHealingEnabled, setAutoHealingEnabled] = useState(false);
  const { 
    isProcessing: isHealing, 
    queueLength: healingQueue, 
    stats: healingStats 
  } = useAutoHealing({ 
    enabled: autoHealingEnabled,
    debounceMs: 1000,
    maxErrorsPerMinute: 10,
  });

  const {
    isFixingError,
    handleShowLogs,
    handleRestoreVersion,
    handleTryFix,
  } = useBuilderProjectMaintenance({
    projectId: project?.id,
    projectName: project?.name,
    userId: user?.id,
    reactProject: reactProject as ProjectStructure | null,
    setReactProject,
    setHasContent,
    addMessage,
    restoreProjectVersion,
    autofix,
  });
  
  const isGenerating = orchestrator.isRunning || isProjectGenerating;
  
  useEffect(() => {
    console.log('🔄 isGenerating changed:', {
      isGenerating,
      orchestrator: orchestrator.isRunning,
      project: isProjectGenerating
    });
  }, [isGenerating, orchestrator.isRunning, isProjectGenerating]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (orchestrator.isRunning && !orchestrator.steps.length) {
        console.log('⚠️ Orchestrator stuck after timeout, resetting...');
        orchestrator.reset();
      }
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [orchestrator]);
  
  const onboarding = useOnboarding('builder');
  
  const {
    isListening: isRecording,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    language: 'ru-RU',
    continuous: true,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        setPrompt(prev => prev + text);
      }
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  }, [isRecording, startListening, stopListening]);

  useEffect(() => {
    if (orchestrator.error) {
      toast.error('Ошибка оркестратора', { description: orchestrator.error });
    }
  }, [orchestrator.error]);

  // Fetch smart suggestions when messages change (after generation)
  useEffect(() => {
    if (isGenerating || messages.length === 0) return;
    
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop();
    
    // Only fetch if we have content
    const hasBuild = hasContent || (reactProject?.files.length || 0) > 0;
    if (!hasBuild) return;
    
    fetchSmartSuggestions({
      projectType: projectType,
      existingFiles: reactProject?.files.map(f => f.path) || [],
      lastUserMessage: lastUserMsg?.content,
      lastAssistantMessage: lastAssistantMsg?.content,
      hasCompletedBuild: hasBuild,
    });
  }, [messages, isGenerating, hasContent, reactProject?.files, projectType, fetchSmartSuggestions]);

  const hasSavedRef = useRef(false);
  
  useEffect(() => {
    if (orchestrator.completed && reactProject && !hasSavedRef.current) {
      hasSavedRef.current = true;
      
      projectCache.cacheProject(reactProject, {
        id: project?.id || `local_${Date.now()}`,
        name: project?.name || 'Новый проект',
        prompt: messages[messages.length - 2]?.content,
      });
      
      if (project?.id) {
        const filesToSave: ReactProjectFile[] = reactProject.files.map(f => ({
          path: f.path,
          content: f.content,
          type: f.type,
          language: f.language,
        }));
        saveProject({
          react_files: filesToSave,
          dependencies: reactProject.dependencies,
        }, { silent: true });
      }
    }
    
    if (orchestrator.isRunning) {
      hasSavedRef.current = false;
    }
  }, [orchestrator.completed, orchestrator.isRunning, reactProject, project?.id, project?.name, saveProject, projectCache, messages]);

  useEffect(() => {
    if (isNewProject && projectCache.isLoaded && projectCache.hasCachedProjects && !reactProject) {
      setShowCacheRestore(true);
    }
  }, [isNewProject, projectCache.isLoaded, projectCache.hasCachedProjects, reactProject]);

  useEffect(() => {
    if (project?.react_files && project.react_files.length > 0 && !reactProject) {
      const files = project.react_files.map(f => {
        let path = f.path;
        if (!path.startsWith('/')) path = '/' + path;
        if (path === '/App.tsx') path = '/src/App.tsx';
        if (path === '/main.tsx') path = '/src/main.tsx';
        if (path === '/index.css') path = '/src/index.css';
        return { ...f, path };
      });
      
      setReactProject({
        entryPoint: '/src/App.tsx',
        files,
        dependencies: project.dependencies || {},
      });
      setHasContent(true);
      // Suggestions will be fetched by the effect when hasContent changes
    }
  }, [project?.react_files, project?.dependencies, reactProject, setReactProject]);

  useBuilderBootstrapFlow({
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
    runOrchestrator: orchestrator.run,
  });

  const handleRestoreFromCache = useCallback((cached: typeof projectCache.cachedProjects[0]) => {
    setReactProject(cached.structure);
    setHasContent(true);
    // Suggestions will be fetched by the effect
    setShowCacheRestore(false);
    toast.success('Проект восстановлен из кэша', {
      description: cached.name,
    });
  }, [projectCache, setReactProject]);

  const handleAuthGateClick = useCallback(() => {
    navigate('/login', { 
      state: { 
        from: '/builder/new', 
        message: 'Войдите, чтобы продолжить создание проекта' 
      } 
    });
  }, [navigate]);

  const ensureAuthedProject = useCallback(
    async (projectName?: string) => {
      if (!user) return null;
      
      if (project?.id) return project;
      
      if (id && id !== 'new') {
        console.log('🔍 Using project ID from URL:', id);
        return { id } as Project;
      }

      const created = await createProject({
        name: projectName || 'Новый проект',
        type: projectType, // Pass actual projectType ('website' or 'tma')
      });

      if (created) {
        navigate(`/builder/${created.id}`, {
          replace: true,
          state: { projectType },
        });
      }

      return created;
    },
    [user, id, projectType, createProject, navigate, project]
  );

  const { preprocess, isPreprocessing } = usePromptPreprocessor();

  const {
    analyzePromptComplexity,
    runAgentWithContext,
  } = useBuilderOrchestratorRunner({
    messages,
    reactProject: reactProject as ProjectStructure | null,
    project,
    projectType,
    userId: user?.id,
    resetOrchestrator: orchestrator.reset,
    runOrchestrator: orchestrator.run,
    startRunSession,
    setCurrentMode,
  });
  
  const {
    handleSubmit,
    handleClarificationComplete,
    handleClarificationSkip,
  } = useBuilderSubmitFlow({
    prompt,
    isGenerating,
    isPreprocessing,
    user,
    messages,
    project,
    projectType,
    reactProject: reactProject as ProjectStructure | null,
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
  });

  const handleSuggestionClick = useCallback((suggestion: AISuggestion) => {
    setPrompt(suggestion.text);
  }, []);

  const { filteredEffects, handleApplyEffectFromLibrary } = useBuilderEffects({
    libraryCategory,
    messages,
    setMessages,
    projectId: project?.id,
    addMessage,
    reactProject: reactProject as ProjectStructure | null,
    orchestrator,
    setCurrentMode,
    startRunSession,
  });

  const {
    handleUndo,
    handleRedo,
    handlePublish,
    handleAutoHealingToggle,
  } = useBuilderSurfaceActions({
    user,
    project,
    publishProject,
    navigate,
    builderHistory,
    setReactProject,
    autoHealingEnabled,
    setAutoHealingEnabled,
  });

  const handleStop = useBuilderStopAction({
    projectId: project?.id,
    orchestrator,
    addMessage,
    currentRunIdRef,
    runStartedAtRef,
    runStatsRef,
    markTerminated,
    resetSession,
    setCurrentMode,
    setCurrentPhase,
  });

  // Stable callback refs for inline handlers
  const handleDismissCacheRestore = useCallback(() => {
    setShowCacheRestore(false);
  }, []);

  // Profiler callback for performance monitoring
  const onRenderCallback: ProfilerOnRenderCallback = useCallback((
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    // Only log if render took more than 5ms (to reduce noise)
    if (actualDuration > 5) {
      console.log(`⏱️ [Profiler] ${id}:`, {
        phase,
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
      });
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <BuilderWorkspace
        onRenderCallback={onRenderCallback}
        headerProps={{
          projectType,
          viewMode,
          onViewModeChange: setViewMode,
          tmaScale,
          onTmaScaleChange: setTmaScale,
          credits,
          canUndo: builderHistory.canUndo,
          canRedo: builderHistory.canRedo,
          historyLength: builderHistory.historyLength,
          futureLength: builderHistory.futureLength,
          onUndo: handleUndo,
          onRedo: handleRedo,
          autoHealingEnabled,
          onAutoHealingToggle: handleAutoHealingToggle,
          isHealing,
          healingQueue,
          healingStats,
          isLibraryOpen,
          onLibraryOpenChange: setIsLibraryOpen,
          libraryCategory,
          onLibraryCategoryChange: setLibraryCategory,
          filteredEffects,
          onApplyEffect: handleApplyEffectFromLibrary,
          project,
          currentProjectStructure: reactProject as ProjectStructure | null,
          versions,
          isVersionsLoading,
          onRestoreVersion: handleRestoreVersion,
          isPublishing,
          onPublish: handlePublish,
          user,
        }}
        chatProps={{
          messages,
          suggestions,
          showSuggestions,
          onShowSuggestionsChange: setShowSuggestions,
          prompt,
          onPromptChange: setPrompt,
          onSubmit: handleSubmit,
          onSuggestionClick: handleSuggestionClick,
          isGenerating,
          isPreprocessing,
          orchestratorSteps: orchestrator.steps,
          orchestratorTextOutput: orchestrator.textOutput || '',
          orchestratorIteration: orchestrator.iteration,
          orchestratorMaxIterations: orchestrator.maxIterations,
          orchestratorPendingMigration: orchestrator.pendingMigration,
          onMigrationApprove: orchestrator.approveMigration,
          onMigrationReject: orchestrator.rejectMigration,
          onStop: handleStop,
          currentMode,
          currentPhase,
          isRecording,
          isSpeechSupported,
          onToggleRecording: toggleRecording,
          intentIndicator,
          showClarification,
          clarificationQuestions,
          onClarificationComplete: handleClarificationComplete,
          onClarificationSkip: handleClarificationSkip,
          isGuestMode,
          guestFakeProgress,
          showCacheRestore,
          cachedProjects: projectCache.cachedProjects,
          hasCachedProjects: projectCache.hasCachedProjects,
          onRestoreFromCache: handleRestoreFromCache,
          onDismissCacheRestore: handleDismissCacheRestore,
          onClearCache: projectCache.clearCache,
          attachedFiles: fileUpload.files,
          onFilesAdd: fileUpload.addFiles,
          onFileRemove: fileUpload.removeFile,
          isUploading: fileUpload.isUploading,
        }}
        previewProps={{
          projectType,
          viewMode,
          tmaScale,
          hasContent,
          isGenerating,
          reactProject: reactProject as ProjectStructure | null,
          onFilesChange: setReactProject,
          projectId: project?.id,
          orchestratorIteration: orchestrator.iteration,
          orchestratorMaxIterations: orchestrator.maxIterations,
          currentPhase,
          onShowLogs: handleShowLogs,
          onTryFix: handleTryFix,
          isFixing: isFixingError,
          isGuestMode,
          guestFakeProgress,
          showAuthGate,
          onAuthGateClick: handleAuthGateClick,
          enableAutofix: false,
        }}
      />


      <BuilderAuxOverlays
        autofix={autofix}
        onboarding={onboarding}
      />
    </div>
  );
};

export default Builder;
