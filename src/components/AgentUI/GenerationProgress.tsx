import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Shield, 
  Wrench,
  CheckCircle,
  XCircle,
  Loader2,
  FileCode,
  Clock,
  Zap,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileBadge } from './FileBadge';
import type { PipelineStage, PipelineProgress } from '@/hooks/useSitePipeline';

interface GenerationStep {
  id: string;
  stage: PipelineStage;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
}

interface GenerationProgressProps {
  progress: PipelineProgress;
  isRunning: boolean;
  files?: string[];
  className?: string;
}

const stageLabels: Record<PipelineStage, string> = {
  idle: 'Готов',
  analyzing: 'Анализирую запрос',
  generating: 'Генерирую сайт',
  validating: 'Проверяю качество',
  fixing: 'Исправляю проблемы',
  complete: 'Готово!',
  failed: 'Ошибка',
};

const stageIcons: Record<PipelineStage, React.ElementType> = {
  idle: Sparkles,
  analyzing: Brain,
  generating: Sparkles,
  validating: Shield,
  fixing: Wrench,
  complete: CheckCircle,
  failed: XCircle,
};

const stageOrder: PipelineStage[] = ['analyzing', 'generating', 'validating', 'fixing', 'complete'];

function getStageIndex(stage: PipelineStage): number {
  return stageOrder.indexOf(stage);
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function GenerationProgress({ progress, isRunning, files = [], className }: GenerationProgressProps) {
  const [steps, setSteps] = useState<GenerationStep[]>([]);
  const [showDetails, setShowDetails] = useState(true);

  // Reset on new run
  useEffect(() => {
    if (progress.stage === 'analyzing' && steps.length === 0) {
      setSteps([]);
    }
  }, [progress.stage, steps.length]);

  // Update steps based on progress
  useEffect(() => {
    const currentIndex = getStageIndex(progress.stage);
    if (currentIndex === -1) return;

    setSteps(prev => {
      const newSteps: GenerationStep[] = stageOrder.slice(0, currentIndex + 1).map((stage, idx) => {
        const existing = prev.find(s => s.stage === stage);
        const isActive = stage === progress.stage && progress.stage !== 'complete';
        const isCompleted = idx < currentIndex || progress.stage === 'complete';
        const isFailed = progress.stage === 'failed' && idx === currentIndex;

        return {
          id: stage,
          stage,
          label: stageLabels[stage],
          status: isFailed ? 'error' : isCompleted ? 'completed' : isActive ? 'active' : 'pending',
          startTime: existing?.startTime || (isActive || isCompleted ? Date.now() - (currentIndex - idx) * 1000 : undefined),
          endTime: existing?.endTime || (isCompleted && !isActive ? Date.now() : undefined),
        };
      });

      return newSteps;
    });
  }, [progress.stage]);

  const currentStep = steps.find(s => s.status === 'active');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-4", className)}
    >
      {/* Status header removed - no more "Thought for X" counter */}

      {/* Current status message */}
      <motion.p 
        key={progress.message}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm font-medium"
      >
        {progress.message || stageLabels[progress.stage]}
      </motion.p>

      {/* Tasks panel */}
      <motion.div 
        className="border rounded-xl overflow-hidden bg-card"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors border-b border-border"
        >
          <span className="font-medium text-sm">Tasks</span>
          {showDetails ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {showDetails && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-3 space-y-2">
                {steps.map((step, index) => {
                  const Icon = stageIcons[step.stage];
                  const duration = step.endTime && step.startTime 
                    ? step.endTime - step.startTime 
                    : undefined;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      {/* Status indicator */}
                      <div className={cn(
                        "relative p-1.5 rounded-md",
                        step.status === 'active' && "bg-blue-500/10 text-blue-500",
                        step.status === 'completed' && "bg-green-500/10 text-green-500",
                        step.status === 'error' && "bg-red-500/10 text-red-500",
                        step.status === 'pending' && "bg-muted text-muted-foreground"
                      )}>
                        {step.status === 'active' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : step.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : step.status === 'error' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}

                        {/* Pulse for active */}
                        {step.status === 'active' && (
                          <motion.div
                            className="absolute inset-0 rounded-md bg-blue-500/20"
                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </div>

                      {/* Label */}
                      <span className={cn(
                        "flex-1 text-sm",
                        step.status === 'active' && "font-medium",
                        step.status === 'completed' && "text-muted-foreground",
                        step.status === 'pending' && "text-muted-foreground"
                      )}>
                        {step.label}
                      </span>

                      {/* Duration */}
                      {duration && step.status === 'completed' && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(duration)}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Model badge */}
      {progress.model && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs">
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="font-medium capitalize">{progress.model}</span>
          </div>
        </motion.div>
      )}

      {/* Files being edited */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileCode className="w-3.5 h-3.5" />
              <span>Editing</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {files.map((file, i) => (
                <motion.div
                  key={file}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <FileBadge 
                    filename={file.split('/').pop() || file} 
                    action={i === files.length - 1 ? 'modified' : 'created'}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quality score */}
      <AnimatePresence>
        {progress.qualityScore !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Качество</span>
              <span className={cn(
                "font-bold tabular-nums",
                progress.qualityScore >= 80 ? "text-green-500" :
                progress.qualityScore >= 60 ? "text-amber-500" : "text-red-500"
              )}>
                {progress.qualityScore}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  progress.qualityScore >= 80 
                    ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                    : progress.qualityScore >= 60 
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400" 
                    : "bg-gradient-to-r from-red-500 to-orange-400"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress.qualityScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issues being fixed */}
      <AnimatePresence>
        {progress.issues && progress.issues.length > 0 && progress.stage === 'fixing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-orange-500" />
              Исправляю:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {progress.issues.slice(0, 4).map((issue, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="px-2 py-0.5 rounded-full text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                >
                  {issue}
                </motion.span>
              ))}
              {progress.issues.length > 4 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                  +{progress.issues.length - 4}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attempt counter */}
      {progress.attempt && progress.attempt > 1 && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground"
        >
          Попытка {progress.attempt}/3
        </motion.p>
      )}
    </motion.div>
  );
}
