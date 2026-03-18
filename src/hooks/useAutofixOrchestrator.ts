/**
 * 🔧 useAutofixOrchestrator Hook
 * 
 * Клиентский хук для работы с unified autofix-orchestrator.
 * Поддерживает стриминг событий, snapshot/rollback и метрики.
 * 
 * @version 2.0.0
 */

import { useState, useCallback, useRef } from 'react';
import { runUnifiedOrchestratorStream } from '@/features/builder/api/unified-orchestrator-api';

// ============ TYPES ============

export type ErrorCategory = 
  | 'import' | 'syntax' | 'type' | 'runtime' 
  | 'style' | 'dependency' | 'api' | 'logic' 
  | 'architecture' | 'a11y' | 'performance' | 'i18n' | 'unknown';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ModelTier = 'fast' | 'balanced' | 'quality' | 'expert';

export type FixStrategy = 
  | 'create_file' | 'edit_file' | 'fix_imports' | 'fix_syntax'
  | 'fix_types' | 'fix_logic' | 'fix_styles' | 'add_dependency'
  | 'update_dependency' | 'fix_api' | 'refactor' | 'split_component'
  | 'add_error_boundary' | 'optimize' | 'rollback' | 'escalate';

export interface ClassifiedError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  relatedFiles: string[];
  confidence: number;
}

export interface FixStep {
  id: string;
  action: string;
  target: string;
  description: string;
  priority: number;
  required: boolean;
}

export interface FixPlan {
  id: string;
  strategy: FixStrategy;
  steps: FixStep[];
  estimatedIterations: number;
  requiredModelTier: ModelTier;
  priority: number;
  confidence: number;
  reasoning: string;
}

export interface FileChange {
  path: string;
  action: 'create' | 'edit' | 'delete';
  timestamp: number;
}

export interface AttemptInfo {
  number: number;
  model: ModelTier;
  strategy: FixStrategy;
  success: boolean;
  startedAt: number;
  completedAt?: number;
}

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export type OrchestratorStatus = 
  | 'idle'
  | 'starting'
  | 'classifying'
  | 'planning'
  | 'fixing'
  | 'validating'
  | 'success'
  | 'failed'
  | 'error';

export interface OrchestratorState {
  // Status
  status: OrchestratorStatus;
  sessionId: string | null;
  mode: 'auto' | 'smart' | 'quick';
  
  // Snapshot
  snapshotId: string | null;
  snapshotFileCount: number;
  
  // Classification
  classifiedError: ClassifiedError | null;
  allErrors: ClassifiedError[];
  
  // Plan
  fixPlan: FixPlan | null;
  
  // Execution
  currentAttempt: number;
  maxAttempts: number;
  currentModel: ModelTier;
  attempts: AttemptInfo[];
  
  // Actions
  currentAction: string | null;
  currentTarget: string | null;
  thinking: string | null;
  fileChanges: FileChange[];
  
  // Validation
  validation: ValidationResult | null;
  
  // Result
  success: boolean;
  summary: string | null;
  filesChanged: string[];
  resultFiles: Record<string, string> | null;
  
  // Error
  error: string | null;
  errorRecoverable: boolean;
}

export interface OrchestratorOptions {
  projectId?: string;
  userId?: string;
  packages?: Record<string, string>;
  mode?: 'auto' | 'smart' | 'quick';
  maxAttempts?: number;
  enableSnapshot?: boolean;
  enableMetrics?: boolean;
  preferredTier?: ModelTier;
  onEvent?: (event: OrchestratorEvent) => void;
}

// Event types from backend
type OrchestratorEvent =
  | { type: 'session_start'; sessionId: string; mode: string }
  | { type: 'snapshot_created'; snapshotId: string; fileCount: number }
  | { type: 'classification_start' }
  | { type: 'classification_complete'; error: ClassifiedError; allErrors?: ClassifiedError[] }
  | { type: 'plan_created'; plan: FixPlan }
  | { type: 'attempt_start'; attempt: number; model: ModelTier; strategy: FixStrategy }
  | { type: 'thinking'; content: string }
  | { type: 'action'; action: string; target: string; status: 'start' | 'success' | 'error'; error?: string }
  | { type: 'file_changed'; path: string; action: 'create' | 'edit' | 'delete' }
  | { type: 'validation_start' }
  | { type: 'validation_complete'; passed: boolean; errors: string[]; warnings: string[] }
  | { type: 'attempt_complete'; attempt: number; success: boolean }
  | { type: 'escalation'; from: ModelTier; to: ModelTier; reason: string }
  | { type: 'session_complete'; success: boolean; summary: string; filesChanged: string[] }
  | { type: 'files'; files: Record<string, string> }
  | { type: 'rollback_available'; snapshotId: string }
  | { type: 'error'; message: string; recoverable: boolean };

// ============ INITIAL STATE ============

const initialState: OrchestratorState = {
  status: 'idle',
  sessionId: null,
  mode: 'smart',
  snapshotId: null,
  snapshotFileCount: 0,
  classifiedError: null,
  allErrors: [],
  fixPlan: null,
  currentAttempt: 0,
  maxAttempts: 3,
  currentModel: 'balanced',
  attempts: [],
  currentAction: null,
  currentTarget: null,
  thinking: null,
  fileChanges: [],
  validation: null,
  success: false,
  summary: null,
  filesChanged: [],
  resultFiles: null,
  error: null,
  errorRecoverable: false,
};

// ============ HOOK ============

export function useAutofixOrchestrator() {
  const [state, setState] = useState<OrchestratorState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const eventCallbackRef = useRef<((event: OrchestratorEvent) => void) | null>(null);

  // Process SSE events
  const processEvent = useCallback((event: OrchestratorEvent) => {
    // Call external handler if provided
    eventCallbackRef.current?.(event);

    switch (event.type) {
      case 'session_start':
        setState(prev => ({
          ...prev,
          status: 'starting',
          sessionId: event.sessionId,
          mode: event.mode as 'auto' | 'smart' | 'quick',
        }));
        break;

      case 'snapshot_created':
        setState(prev => ({
          ...prev,
          snapshotId: event.snapshotId,
          snapshotFileCount: event.fileCount,
        }));
        break;

      case 'classification_start':
        setState(prev => ({
          ...prev,
          status: 'classifying',
        }));
        break;

      case 'classification_complete':
        setState(prev => ({
          ...prev,
          status: 'planning',
          classifiedError: event.error,
          allErrors: event.allErrors || [event.error],
        }));
        break;

      case 'plan_created':
        setState(prev => ({
          ...prev,
          fixPlan: event.plan,
          currentModel: event.plan.requiredModelTier,
        }));
        break;

      case 'attempt_start':
        setState(prev => ({
          ...prev,
          status: 'fixing',
          currentAttempt: event.attempt,
          currentModel: event.model,
          attempts: [
            ...prev.attempts,
            {
              number: event.attempt,
              model: event.model,
              strategy: event.strategy,
              success: false,
              startedAt: Date.now(),
            },
          ],
        }));
        break;

      case 'thinking':
        setState(prev => ({
          ...prev,
          thinking: event.content,
        }));
        break;

      case 'action':
        setState(prev => ({
          ...prev,
          currentAction: event.status === 'start' ? event.action : null,
          currentTarget: event.status === 'start' ? event.target : null,
        }));
        break;

      case 'file_changed':
        setState(prev => ({
          ...prev,
          fileChanges: [
            ...prev.fileChanges,
            {
              path: event.path,
              action: event.action,
              timestamp: Date.now(),
            },
          ],
        }));
        break;

      case 'validation_start':
        setState(prev => ({
          ...prev,
          status: 'validating',
        }));
        break;

      case 'validation_complete':
        setState(prev => ({
          ...prev,
          validation: {
            passed: event.passed,
            errors: event.errors,
            warnings: event.warnings,
          },
        }));
        break;

      case 'attempt_complete':
        setState(prev => ({
          ...prev,
          attempts: prev.attempts.map(a =>
            a.number === event.attempt
              ? { ...a, success: event.success, completedAt: Date.now() }
              : a
          ),
        }));
        break;

      case 'escalation':
        setState(prev => ({
          ...prev,
          currentModel: event.to,
        }));
        console.log(`🔄 Escalation: ${event.from} → ${event.to}. Reason: ${event.reason}`);
        break;

      case 'files':
        setState(prev => ({
          ...prev,
          resultFiles: event.files,
        }));
        break;

      case 'session_complete':
        setState(prev => ({
          ...prev,
          status: event.success ? 'success' : 'failed',
          success: event.success,
          summary: event.summary,
          filesChanged: event.filesChanged,
        }));
        break;

      case 'rollback_available':
        setState(prev => ({
          ...prev,
          snapshotId: event.snapshotId,
        }));
        break;

      case 'error':
        setState(prev => ({
          ...prev,
          status: 'error',
          error: event.message,
          errorRecoverable: event.recoverable,
        }));
        break;
    }
  }, []);

  // Run autofix
  const run = useCallback(async (
    errorMessage: string,
    files: Record<string, string>,
    options: OrchestratorOptions = {}
  ): Promise<{
    success: boolean;
    files: Record<string, string>;
    summary: string;
    snapshotId: string | null;
  }> => {
    // Reset state
    setState({
      ...initialState,
      status: 'starting',
      mode: options.mode || 'smart',
      maxAttempts: options.maxAttempts || 3,
    });

    // Store callback
    eventCallbackRef.current = options.onEvent || null;

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      let resultFiles = files;
      let resultSummary = '';
      let resultSuccess = false;
      let resultSnapshotId: string | null = null;

      await runUnifiedOrchestratorStream(
        {
          prompt: `Fix this error and update files: ${errorMessage}`,
          files,
          packages: [],
          projectId: options.projectId,
          userId: options.userId,
          mode: options.mode || 'smart',
        },
        (rawEvent) => {
          if (typeof rawEvent.type !== 'string') return;
          const event = rawEvent as OrchestratorEvent;
          processEvent(event);

          // Capture final state
          if (event.type === 'files') {
            resultFiles = event.files;
          } else if (event.type === 'session_complete') {
            resultSuccess = event.success;
            resultSummary = event.summary;
          } else if (event.type === 'snapshot_created' || event.type === 'rollback_available') {
            resultSnapshotId = event.snapshotId;
          }
        },
        {
          signal: abortControllerRef.current.signal,
        }
      );

      return {
        success: resultSuccess,
        files: resultFiles,
        summary: resultSummary || 'Autofix completed',
        snapshotId: resultSnapshotId,
      };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        setState(prev => ({
          ...prev,
          status: 'idle',
          error: 'Cancelled by user',
        }));
        return {
          success: false,
          files,
          summary: 'Cancelled',
          snapshotId: null,
        };
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));

      return {
        success: false,
        files,
        summary: errorMessage,
        snapshotId: null,
      };
    } finally {
      abortControllerRef.current = null;
      eventCallbackRef.current = null;
    }
  }, [processEvent]);

  // Stop/cancel
  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(prev => ({
      ...prev,
      status: 'idle',
      error: 'Cancelled by user',
    }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  // Rollback to snapshot
  const rollback = useCallback(async (snapshotId: string): Promise<{
    success: boolean;
    files: Record<string, string>;
    error?: string;
  }> => {
    void snapshotId;
    try {
      return {
        success: false,
        files: {},
        error: 'Rollback endpoint is not implemented in API runtime',
      };
    } catch (error) {
      return {
        success: false,
        files: {},
        error: error instanceof Error ? error.message : 'Rollback failed',
      };
    }
  }, []);

  // Computed values
  const isRunning = state.status !== 'idle' && state.status !== 'success' && state.status !== 'failed' && state.status !== 'error';
  const progress = state.currentAttempt > 0 
    ? Math.round((state.currentAttempt / state.maxAttempts) * 100)
    : 0;

  return {
    // State
    state,
    
    // Actions
    run,
    stop,
    reset,
    rollback,
    
    // Computed
    isRunning,
    isSuccess: state.status === 'success',
    isFailed: state.status === 'failed' || state.status === 'error',
    progress,
    
    // Shortcuts
    sessionId: state.sessionId,
    status: state.status,
    classifiedError: state.classifiedError,
    fixPlan: state.fixPlan,
    currentModel: state.currentModel,
    currentAttempt: state.currentAttempt,
    attempts: state.attempts,
    validation: state.validation,
    filesChanged: state.filesChanged,
    resultFiles: state.resultFiles,
    summary: state.summary,
    error: state.error,
    snapshotId: state.snapshotId,
    canRollback: !!state.snapshotId && (state.status === 'success' || state.status === 'failed'),
  };
}

export default useAutofixOrchestrator;
