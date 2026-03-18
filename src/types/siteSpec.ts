// SiteSpec JSON Contract - Core data structure for all projects

export interface SiteSpec {
  version: '1.0';
  metadata: SiteMetadata;
  theme: SiteTheme;
  pages: Page[];
  globalEffects: EffectConfig[];
}

export interface SiteMetadata {
  title: string;
  description: string;
  language: 'ru' | 'en';
  ogImage?: string;
  favicon?: string;
}

export interface SiteTheme {
  palette: ThemePalette;
  fontMode: 'normal' | 'ancient-rus';
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  tokens: Record<string, string>;
  darkMode: boolean;
}

export interface ThemePalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  sections: Section[];
}

export interface Section {
  id: string;
  type: SectionType;
  presetId?: string;
  content: SectionContent;
  effects: EffectConfig[];
  style: SectionStyle;
}

export type SectionType = 
  | 'hero'
  | 'features'
  | 'gallery'
  | 'testimonials'
  | 'pricing'
  | 'cta'
  | 'faq'
  | 'contact'
  | 'custom';

export interface SectionContent {
  heading?: string;
  subheading?: string;
  body?: string;
  items?: ContentItem[];
  cta?: CTAConfig;
  images?: ImageConfig[];
}

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  link?: string;
}

export interface CTAConfig {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
}

export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface SectionStyle {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'transparent' | 'muted' | 'card' | 'gradient';
  align?: 'left' | 'center' | 'right';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface EffectConfig {
  id: string;
  type: EffectType;
  enabled: boolean;
  options: Record<string, unknown>;
}

export type EffectType =
  // Background effects
  | 'gradient-bg'
  | 'noise-bg'
  | 'particles'
  | 'blob-bg'
  | 'grid-pattern'
  | 'dot-pattern'
  // Text effects
  | 'shimmer-text'
  | 'typewriter'
  | 'blur-reveal'
  | 'gradient-text'
  | 'hover-highlight'
  // Card effects
  | 'glow-border'
  | 'tilt-card'
  | 'hover-lift'
  // Cursor effects
  | 'cursor-follower'
  | 'magnetic-button'
  // Scroll effects
  | 'scroll-reveal'
  | 'parallax'
  // Transition effects
  | 'fade-transition'
  | 'slide-transition'
  // 3D/WebGL effects
  | 'particle-field-3d'
  | 'wave-3d'
  | 'floating-spheres-3d'
  | 'gradient-blob-3d'
  | 'noise-shader-3d';

// Preset types
export interface Preset {
  id: string;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  category: PresetCategory;
  thumbnail: string;
  defaultSpec: Partial<SiteSpec>;
  tags: string[];
}

export type PresetCategory = 
  | 'landing'
  | 'portfolio'
  | 'ecommerce'
  | 'blog'
  | 'saas'
  | 'startup'
  | 'personal'
  | 'corporate'
  | 'tma-shop'
  | 'tma-booking'
  | 'tma-game'
  | 'tma-menu';

export type ProjectType = 'website' | 'tma';

// Effect pack types
export interface EffectPack {
  id: string;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  category: EffectCategory;
  effects: EffectDefinition[];
  preview?: string;
}

export type EffectCategory = 
  | 'background'
  | 'text'
  | 'cards'
  | 'cursor'
  | 'scroll'
  | 'transitions'
  | 'loaders'
  | '3d';

export interface EffectDefinition {
  id: string;
  type: EffectType;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  defaultOptions: Record<string, unknown>;
  optionSchema: EffectOptionSchema[];
  component: string; // Component name to render
  performance: 'light' | 'medium' | 'heavy';
}

export interface EffectOptionSchema {
  key: string;
  label: string;
  labelRu: string;
  type: 'boolean' | 'number' | 'string' | 'color' | 'select';
  default: unknown;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

// Project types
export interface Project {
  id: string;
  userId: string;
  name: string;
  slug: string;
  type: 'website' | 'tma';
  status: 'draft' | 'building' | 'published' | 'error';
  siteSpec: SiteSpec;
  presetId?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  tmaConfig?: TmaConfig;
}

export interface TmaConfig {
  botToken?: string; // Encrypted
  webAppUrl?: string;
  validateInitData: boolean;
  menuButtonText?: string;
}

export interface ProjectRevision {
  id: string;
  projectId: string;
  siteSpec: SiteSpec;
  prompt?: string;
  createdAt: Date;
}

// Style presets
export type StylePreset = 'minimal' | 'cyber' | 'corporate' | 'gaming';

export const STYLE_PRESETS: Record<StylePreset, { name: string; nameRu: string; colors: ThemePalette }> = {
  minimal: {
    name: 'Minimal',
    nameRu: 'Минимал',
    colors: {
      primary: '0 0% 100%',
      secondary: '0 0% 96%',
      accent: '0 0% 50%',
      background: '0 0% 4%',
      foreground: '0 0% 98%',
      muted: '0 0% 15%',
    },
  },
  cyber: {
    name: 'Cyber',
    nameRu: 'Кибер',
    colors: {
      primary: '186 100% 50%',
      secondary: '280 100% 60%',
      accent: '38 92% 50%',
      background: '222 47% 6%',
      foreground: '210 40% 98%',
      muted: '222 30% 12%',
    },
  },
  corporate: {
    name: 'Corporate',
    nameRu: 'Корп',
    colors: {
      primary: '221 83% 53%',
      secondary: '215 20% 65%',
      accent: '38 92% 50%',
      background: '222 47% 8%',
      foreground: '210 40% 98%',
      muted: '220 15% 20%',
    },
  },
  gaming: {
    name: 'Gaming',
    nameRu: 'Игровой',
    colors: {
      primary: '142 76% 36%',
      secondary: '280 100% 60%',
      accent: '0 84% 60%',
      background: '240 10% 4%',
      foreground: '0 0% 98%',
      muted: '240 5% 15%',
    },
  },
};
