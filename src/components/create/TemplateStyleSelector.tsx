/**
 * 🎨 Template & Style Selector Component
 * 
 * Enhanced UI for selecting design templates and styles
 * during project creation.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Layout,
  BarChart3,
  ShoppingBag,
  Briefcase,
  Rocket,
  BookOpen,
  MessageSquare,
  Sparkles,
  Minimize2,
  Layers,
  Square,
  Palette,
  Sun,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type TemplateType = 'landing' | 'dashboard' | 'ecommerce' | 'portfolio' | 'saas' | 'blog' | 'tma';
export type StyleType = 'modern' | 'minimal' | 'brutalist' | 'glassmorphism' | 'neomorphism' | 'retro';

interface TemplateOption {
  id: TemplateType;
  name: string;
  nameRu: string;
  description: string;
  icon: React.ElementType;
  sections: string[];
  colorScheme: 'dark' | 'light';
  recommended?: boolean;
}

interface StyleOption {
  id: StyleType;
  name: string;
  nameRu: string;
  description: string;
  icon: React.ElementType;
  preview: {
    bg: string;
    accent: string;
    border: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════

const TEMPLATES: TemplateOption[] = [
  {
    id: 'landing',
    name: 'Landing Page',
    nameRu: 'Лендинг',
    description: 'Hero + Features + Pricing + CTA',
    icon: Layout,
    sections: ['Hero', 'Features', 'Pricing', 'FAQ', 'CTA'],
    colorScheme: 'dark',
    recommended: true,
  },
  {
    id: 'saas',
    name: 'SaaS Product',
    nameRu: 'SaaS Продукт',
    description: 'Полный лендинг для сервиса',
    icon: Rocket,
    sections: ['Hero', 'Logos', 'Features', 'HowItWorks', 'Pricing', 'Testimonials'],
    colorScheme: 'dark',
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    nameRu: 'Дашборд',
    description: 'Панель с графиками и таблицами',
    icon: BarChart3,
    sections: ['Sidebar', 'Header', 'Stats', 'Charts', 'Table'],
    colorScheme: 'dark',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    nameRu: 'Интернет-магазин',
    description: 'Каталог товаров и корзина',
    icon: ShoppingBag,
    sections: ['Header', 'Categories', 'ProductGrid', 'Cart'],
    colorScheme: 'light',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    nameRu: 'Портфолио',
    description: 'Галерея работ и about',
    icon: Briefcase,
    sections: ['Hero', 'About', 'Projects', 'Skills', 'Contact'],
    colorScheme: 'dark',
  },
  {
    id: 'blog',
    name: 'Blog',
    nameRu: 'Блог',
    description: 'Статьи и категории',
    icon: BookOpen,
    sections: ['Header', 'Featured', 'PostGrid', 'Newsletter'],
    colorScheme: 'light',
  },
  {
    id: 'tma',
    name: 'Telegram Mini App',
    nameRu: 'Telegram App',
    description: 'Мини-приложение для TG',
    icon: MessageSquare,
    sections: ['Header', 'Content', 'Actions', 'BottomNav'],
    colorScheme: 'dark',
  },
];

const STYLES: StyleOption[] = [
  {
    id: 'modern',
    name: 'Modern',
    nameRu: 'Современный',
    description: 'Градиенты, glow, плавные анимации',
    icon: Sparkles,
    preview: {
      bg: 'bg-gradient-to-br from-violet-500/20 to-purple-600/20',
      accent: 'bg-violet-500',
      border: 'border-violet-500/30',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    nameRu: 'Минимализм',
    description: 'Много пространства, простые формы',
    icon: Minimize2,
    preview: {
      bg: 'bg-background',
      accent: 'bg-foreground',
      border: 'border-border',
    },
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    nameRu: 'Брутализм',
    description: 'Жёсткие формы, контраст',
    icon: Square,
    preview: {
      bg: 'bg-background',
      accent: 'bg-foreground',
      border: 'border-foreground border-2',
    },
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    nameRu: 'Стекло',
    description: 'Прозрачность и размытие',
    icon: Layers,
    preview: {
      bg: 'bg-white/5 backdrop-blur-xl',
      accent: 'bg-white/20',
      border: 'border-white/10',
    },
  },
  {
    id: 'neomorphism',
    name: 'Neomorphism',
    nameRu: 'Неоморфизм',
    description: 'Мягкие выдавленные формы',
    icon: Sun,
    preview: {
      bg: 'bg-muted',
      accent: 'bg-muted-foreground/20',
      border: 'border-transparent shadow-lg',
    },
  },
  {
    id: 'retro',
    name: 'Retro',
    nameRu: 'Ретро',
    description: 'Неоновые акценты 80-х',
    icon: Palette,
    preview: {
      bg: 'bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-cyan-400/20',
      accent: 'bg-gradient-to-r from-purple-600 to-pink-500',
      border: 'border-pink-500/30',
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface TemplateStyleSelectorProps {
  selectedTemplate: TemplateType | null;
  selectedStyle: StyleType | null;
  onTemplateChange: (template: TemplateType | null) => void;
  onStyleChange: (style: StyleType | null) => void;
  className?: string;
}

export function TemplateStyleSelector({
  selectedTemplate,
  selectedStyle,
  onTemplateChange,
  onStyleChange,
  className,
}: TemplateStyleSelectorProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Templates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Шаблон</h3>
          {selectedTemplate && (
            <button
              onClick={() => onTemplateChange(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {TEMPLATES.map((template, index) => {
            const Icon = template.icon;
            const isSelected = selectedTemplate === template.id;
            
            return (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                onClick={() => onTemplateChange(isSelected ? null : template.id)}
                className={cn(
                  'group relative p-3 rounded-xl border text-left transition-all duration-200',
                  isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                    : 'border-border/50 bg-background/50 hover:border-primary/50 hover:bg-muted/50'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Selection indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Recommended badge */}
                {template.recommended && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 left-2 text-[9px] px-1.5 py-0 h-4"
                  >
                    Популярно
                  </Badge>
                )}
                
                <div className="flex items-start gap-2">
                  <div className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    isSelected ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'
                  )}>
                    <Icon className={cn(
                      'w-4 h-4 transition-colors',
                      isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{template.nameRu}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {template.description}
                    </div>
                  </div>
                </div>
                
                {/* Section preview */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.sections.slice(0, 3).map((section) => (
                    <span
                      key={section}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {section}
                    </span>
                  ))}
                  {template.sections.length > 3 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      +{template.sections.length - 3}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Styles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Стиль дизайна</h3>
          {selectedStyle && (
            <button
              onClick={() => onStyleChange(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STYLES.map((style, index) => {
            const Icon = style.icon;
            const isSelected = selectedStyle === style.id;
            
            return (
              <motion.button
                key={style.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                onClick={() => onStyleChange(isSelected ? null : style.id)}
                className={cn(
                  'group relative p-3 rounded-xl border text-left transition-all duration-200',
                  isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                    : 'border-border/50 bg-background/50 hover:border-primary/50 hover:bg-muted/50'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Selection indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex items-start gap-2">
                  <div className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    isSelected ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'
                  )}>
                    <Icon className={cn(
                      'w-4 h-4 transition-colors',
                      isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{style.nameRu}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1">
                      {style.description}
                    </div>
                  </div>
                </div>
                
                {/* Style preview */}
                <div className="mt-2 flex items-center gap-1.5">
                  <div className={cn(
                    'w-8 h-4 rounded border',
                    style.preview.bg,
                    style.preview.border
                  )} />
                  <div className={cn(
                    'w-4 h-4 rounded',
                    style.preview.accent
                  )} />
                  <div className={cn(
                    'flex-1 h-1.5 rounded-full',
                    style.preview.accent,
                    'opacity-50'
                  )} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TemplateStyleSelector;
