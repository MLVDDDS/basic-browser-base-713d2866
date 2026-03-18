/**
 * Contextual horizontal chip row near the input
 */
import { motion } from 'framer-motion';
import { Sparkles, Plus, Wrench, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AISuggestion {
  id: string;
  text: string;
  type: 'improve' | 'add' | 'fix' | 'effect';
  priority: 'high' | 'medium' | 'low';
}

interface SuggestionsPanelProps {
  suggestions: AISuggestion[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuggestionClick: (suggestion: AISuggestion) => void;
  maxVisible?: number;
  className?: string;
  // NEW: Only show after first build
  hasCompletedBuild?: boolean;
}

const typeIcons = {
  improve: Sparkles,
  add: Plus,
  fix: Wrench,
  effect: Wand2,
};

const priorityStyles = {
  high: 'border-foreground/15 bg-foreground/[0.03] text-foreground',
  medium: 'border-border/70 bg-background text-foreground/90',
  low: 'border-border/50 bg-background text-muted-foreground',
};

export function SuggestionsPanel({
  suggestions,
  isOpen: _isOpen,
  onOpenChange: _onOpenChange,
  onSuggestionClick,
  maxVisible = 4,
  className,
  hasCompletedBuild = false,
}: SuggestionsPanelProps) {
  // Don't show suggestions until first build is complete
  if (!hasCompletedBuild || suggestions.length === 0) return null;

  const visibleSuggestions = suggestions.slice(0, maxVisible);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("px-4 pb-2 pt-1.5", className)}
    >
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleSuggestions.map((suggestion, idx) => {
          const Icon = typeIcons[suggestion.type];
          return (
            <motion.button
              key={suggestion.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.18 }}
              onClick={() => onSuggestionClick(suggestion)}
              className={cn(
                "group inline-flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 text-[12px] leading-none transition-[border-color,background-color,color,transform]",
                "backdrop-blur-sm hover:bg-muted/50 hover:text-foreground active:scale-[0.985]",
                priorityStyles[suggestion.priority]
              )}
              title={suggestion.reasoning || suggestion.text}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground/80" />
              <span className="max-w-[220px] truncate">{suggestion.text}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
