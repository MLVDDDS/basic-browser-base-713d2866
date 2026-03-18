import { cn } from '@/lib/utils';
import { 
  Target,
  Sparkles,
  Package,
  LucideIcon,
} from 'lucide-react';

interface Section {
  id: string;
  type: string;
  name: string;
  visible?: boolean;
  effects?: string[];
}

export interface SectionPreviewProps {
  section: Section;
  isActive: boolean;
  onClick: () => void;
  compact?: boolean;
}

const sectionIcons: Record<string, LucideIcon> = {
  hero: Target,
  features: Sparkles,
  custom: Package,
};

const getSectionIcon = (type: string): LucideIcon => sectionIcons[type] || Package;

export const SectionPreview = ({ section, isActive, onClick, compact = false }: SectionPreviewProps) => {
  if (!section.visible) return null;

  // Compact mode for TMA preview
  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'relative border border-dashed rounded-lg transition-all cursor-pointer mb-3',
          isActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          'group'
        )}
      >
        {section.type === 'hero' && (
          <div className="text-center py-6 px-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 mx-auto mb-3 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold mb-2">Заголовок</h2>
            <p className="text-xs text-muted-foreground mb-3">Описание продукта</p>
            <div className="w-24 h-8 bg-primary rounded-lg mx-auto" />
          </div>
        )}

        {section.type === 'features' && (
          <div className="py-4 px-4">
            <h3 className="text-sm font-semibold text-center mb-3">Возможности</h3>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="text-center p-2 bg-muted/30 rounded">
                  <div className="w-8 h-8 rounded bg-primary/10 mx-auto mb-1 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="h-2 w-12 bg-muted rounded mx-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        {section.type === 'testimonials' && (
          <div className="py-4 px-4">
            <h3 className="text-sm font-semibold text-center mb-3">Отзывы</h3>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="h-2 w-16 bg-muted rounded" />
              </div>
              <div className="h-2 w-full bg-muted/50 rounded" />
            </div>
          </div>
        )}

        {section.type === 'cta' && (
          <div className="text-center py-4 px-4">
            <h3 className="text-sm font-semibold mb-2">Призыв к действию</h3>
            <div className="w-28 h-8 bg-primary rounded-lg mx-auto" />
          </div>
        )}

        {/* Generic fallback for other types */}
        {!['hero', 'features', 'testimonials', 'cta'].includes(section.type) && (
          <div className="py-4 px-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-muted mx-auto mb-2 flex items-center justify-center">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">{section.name}</h3>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative border-2 border-dashed rounded-lg transition-all cursor-pointer mb-4',
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        'group'
      )}
    >
        {section.type === 'hero' && (
          <div className="text-center py-16 px-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-6 flex items-center justify-center">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
              Заголовок Hero
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Подзаголовок с описанием вашего продукта или услуги
          </p>
          <div className="flex gap-3 justify-center">
            <div className="w-28 h-10 bg-primary rounded-lg" />
            <div className="w-28 h-10 bg-muted rounded-lg border border-border" />
          </div>
        </div>
      )}

      {section.type === 'features' && (
        <div className="py-12 px-8">
          <h3 className="text-xl font-semibold text-center mb-8 group-hover:text-primary transition-colors">
            Возможности
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="h-3 w-20 bg-muted rounded mx-auto mb-2" />
                <div className="h-2 w-32 bg-muted/50 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      )}

      {section.type === 'gallery' && (
        <div className="py-12 px-8">
          <h3 className="text-xl font-semibold text-center mb-8 group-hover:text-primary transition-colors">
            Галерея
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {section.type === 'testimonials' && (
        <div className="py-12 px-8">
          <h3 className="text-xl font-semibold text-center mb-8 group-hover:text-primary transition-colors">
            Отзывы
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div>
                    <div className="h-3 w-24 bg-muted rounded mb-1" />
                    <div className="h-2 w-16 bg-muted/50 rounded" />
                  </div>
                </div>
                <div className="h-2 w-full bg-muted/50 rounded mb-1" />
                <div className="h-2 w-3/4 bg-muted/50 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {section.type === 'pricing' && (
        <div className="py-12 px-8">
          <h3 className="text-xl font-semibold text-center mb-8 group-hover:text-primary transition-colors">
            Тарифы
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {['Старт', 'Про', 'Бизнес'].map((plan) => (
              <div key={plan} className="p-4 bg-muted/30 rounded-lg border border-border text-center">
                <div className="text-sm font-medium mb-2">{plan}</div>
                <div className="text-2xl font-bold mb-3">$XX</div>
                <div className="h-8 w-full bg-primary/20 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {section.type === 'cta' && (
        <div className="text-center py-12 px-8">
          <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">
            Призыв к действию
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Описание с мотивацией для пользователя
          </p>
          <div className="w-36 h-12 bg-primary rounded-lg mx-auto" />
        </div>
      )}

      {section.type === 'faq' && (
        <div className="py-12 px-8">
          <h3 className="text-xl font-semibold text-center mb-8 group-hover:text-primary transition-colors">
            FAQ
          </h3>
          <div className="space-y-3 max-w-lg mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                <div className="h-3 w-48 bg-muted rounded" />
                <div className="w-4 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {section.type === 'contact' && (
        <div className="py-12 px-8">
          <h3 className="text-xl font-semibold text-center mb-8 group-hover:text-primary transition-colors">
            Контакты
          </h3>
          <div className="max-w-md mx-auto space-y-3">
            <div className="h-10 bg-muted/50 rounded-lg border border-border" />
            <div className="h-10 bg-muted/50 rounded-lg border border-border" />
            <div className="h-24 bg-muted/50 rounded-lg border border-border" />
            <div className="h-10 bg-primary rounded-lg" />
          </div>
        </div>
      )}

        {section.type === 'custom' && (
          <div className="py-12 px-8 text-center">
            <div className="w-16 h-16 rounded-lg bg-muted mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
              {section.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Кастомная секция
            </p>
          </div>
        )}

      {/* Overlay with section name (non-blocking) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 transition-opacity rounded-lg',
          'group-hover:opacity-100'
        )}
      >
        <span className="text-sm font-medium">{section.name}</span>
      </div>
    </div>
  );
};
