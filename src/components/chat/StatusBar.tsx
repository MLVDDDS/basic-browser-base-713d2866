/**
 * 🎛️ StatusBar Component
 * Shows current generation mode, phase and stop button
 */
import { motion } from 'framer-motion';
import { Loader2, Square, Brain, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PipelineMode, PipelinePhase } from '@/hooks/useUnifiedOrchestrator';

interface StatusBarProps {
  mode: PipelineMode | null;
  phase: PipelinePhase | null;
  iteration?: number;
  maxIterations?: number;
  stepsCount?: number;
  onStop: () => void;
  className?: string;
}

const modeStyles = {
  light: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/30' },
  high: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' },
};

const phaseConfig = {
  plan: { icon: Brain, label: 'Планирование', emoji: '📋' },
  execute: { icon: Zap, label: 'Выполнение', emoji: '⚡' },
  validate: { icon: CheckCircle2, label: 'Валидация', emoji: '✅' },
};

export function StatusBar({
  mode,
  phase,
  iteration = 0,
  maxIterations = 0,
  stepsCount = 0,
  onStop,
  className
}: StatusBarProps) {
  const modeStyle = mode ? modeStyles[mode] : null;
  const currentPhase = phase ? phaseConfig[phase] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={cn(
        "flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg",
        "bg-muted/30 border border-border/50",
        className
      )}
    >
      {/* Mode badge */}
      {modeStyle && (
        <span className={cn(
          "px-2 py-0.5 rounded-full font-medium border",
          modeStyle.bg,
          modeStyle.text,
          modeStyle.border
        )}>
          {mode?.toUpperCase()}
        </span>
      )}
      
      {/* Phase indicator */}
      {currentPhase && (
        <span className="text-muted-foreground flex items-center gap-1">
          <span>{currentPhase.emoji}</span>
          <span>{currentPhase.label}</span>
        </span>
      )}
      
      {/* Loading spinner */}
      <Loader2 className="w-3 h-3 animate-spin text-primary" />

      <span className="text-muted-foreground">
        Прогресс: {stepsCount} steps{maxIterations > 0 ? ` • ${iteration}/${maxIterations}` : ''}
      </span>
      
      {/* Stop button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onStop}
        className="ml-auto h-6 text-xs gap-1 hover:text-destructive hover:bg-destructive/10"
      >
        <Square className="w-3 h-3" />
        Стоп
      </Button>
    </motion.div>
  );
}
