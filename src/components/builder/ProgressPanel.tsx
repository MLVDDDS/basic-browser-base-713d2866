import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle, 
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Palette,
  Shield,
  Wand2,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

// User-friendly phase labels (no technical jargon)
const PHASE_LABELS: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  idle: { label: 'Готов к работе', icon: Sparkles, description: 'Напишите что создать' },
  intake: { label: 'Читаю запрос', icon: FileText, description: 'Понимаю что вы хотите' },
  analyze: { label: 'Анализирую', icon: FileText, description: 'Разбираю ваш запрос' },
  plan: { label: 'Планирую', icon: Palette, description: 'Продумываю структуру' },
  execute: { label: 'Создаю', icon: Wand2, description: 'Пишу код и стили' },
  validate: { label: 'Проверяю', icon: Shield, description: 'Ищу ошибки' },
  fix: { label: 'Исправляю', icon: Wand2, description: 'Устраняю проблемы' },
  preview: { label: 'Готовлю просмотр', icon: Sparkles, description: 'Скоро покажу результат' },
  deploy: { label: 'Публикую', icon: Rocket, description: 'Загружаю на сервер' },
  complete: { label: 'Готово!', icon: CheckCircle, description: 'Всё сделано' },
  failed: { label: 'Что-то пошло не так', icon: Sparkles, description: 'Попробуйте ещё раз' },
};

interface ProgressPanelProps {
  isRunning: boolean;
  currentPhase: string | null;
  mode: string | null;
  iteration: number;
  maxIterations: number;
  filesCount: number;
  isEpicMode?: boolean;
  epicsCompleted?: number;
  epicsTotal?: number;
  epicProgress?: number;
  className?: string;
}

export function ProgressPanel({
  isRunning,
  currentPhase,
  mode,
  iteration,
  maxIterations,
  filesCount,
  isEpicMode = false,
  epicsCompleted = 0,
  epicsTotal = 0,
  epicProgress = 0,
  className,
}: ProgressPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const phaseConfig = currentPhase ? PHASE_LABELS[currentPhase] : PHASE_LABELS.idle;
  const Icon = phaseConfig?.icon || Sparkles;
  
  if (!isRunning && !currentPhase) return null;

  // Calculate overall progress
  let overallProgress = 0;
  if (isEpicMode && epicsTotal > 0) {
    overallProgress = epicProgress;
  } else if (maxIterations > 0) {
    overallProgress = Math.min(100, Math.round((iteration / maxIterations) * 100));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "rounded-xl border bg-card overflow-hidden",
        isRunning ? "border-primary/30 shadow-lg shadow-primary/5" : "border-border",
        className
      )}
    >
      {/* Main status row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
      >
        {/* Status indicator */}
        <div className={cn(
          "relative p-2 rounded-lg",
          isRunning ? "bg-primary/10" : "bg-green-500/10"
        )}>
          {isRunning ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : currentPhase === 'complete' ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Icon className="w-4 h-4 text-primary" />
          )}
          
          {/* Pulse for running state */}
          {isRunning && (
            <motion.div
              className="absolute inset-0 rounded-lg bg-primary/20"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* Text */}
        <div className="flex-1 text-left">
          <p className={cn(
            "font-medium text-sm",
            isRunning ? "text-foreground" : "text-green-600 dark:text-green-400"
          )}>
            {phaseConfig?.label || 'Работаю...'}
          </p>
          <p className="text-xs text-muted-foreground">
            {phaseConfig?.description || ''}
          </p>
        </div>
        
        {/* Progress indicator */}
        {isRunning && (
          <div className="flex items-center gap-2">
            {filesCount > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {filesCount} файлов
              </span>
            )}
            <div className="text-muted-foreground">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        )}
      </button>
      
      {/* Progress bar */}
      {isRunning && (
        <div className="px-3 pb-2">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(overallProgress, 5)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
      
      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && isRunning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-3 space-y-3">
              {/* Epic mode progress */}
              {isEpicMode && epicsTotal > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Большой проект</span>
                    <span className="text-foreground font-medium">
                      Часть {epicsCompleted + 1} из {epicsTotal}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: epicsTotal }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 h-1.5 rounded-full transition-colors",
                          i < epicsCompleted ? "bg-green-500" :
                          i === epicsCompleted ? "bg-primary animate-pulse" :
                          "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Simple progress info */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {iteration > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Шаг {iteration} из {maxIterations}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ProgressPanel;
