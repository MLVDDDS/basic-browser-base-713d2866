import { useState, useCallback, useRef } from 'react';
import { getRecommendedTier, checkEscalation } from '@/lib/model-config';
import { runUnifiedOrchestratorStream } from '@/features/builder/api/unified-orchestrator-api';

export interface AutofixStep {
  id: string;
  type: 'classification' | 'plan' | 'attempt' | 'thinking' | 'action' | 'file_changed' | 'validation' | 'escalation' | 'complete' | 'error';
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface AutofixResult {
  success: boolean;
  files: Record<string, string>;
  validationScore: number;
  attemptCount: number;
  modelTier: string;
  tokensUsed: number;
  duration: number;
}

export interface AutofixOptions {
  files: Record<string, string>;
  errorMessage: string;
  context?: string;
  maxAttempts?: number;
  onStep?: (step: AutofixStep) => void;
  onFileChange?: (path: string, content: string) => void;
  onProgress?: (progress: number) => void;
}

export function useAutofix() {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<AutofixStep[]>([]);
  const [result, setResult] = useState<AutofixResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [currentTier, setCurrentTier] = useState<string>('haiku');
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  const addStep = useCallback((step: Omit<AutofixStep, 'id' | 'timestamp'>) => {
    const newStep: AutofixStep = {
      ...step,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    setSteps(prev => [...prev, newStep]);
    return newStep;
  }, []);

  const run = useCallback(async (options: AutofixOptions): Promise<AutofixResult | null> => {
    const { files, errorMessage, context, maxAttempts = 3, onStep, onFileChange, onProgress } = options;

    // Reset state
    setIsRunning(true);
    setSteps([]);
    setResult(null);
    setError(null);
    setProgress(0);
    setCurrentAttempt(0);
    setCurrentTier('haiku');
    startTimeRef.current = Date.now();

    abortControllerRef.current = new AbortController();

    try {
      const updatedFiles = { ...files };
      let finalResult: AutofixResult | null = null;
      let attemptCount = 1;
      let tier = 'haiku';

      await runUnifiedOrchestratorStream(
        {
          prompt: `Fix the following error: ${errorMessage}`,
          files,
          packages: [],
          mode: 'autofix',
        },
        (event) => {
          switch (event.type) {
            case 'autofix_start': {
              const classifyStep = addStep({ type: 'classification', content: 'Analyzing error...' });
              onStep?.(classifyStep);
              setProgress(5);
              onProgress?.(5);
              break;
            }

            case 'phase_start': {
              if (event.phase === 'autofix') {
                const planStep = addStep({ type: 'plan', content: 'Planning fix strategy...' });
                onStep?.(planStep);
                setProgress(15);
                onProgress?.(15);
              }
              break;
            }

            case 'thinking': {
              const thinkStep = addStep({
                type: 'thinking',
                content: typeof event.content === 'string' ? event.content : 'Thinking...',
                metadata: { model: event.model }
              });
              onStep?.(thinkStep);
              break;
            }

            case 'autofix_attempt': {
              const attempt = Number(event.attempt || 1);
              const nextTier = typeof event.tier === 'string' ? event.tier : tier;
              attemptCount = attempt;
              tier = nextTier;
              setCurrentAttempt(attempt);
              setCurrentTier(nextTier);
              const attemptStep = addStep({
                type: 'attempt',
                content: `Attempt ${attempt}/${maxAttempts}`,
                metadata: { attempt, tier: nextTier }
              });
              onStep?.(attemptStep);
              const nextProgress = 20 + (attempt - 1) * 25;
              setProgress(nextProgress);
              onProgress?.(nextProgress);
              break;
            }

            case 'file_updated':
            case 'file_created': {
              if (typeof event.path !== 'string' || typeof event.content !== 'string') break;
              updatedFiles[event.path] = event.content;
              const fileStep = addStep({
                type: 'file_changed',
                content: `${event.type === 'file_created' ? 'Created' : 'Updated'}: ${event.path}`,
                metadata: { path: event.path }
              });
              onStep?.(fileStep);
              onFileChange?.(event.path, event.content);
              break;
            }

            case 'validation': {
              const score = Number(event.score || 0);
              const validStep = addStep({
                type: 'validation',
                content: `Validation score: ${score}/100`,
                metadata: { score, errors: event.errors, warnings: event.warnings }
              });
              onStep?.(validStep);
              const nextProgress = 70 + (score / 100) * 20;
              setProgress(nextProgress);
              onProgress?.(nextProgress);
              break;
            }

            case 'escalation': {
              const nextTier = typeof event.toTier === 'string' ? event.toTier : tier;
              tier = nextTier;
              setCurrentTier(nextTier);
              const escalateStep = addStep({
                type: 'escalation',
                content: `Escalating to ${nextTier} model`,
                metadata: { fromTier: event.fromTier, toTier: event.toTier, reason: event.reason }
              });
              onStep?.(escalateStep);
              break;
            }

            case 'complete':
            case 'autofix_complete': {
              const duration = Date.now() - startTimeRef.current;
              const validationScore = Number(
                (event.validation as { score?: number } | undefined)?.score || event.score || 0
              );
              const tokensUsed = Number(event.tokensUsed || 0);
              finalResult = {
                success: event.success !== false,
                files: updatedFiles,
                validationScore,
                attemptCount,
                modelTier: tier,
                tokensUsed,
                duration
              };

              const completeStep = addStep({
                type: 'complete',
                content:
                  typeof event.summary === 'string'
                    ? event.summary
                    : `Autofix ${finalResult.success ? 'completed' : 'failed'}`,
                metadata: { ...finalResult } as Record<string, unknown>
              });
              onStep?.(completeStep);
              setProgress(100);
              onProgress?.(100);
              break;
            }

            case 'error': {
              const message = typeof event.message === 'string' ? event.message : 'Autofix error';
              const errorStep = addStep({
                type: 'error',
                content: message,
                metadata: { error: event.error }
              });
              onStep?.(errorStep);
              throw new Error(message);
            }
          }
        },
        {
          signal: abortControllerRef.current.signal
        }
      );

      setResult(finalResult);
      return finalResult;

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Autofix cancelled');
        return null;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addStep({ type: 'error', content: errorMessage });
      return null;

    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  }, [addStep]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setSteps([]);
    setResult(null);
    setError(null);
    setProgress(0);
    setCurrentAttempt(0);
    setCurrentTier('haiku');
  }, []);

  // Get recommended model based on error severity
  const getRecommendedModel = useCallback((errorSeverity: 'low' | 'medium' | 'high' | 'critical') => {
    return getRecommendedTier({ taskType: 'auto_debug', fileCount: 1, errorSeverity });
  }, []);

  // Check if escalation is needed
  const shouldEscalate = useCallback((attempts: number, lastSuccess: boolean) => {
    return checkEscalation(currentTier as 'haiku' | 'sonnet' | 'opus', attempts, lastSuccess);
  }, [currentTier]);

  return {
    // State
    isRunning,
    steps,
    result,
    error,
    progress,
    currentAttempt,
    currentTier,
    
    // Actions
    run,
    cancel,
    reset,
    
    // Utilities
    getRecommendedModel,
    shouldEscalate
  };
}
