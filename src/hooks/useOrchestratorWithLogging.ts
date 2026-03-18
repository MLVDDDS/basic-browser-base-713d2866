/**
 * 🔧 useOrchestratorWithLogging Hook
 * Обёртка над useUnifiedOrchestrator с автоматическим логированием шагов
 */
import { useCallback, useRef } from 'react';
import { useUnifiedOrchestrator, type AgentStep, type UnifiedState, type PipelinePhase, type PipelineMode, type BuilderContext, type AgentFile } from './useUnifiedOrchestrator';
import { useAgentLogger } from './useAgentLogger';

interface UseOrchestratorWithLoggingOptions {
  onStep?: (step: AgentStep) => void;
  onFileChange?: (file: AgentFile) => void;
  onPhaseChange?: (phase: PipelinePhase, model: string) => void;
  onComplete?: (state: UnifiedState) => void;
  onError?: (error: string) => void;
}

export function useOrchestratorWithLogging(options: UseOrchestratorWithLoggingOptions = {}) {
  const logger = useAgentLogger();
  const startTimeRef = useRef<number>(0);
  const filesCountRef = useRef({ created: 0, modified: 0, deleted: 0 });
  
  // Wrap onStep to log each step
  const handleStep = useCallback((step: AgentStep) => {
    // Log to database
    logger.logStep(step, {
      duration_ms: step.duration,
      success: step.success !== false,
    });
    
    // Track file changes
    if (step.type === 'tool_call' || step.type === 'tool_result') {
      const data = step.data as { path?: string; action?: string } | undefined;
      if (data?.path) {
        const action = data.action || (step.name?.includes('create') ? 'created' : 'modified');
        if (action === 'created') filesCountRef.current.created++;
        else if (action === 'deleted') filesCountRef.current.deleted++;
        else filesCountRef.current.modified++;
      }
    }
    
    // Call original handler
    options.onStep?.(step);
  }, [logger, options]);
  
  // Wrap onComplete to end session
  const handleComplete = useCallback((state: UnifiedState) => {
    const duration = Date.now() - startTimeRef.current;
    
    logger.endSession({
      success: state.completed && !state.error,
      filesCreated: filesCountRef.current.created,
      filesModified: filesCountRef.current.modified,
      filesDeleted: filesCountRef.current.deleted,
      totalDurationMs: duration,
      error: state.error || undefined,
    });
    
    options.onComplete?.(state);
  }, [logger, options]);
  
  // Wrap onError to log failure
  const handleError = useCallback((error: string) => {
    logger.endSession({
      success: false,
      error,
      totalDurationMs: Date.now() - startTimeRef.current,
    });
    
    options.onError?.(error);
  }, [logger, options]);
  
  const orchestrator = useUnifiedOrchestrator({
    onStep: handleStep,
    onFileChange: options.onFileChange,
    onPhaseChange: options.onPhaseChange,
    onComplete: handleComplete,
    onError: handleError,
  });
  
  // Extended run function that starts logging session
  const runWithLogging = useCallback(async (
    prompt: string,
    initialFiles: Record<string, string> = {},
    initialPackages: string[] = [],
    runOptions?: {
      mode?: PipelineMode;
      projectId?: string;
      userId?: string;
      builderContext?: BuilderContext;
      attachedImages?: string[]; // 🆕 Vision support
    }
  ) => {
    if (!runOptions?.projectId) {
      console.warn('[OrchestratorWithLogging] No projectId provided, logging disabled');
      return orchestrator.run(prompt, initialFiles, initialPackages, runOptions);
    }
    
    // Reset counters
    startTimeRef.current = Date.now();
    filesCountRef.current = { created: 0, modified: 0, deleted: 0 };
    
    // Start logging session
    const complexity = detectComplexity(prompt);
    const promptType = detectPromptType(prompt);
    
    await logger.startSession({
      projectId: runOptions.projectId,
      promptSnippet: prompt.slice(0, 500),
      complexityScore: complexity.score,
      complexity: complexity.level,
      promptType,
    });
    
    // Run orchestrator
    return orchestrator.run(prompt, initialFiles, initialPackages, runOptions);
  }, [orchestrator, logger]);
  
  // Extended stop that cancels session
  const stopWithLogging = useCallback(() => {
    logger.cancelSession();
    orchestrator.stop();
  }, [orchestrator, logger]);
  
  return {
    ...orchestrator,
    run: runWithLogging,
    stop: stopWithLogging,
    logger,
  };
}

/**
 * Определение сложности промпта
 */
function detectComplexity(prompt: string): { score: number; level: 'simple' | 'medium' | 'complex' | 'epic' } {
  const wordCount = prompt.split(/\s+/).length;
  const hasMultipleFeatures = /и|также|ещё|плюс|добавь.*добавь/i.test(prompt);
  const hasBackend = /база|supabase|api|сервер|авторизац|регистрац/i.test(prompt);
  const hasComplexUI = /анимац|график|диаграмм|карта|3d|canvas/i.test(prompt);
  
  let score = 0;
  
  // Word count scoring
  if (wordCount > 500) score += 0.4;
  else if (wordCount > 200) score += 0.3;
  else if (wordCount > 50) score += 0.2;
  else score += 0.1;
  
  // Feature complexity
  if (hasMultipleFeatures) score += 0.2;
  if (hasBackend) score += 0.2;
  if (hasComplexUI) score += 0.15;
  
  // Normalize to 0-1
  score = Math.min(1, score);
  
  let level: 'simple' | 'medium' | 'complex' | 'epic';
  if (score < 0.25) level = 'simple';
  else if (score < 0.5) level = 'medium';
  else if (score < 0.75) level = 'complex';
  else level = 'epic';
  
  return { score, level };
}

/**
 * Определение типа промпта
 */
function detectPromptType(prompt: string): 'create' | 'modify' | 'fix' | 'style' | 'backend' {
  const lower = prompt.toLowerCase();
  
  if (/исправ|почини|фикс|баг|ошибк|не работ/i.test(lower)) {
    return 'fix';
  }
  if (/стил|цвет|шрифт|дизайн|отступ|margin|padding|css/i.test(lower)) {
    return 'style';
  }
  if (/база|supabase|api|сервер|авториз|бэкенд|backend/i.test(lower)) {
    return 'backend';
  }
  if (/создай|сделай|сгенерир|новый|новая|новое/i.test(lower)) {
    return 'create';
  }
  
  return 'modify';
}

export default useOrchestratorWithLogging;
