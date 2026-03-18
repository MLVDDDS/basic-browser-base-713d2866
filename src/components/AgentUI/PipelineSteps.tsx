import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Shield, 
  Wrench,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Zap,
  Clock,
  FileCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PipelineStage, PipelineProgress } from '@/hooks/useSitePipeline';

export interface PipelineStep {
  id: string;
  stage: PipelineStage;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  duration?: number;
  details?: string;
  files?: string[];
}

interface PipelineStepsProps {
  steps: PipelineStep[];
  currentStage: PipelineStage;
  thinkingTime?: number;
  model?: string;
  qualityScore?: number;
  issues?: string[];
  isRunning: boolean;
}

const stageIcons: Record<PipelineStage, React.ElementType> = {
  idle: Sparkles,
  analyzing: Brain,
  generating: Sparkles,
  validating: Shield,
  fixing: Wrench,
  complete: CheckCircle,
  failed: XCircle,
};

const stageColors: Record<PipelineStage, { icon: string; bg: string; border: string }> = {
  idle: { icon: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-muted' },
  analyzing: { icon: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
  generating: { icon: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  validating: { icon: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  fixing: { icon: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  complete: { icon: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  failed: { icon: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// Individual step component
function StepItem({ step, isLast }: { step: PipelineStep; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = stageIcons[step.stage] || Sparkles;
  const colors = stageColors[step.stage] || stageColors.idle;
  const hasDetails = step.details || (step.files && step.files.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative"
    >
      {/* Connector line */}
      {!isLast && (
        <div className={cn(
          "absolute left-[15px] top-[36px] w-0.5 h-[calc(100%-20px)]",
          step.status === 'completed' ? 'bg-green-500/50' : 'bg-border'
        )} />
      )}

      <button
        onClick={() => hasDetails && setExpanded(!expanded)}
        className={cn(
          "w-full flex items-start gap-3 p-3 rounded-lg transition-all",
          "border",
          colors.border,
          colors.bg,
          hasDetails && "hover:brightness-95 cursor-pointer"
        )}
        disabled={!hasDetails}
      >
        {/* Status icon */}
        <div className={cn(
          "relative p-2 rounded-lg shrink-0",
          colors.bg,
          colors.icon
        )}>
          {step.status === 'active' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : step.status === 'completed' ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : step.status === 'error' ? (
            <XCircle className="w-4 h-4 text-red-500" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
          
          {/* Pulse animation for active */}
          {step.status === 'active' && (
            <motion.div
              className={cn("absolute inset-0 rounded-lg", colors.bg)}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium text-sm",
              step.status === 'completed' ? 'text-green-600 dark:text-green-400' :
              step.status === 'active' ? 'text-foreground' :
              step.status === 'error' ? 'text-red-600 dark:text-red-400' :
              'text-muted-foreground'
            )}>
              {step.label}
            </span>
            
            {step.duration && step.status === 'completed' && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded">
                <Clock className="w-2.5 h-2.5" />
                {formatDuration(step.duration)}
              </span>
            )}
          </div>

          {/* Files being edited */}
          {step.files && step.files.length > 0 && step.status === 'active' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 mt-1"
            >
              <FileCode className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-500">
                Editing {step.files[step.files.length - 1]}
              </span>
            </motion.div>
          )}
        </div>

        {/* Expand indicator */}
        {hasDetails && (
          <div className="shrink-0 text-muted-foreground">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        )}
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-11"
          >
            <div className="pt-2 pb-1 text-xs text-muted-foreground space-y-1">
              {step.details && (
                <p className="whitespace-pre-wrap">{step.details}</p>
              )}
              {step.files && step.files.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {step.files.map((file, i) => (
                    <span 
                      key={i}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    >
                      <FileCode className="w-2.5 h-2.5" />
                      {file}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function PipelineSteps({
  steps,
  currentStage,
  thinkingTime,
  model,
  qualityScore,
  issues,
  isRunning,
}: PipelineStepsProps) {
  return (
    <div className="space-y-3">
      {/* Thinking header */}
      {isRunning && thinkingTime && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Brain className="w-3.5 h-3.5 text-violet-500" />
          <span>Thought for {formatDuration(thinkingTime)}</span>
        </motion.div>
      )}

      {/* Model badge */}
      {model && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-background border text-xs"
        >
          <Zap className="w-3 h-3 text-amber-500" />
          <span className="capitalize font-medium">{model}</span>
        </motion.div>
      )}

      {/* Steps list */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <StepItem 
            key={step.id} 
            step={step} 
            isLast={index === steps.length - 1}
          />
        ))}
      </div>

      {/* Quality score */}
      <AnimatePresence>
        {qualityScore !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 p-3 rounded-lg border bg-card space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Качество</span>
              <span className={cn(
                "font-bold",
                qualityScore >= 80 ? "text-green-500" :
                qualityScore >= 60 ? "text-amber-500" :
                "text-red-500"
              )}>
                {qualityScore}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  qualityScore >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                  qualityScore >= 60 ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                  "bg-gradient-to-r from-red-500 to-orange-400"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${qualityScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issues being fixed */}
      <AnimatePresence>
        {issues && issues.length > 0 && currentStage === 'fixing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs space-y-1"
          >
            <p className="text-muted-foreground flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              Исправляю:
            </p>
            <div className="flex flex-wrap gap-1">
              {issues.slice(0, 5).map((issue, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                >
                  {issue}
                </motion.span>
              ))}
              {issues.length > 5 && (
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  +{issues.length - 5}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
