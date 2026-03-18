import { useState, forwardRef } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Sparkles,
  X,
  Target,
  Image,
  MessageSquareQuote,
  Coins,
  Rocket,
  HelpCircle,
  Mail,
  Package,
  LucideIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Section {
  id: string;
  type: string;
  name: string;
  visible: boolean;
  effects: string[];
}

interface SectionItemProps {
  section: Section;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onRemoveEffect?: (effectName: string) => void;
}

const sectionIcons: Record<string, LucideIcon> = {
  hero: Target,
  features: Sparkles,
  gallery: Image,
  testimonials: MessageSquareQuote,
  pricing: Coins,
  cta: Rocket,
  faq: HelpCircle,
  contact: Mail,
  custom: Package,
};

const getSectionIcon = (type: string): LucideIcon => sectionIcons[type] || Package;

// Separate inner content component
const SectionItemContent = ({
  section,
  isActive,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onRemoveEffect,
  dragControls,
}: SectionItemProps & { dragControls: ReturnType<typeof useDragControls> }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasEffects = section.effects && section.effects.length > 0;

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
          isActive ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50 hover:bg-muted',
          !section.visible && 'opacity-50'
        )}
        onClick={onSelect}
      >
        <div
          onPointerDown={(e) => {
            e.preventDefault();
            dragControls.start(e);
          }}
          className="touch-none cursor-grab active:cursor-grabbing p-1 -m-1 hover:bg-muted rounded"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        
        {(() => { const Icon = getSectionIcon(section.type); return <Icon className="w-4 h-4 text-primary" />; })()}
        
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium block truncate">{section.name}</span>
          {hasEffects && !isExpanded && (
            <div className="flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-primary shrink-0" />
              <span className="text-[10px] text-muted-foreground truncate">
                {section.effects.length} эффект{section.effects.length === 1 ? '' : section.effects.length < 5 ? 'а' : 'ов'}
              </span>
            </div>
          )}
        </div>
        
        {hasEffects && (
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
            <DropdownMenuItem onClick={onToggleVisibility}>
              {section.visible ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Скрыть
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Показать
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Дублировать
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Effects badges */}
      {isExpanded && hasEffects && (
        <div className="ml-8 mt-2 flex flex-wrap gap-1.5">
          {section.effects.map((effect, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-0.5 text-[11px] group/badge hover:bg-destructive/10 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="max-w-[100px] truncate">{effect}</span>
              {onRemoveEffect && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveEffect(effect);
                  }}
                  className="ml-0.5 p-0.5 rounded hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};

export const SectionItem = forwardRef<HTMLLIElement, SectionItemProps>(
  (props, ref) => {
    const dragControls = useDragControls();

    return (
      <Reorder.Item
        ref={ref}
        value={props.section}
        id={props.section.id}
        dragListener={false}
        dragControls={dragControls}
        className="group"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
        whileDrag={{ 
          scale: 1.02,
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
          zIndex: 50,
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 400, 
          damping: 30 
        }}
      >
        <SectionItemContent {...props} dragControls={dragControls} />
      </Reorder.Item>
    );
  }
);

SectionItem.displayName = 'SectionItem';
