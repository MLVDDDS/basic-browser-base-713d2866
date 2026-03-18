import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Brain, FileCode, Wrench, Plus, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAgentStep, type AgentAction } from '@/lib/agent-labels';

interface AgentStatusCardProps {
  step?: {
    type: string;
    label?: string;
    content?: string;
    file?: string;
  };
  isThinking?: boolean;
  isComplete?: boolean;
  className?: string;
}

const iconMap: Record<AgentAction['icon'], React.ElementType> = {
  thinking: Brain,
  writing: FileCode,
  editing: Sparkles,
  fixing: Wrench,
  adding: Plus,
  checking: Search,
  done: Check,
};

export function AgentStatusCard({ 
  step, 
  isThinking = false, 
  isComplete = false,
  className 
}: AgentStatusCardProps) {
  const action = step ? formatAgentStep(step) : isThinking 
    ? { label: 'Думаю...', description: 'Анализирую задачу', icon: 'thinking' as const }
    : { label: 'Готово', description: 'Изменения применены', icon: 'done' as const };

  const Icon = iconMap[action.icon];
  const showSpinner = !isComplete && (isThinking || step);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={action.label}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl',
          'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent',
          'border border-primary/20',
          isComplete && 'from-green-500/10 via-green-500/5 border-green-500/20',
          className
        )}
      >
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          'bg-primary/10',
          isComplete && 'bg-green-500/10'
        )}>
          {showSpinner ? (
            <Loader2 className={cn(
              'w-5 h-5 animate-spin',
              isComplete ? 'text-green-500' : 'text-primary'
            )} />
          ) : (
            <Icon className={cn(
              'w-5 h-5',
              isComplete ? 'text-green-500' : 'text-primary'
            )} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={cn(
            'font-medium text-sm',
            isComplete ? 'text-green-600 dark:text-green-400' : 'text-foreground'
          )}>
            {action.label}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {step?.file ? `Файл: ${step.file.split('/').pop()}` : action.description}
          </div>
        </div>

        {/* Animated dots for in-progress */}
        {showSpinner && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/40"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Simple inline status for chat messages
export function AgentInlineStatus({ 
  label, 
  isComplete = false 
}: { 
  label: string; 
  isComplete?: boolean;
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full',
      isComplete 
        ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
        : 'bg-primary/10 text-primary'
    )}>
      {isComplete ? (
        <Check className="w-3 h-3" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin" />
      )}
      {label}
    </span>
  );
}
