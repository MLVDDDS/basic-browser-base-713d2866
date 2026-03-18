/**
 * ⏳ LoadingState Component
 * Shows loading indicator while waiting for agent response
 */
import { motion } from 'framer-motion';
import { Brain, Loader2, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PipelineMode, PipelinePhase } from '@/hooks/useUnifiedOrchestrator';

interface LoadingStateProps {
  iteration?: number;
  maxIterations?: number;
  mode?: PipelineMode | null;
  phase?: PipelinePhase | null;
  className?: string;
}

const modeConfig = {
  light: { bg: 'bg-green-500/10', text: 'text-green-600', label: 'LIGHT' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: 'LOW' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', label: 'MEDIUM' },
  high: { bg: 'bg-purple-500/10', text: 'text-purple-600', label: 'HIGH' },
};

const phaseLabels = {
  plan: { icon: Brain, label: 'Планирование', emoji: '📋' },
  execute: { icon: Zap, label: 'Выполнение', emoji: '⚡' },
  validate: { icon: Sparkles, label: 'Валидация', emoji: '✅' },
};

export function LoadingState({
  iteration = 0,
  maxIterations = 5,
  mode,
  phase,
  className
}: LoadingStateProps) {
  void iteration;
  void maxIterations;
  const modeStyle = mode ? modeConfig[mode] : null;
  const phaseConfig = phase ? phaseLabels[phase] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-2", className)}
    >
      {/* Main loading card */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Анализирую запрос...</p>
          <p className="text-xs text-muted-foreground">Подготовка к генерации</p>
        </div>
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      </div>
      
      {/* Mode and phase badges */}
      {(mode || phase) && (
        <div className="flex items-center gap-2 text-xs pl-1">
          {modeStyle && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "px-2 py-0.5 rounded-full font-medium",
                modeStyle.bg,
                modeStyle.text
              )}
            >
              {modeStyle.label}
            </motion.span>
          )}
          
          {phaseConfig && (
            <motion.span
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-muted-foreground flex items-center gap-1"
            >
              <span>{phaseConfig.emoji}</span>
              <span>{phaseConfig.label}</span>
            </motion.span>
          )}
          
          <Loader2 className="w-3 h-3 animate-spin ml-auto" />
        </div>
      )}
    </motion.div>
  );
}
