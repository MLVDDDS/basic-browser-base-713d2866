import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Sparkles,
  Brain,
  Wrench,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentStep, PipelinePhase } from '@/hooks/useUnifiedOrchestrator';

// Extended mode type including 'epic' for long prompts
type PipelineMode = 'light' | 'low' | 'medium' | 'high' | 'epic';

interface RealtimeProgressProps {
  isRunning: boolean;
  mode: PipelineMode | null;
  currentPhase: PipelinePhase | null;
  steps: AgentStep[];
  iteration: number;
  maxIterations: number;
  filesCount: number;
  isEpicMode?: boolean;
  epicsCompleted?: number;
  epicsTotal?: number;
  epicProgress?: number;
  className?: string;
}

const phaseLabels: Record<string, string> = {
  idle: 'Ожидание',
  intake: 'Анализ требований',
  analyze: 'Анализ',
  plan: 'Планирование',
  execute: 'Выполнение',
  validate: 'Валидация',
  fix: 'Исправление',
  preview: 'Превью',
  deploy: 'Деплой',
  complete: 'Завершено',
  failed: 'Ошибка',
};

const modeConfig: Record<PipelineMode, { label: string; color: string; icon: typeof Zap }> = {
  light: { label: 'Light', color: 'text-green-500 bg-green-500/10', icon: Zap },
  low: { label: 'Low', color: 'text-blue-500 bg-blue-500/10', icon: Zap },
  medium: { label: 'Medium', color: 'text-yellow-500 bg-yellow-500/10', icon: Brain },
  high: { label: 'High', color: 'text-purple-500 bg-purple-500/10', icon: Brain },
  epic: { label: 'Epic', color: 'text-violet-500 bg-violet-500/10', icon: Sparkles },
};

export function RealtimeProgress({
  isRunning,
  mode,
  currentPhase,
  steps,
  iteration,
  maxIterations,
  filesCount,
  isEpicMode,
  epicsCompleted = 0,
  epicsTotal = 0,
  epicProgress = 0,
  className,
}: RealtimeProgressProps) {
  // Calculate progress based on steps
  const progress = useMemo(() => {
    if (!isRunning) return 100;
    
    const thinkingSteps = steps.filter(s => s.type === 'thinking').length;
    const toolCalls = steps.filter(s => s.type === 'tool_call').length;
    const toolResults = steps.filter(s => s.type === 'tool_result').length;
    
    // Estimate progress based on activity
    const estimatedProgress = Math.min(
      90,
      (thinkingSteps * 5) + (toolCalls * 10) + (toolResults * 10) + (filesCount * 5)
    );
    
    return estimatedProgress;
  }, [isRunning, steps, filesCount]);

  // Get recent activity
  const recentActivity = useMemo(() => {
    return steps.slice(-3).reverse();
  }, [steps]);

  // Mode configuration
  const modeInfo = mode ? modeConfig[mode] : null;
  const ModeIcon = modeInfo?.icon || Zap;

  if (!isRunning && !steps.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        "bg-card/95 backdrop-blur-lg border border-border rounded-xl shadow-xl overflow-hidden",
        className
      )}
    >
      {/* Header with mode and phase */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mode badge */}
          {modeInfo && (
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              modeInfo.color
            )}>
              <ModeIcon className="w-3 h-3" />
              {modeInfo.label}
            </div>
          )}
          
          {/* Phase indicator */}
          {currentPhase && (
            <div className="flex items-center gap-1.5 text-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span className="text-muted-foreground">
                {phaseLabels[currentPhase] || currentPhase}
              </span>
            </div>
          )}
        </div>
        
        {/* Iteration counter */}
        <div className="text-xs text-muted-foreground">
          {iteration > 0 && `${iteration}/${maxIterations}`}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              isEpicMode 
                ? "bg-gradient-to-r from-violet-500 to-blue-500" 
                : "bg-gradient-to-r from-primary to-primary/70"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${isEpicMode ? epicProgress : progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Epic mode progress */}
      {isEpicMode && epicsTotal > 0 && (
        <div className="px-4 py-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-violet-500 font-medium">Эпики</span>
            <span className="text-muted-foreground">{epicsCompleted}/{epicsTotal}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: epicsTotal }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i < epicsCompleted 
                    ? "bg-violet-500" 
                    : i === epicsCompleted 
                      ? "bg-violet-500/50 animate-pulse" 
                      : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent activity feed */}
      <div className="px-4 py-2 space-y-1 max-h-32 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {recentActivity.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 text-xs"
            >
              {step.type === 'thinking' && (
                <>
                  <Brain className="w-3 h-3 text-amber-500" />
                  <span className="text-muted-foreground truncate">
                    {step.content?.slice(0, 50) || 'Размышление...'}
                  </span>
                </>
              )}
              {step.type === 'tool_call' && (
                <>
                  <Wrench className="w-3 h-3 text-blue-500" />
                  <span className="text-blue-500 font-medium">{step.name}</span>
                  {(step.args as { path?: string })?.path && (
                    <span className="text-muted-foreground truncate">
                      {(step.args as { path: string }).path}
                    </span>
                  )}
                </>
              )}
              {step.type === 'tool_result' && (
                <>
                  {step.success ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className={step.success ? 'text-green-600' : 'text-red-500'}>
                    {step.success ? 'Готово' : 'Ошибка'}
                  </span>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Files counter */}
      {filesCount > 0 && (
        <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileCode className="w-3 h-3" />
            <span>Файлов создано</span>
          </div>
          <span className="font-medium text-primary">{filesCount}</span>
        </div>
      )}
    </motion.div>
  );
}

export default RealtimeProgress;
