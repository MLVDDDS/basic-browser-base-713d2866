import { motion } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Shield, 
  Wrench,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Code,
  Layers,
  Eye,
  Rocket,
  ChevronRight,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
type PipelinePhase = 'idle' | 'intake' | 'analyze' | 'plan' | 'execute' | 'validate' | 'fix' | 'preview' | 'deploy' | 'complete' | 'failed';
type PipelineMode = 'light' | 'low' | 'medium' | 'high' | 'epic';
type StepStatus = 'pending' | 'active' | 'completed' | 'failed';

interface PipelineTimelineStep {
  phase: PipelinePhase;
  status: StepStatus;
  duration?: number;
  label?: string;
}

interface PipelineTimelineProps {
  steps: PipelineTimelineStep[];
  currentPhase: PipelinePhase | null;
  mode: PipelineMode | null;
  isRunning: boolean;
  className?: string;
}

const phaseConfig: Record<PipelinePhase, {
  icon: React.ElementType;
  label: string;
  color: string;
}> = {
  idle: { icon: Sparkles, label: 'Готов', color: 'text-muted-foreground' },
  intake: { icon: FileText, label: 'Анализ', color: 'text-violet-500' },
  analyze: { icon: Brain, label: 'Анализ', color: 'text-violet-500' },
  plan: { icon: Target, label: 'Планирование', color: 'text-blue-500' },
  execute: { icon: Code, label: 'Генерация', color: 'text-cyan-500' },
  validate: { icon: Shield, label: 'Валидация', color: 'text-amber-500' },
  fix: { icon: Wrench, label: 'Исправление', color: 'text-orange-500' },
  preview: { icon: Eye, label: 'Предпросмотр', color: 'text-pink-500' },
  deploy: { icon: Rocket, label: 'Деплой', color: 'text-emerald-500' },
  complete: { icon: CheckCircle, label: 'Готово', color: 'text-green-500' },
  failed: { icon: XCircle, label: 'Ошибка', color: 'text-red-500' },
};

const modeColors: Record<PipelineMode, { bg: string; text: string }> = {
  light: { bg: 'bg-green-500/10', text: 'text-green-600' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-600' },
  high: { bg: 'bg-purple-500/10', text: 'text-purple-600' },
  epic: { bg: 'bg-violet-500/10', text: 'text-violet-600' },
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function PipelineTimeline({
  steps,
  currentPhase,
  mode,
  isRunning,
  className,
}: PipelineTimelineProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Mode badge */}
      {mode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
            modeColors[mode].bg,
            modeColors[mode].text
          )}
        >
          <Sparkles className="w-3 h-3" />
          {mode.toUpperCase()} Mode
          {isRunning && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
        </motion.div>
      )}

      {/* Timeline */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((step, index) => {
          const config = phaseConfig[step.phase];
          const Icon = config.icon;
          const isActive = step.phase === currentPhase;
          const isCompleted = step.status === 'completed';
          const isFailed = step.status === 'failed';
          const isPending = step.status === 'pending';
          
          return (
            <motion.div
              key={step.phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center"
            >
              {/* Step */}
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all",
                isActive && "bg-primary/10 border-primary/30 shadow-sm",
                isCompleted && "bg-green-500/10 border-green-500/30",
                isFailed && "bg-red-500/10 border-red-500/30",
                isPending && "bg-muted/50 border-transparent",
              )}>
                {isActive ? (
                  <Loader2 className={cn("w-3.5 h-3.5 animate-spin", config.color)} />
                ) : isCompleted ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                ) : isFailed ? (
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <Icon className={cn("w-3.5 h-3.5", isPending ? 'text-muted-foreground' : config.color)} />
                )}
                
                <span className={cn(
                  "text-xs font-medium whitespace-nowrap",
                  isActive && "text-foreground",
                  isCompleted && "text-green-600 dark:text-green-400",
                  isFailed && "text-red-600 dark:text-red-400",
                  isPending && "text-muted-foreground",
                )}>
                  {step.label || config.label}
                </span>
                
                {step.duration && isCompleted && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatDuration(step.duration)}
                  </span>
                )}
              </div>
              
              {/* Connector */}
              {index < steps.length - 1 && (
                <ChevronRight className={cn(
                  "w-3.5 h-3.5 mx-0.5 shrink-0",
                  isCompleted ? "text-green-500/50" : "text-muted-foreground/30"
                )} />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default PipelineTimeline;
