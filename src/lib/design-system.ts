/**
 * 🎨 Design System v2.0
 * 
 * Централизованная система дизайн-токенов, шаблонов и стилей
 * для генерации высококачественных UI.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type TemplateType = 'landing' | 'dashboard' | 'ecommerce' | 'portfolio' | 'saas' | 'blog' | 'tma';
export type StyleType = 'modern' | 'minimal' | 'brutalist' | 'glassmorphism' | 'neomorphism' | 'retro';
export type ColorScheme = 'dark' | 'light' | 'system';

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    card: string;
    cardForeground: string;
    border: string;
    ring: string;
    destructive: string;
    success: string;
    warning: string;
  };
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
      display?: string;
    };
    fontSizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    fontWeights: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    glow: string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      default: string;
      spring: string;
      bounce: string;
    };
  };
}

export interface TemplateConfig {
  id: TemplateType;
  name: string;
  nameRu: string;
  description: string;
  sections: string[];
  recommendedComponents: string[];
  defaultStyle: StyleType;
  features: string[];
  colorScheme: ColorScheme;
}

export interface StyleConfig {
  id: StyleType;
  name: string;
  nameRu: string;
  description: string;
  characteristics: string[];
  tokens: {
    colors?: Partial<DesignTokens['colors']>;
    typography?: Partial<DesignTokens['typography']>;
    spacing?: Partial<DesignTokens['spacing']>;
    borderRadius?: Partial<DesignTokens['borderRadius']>;
    shadows?: Partial<DesignTokens['shadows']>;
    animations?: Partial<DesignTokens['animations']>;
  };
  cssClasses: string[];
  effects: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS (Default)
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  colors: {
    primary: '262 83% 58%',        // Violet
    secondary: '220 14% 96%',      // Light gray
    accent: '38 92% 50%',          // Amber
    background: '0 0% 3.9%',       // Near black
    foreground: '0 0% 98%',        // Near white
    muted: '0 0% 14.9%',           // Dark gray
    mutedForeground: '0 0% 63.9%', // Medium gray
    card: '0 0% 7%',               // Card bg
    cardForeground: '0 0% 98%',    // Card text
    border: '0 0% 14.9%',          // Border color
    ring: '262 83% 58%',           // Focus ring
    destructive: '0 84% 60%',      // Red
    success: '142 76% 36%',        // Green
    warning: '38 92% 50%',         // Amber
  },
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
      display: "'Inter', sans-serif",
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    unit: 4,
    scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64],
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    glow: '0 0 40px -10px hsl(var(--primary) / 0.5)',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

export const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  landing: {
    id: 'landing',
    name: 'Landing Page',
    nameRu: 'Лендинг',
    description: 'Классический SaaS-лендинг с hero, фичами и CTA',
    sections: ['Hero', 'Features', 'HowItWorks', 'Pricing', 'Testimonials', 'FAQ', 'CTA', 'Footer'],
    recommendedComponents: ['Button', 'Card', 'Badge', 'Accordion', 'Tabs'],
    defaultStyle: 'modern',
    features: ['Адаптивный дизайн', 'Анимации при скролле', 'Градиентный фон', 'CTA-секции'],
    colorScheme: 'dark',
  },
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    nameRu: 'Дашборд',
    description: 'Админ-панель с графиками, таблицами и статистикой',
    sections: ['Sidebar', 'Header', 'Stats', 'Charts', 'Table', 'Activity'],
    recommendedComponents: ['Card', 'Table', 'Chart', 'Sidebar', 'Avatar', 'Badge', 'Progress'],
    defaultStyle: 'minimal',
    features: ['Боковая навигация', 'KPI-карточки', 'Графики', 'Таблицы данных'],
    colorScheme: 'dark',
  },
  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce',
    nameRu: 'Интернет-магазин',
    description: 'Магазин с каталогом, карточками товаров и корзиной',
    sections: ['Hero', 'Categories', 'ProductGrid', 'Featured', 'Benefits', 'Newsletter', 'Footer'],
    recommendedComponents: ['Card', 'Button', 'Badge', 'Dialog', 'Carousel', 'Input'],
    defaultStyle: 'modern',
    features: ['Карточки товаров', 'Фильтры', 'Корзина', 'Поиск'],
    colorScheme: 'light',
  },
  portfolio: {
    id: 'portfolio',
    name: 'Portfolio',
    nameRu: 'Портфолио',
    description: 'Персональное портфолио для дизайнеров и разработчиков',
    sections: ['Hero', 'About', 'Projects', 'Skills', 'Experience', 'Contact'],
    recommendedComponents: ['Card', 'Badge', 'Button', 'Avatar', 'Tooltip'],
    defaultStyle: 'minimal',
    features: ['Галерея работ', 'Навыки', 'Контактная форма'],
    colorScheme: 'dark',
  },
  saas: {
    id: 'saas',
    name: 'SaaS Product',
    nameRu: 'SaaS-продукт',
    description: 'Полноценный SaaS с pricing, features и интеграциями',
    sections: ['Hero', 'Logos', 'Features', 'HowItWorks', 'Integrations', 'Pricing', 'Testimonials', 'FAQ', 'CTA'],
    recommendedComponents: ['Button', 'Card', 'Badge', 'Tabs', 'Accordion', 'Avatar', 'Switch'],
    defaultStyle: 'modern',
    features: ['Сравнение тарифов', 'Интеграции', 'FAQ', 'Отзывы'],
    colorScheme: 'dark',
  },
  blog: {
    id: 'blog',
    name: 'Blog',
    nameRu: 'Блог',
    description: 'Блог-платформа с постами и категориями',
    sections: ['Header', 'Featured', 'PostGrid', 'Sidebar', 'Newsletter', 'Footer'],
    recommendedComponents: ['Card', 'Badge', 'Avatar', 'Input', 'Button'],
    defaultStyle: 'minimal',
    features: ['Посты', 'Категории', 'Поиск', 'Подписка'],
    colorScheme: 'light',
  },
  tma: {
    id: 'tma',
    name: 'Telegram Mini App',
    nameRu: 'Telegram Mini App',
    description: 'Мини-приложение для Telegram с нативными токенами',
    sections: ['TMALayout', 'TMAHeader', 'TMAContent', 'TMABottomNav', 'TMASection'],
    recommendedComponents: ['TMAButton', 'TMACard', 'TMASection', 'List', 'Input', 'Avatar'],
    defaultStyle: 'modern',
    features: ['Telegram SDK', 'Safe-area', 'Haptic feedback', 'Theme bridge', 'MainButton API'],
    colorScheme: 'light', // Adapts via TMAThemeBridge
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

export const STYLES: Record<StyleType, StyleConfig> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    nameRu: 'Современный',
    description: 'Градиенты, мягкие тени, плавные анимации',
    characteristics: [
      'Градиентные фоны и акценты',
      'Мягкие тени с цветом',
      'Крупные скругления (lg/xl)',
      'Плавные hover-эффекты',
      'Glow-эффекты на кнопках',
    ],
    tokens: {
      borderRadius: {
        none: '0',
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      shadows: {
        sm: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
        md: '0 4px 12px -2px rgb(0 0 0 / 0.2)',
        lg: '0 8px 24px -4px rgb(0 0 0 / 0.3)',
        xl: '0 20px 50px -12px rgb(0 0 0 / 0.4)',
        glow: '0 0 40px -10px hsl(var(--primary) / 0.6)',
      },
    },
    cssClasses: [
      'bg-gradient-to-br',
      'shadow-lg shadow-primary/20',
      'hover:shadow-xl hover:shadow-primary/30',
      'transition-all duration-300',
      'backdrop-blur-sm',
    ],
    effects: ['gradient-bg', 'glow', 'hover-lift', 'parallax'],
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    nameRu: 'Минималистичный',
    description: 'Много пустого пространства, простые формы, моноцвет',
    characteristics: [
      'Максимум whitespace',
      'Простые черно-белые цвета',
      'Минимум декора',
      'Тонкие линии и границы',
      'Четкая типографика',
    ],
    tokens: {
      colors: {
        primary: '0 0% 9%',
        secondary: '0 0% 96%',
        accent: '0 0% 45%',
        background: '0 0% 100%',
        foreground: '0 0% 9%',
        muted: '0 0% 96%',
        mutedForeground: '0 0% 45%',
        card: '0 0% 100%',
        cardForeground: '0 0% 9%',
        border: '0 0% 90%',
        ring: '0 0% 9%',
        destructive: '0 84% 60%',
        success: '142 76% 36%',
        warning: '38 92% 50%',
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.375rem',
        xl: '0.5rem',
        full: '9999px',
      },
    },
    cssClasses: [
      'border border-border',
      'bg-background',
      'hover:bg-muted/50',
      'transition-colors',
    ],
    effects: ['fade-in', 'subtle-hover'],
  },
  brutalist: {
    id: 'brutalist',
    name: 'Brutalist',
    nameRu: 'Бруталистский',
    description: 'Жёсткие формы, контраст, без скруглений',
    characteristics: [
      'Без скруглений (sharp corners)',
      'Высокий контраст',
      'Толстые границы',
      'Грубые тени',
      'Крупная типографика',
    ],
    tokens: {
      borderRadius: {
        none: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        full: '0',
      },
      shadows: {
        sm: '2px 2px 0 0 currentColor',
        md: '4px 4px 0 0 currentColor',
        lg: '6px 6px 0 0 currentColor',
        xl: '8px 8px 0 0 currentColor',
        glow: '0 0 0 0 transparent',
      },
    },
    cssClasses: [
      'border-2 border-foreground',
      'shadow-[4px_4px_0_0_currentColor]',
      'hover:translate-x-[-2px] hover:translate-y-[-2px]',
      'hover:shadow-[6px_6px_0_0_currentColor]',
      'transition-all',
    ],
    effects: ['shake', 'glitch'],
  },
  glassmorphism: {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    nameRu: 'Стекло',
    description: 'Прозрачность, размытие, эффект стекла',
    characteristics: [
      'Backdrop-blur',
      'Полупрозрачные фоны',
      'Тонкие светлые границы',
      'Мягкие тени',
      'Градиентные акценты',
    ],
    tokens: {
      colors: {
        primary: '262 83% 58%',
        secondary: '220 14% 96%',
        accent: '38 92% 50%',
        background: '0 0% 3.9%',
        foreground: '0 0% 98%',
        muted: '0 0% 14.9%',
        mutedForeground: '0 0% 63.9%',
        card: '0 0% 10% / 0.5',
        cardForeground: '0 0% 98%',
        border: '0 0% 100% / 0.1',
        ring: '262 83% 58%',
        destructive: '0 84% 60%',
        success: '142 76% 36%',
        warning: '38 92% 50%',
      },
    },
    cssClasses: [
      'backdrop-blur-xl',
      'bg-white/5',
      'border border-white/10',
      'shadow-lg shadow-black/20',
    ],
    effects: ['blur-bg', 'gradient-border'],
  },
  neomorphism: {
    id: 'neomorphism',
    name: 'Neomorphism',
    nameRu: 'Неоморфизм',
    description: 'Мягкие выдавленные формы, нейтральные цвета',
    characteristics: [
      'Двойные тени (светлая + темная)',
      'Мягкие нейтральные цвета',
      'Эффект выдавливания',
      'Средние скругления',
    ],
    tokens: {
      colors: {
        background: '220 14% 96%',
        foreground: '220 14% 20%',
        card: '220 14% 96%',
        muted: '220 14% 90%',
      },
      shadows: {
        sm: '3px 3px 6px #b8b9be, -3px -3px 6px #ffffff',
        md: '6px 6px 12px #b8b9be, -6px -6px 12px #ffffff',
        lg: '10px 10px 20px #b8b9be, -10px -10px 20px #ffffff',
        xl: '15px 15px 30px #b8b9be, -15px -15px 30px #ffffff',
        glow: '0 0 0 0 transparent',
      },
    },
    cssClasses: [
      'bg-background',
      'shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]',
      'rounded-xl',
    ],
    effects: ['press', 'inset'],
  },
  retro: {
    id: 'retro',
    name: 'Retro',
    nameRu: 'Ретро',
    description: 'Яркие цвета 80-х, неон, градиенты',
    characteristics: [
      'Неоновые акценты',
      'Яркие контрастные цвета',
      'Геометрические формы',
      'Градиенты purple-pink-cyan',
    ],
    tokens: {
      colors: {
        primary: '280 100% 60%',
        secondary: '320 100% 60%',
        accent: '180 100% 50%',
        background: '260 50% 5%',
        foreground: '0 0% 100%',
        muted: '260 30% 15%',
        mutedForeground: '260 20% 70%',
      },
    },
    cssClasses: [
      'bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400',
      'text-transparent bg-clip-text',
      'shadow-[0_0_20px_hsl(280_100%_60%/0.5)]',
    ],
    effects: ['neon-glow', 'scanlines', 'crt'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UI COMPONENTS LIBRARY
// ═══════════════════════════════════════════════════════════════════════════

export const UI_COMPONENTS = [
  'Button',
  'Card',
  'Badge',
  'Input',
  'Textarea',
  'Select',
  'Checkbox',
  'Switch',
  'Slider',
  'Dialog',
  'Sheet',
  'Drawer',
  'Popover',
  'Tooltip',
  'Tabs',
  'Accordion',
  'Avatar',
  'Progress',
  'Skeleton',
  'Table',
  'Separator',
  'ScrollArea',
  'Carousel',
  'Calendar',
  'Command',
  'DropdownMenu',
  'NavigationMenu',
  'ContextMenu',
  'Menubar',
  'AlertDialog',
  'Alert',
  'Toast',
  'Sonner',
  'Form',
  'Label',
  'RadioGroup',
  'HoverCard',
  'AspectRatio',
  'Collapsible',
  'Resizable',
  'ToggleGroup',
  'Toggle',
] as const;

export type UIComponent = typeof UI_COMPONENTS[number];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Получить конфигурацию шаблона
 */
export function getTemplateConfig(templateType: TemplateType): TemplateConfig {
  return TEMPLATES[templateType] || TEMPLATES.landing;
}

/**
 * Получить конфигурацию стиля
 */
export function getStyleConfig(styleType: StyleType): StyleConfig {
  return STYLES[styleType] || STYLES.modern;
}

/**
 * Объединить токены с учётом стиля
 */
export function mergeTokensWithStyle(
  baseTokens: DesignTokens,
  style: StyleType
): DesignTokens {
  const styleConfig = getStyleConfig(style);
  const styleTokens = styleConfig.tokens;
  
  return {
    ...baseTokens,
    colors: {
      ...baseTokens.colors,
      ...(styleTokens.colors || {}),
    },
    typography: {
      ...baseTokens.typography,
      ...(styleTokens.typography || {}),
    },
    spacing: {
      ...baseTokens.spacing,
      ...(styleTokens.spacing || {}),
    },
    borderRadius: {
      ...baseTokens.borderRadius,
      ...(styleTokens.borderRadius || {}),
    },
    shadows: {
      ...baseTokens.shadows,
      ...(styleTokens.shadows || {}),
    },
    animations: {
      ...baseTokens.animations,
      ...(styleTokens.animations || {}),
    },
  };
}

/**
 * Генерировать CSS-переменные из токенов
 */
export function generateCSSVariables(tokens: DesignTokens): string {
  const lines: string[] = [];
  
  // Colors
  Object.entries(tokens.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    lines.push(`  --${cssKey}: ${value};`);
  });
  
  // Border radius
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    lines.push(`  --radius-${key}: ${value};`);
  });
  
  return `:root {\n${lines.join('\n')}\n}`;
}

/**
 * Получить системный промпт для стиля
 */
export function getStyleSystemPrompt(style: StyleType): string {
  const config = getStyleConfig(style);
  
  return `
═══════════════════════════════════════════════════════════════════════════════
🎨 СТИЛЬ: ${config.nameRu} (${config.name})
═══════════════════════════════════════════════════════════════════════════════

${config.description}

ХАРАКТЕРИСТИКИ:
${config.characteristics.map(c => `• ${c}`).join('\n')}

РЕКОМЕНДУЕМЫЕ TAILWIND КЛАССЫ:
${config.cssClasses.map(c => `• ${c}`).join('\n')}

ЭФФЕКТЫ:
${config.effects.map(e => `• ${e}`).join('\n')}
`;
}

/**
 * Получить системный промпт для шаблона
 */
export function getTemplateSystemPrompt(template: TemplateType): string {
  const config = getTemplateConfig(template);
  
  return `
═══════════════════════════════════════════════════════════════════════════════
📋 ШАБЛОН: ${config.nameRu} (${config.name})
═══════════════════════════════════════════════════════════════════════════════

${config.description}

ОБЯЗАТЕЛЬНЫЕ СЕКЦИИ:
${config.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

РЕКОМЕНДУЕМЫЕ КОМПОНЕНТЫ:
${config.recommendedComponents.map(c => `• ${c} из @/components/ui/${c.toLowerCase()}`).join('\n')}

ОСОБЕННОСТИ:
${config.features.map(f => `• ${f}`).join('\n')}

ЦВЕТОВАЯ СХЕМА: ${config.colorScheme}
`;
}

/**
 * Генерировать полный системный промпт для дизайна
 */
export function generateDesignSystemPrompt(
  template: TemplateType,
  style: StyleType
): string {
  return `
${getTemplateSystemPrompt(template)}

${getStyleSystemPrompt(style)}

═══════════════════════════════════════════════════════════════════════════════
🧩 UI-КОМПОНЕНТЫ
═══════════════════════════════════════════════════════════════════════════════

Используй компоненты из @/components/ui:
${UI_COMPONENTS.slice(0, 20).map(c => `• import { ${c} } from '@/components/ui/${c.toLowerCase()}'`).join('\n')}

ПРАВИЛА:
1. Всегда используй cn() из @/lib/utils для объединения классов
2. Используй семантические цвета: bg-background, text-foreground, bg-primary, text-primary-foreground
3. Для анимаций используй framer-motion: motion.div, AnimatePresence
4. Все иконки из lucide-react: import { IconName } from 'lucide-react'
5. Адаптивный дизайн: mobile-first (sm:, md:, lg:, xl:)
`;
}
