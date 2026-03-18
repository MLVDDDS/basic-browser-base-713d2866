/**
 * 🔧 AutofixProgress Component
 * 
 * Визуализация прогресса автофикса с новым orchestrator.
 * Показывает классификацию, план, попытки и результат.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug,
  Wrench,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Brain,
  Sparkles,
  FileCode,
  ArrowUp,
  RotateCcw,
  Zap,
  Target,
  Shield,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type {
  OrchestratorState,
  ClassifiedError,
  FixPlan,
  ModelTier,
  ErrorCategory,
  ErrorSeverity,
} from '@/hooks/useAutofixOrchestrator';

// ============ CONFIG ============

const CATEGORY_CONFIG: Record<ErrorCategory, { icon: React.ElementType; label: string; color: string }> = {
  import: { icon: FileCode, label: 'Import Error', color: 'text-blue-500' },
  syntax: { icon: Bug, label: 'Syntax Error', color: 'text-red-500' },
  type: { icon: Shield, label: 'Type Error', color: 'text-orange-500' },
  runtime: { icon: Zap, label: 'Runtime Error', color: 'text-yellow-500' },
  style: { icon: Sparkles, label: 'Style Issue', color: 'text-purple-500' },
  dependency: { icon: FileCode, label: 'Dependency', color: 'text-cyan-500' },
  api: { icon: Target, label: 'API Error', color: 'text-pink-500' },
  logic: { icon: Brain, label: 'Logic Error', color: 'text-amber-500' },
  architecture: { icon: Wrench, label: 'Architecture', color: 'text-indigo-500' },
  a11y: { icon: Shield, label: 'Accessibility', color: 'text-green-500' },
  performance: { icon: Clock, label: 'Performance', color: 'text-lime-500' },
  i18n: { icon: Target, label: 'i18n', color: 'text-teal-500' },
  unknown: { icon: AlertTriangle, label: 'Unknown', color: 'text-gray-500' },
};

const SEVERITY_CONFIG: Record<ErrorSeverity, { label: string; color: string; bg: string }> = {
  critical: { label: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10' },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  medium: { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  low: { label: 'Low', color: 'text-green-500', bg: 'bg-green-500/10' },
};

const MODEL_CONFIG: Record<ModelTier, { label: string; icon: React.ElementType; color: string }> = {
  fast: { label: 'Fast', icon: Zap, color: 'text-green-500' },
  balanced: { label: 'Balanced', icon: Target, color: 'text-blue-500' },
  quality: { label: 'Quality', icon: Sparkles, color: 'text-purple-500' },
  expert: { label: 'Expert', icon: Brain, color: 'text-amber-500' },
};

// ============ COMPONENTS ============

interface AutofixProgressProps {
  state: OrchestratorState;
  onStop?: () => void;
  onRollback?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function AutofixProgress({
  state,
  onStop,
  onRollback,
  onRetry,
  className,
}: AutofixProgressProps) {
  const isRunning = !['idle', 'success', 'failed', 'error'].includes(state.status);
  const progress = state.currentAttempt > 0 
    ? Math.round((state.currentAttempt / state.maxAttempts) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border bg-card p-4 space-y-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon status={state.status} />
          <span className="font-medium">
            {getStatusLabel(state.status)}
          </span>
        </div>
        
        {isRunning && onStop && (
          <Button variant="ghost" size="sm" onClick={onStop}>
            Cancel
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {isRunning && (
        <Progress value={progress} className="h-2" />
      )}

      {/* Classification */}
      <AnimatePresence mode="wait">
        {state.classifiedError && (
          <ClassificationCard error={state.classifiedError} />
        )}
      </AnimatePresence>

      {/* Current action */}
      {state.currentAction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{state.currentAction}</span>
          {state.currentTarget && (
            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              {state.currentTarget}
            </code>
          )}
        </motion.div>
      )}

      {/* Thinking */}
      {state.thinking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground bg-muted/50 rounded p-2"
        >
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-4 w-4 text-purple-500" />
            <span className="font-medium">Thinking</span>
          </div>
          <p className="text-xs line-clamp-3">{state.thinking}</p>
        </motion.div>
      )}

      {/* Model & Attempt */}
      {state.currentAttempt > 0 && (
        <div className="flex items-center gap-4 text-sm">
          <ModelBadge tier={state.currentModel} />
          <span className="text-muted-foreground">
            Attempt {state.currentAttempt}/{state.maxAttempts}
          </span>
        </div>
      )}

      {/* File changes */}
      {state.fileChanges.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Files changed:
          </span>
          <div className="flex flex-wrap gap-1">
            {state.fileChanges.slice(-5).map((fc, i) => (
              <motion.span
                key={`${fc.path}-${i}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  fc.action === 'create' && 'bg-green-500/10 text-green-500',
                  fc.action === 'edit' && 'bg-blue-500/10 text-blue-500',
                  fc.action === 'delete' && 'bg-red-500/10 text-red-500'
                )}
              >
                {fc.path.split('/').pop()}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Validation result */}
      {state.validation && (
        <ValidationCard validation={state.validation} />
      )}

      {/* Result */}
      {(state.status === 'success' || state.status === 'failed') && (
        <ResultCard
          success={state.success}
          summary={state.summary}
          filesChanged={state.filesChanged}
          canRollback={!!state.snapshotId}
          onRollback={onRollback}
          onRetry={!state.success ? onRetry : undefined}
        />
      )}

      {/* Error */}
      {state.error && state.status === 'error' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-destructive/10 border border-destructive/20 rounded p-3"
        >
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{state.error}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============ SUB-COMPONENTS ============

function StatusIcon({ status }: { status: OrchestratorState['status'] }) {
  switch (status) {
    case 'idle':
      return <Wrench className="h-5 w-5 text-muted-foreground" />;
    case 'starting':
    case 'classifying':
    case 'planning':
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    case 'fixing':
      return <Wrench className="h-5 w-5 animate-pulse text-amber-500" />;
    case 'validating':
      return <Shield className="h-5 w-5 animate-pulse text-purple-500" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'failed':
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Loader2 className="h-5 w-5 animate-spin" />;
  }
}

function getStatusLabel(status: OrchestratorState['status']): string {
  const labels: Record<OrchestratorState['status'], string> = {
    idle: 'Ready',
    starting: 'Starting...',
    classifying: 'Analyzing error...',
    planning: 'Creating fix plan...',
    fixing: 'Applying fix...',
    validating: 'Validating...',
    success: 'Fixed successfully!',
    failed: 'Fix failed',
    error: 'Error occurred',
  };
  return labels[status];
}

function ClassificationCard({ error }: { error: ClassifiedError }) {
  const config = CATEGORY_CONFIG[error.category];
  const severityConfig = SEVERITY_CONFIG[error.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-muted/50 rounded-lg p-3 space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', config.color)} />
          <span className="font-medium text-sm">{config.label}</span>
        </div>
        <span className={cn('text-xs px-2 py-0.5 rounded-full', severityConfig.bg, severityConfig.color)}>
          {severityConfig.label}
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground line-clamp-2">
        {error.message}
      </p>
      
      {error.file && (
        <div className="flex items-center gap-2 text-xs">
          <FileCode className="h-3 w-3" />
          <code className="bg-background px-1.5 py-0.5 rounded">
            {error.file}
            {error.line && `:${error.line}`}
          </code>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${error.confidence}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {error.confidence}% confidence
        </span>
      </div>
    </motion.div>
  );
}

function ModelBadge({ tier }: { tier: ModelTier }) {
  const config = MODEL_CONFIG[tier];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', config.color)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </div>
  );
}

function ValidationCard({ validation }: { validation: { passed: boolean; errors: string[]; warnings: string[] } }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'rounded p-2 text-sm',
        validation.passed ? 'bg-green-500/10' : 'bg-yellow-500/10'
      )}
    >
      <div className="flex items-center gap-2">
        {validation.passed ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        )}
        <span className={validation.passed ? 'text-green-500' : 'text-yellow-500'}>
          {validation.passed ? 'Validation passed' : 'Validation issues'}
        </span>
      </div>
      
      {validation.errors.length > 0 && (
        <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
          {validation.errors.slice(0, 3).map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function ResultCard({
  success,
  summary,
  filesChanged,
  canRollback,
  onRollback,
  onRetry,
}: {
  success: boolean;
  summary: string | null;
  filesChanged: string[];
  canRollback: boolean;
  onRollback?: () => void;
  onRetry?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-lg p-4',
        success ? 'bg-green-500/10' : 'bg-red-500/10'
      )}
    >
      <div className="flex items-start gap-3">
        {success ? (
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
        )}
        
        <div className="flex-1">
          <p className={cn('font-medium', success ? 'text-green-500' : 'text-red-500')}>
            {success ? 'Error Fixed!' : 'Could not fix error'}
          </p>
          
          {summary && (
            <p className="text-sm text-muted-foreground mt-1">{summary}</p>
          )}
          
          {filesChanged.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filesChanged.map((file, i) => (
                <span
                  key={i}
                  className="text-xs bg-background px-2 py-0.5 rounded"
                >
                  {file.split('/').pop()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        {canRollback && onRollback && (
          <Button variant="outline" size="sm" onClick={onRollback}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Undo
          </Button>
        )}
        
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <ArrowUp className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default AutofixProgress;
