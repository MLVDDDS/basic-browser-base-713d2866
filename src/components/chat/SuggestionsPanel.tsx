/**
 * 💡 SuggestionsPanel Component v2.0
 * Contextual suggestions shown only after first successful build
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronUp, ChevronDown, Wand2, ArrowRight, Sparkles, Plus, Wrench } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

const typeLabels = {
  improve: 'Улучшить',
  add: 'Добавить',
  fix: 'Исправить',
  effect: 'Эффект',
};

const priorityStyles = {
  high: 'border-primary/40 bg-primary/5 hover:border-primary/60',
  medium: 'border-border hover:border-primary/40',
  low: 'border-border/50 hover:border-border',
};

export function SuggestionsPanel({
  suggestions,
  isOpen,
  onOpenChange,
  onSuggestionClick,
  maxVisible = 4,
  className,
  hasCompletedBuild = false,
}: SuggestionsPanelProps) {
  // Don't show suggestions until first build is complete
  if (!hasCompletedBuild || suggestions.length === 0) return null;

  const visibleSuggestions = suggestions.slice(0, maxVisible);
  const hasMore = suggestions.length > maxVisible;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className={cn("border-t border-border/50", className)}
    >
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between gap-2 px-4 py-3 text-xs text-muted-foreground hover:bg-muted/30 transition-all group">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Lightbulb className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-medium text-foreground/80">Рекомендации</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {suggestions.length}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="px-4 pb-4 space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {visibleSuggestions.map((suggestion, idx) => {
              const Icon = typeIcons[suggestion.type];
              return (
                <motion.button
                  key={suggestion.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                  onClick={() => onSuggestionClick(suggestion)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-200",
                    "hover:shadow-sm active:scale-[0.99]",
                    "text-xs flex items-center gap-3 group",
                    priorityStyles[suggestion.priority]
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    suggestion.priority === 'high' 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                  )}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block truncate text-foreground/90 group-hover:text-foreground transition-colors">
                      {suggestion.text}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">
                      {typeLabels[suggestion.type]}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </motion.button>
              );
            })}
          </AnimatePresence>
          
          {hasMore && (
            <p className="text-center pt-1">
              <span className="text-[10px] text-muted-foreground/60">
                +{suggestions.length - maxVisible} ещё
              </span>
            </p>
          )}
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}
