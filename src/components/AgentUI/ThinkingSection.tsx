import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingSectionProps {
  content: string;
  duration?: number;
  isActive?: boolean;
  defaultExpanded?: boolean;
}

export function ThinkingSection({
  content,
  duration,
  isActive = false,
  defaultExpanded = false
}: ThinkingSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
      >
        <div className={cn(
          "p-1.5 rounded-md",
          isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {isActive ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
        </div>
        
        <span className="flex-1 text-left text-sm font-medium">
          {isActive ? 'Думаю...' : 'Процесс мышления'}
        </span>
        
        {duration && (
          <span className="text-xs text-muted-foreground">
            {formatDuration(duration)}
          </span>
        )}
        
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 border-t border-border">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                {content || 'Обработка...'}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
