import { cn } from '@/lib/utils';
import { AdvancedSection } from './DraggableSection';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface VisualPreviewProps {
  sections: AdvancedSection[];
  activeSection: string | null;
  onSelectSection: (id: string) => void;
  projectSlug: string;
}

const sectionTypeToPreview: Record<string, React.ReactNode> = {
  hero: (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-2/3 h-8 bg-foreground/20 rounded mb-4" />
      <div className="w-1/2 h-4 bg-foreground/10 rounded mb-6" />
      <div className="w-28 h-10 bg-primary rounded-lg" />
    </div>
  ),
  features: (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-xl mb-3" />
          <div className="w-20 h-3 bg-foreground/20 rounded mb-2" />
          <div className="w-24 h-2 bg-foreground/10 rounded" />
        </div>
      ))}
    </div>
  ),
  gallery: (
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="aspect-square bg-muted rounded-lg" />
      ))}
    </div>
  ),
  testimonials: (
    <div className="grid grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="bg-muted/50 rounded-lg p-4">
          <div className="w-full h-3 bg-foreground/10 rounded mb-2" />
          <div className="w-3/4 h-3 bg-foreground/10 rounded mb-4" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted rounded-full" />
            <div className="w-16 h-2 bg-foreground/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  ),
  pricing: (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={cn(
          'bg-muted/50 rounded-lg p-4',
          i === 2 && 'ring-2 ring-primary'
        )}>
          <div className="w-16 h-3 bg-foreground/20 rounded mb-2" />
          <div className="w-12 h-6 bg-foreground/30 rounded mb-3" />
          <div className="space-y-2 mb-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="w-full h-2 bg-foreground/10 rounded" />
            ))}
          </div>
          <div className="w-full h-8 bg-primary/50 rounded" />
        </div>
      ))}
    </div>
  ),
  cta: (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-1/2 h-6 bg-foreground/20 rounded mb-3" />
      <div className="w-1/3 h-3 bg-foreground/10 rounded mb-5" />
      <div className="w-32 h-10 bg-primary rounded-lg" />
    </div>
  ),
  faq: (
    <div className="space-y-3 max-w-md mx-auto">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-muted/50 rounded-lg p-3">
          <div className="w-3/4 h-3 bg-foreground/15 rounded" />
        </div>
      ))}
    </div>
  ),
  contact: (
    <div className="max-w-sm mx-auto">
      <div className="w-1/2 h-4 bg-foreground/20 rounded mx-auto mb-4" />
      <div className="space-y-3">
        <div className="w-full h-10 bg-muted rounded" />
        <div className="w-full h-10 bg-muted rounded" />
        <div className="w-full h-20 bg-muted rounded" />
        <div className="w-full h-10 bg-primary rounded" />
      </div>
    </div>
  ),
  custom: (
    <div className="flex items-center justify-center h-32">
      <div className="text-muted-foreground text-sm">Кастомный блок</div>
    </div>
  ),
};

const widthClasses: Record<string, string> = {
  full: 'max-w-full',
  wide: 'max-w-5xl mx-auto',
  medium: 'max-w-3xl mx-auto',
  narrow: 'max-w-xl mx-auto',
};

const paddingClasses: Record<string, string> = {
  none: 'py-0',
  sm: 'py-4',
  md: 'py-8',
  lg: 'py-12',
  xl: 'py-20',
};

export const VisualPreview = ({
  sections,
  activeSection,
  onSelectSection,
  projectSlug,
}: VisualPreviewProps) => {
  return (
    <div className="space-y-0">
      <AnimatePresence mode="popLayout">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: section.visible ? 1 : 0.3, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'relative cursor-pointer transition-all duration-200',
              paddingClasses[section.layout.padding],
              activeSection === section.id && 'ring-2 ring-primary ring-inset'
            )}
            onClick={() => onSelectSection(section.id)}
          >
            {/* Active indicator */}
            {activeSection === section.id && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded font-medium z-10">
                {section.name}
              </div>
            )}

            {/* Section content */}
            <div className={cn(widthClasses[section.layout.width], 'px-6')}>
              {section.layout.columns > 1 ? (
                <div className={cn(
                  'grid gap-4',
                  section.layout.columns === 2 && 'grid-cols-2',
                  section.layout.columns === 3 && 'grid-cols-3',
                  section.layout.columns === 4 && 'grid-cols-4'
                )}>
                  {Array.from({ length: section.layout.columns }).map((_, i) => (
                    <div key={i} className="bg-muted/30 rounded-lg p-4 min-h-[100px]">
                      <div className="w-full h-3 bg-foreground/10 rounded mb-2" />
                      <div className="w-3/4 h-3 bg-foreground/10 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                sectionTypeToPreview[section.type] || sectionTypeToPreview.custom
              )}
            </div>

            {/* Effects indicator */}
            {section.effects.length > 0 && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-accent/20 text-accent-foreground text-xs rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {section.effects.length}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
