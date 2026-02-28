import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  Search,
  Palette,
  Type,
  Square,
  MousePointer,
  ArrowDown,
  Sparkles,
  Loader,
  Zap,
  Check,
  Plus,
} from 'lucide-react';
import { EFFECT_CATEGORIES, EFFECTS_LIBRARY, getEffectsByCategory } from '@/data/effects';
import { EffectCategory } from '@/types/siteSpec';

interface EffectsPanelProps {
  onClose: () => void;
  onSelectEffect: (effectId: string, effectName: string) => void;
  activeSection: string | null;
  activeSectionEffects: string[];
}

const categoryIcons: Record<EffectCategory, React.ReactNode> = {
  background: <Palette className="w-4 h-4" />,
  text: <Type className="w-4 h-4" />,
  cards: <Square className="w-4 h-4" />,
  cursor: <MousePointer className="w-4 h-4" />,
  scroll: <ArrowDown className="w-4 h-4" />,
  transitions: <Sparkles className="w-4 h-4" />,
  loaders: <Loader className="w-4 h-4" />,
  '3d': <Sparkles className="w-4 h-4" />,
};

const performanceBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  light: { label: 'Лёгкий', variant: 'secondary' },
  medium: { label: 'Средний', variant: 'default' },
  heavy: { label: 'Тяжёлый', variant: 'destructive' },
};

export const EffectsPanel = ({ 
  onClose, 
  onSelectEffect, 
  activeSection,
  activeSectionEffects 
}: EffectsPanelProps) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<EffectCategory | 'all'>('all');

  const filteredEffects = activeCategory === 'all' 
    ? EFFECTS_LIBRARY 
    : getEffectsByCategory(activeCategory);

  const searchedEffects = search 
    ? filteredEffects.filter(e => 
        e.nameRu.toLowerCase().includes(search.toLowerCase()) ||
        e.descriptionRu.toLowerCase().includes(search.toLowerCase())
      )
    : filteredEffects;

  const isEffectAdded = (effectName: string) => activeSectionEffects.includes(effectName);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onClose}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold flex-1">Библиотека эффектов</h3>
        <Badge variant="outline" className="gap-1">
          <Zap className="w-3 h-3" />
          {searchedEffects.length}
        </Badge>
      </div>

      {/* Active section indicator */}
      {activeSection ? (
        <div className="px-4 py-2 bg-primary/10 border-b border-primary/20">
          <p className="text-xs text-primary">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Эффекты добавятся к выбранной секции
          </p>
        </div>
      ) : (
        <div className="px-4 py-2 bg-muted border-b border-border">
          <p className="text-xs text-muted-foreground">
            Выберите секцию для добавления эффектов
          </p>
        </div>
      )}

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск эффектов..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-border overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('all')}
          >
            Все
          </Button>
          {EFFECT_CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              className="gap-2 whitespace-nowrap"
              onClick={() => setActiveCategory(cat.id)}
            >
              {categoryIcons[cat.id]}
              {cat.nameRu}
            </Button>
          ))}
        </div>
      </div>

      {/* Effects Grid */}
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-1 gap-3">
          {searchedEffects.map((effect) => {
            const isAdded = isEffectAdded(effect.nameRu);
            
            return (
              <button
                key={effect.id}
                onClick={() => !isAdded && activeSection && onSelectEffect(effect.id, effect.nameRu)}
                disabled={!activeSection || isAdded}
                className={cn(
                  'p-4 rounded-lg border text-left transition-all',
                  'group cursor-pointer',
                  isAdded 
                    ? 'border-primary/50 bg-primary/5 cursor-default'
                    : activeSection
                      ? 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                      : 'border-border bg-card opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className={cn(
                    'font-medium text-sm transition-colors',
                    isAdded ? 'text-primary' : 'group-hover:text-primary'
                  )}>
                    {effect.nameRu}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    {isAdded && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 gap-1">
                        <Check className="w-3 h-3" />
                        Добавлен
                      </Badge>
                    )}
                    <Badge {...performanceBadge[effect.performance]} className="text-[10px] px-1.5 py-0">
                      {performanceBadge[effect.performance].label}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {effect.descriptionRu}
                </p>
                
                {/* Action hint */}
                {!isAdded && activeSection && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3 h-3" />
                    Нажмите для добавления
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
