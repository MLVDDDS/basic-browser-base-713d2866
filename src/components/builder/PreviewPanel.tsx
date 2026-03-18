/**
 * PreviewPanel - MEMOIZED to prevent re-renders during panel resize
 */
import { useRef, useCallback, memo, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  Lock,
  ArrowRight,
  Wand2,
  Zap,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  RotateCcw,
  RefreshCcw,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TelegramFrame } from '@/components/builder/TelegramFrame';
import { cn } from '@/lib/utils';
import { isApiConfigured } from '@/lib/api-client';
import { useAutofix, AutofixStep, AutofixResult } from '@/hooks/useAutofix';
import { usePreviewSession } from '@/hooks/usePreviewSession';
import type { ProjectStructure, ProjectFile } from '@/types/project';
import { toast } from 'sonner';

// Debounce delay for autofix (ms)
const AUTOFIX_DEBOUNCE_MS = 2000;

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type ProjectType = 'website' | 'tma';

export interface PreviewPanelProps {
  projectType: ProjectType;
  viewMode: ViewMode;
  tmaScale: number;
  
  // Content state
  hasContent: boolean;
  isGenerating: boolean;
  reactProject: ProjectStructure | null;
  onFilesChange: (project: ProjectStructure) => void;
  
  // Orchestrator info
  orchestratorIteration: number;
  orchestratorMaxIterations: number;
  currentPhase?: string | null;
  
  // Error handling
  onShowLogs: () => void;
  onTryFix: () => void;
  isFixing: boolean;
  
  // Guest mode
  isGuestMode: boolean;
  guestFakeProgress: number;
  showAuthGate: boolean;
  onAuthGateClick: () => void;
  
  // Autofix
  projectId?: string;
  enableAutofix?: boolean;
  
  className?: string;
}

const viewModeWidth: Record<ViewMode, string> = { 
  desktop: '100%', 
  tablet: '768px', 
  mobile: '375px' 
};

function getPreviewStatusMeta({
  status,
  runtimeState,
  isStarting,
  hasError,
}: {
  status: string | null;
  runtimeState: string | null;
  isStarting: boolean;
  hasError: boolean;
}) {
  if (hasError) {
    return { label: 'Ошибка', tone: 'error' as const };
  }
  if (isStarting || status === 'queued') {
    return { label: 'Запуск', tone: 'info' as const };
  }
  if (runtimeState === 'recovering') {
    return { label: 'Восстановление', tone: 'warn' as const };
  }
  if (status === 'running' || runtimeState === 'building') {
    return { label: 'Сборка', tone: 'warn' as const };
  }
  if (status === 'ready' || runtimeState === 'ready') {
    return { label: 'Готов', tone: 'success' as const };
  }
  return { label: status || 'Ожидание', tone: 'info' as const };
}

function buildFilesMap(project: ProjectStructure | null): Record<string, string> {
  if (!project) return {};
  const files: Record<string, string> = {};
  for (const file of project.files) {
    if (!file.path) continue;
    const normalized = file.path.startsWith('/') ? file.path : `/${file.path}`;
    files[normalized] = file.content || '';
  }
  return files;
}

// Helper to infer file type and language from path
function inferFileMetadata(path: string): Pick<ProjectFile, 'type' | 'language'> {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const fileName = path.split('/').pop() || '';
  
  let type: ProjectFile['type'] = 'component';
  let language: ProjectFile['language'] = 'tsx';
  
  // Determine language
  if (ext === 'ts') language = 'ts';
  else if (ext === 'tsx') language = 'tsx';
  else if (ext === 'css') language = 'css';
  else if (ext === 'json') language = 'json';
  else if (ext === 'html') language = 'html';
  
  // Determine type
  if (path.includes('/hooks/') || fileName.startsWith('use')) type = 'hook';
  else if (path.includes('/utils/') || path.includes('/lib/')) type = 'util';
  else if (ext === 'css') type = 'style';
  else if (ext === 'json' || fileName.includes('config')) type = 'config';
  else if (path.includes('/pages/')) type = 'page';
  else if (path.includes('/assets/')) type = 'asset';
  
  return { type, language };
}

// Autofix Overlay Component
function AutofixOverlay({
  steps,
  progress,
  onCancel
}: {
  steps: AutofixStep[];
  progress: number;
  onCancel: () => void;
}) {
  const currentStep = steps[steps.length - 1];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Autofix</h3>
              <p className="text-xs text-muted-foreground">Исправление ошибки...</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">{progress}%</p>
        </div>
        
        {/* Current step */}
        {currentStep && (
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="text-xs font-medium capitalize">{currentStep.type.replace('_', ' ')}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{currentStep.content}</p>
          </div>
        )}
        
        {/* Recent steps */}
        {steps.length > 1 && (
          <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
            {steps.slice(-5, -1).reverse().map((step) => (
              <div key={step.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                <span className="truncate">{step.content}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Autofix Result Toast Component  
function AutofixResultToast({
  result,
  onDismiss
}: {
  result: AutofixResult;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 right-4 z-50"
    >
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-lg border shadow-lg",
        result.success 
          ? "bg-green-500/10 border-green-500/30" 
          : "bg-destructive/10 border-destructive/30"
      )}>
        {result.success ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-destructive" />
        )}
        <div>
          <p className="font-medium text-sm">
            {result.success ? 'Ошибка исправлена!' : 'Не удалось исправить'}
          </p>
          <p className="text-xs text-muted-foreground">
            {result.attemptCount} попыток • {(result.duration / 1000).toFixed(1)}с
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={onDismiss}>
          <X className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
}

// Generating Overlay - blocks preview during generation
function GeneratingOverlay({
  phase,
  filesCount,
}: {
  phase?: string | null;
  filesCount: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute right-4 top-4 z-30"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-full border border-border/70 bg-background/90 p-2 shadow-sm backdrop-blur"
      >
        <motion.div
          className="relative h-7 w-7"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <motion.div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <motion.div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent" />
          <Sparkles className="absolute inset-0 m-auto h-3.5 w-3.5 text-primary" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Memoized to prevent re-renders during resize drag
export const PreviewPanel = memo<PreviewPanelProps>(function PreviewPanel({
  projectType,
  viewMode,
  tmaScale,
  hasContent,
  isGenerating,
  reactProject,
  onFilesChange,
  orchestratorIteration,
  orchestratorMaxIterations,
  currentPhase,
  onShowLogs,
  onTryFix,
  isFixing,
  isGuestMode,
  guestFakeProgress,
  showAuthGate,
  onAuthGateClick,
  projectId,
  enableAutofix = true,
  className,
}) {
  // Autofix hook
  const autofix = useAutofix();
  
  // Debounce refs for autofix
  const autofixTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingErrorRef = useRef<string | null>(null);
  
  // Apply autofix result when complete
  const handleAutofixComplete = useCallback((files: Record<string, string>) => {
    if (!reactProject) return;
    
    const updatedFiles = reactProject.files.map(file => {
      const newContent = files[file.path];
      return newContent ? { ...file, content: newContent } : file;
    });
    
    // Add any new files with proper metadata
    const existingPaths = new Set(reactProject.files.map(f => f.path));
    const newFiles: ProjectFile[] = Object.entries(files)
      .filter(([path]) => !existingPaths.has(path))
      .map(([path, content]) => ({
        path,
        content,
        ...inferFileMetadata(path)
      }));
    
    onFilesChange({
      ...reactProject,
      files: [...updatedFiles, ...newFiles]
    });
  }, [reactProject, onFilesChange]);

  // Execute autofix with current pending error
  const executeAutofix = useCallback(async () => {
    const error = pendingErrorRef.current;
    if (!error || !enableAutofix || autofix.isRunning || isFixing) return;
    
    // Clear pending error
    pendingErrorRef.current = null;
    
    // Get current file contents for context
    const files = reactProject?.files.reduce((acc, f) => {
      acc[f.path] = f.content;
      return acc;
    }, {} as Record<string, string>) || {};
    
    const result = await autofix.run({
      files,
      errorMessage: error,
      context: `Project: ${projectId || 'preview'}, Framework: React + TypeScript`,
      onFileChange: (path, content) => {
        // Update file in real-time
        if (reactProject) {
          const updatedFiles = reactProject.files.map(f => 
            f.path === path ? { ...f, content } : f
          );
          onFilesChange({ ...reactProject, files: updatedFiles });
        }
      }
    });
    
    if (result?.success && result.files) {
      handleAutofixComplete(result.files);
    }
  }, [enableAutofix, autofix, isFixing, reactProject, projectId, onFilesChange, handleAutofixComplete]);

  // Handle build error with debounced autofix
  const handleBuildError = useCallback((error: string) => {
    if (!enableAutofix || autofix.isRunning || isFixing) return;
    
    // Store the latest error
    pendingErrorRef.current = error;
    
    // Clear existing timeout
    if (autofixTimeoutRef.current) {
      clearTimeout(autofixTimeoutRef.current);
    }
    
    // Set new debounced timeout
    autofixTimeoutRef.current = setTimeout(() => {
      autofixTimeoutRef.current = null;
      executeAutofix();
    }, AUTOFIX_DEBOUNCE_MS);
  }, [enableAutofix, autofix.isRunning, isFixing, executeAutofix]);

  // Cancel pending autofix when build succeeds
  const handleBuildSuccess = useCallback(() => {
    if (autofixTimeoutRef.current) {
      clearTimeout(autofixTimeoutRef.current);
      autofixTimeoutRef.current = null;
      pendingErrorRef.current = null;
      console.log('[PreviewPanel] Build success - cancelled pending autofix');
    }
  }, []);

  // Check if App.tsx has real content - lowered threshold and check for JSX
  const hasRealContent = reactProject && 
    reactProject.files.length > 0 && 
    reactProject.files.some(f => 
      f.path.includes('App.tsx') && 
      f.content && 
      (f.content.trim().length > 20 || f.content.includes('return'))
    );

  const apiEnabled = isApiConfigured();
  // Start server preview only when the generated app shell is present.
  // This avoids creating failing sessions on empty/scaffold-only projects.
  const serverPreviewEnabled = Boolean(projectId) && !isGuestMode && apiEnabled && hasRealContent;
  const previewUnavailableMessage = !apiEnabled
    ? 'Preview API не настроен'
    : isGuestMode
    ? 'Войдите, чтобы включить серверный preview'
    : !projectId
    ? 'Сохраните проект, чтобы включить серверный preview'
    : 'Preview недоступен';
  const previewSession = usePreviewSession({
    projectId,
    enabled: serverPreviewEnabled,
  });
  const primaryPreviewUrl = previewSession.previewUrl || null;
  const previewError = previewSession.error;
  const canRestartPreview = previewSession.canRestart && !previewSession.isStarting;
  const restartPreviewSession = previewSession.restartSession;
  const pushPreviewFiles = previewSession.pushFiles;
  const [previewRefreshNonce, setPreviewRefreshNonce] = useState(0);
  const previewStatusMeta = useMemo(
    () =>
      getPreviewStatusMeta({
        status: previewSession.status,
        runtimeState: previewSession.runtimeState,
        isStarting: previewSession.isStarting,
        hasError: Boolean(previewError),
      }),
    [previewSession.status, previewSession.runtimeState, previewSession.isStarting, previewError]
  );
  const previewViewportIcon = viewMode === 'desktop' ? Monitor : viewMode === 'tablet' ? Tablet : Smartphone;
  const previewViewportLabel = viewMode === 'desktop' ? 'Desktop' : viewMode === 'tablet' ? 'Tablet' : 'Mobile';

  const handlePreviewReload = useCallback(() => {
    setPreviewRefreshNonce((prev) => prev + 1);
  }, []);

  const handleOpenPreviewInNewTab = useCallback(() => {
    if (!primaryPreviewUrl) {
      toast.info('Preview URL пока недоступен');
      return;
    }
    window.open(primaryPreviewUrl, '_blank', 'noopener,noreferrer');
  }, [primaryPreviewUrl]);

  const handleCopyPreviewUrl = useCallback(async () => {
    if (!primaryPreviewUrl) {
      toast.info('Preview URL пока недоступен');
      return;
    }
    try {
      await navigator.clipboard.writeText(primaryPreviewUrl);
      toast.success('Preview URL скопирован');
    } catch {
      toast.error('Не удалось скопировать URL');
    }
  }, [primaryPreviewUrl]);

  const handleRestartFromToolbar = useCallback(() => {
    if (!canRestartPreview) return;
    void restartPreviewSession();
  }, [canRestartPreview, restartPreviewSession]);
  const syncTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!serverPreviewEnabled || !primaryPreviewUrl) return;
    if (!reactProject) return;
    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current);
    }
    const files = buildFilesMap(reactProject);
    syncTimerRef.current = window.setTimeout(() => {
      pushPreviewFiles(files);
    }, 800);
    return () => {
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, [
    primaryPreviewUrl,
    pushPreviewFiles,
    reactProject,
    serverPreviewEnabled,
  ]);

  // TMA Preview - centered phone mockup with animated appearance
  if (projectType === 'tma') {
    return (
      <main 
        data-tour="preview" 
        className={cn(
          "flex-1 h-full min-h-0 overflow-hidden relative flex items-center justify-center",
          "bg-gradient-to-br from-background via-muted/10 to-primary/5",
          className
        )}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />
        </div>
        
        {/* Centered phone frame with entrance animation */}
        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.23, 1, 0.32, 1] // cubic-bezier for smooth spring-like effect
          }}
          key="tma-phone-frame"
        >
          <TelegramFrame scale={tmaScale} fullScreen={hasRealContent}>
            {/* Render real content (server preview) if available, otherwise placeholder */}
            {hasRealContent ? (
              <div className="w-full h-full relative">
                {serverPreviewEnabled ? (
                  previewError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                      <AlertCircle className="w-6 h-6 text-destructive mb-2" />
                      <span className="text-xs text-muted-foreground">Preview ошибка: {previewError}</span>
                      {canRestartPreview && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 h-7 text-xs"
                          onClick={() => {
                            void restartPreviewSession();
                          }}
                        >
                          Перезапустить preview
                        </Button>
                      )}
                    </div>
                  ) : primaryPreviewUrl ? (
                    <iframe
                      title="TMA Preview"
                      src={primaryPreviewUrl}
                      className="w-full h-full block"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-center p-4">
                      <Loader2 className="w-6 h-6 text-primary animate-spin mr-2" />
                      <span className="text-xs text-muted-foreground">Поднимаю серверный preview...</span>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <Lock className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">{previewUnavailableMessage}</span>
                  </div>
                )}
                
                {/* Generating overlay for TMA */}
                <AnimatePresence>
                  {isGenerating && (
                    <GeneratingOverlay 
                      phase={currentPhase}
                      filesCount={reactProject.files.length}
                    />
                  )}
                </AnimatePresence>
                
                {/* Autofix overlay for TMA */}
                <AnimatePresence>
                  {autofix.isRunning && !isGenerating && (
                    <AutofixOverlay 
                      steps={autofix.steps}
                      progress={autofix.progress}
                      onCancel={autofix.cancel}
                    />
                  )}
                </AnimatePresence>
              </div>
            ) : isGenerating ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mb-4"
                >
                  <Loader2 className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-xs text-muted-foreground">Создаю приложение...</p>
              </div>
            ) : !hasContent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <Wand2 className="w-8 h-8 text-muted-foreground/30 mb-4" />
                <p className="text-xs text-muted-foreground">Опиши приложение в чате</p>
              </div>
            ) : (
              /* Placeholder UI while loading */
              <div className="p-3 space-y-3">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-1">Добро пожаловать!</h3>
                  <p className="text-xs text-muted-foreground">Загрузка...</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-lg p-3 border border-border animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-muted mb-2" />
                      <div className="h-2 w-16 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TelegramFrame>
        </motion.div>
        
        {/* Autofix Result Toast - outside phone for visibility */}
        <AnimatePresence>
          {autofix.result && !autofix.isRunning && (
            <AutofixResultToast 
              result={autofix.result}
              onDismiss={autofix.reset}
            />
          )}
        </AnimatePresence>
      </main>
    );
  }

  // Loading state during generation (NO content yet)
  if (isGenerating && !hasRealContent) {
    return (
      <main data-tour="preview" className={cn("flex-1 h-full min-h-0 bg-muted/20 overflow-hidden relative", className)}>
        <GeneratingAnimation filesCount={reactProject?.files.length || 0} />
      </main>
    );
  }

  // React Sandbox with generated project
  if (hasRealContent) {
    const isCompactViewport = viewMode !== 'desktop';
    const compactViewportWidth = viewModeWidth[viewMode];
    const PreviewViewportIcon = previewViewportIcon;
    return (
      <main data-tour="preview" className={cn("flex-1 h-full min-h-0 bg-muted/20 overflow-hidden relative", className)}>
        <div className="flex h-10 items-center gap-1.5 border-b border-border/60 bg-background/85 px-2.5">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px]">
            <PreviewViewportIcon className="h-3.5 w-3.5" />
            {previewViewportLabel}
          </Button>
          <div className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                previewStatusMeta.tone === "success" && "bg-emerald-500",
                previewStatusMeta.tone === "warn" && "bg-amber-500",
                previewStatusMeta.tone === "error" && "bg-red-500",
                previewStatusMeta.tone === "info" && "bg-blue-500"
              )}
            />
            {previewStatusMeta.label}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopyPreviewUrl}
              title="Скопировать URL preview"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleOpenPreviewInNewTab}
              title="Открыть preview в новой вкладке"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePreviewReload}
              title="Обновить iframe"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleRestartFromToolbar}
              disabled={!canRestartPreview}
              title="Перезапустить preview-сессию"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onShowLogs}
              title="Показать диагностические логи"
            >
              <AlertCircle className="h-3.5 w-3.5" />
            </Button>
            {previewError ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onTryFix}
                title="Запустить авто-исправление"
              >
                <Wand2 className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
        </div>
        <div
          className={cn(
            "h-[calc(100%-2.5rem)] w-full",
            isCompactViewport && "flex items-start justify-center overflow-auto p-3"
          )}
        >
          <div
            className={cn(
              "h-full w-full",
              isCompactViewport && "min-h-[520px] overflow-hidden rounded-xl border bg-background shadow-lg"
            )}
            style={isCompactViewport ? { width: compactViewportWidth, maxWidth: '100%' } : undefined}
          >
            <div className="h-full w-full">
              {serverPreviewEnabled ? (
                previewError ? (
                  <PreviewSkeleton
                    message={`Preview ошибка: ${previewError}`}
                    actionLabel={canRestartPreview ? "Перезапустить preview" : undefined}
                    onAction={
                      canRestartPreview
                        ? () => {
                            void restartPreviewSession();
                          }
                        : undefined
                    }
                  />
                ) : primaryPreviewUrl ? (
                  <iframe
                    key={`preview-${previewRefreshNonce}`}
                    title="Preview"
                    src={primaryPreviewUrl}
                    className="w-full h-full block"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <PreviewSkeleton message="Поднимаю серверный preview..." />
                )
              ) : (
                <PreviewSkeleton message={previewUnavailableMessage} />
              )}
            </div>
          </div>
        </div>
        
        {/* Generating Overlay - blocks preview during generation */}
        <AnimatePresence>
          {isGenerating && (
            <GeneratingOverlay 
              iteration={orchestratorIteration}
              maxIterations={orchestratorMaxIterations}
              phase={currentPhase}
              filesCount={reactProject.files.length}
            />
          )}
        </AnimatePresence>
        
        {/* Autofix Progress Overlay */}
        <AnimatePresence>
          {autofix.isRunning && !isGenerating && (
            <AutofixOverlay 
              steps={autofix.steps}
              progress={autofix.progress}
              onCancel={autofix.cancel}
            />
          )}
        </AnimatePresence>
        
        {/* Autofix Result Toast */}
        <AnimatePresence>
          {autofix.result && !autofix.isRunning && (
            <AutofixResultToast 
              result={autofix.result}
              onDismiss={autofix.reset}
            />
          )}
        </AnimatePresence>
      </main>
    );
  }

  // Files exist but App.tsx incomplete - show skeleton loading
  if (reactProject && reactProject.files.length > 0) {
    return (
      <main data-tour="preview" className={cn("flex-1 h-full min-h-0 bg-muted/20 overflow-hidden relative", className)}>
        <PreviewSkeleton message="Подготовка превью..." />
      </main>
    );
  }

  // Guest mode skeleton
  if (isGuestMode) {
    return (
      <main data-tour="preview" className={cn("flex-1 h-full min-h-0 bg-muted/20 overflow-hidden relative flex items-center justify-center", className)}>
        <GuestPreviewSkeleton 
          viewMode={viewMode}
          progress={guestFakeProgress}
          showAuthGate={showAuthGate}
          onAuthGateClick={onAuthGateClick}
        />
      </main>
    );
  }

  // Empty state
  return (
    <main data-tour="preview" className={cn("flex-1 h-full min-h-0 bg-muted/20 overflow-hidden relative flex items-center justify-center", className)}>
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <Wand2 className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <p className="text-sm text-muted-foreground">Введи промпт слева — и здесь появится сайт</p>
      </div>
    </main>
  );
});
PreviewPanel.displayName = 'PreviewPanel';

// Generation Animation Component
function GeneratingAnimation({ 
  filesCount 
}: { 
  filesCount: number;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div 
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated logo/icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Text */}
        <div className="text-center space-y-3">
          <motion.p 
            className="text-xl font-medium text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Генерируем ваш сайт
          </motion.p>
          <motion.p 
            className="text-sm text-muted-foreground max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            ИИ создаёт компоненты, стили и структуру...
          </motion.p>
        </div>
        
        {/* Progress dots */}
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        
        {/* Status info */}
        {filesCount > 0 && (
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="px-3 py-1 bg-primary/10 rounded-full">
              <span className="text-xs text-primary">
                {filesCount} файлов создано
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Preview Skeleton Component - smooth loading state
function PreviewSkeleton({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="w-full h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      {/* Browser chrome skeleton */}
      <div className="bg-muted/30 border-b border-border px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-muted animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-muted animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="flex-1 h-6 bg-muted/50 rounded-full max-w-xs mx-auto animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <motion.div 
            className="h-8 w-32 bg-gradient-to-r from-muted/60 via-muted/30 to-muted/60 rounded-lg"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% 100%' }}
          />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                className="h-4 w-16 bg-muted/40 rounded"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>

        {/* Hero skeleton */}
        <div className="space-y-4 pt-8">
          <motion.div 
            className="h-10 w-3/4 bg-gradient-to-r from-muted/70 via-muted/40 to-muted/70 rounded-xl"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% 100%' }}
          />
          <motion.div 
            className="h-5 w-1/2 bg-muted/40 rounded-lg"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
        </div>

        {/* Image placeholder skeleton */}
        <motion.div 
          className="h-48 w-full bg-gradient-to-br from-primary/10 via-muted/20 to-primary/5 rounded-xl"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Features grid skeleton */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              className="bg-muted/30 rounded-xl p-5 space-y-3"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10" />
              <div className="h-4 w-24 bg-muted/50 rounded" />
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-muted/40 rounded" />
                <div className="h-2.5 w-3/4 bg-muted/40 rounded" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
        {actionLabel && onAction && (
          <div className="flex items-center justify-center pt-3">
            <Button size="sm" variant="outline" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Guest Preview Skeleton Component
function GuestPreviewSkeleton({ 
  viewMode,
  progress,
  showAuthGate,
  onAuthGateClick
}: { 
  viewMode: ViewMode;
  progress: number;
  showAuthGate: boolean;
  onAuthGateClick: () => void;
}) {
  return (
    <div 
      className="bg-card rounded-lg border border-border overflow-hidden shadow-lg transition-all relative"
      style={{ width: viewModeWidth[viewMode], maxWidth: '100%' }}
    >
      {/* Browser chrome */}
      <div className="bg-muted/30 border-b border-border px-3 py-1.5 flex items-center gap-2 relative z-20">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
          <div className="w-2 h-2 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-[10px] text-muted-foreground">lyubakod.app/p/new-project</span>
        </div>
      </div>

      {/* Fake website skeleton */}
      <div className="min-h-[600px] bg-background p-6 space-y-6 relative">
        {/* Hero skeleton */}
        <div className="space-y-4">
          <motion.div 
            className="h-8 w-48 bg-gradient-to-r from-muted/80 via-muted/40 to-muted/80 rounded-lg"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% 100%' }}
          />
          <motion.div 
            className="h-4 w-72 bg-gradient-to-r from-muted/60 via-muted/30 to-muted/60 rounded"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.2 }}
            style={{ backgroundSize: '200% 100%' }}
          />
          <motion.div 
            className="h-4 w-56 bg-gradient-to-r from-muted/60 via-muted/30 to-muted/60 rounded"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.4 }}
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>
        
        {/* Fake hero image */}
        <motion.div 
          className="h-48 w-full bg-gradient-to-br from-primary/10 via-primary/5 to-muted/30 rounded-xl"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        
        {/* Features grid */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              className="bg-muted/40 rounded-lg p-4 space-y-3"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20" />
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-2 w-full bg-muted/60 rounded" />
              <div className="h-2 w-3/4 bg-muted/60 rounded" />
            </motion.div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="flex justify-center mt-8">
          <motion.div 
            className="h-10 w-32 bg-primary/30 rounded-full"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        
        {/* Progress indicator */}
        <div className="mt-8 px-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Анализ промпта...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Auth Gate Overlay */}
        <AnimatePresence>
          {showAuthGate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center"
            >
              <div className="absolute inset-0 backdrop-blur-md bg-background/60" />
              
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 animate-pulse" />
              </div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
                className="relative z-10 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
              >
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="w-7 h-7 text-primary" />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                    </motion.div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Почти готово!</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Авторизуйтесь, чтобы продолжить создание вашего проекта.
                  </p>
                </div>

                <div className="space-y-2 mb-6">
                  {['Сохранение всех проектов', 'История изменений', 'Публикация на свой домен'].map((feature, i) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={onAuthGateClick} 
                    className="w-full gap-2 h-11"
                    size="lg"
                  >
                    Войти или зарегистрироваться
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
