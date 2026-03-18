import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Layers, 
  Target,
  Sparkles,
  Image,
  MessageSquareQuote,
  Coins,
  Rocket,
  Package,
  LucideIcon,
} from 'lucide-react';
import { DraggableSection, AdvancedSection } from './DraggableSection';
import { cn } from '@/lib/utils';

const sectionIcons: Record<string, LucideIcon> = {
  hero: Target,
  features: Sparkles,
  gallery: Image,
  testimonials: MessageSquareQuote,
  pricing: Coins,
  cta: Rocket,
  custom: Package,
};

const getSectionIcon = (type: string): LucideIcon => sectionIcons[type] || Package;

interface SectionListProps {
  sections: AdvancedSection[];
  onSectionsChange: (sections: AdvancedSection[]) => void;
  activeSection: string | null;
  onSelectSection: (id: string | null) => void;
  onAddSection: () => void;
}

export const SectionList = ({
  sections,
  onSectionsChange,
  activeSection,
  onSelectSection,
  onAddSection,
}: SectionListProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id as string || null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      onSectionsChange(arrayMove(sections, oldIndex, newIndex));
    }
  }, [sections, onSectionsChange]);

  const handleDelete = useCallback((id: string) => {
    onSectionsChange(sections.filter(s => s.id !== id));
    if (activeSection === id) {
      onSelectSection(null);
    }
  }, [sections, activeSection, onSectionsChange, onSelectSection]);

  const handleDuplicate = useCallback((id: string) => {
    const idx = sections.findIndex(s => s.id === id);
    if (idx === -1) return;
    
    const section = sections[idx];
    const newSection: AdvancedSection = {
      ...section,
      id: Date.now().toString(),
      name: `${section.name} (копия)`,
    };
    
    const newSections = [...sections];
    newSections.splice(idx + 1, 0, newSection);
    onSectionsChange(newSections);
  }, [sections, onSectionsChange]);

  const handleToggleVisibility = useCallback((id: string) => {
    onSectionsChange(
      sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s)
    );
  }, [sections, onSectionsChange]);

  const handleMoveUp = useCallback((id: string) => {
    const idx = sections.findIndex(s => s.id === id);
    if (idx <= 0) return;
    onSectionsChange(arrayMove(sections, idx, idx - 1));
  }, [sections, onSectionsChange]);

  const handleMoveDown = useCallback((id: string) => {
    const idx = sections.findIndex(s => s.id === id);
    if (idx === -1 || idx >= sections.length - 1) return;
    onSectionsChange(arrayMove(sections, idx, idx + 1));
  }, [sections, onSectionsChange]);

  const handleUpdateLayout = useCallback((id: string, layout: Partial<AdvancedSection['layout']>) => {
    onSectionsChange(
      sections.map(s => s.id === id ? { ...s, layout: { ...s.layout, ...layout } } : s)
    );
  }, [sections, onSectionsChange]);

  const activeItem = activeId ? sections.find(s => s.id === activeId) : null;

  return (
    <div className="flex flex-col h-full">
      {sections.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Layers className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium mb-1">Нет секций</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Добавьте первую секцию
          </p>
          <Button onClick={onAddSection} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Добавить
          </Button>
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always,
              },
            }}
          >
            <SortableContext
              items={sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <DraggableSection
                    key={section.id}
                    section={section}
                    isActive={activeSection === section.id}
                    isOver={overId === section.id}
                    onSelect={() => onSelectSection(section.id)}
                    onDelete={() => handleDelete(section.id)}
                    onDuplicate={() => handleDuplicate(section.id)}
                    onToggleVisibility={() => handleToggleVisibility(section.id)}
                    onMoveUp={() => handleMoveUp(section.id)}
                    onMoveDown={() => handleMoveDown(section.id)}
                    onUpdateLayout={(layout) => handleUpdateLayout(section.id, layout)}
                    canMoveUp={index > 0}
                    canMoveDown={index < sections.length - 1}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeItem ? (
                <div className="bg-card border border-primary rounded-lg p-3 shadow-2xl">
                  <div className="flex items-center gap-2">
                    {(() => { const Icon = getSectionIcon(activeItem.type); return <Icon className="w-4 h-4 text-primary" />; })()}
                    <span className="text-sm font-medium">{activeItem.name}</span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <Button
            variant="outline"
            className="w-full mt-4 gap-2"
            size="sm"
            onClick={onAddSection}
          >
            <Plus className="w-4 h-4" />
            Добавить секцию
          </Button>
        </>
      )}
    </div>
  );
};
