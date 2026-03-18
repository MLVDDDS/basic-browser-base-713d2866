import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Columns,
  Maximize2,
  ChevronUp,
  ChevronDown,
  Settings2,
  Target,
  Sparkles,
  Image,
  MessageSquareQuote,
  Coins,
  Rocket,
  HelpCircle,
  Mail,
  Package,
  Folder,
  LucideIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

export interface AdvancedSection {
  id: string;
  type: string;
  name: string;
  visible: boolean;
  effects: string[];
  layout: {
    columns: 1 | 2 | 3 | 4;
    width: 'full' | 'wide' | 'medium' | 'narrow';
    padding: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
  children?: AdvancedSection[];
}

interface DraggableSectionProps {
  section: AdvancedSection;
  isActive: boolean;
  isOver?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdateLayout: (layout: Partial<AdvancedSection['layout']>) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
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
  container: Folder,
};

const getSectionIcon = (type: string): LucideIcon => sectionIcons[type] || Package;

const widthLabels: Record<string, string> = {
  full: 'Полная',
  wide: 'Широкая',
  medium: 'Средняя',
  narrow: 'Узкая',
};

const paddingLabels: Record<string, string> = {
  none: 'Без отступов',
  sm: 'Маленькие',
  md: 'Средние',
  lg: 'Большие',
  xl: 'Очень большие',
};

export const DraggableSection = ({
  section,
  isActive,
  isOver,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onUpdateLayout,
  canMoveUp,
  canMoveDown,
}: DraggableSectionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-lg border transition-all duration-200',
        isActive 
          ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/20' 
          : 'bg-card border-border hover:border-muted-foreground/30',
        isDragging && 'opacity-50 shadow-2xl z-50',
        isOver && 'border-primary border-dashed bg-primary/5',
        !section.visible && 'opacity-50'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 group">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing p-1 -m-1 hover:bg-muted rounded transition-colors"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Icon */}
        {(() => { const Icon = getSectionIcon(section.type); return <Icon className="w-4 h-4 text-primary" />; })()}

        {/* Name and info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{section.name}</span>
            {section.layout.columns > 1 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {section.layout.columns} кол.
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground">
              {widthLabels[section.layout.width]}
            </span>
            {section.effects.length > 0 && (
              <span className="text-[10px] text-primary">
                {section.effects.length} эфф.
              </span>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Visibility */}
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

            <DropdownMenuSeparator />

            {/* Layout options */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Columns className="w-4 h-4 mr-2" />
                Колонки
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {[1, 2, 3, 4].map((cols) => (
                  <DropdownMenuItem
                    key={cols}
                    onClick={() => onUpdateLayout({ columns: cols as 1 | 2 | 3 | 4 })}
                    className={section.layout.columns === cols ? 'bg-accent' : ''}
                  >
                    {cols} {cols === 1 ? 'колонка' : cols < 5 ? 'колонки' : 'колонок'}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Maximize2 className="w-4 h-4 mr-2" />
                Ширина
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {Object.entries(widthLabels).map(([value, label]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => onUpdateLayout({ width: value as AdvancedSection['layout']['width'] })}
                    className={section.layout.width === value ? 'bg-accent' : ''}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings2 className="w-4 h-4 mr-2" />
                Отступы
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {Object.entries(paddingLabels).map(([value, label]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => onUpdateLayout({ padding: value as AdvancedSection['layout']['padding'] })}
                    className={section.layout.padding === value ? 'bg-accent' : ''}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Actions */}
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

      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />
      )}
    </div>
  );
};
