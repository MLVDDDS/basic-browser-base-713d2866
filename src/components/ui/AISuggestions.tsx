import { useState } from 'react';
import { Sparkles, ArrowRight, Lightbulb, Wand2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Suggestion {
  id: string;
  text: string;
  action: string;
}

interface AISuggestionsProps {
  suggestions: Suggestion[];
  onSelect?: (suggestion: Suggestion) => void;
  onDismiss?: (id: string) => void;
}

export const AISuggestions = ({ suggestions, onSelect, onDismiss }: AISuggestionsProps) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <Lightbulb className="w-3.5 h-3.5 text-primary" />
        <span>AI рекомендует</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSelect?.(suggestion)}
            className="group relative flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
          >
            <Wand2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-sm">{suggestion.text}</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            {onDismiss && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(suggestion.id);
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Demo component for landing page
export const AISuggestionsDemo = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const demoSuggestions: Suggestion[] = [
    { id: '1', text: 'Добавить секцию отзывов', action: 'add_testimonials' },
    { id: '2', text: 'Улучшить Hero с анимацией', action: 'improve_hero' },
    { id: '3', text: 'Добавить форму обратной связи', action: 'add_contact_form' },
    { id: '4', text: 'Оптимизировать для мобильных', action: 'optimize_mobile' },
  ];

  const visibleSuggestions = demoSuggestions.filter(s => !dismissedIds.has(s.id));

  const handleSelect = (suggestion: Suggestion) => {
    setSelectedId(suggestion.id);
    setTimeout(() => setSelectedId(null), 1500);
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const handleReset = () => {
    setDismissedIds(new Set());
    setSelectedId(null);
  };

  return (
    <div className="card-base p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-sm font-medium">AI-ассистент</div>
          <div className="text-xs text-muted-foreground">Подсказки для улучшения</div>
        </div>
      </div>

      {/* Suggestions */}
      {visibleSuggestions.length > 0 ? (
        <div className="space-y-2">
          {visibleSuggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              className={`
                w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left
                ${selectedId === suggestion.id 
                  ? 'border-primary bg-primary/10 scale-[1.02]' 
                  : 'border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5'
                }
              `}
            >
              <Wand2 className={`w-4 h-4 flex-shrink-0 transition-colors ${
                selectedId === suggestion.id ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
              }`} />
              <span className="text-sm flex-1">{suggestion.text}</span>
              {selectedId === suggestion.id ? (
                <span className="text-xs text-primary font-medium animate-pulse">Применяю...</span>
              ) : (
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(suggestion.id);
                }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">Все рекомендации применены!</p>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Показать снова
          </Button>
        </div>
      )}

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-[11px] text-muted-foreground text-center">
          Нажми на подсказку — AI применит изменения
        </p>
      </div>
    </div>
  );
};
