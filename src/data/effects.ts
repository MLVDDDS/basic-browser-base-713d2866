import { EffectDefinition, EffectCategory } from '@/types/siteSpec';

export interface EffectCategoryInfo {
  id: EffectCategory;
  name: string;
  nameRu: string;
  icon: string;
}

export const EFFECT_CATEGORIES: EffectCategoryInfo[] = [
  { id: 'background', name: 'Background', nameRu: 'Фон', icon: 'Palette' },
  { id: 'text', name: 'Text', nameRu: 'Текст', icon: 'Type' },
  { id: 'cards', name: 'Cards', nameRu: 'Карточки', icon: 'Square' },
  { id: 'cursor', name: 'Cursor', nameRu: 'Курсор', icon: 'MousePointer' },
  { id: 'scroll', name: 'Scroll', nameRu: 'Скролл', icon: 'ArrowDown' },
  { id: 'transitions', name: 'Transitions', nameRu: 'Переходы', icon: 'Sparkles' },
  { id: 'loaders', name: 'Loaders', nameRu: 'Лоадеры', icon: 'Loader' },
  { id: '3d', name: '3D/WebGL', nameRu: '3D/WebGL', icon: 'Box' },
];

export const EFFECTS_LIBRARY: EffectDefinition[] = [
  // Background effects
  {
    id: 'gradient-bg-1',
    type: 'gradient-bg',
    name: 'Gradient Background',
    nameRu: 'Градиентный фон',
    description: 'Animated gradient background',
    descriptionRu: 'Анимированный градиентный фон',
    defaultOptions: {
      colors: ['#00d4ff', '#7c3aed'],
      angle: 135,
      animate: true,
    },
    optionSchema: [
      { key: 'animate', label: 'Animate', labelRu: 'Анимация', type: 'boolean', default: true },
      { key: 'angle', label: 'Angle', labelRu: 'Угол', type: 'number', default: 135, min: 0, max: 360 },
    ],
    component: 'GradientBackground',
    performance: 'light',
  },
  {
    id: 'noise-bg-1',
    type: 'noise-bg',
    name: 'Noise Overlay',
    nameRu: 'Шум',
    description: 'Subtle noise texture overlay',
    descriptionRu: 'Тонкая текстура шума',
    defaultOptions: {
      opacity: 0.03,
      blend: 'overlay',
    },
    optionSchema: [
      { key: 'opacity', label: 'Opacity', labelRu: 'Прозрачность', type: 'number', default: 0.03, min: 0, max: 0.2 },
    ],
    component: 'NoiseOverlay',
    performance: 'light',
  },
  {
    id: 'particles-1',
    type: 'particles',
    name: 'Particles',
    nameRu: 'Частицы',
    description: 'Floating particle effect',
    descriptionRu: 'Плавающие частицы',
    defaultOptions: {
      count: 50,
      color: '#00d4ff',
      speed: 1,
    },
    optionSchema: [
      { key: 'count', label: 'Count', labelRu: 'Количество', type: 'number', default: 50, min: 10, max: 200 },
      { key: 'speed', label: 'Speed', labelRu: 'Скорость', type: 'number', default: 1, min: 0.1, max: 3 },
    ],
    component: 'ParticlesEffect',
    performance: 'heavy',
  },
  {
    id: 'blob-bg-1',
    type: 'blob-bg',
    name: 'Blob Background',
    nameRu: 'Блобы',
    description: 'Animated blob shapes',
    descriptionRu: 'Анимированные блобы',
    defaultOptions: {
      count: 3,
      blur: 100,
    },
    optionSchema: [
      { key: 'count', label: 'Count', labelRu: 'Количество', type: 'number', default: 3, min: 1, max: 5 },
      { key: 'blur', label: 'Blur', labelRu: 'Размытие', type: 'number', default: 100, min: 50, max: 200 },
    ],
    component: 'BlobBackground',
    performance: 'medium',
  },
  {
    id: 'grid-pattern-1',
    type: 'grid-pattern',
    name: 'Grid Pattern',
    nameRu: 'Сетка',
    description: 'Subtle grid pattern',
    descriptionRu: 'Тонкий паттерн сетки',
    defaultOptions: {
      size: 60,
      opacity: 0.1,
    },
    optionSchema: [
      { key: 'size', label: 'Size', labelRu: 'Размер', type: 'number', default: 60, min: 20, max: 100 },
    ],
    component: 'GridPattern',
    performance: 'light',
  },
  {
    id: 'dot-pattern-1',
    type: 'dot-pattern',
    name: 'Dot Pattern',
    nameRu: 'Точки',
    description: 'Dot grid pattern',
    descriptionRu: 'Паттерн из точек',
    defaultOptions: {
      size: 24,
      opacity: 0.15,
    },
    optionSchema: [
      { key: 'size', label: 'Size', labelRu: 'Размер', type: 'number', default: 24, min: 10, max: 50 },
    ],
    component: 'DotPattern',
    performance: 'light',
  },

  // Text effects
  {
    id: 'shimmer-text-1',
    type: 'shimmer-text',
    name: 'Shimmer Text',
    nameRu: 'Шимер',
    description: 'Text with shimmer animation',
    descriptionRu: 'Текст с эффектом мерцания',
    defaultOptions: {
      speed: 2,
      color: '#00d4ff',
    },
    optionSchema: [
      { key: 'speed', label: 'Speed', labelRu: 'Скорость', type: 'number', default: 2, min: 0.5, max: 5 },
    ],
    component: 'ShimmerText',
    performance: 'light',
  },
  {
    id: 'typewriter-1',
    type: 'typewriter',
    name: 'Typewriter',
    nameRu: 'Тайпрайтер',
    description: 'Typing animation effect',
    descriptionRu: 'Эффект печатающего текста',
    defaultOptions: {
      speed: 50,
      cursor: true,
    },
    optionSchema: [
      { key: 'speed', label: 'Speed (ms)', labelRu: 'Скорость (мс)', type: 'number', default: 50, min: 20, max: 200 },
      { key: 'cursor', label: 'Show cursor', labelRu: 'Курсор', type: 'boolean', default: true },
    ],
    component: 'TypewriterEffect',
    performance: 'light',
  },
  {
    id: 'blur-reveal-1',
    type: 'blur-reveal',
    name: 'Blur Reveal',
    nameRu: 'Размытие',
    description: 'Text reveals from blur',
    descriptionRu: 'Текст появляется из размытия',
    defaultOptions: {
      delay: 0,
      duration: 0.8,
    },
    optionSchema: [
      { key: 'duration', label: 'Duration', labelRu: 'Длительность', type: 'number', default: 0.8, min: 0.2, max: 2 },
    ],
    component: 'BlurReveal',
    performance: 'light',
  },
  {
    id: 'gradient-text-1',
    type: 'gradient-text',
    name: 'Gradient Text',
    nameRu: 'Градиент',
    description: 'Text with gradient color',
    descriptionRu: 'Текст с градиентом',
    defaultOptions: {
      colors: ['#00d4ff', '#f59e0b'],
      angle: 135,
      animate: false,
    },
    optionSchema: [
      { key: 'animate', label: 'Animate', labelRu: 'Анимация', type: 'boolean', default: false },
    ],
    component: 'GradientText',
    performance: 'light',
  },
  {
    id: 'hover-highlight-1',
    type: 'hover-highlight',
    name: 'Hover Highlight',
    nameRu: 'Подсветка',
    description: 'Highlight on hover',
    descriptionRu: 'Подсветка при наведении',
    defaultOptions: {
      color: '#00d4ff',
      underline: true,
    },
    optionSchema: [
      { key: 'underline', label: 'Underline', labelRu: 'Подчёркивание', type: 'boolean', default: true },
    ],
    component: 'HoverHighlight',
    performance: 'light',
  },

  // Card effects
  {
    id: 'glow-border-1',
    type: 'glow-border',
    name: 'Glow Border',
    nameRu: 'Свечение',
    description: 'Glowing border effect',
    descriptionRu: 'Светящаяся рамка',
    defaultOptions: {
      color: '#00d4ff',
      width: 2,
    },
    optionSchema: [
      { key: 'width', label: 'Width', labelRu: 'Ширина', type: 'number', default: 2, min: 1, max: 5 },
    ],
    component: 'GlowBorder',
    performance: 'light',
  },
  {
    id: 'tilt-card-1',
    type: 'tilt-card',
    name: 'Tilt Card',
    nameRu: 'Наклон',
    description: '3D tilt on hover',
    descriptionRu: '3D наклон при наведении',
    defaultOptions: {
      maxTilt: 15,
      perspective: 1000,
    },
    optionSchema: [
      { key: 'maxTilt', label: 'Max Tilt', labelRu: 'Макс. наклон', type: 'number', default: 15, min: 5, max: 30 },
    ],
    component: 'TiltCard',
    performance: 'light',
  },
  {
    id: 'hover-lift-1',
    type: 'hover-lift',
    name: 'Hover Lift',
    nameRu: 'Подъём',
    description: 'Card lifts on hover',
    descriptionRu: 'Карточка поднимается при наведении',
    defaultOptions: {
      distance: 8,
      shadow: true,
    },
    optionSchema: [
      { key: 'distance', label: 'Distance', labelRu: 'Высота', type: 'number', default: 8, min: 2, max: 20 },
    ],
    component: 'HoverLift',
    performance: 'light',
  },

  // Cursor effects
  {
    id: 'cursor-follower-1',
    type: 'cursor-follower',
    name: 'Cursor Follower',
    nameRu: 'Следящий курсор',
    description: 'Custom cursor that follows',
    descriptionRu: 'Кастомный следящий курсор',
    defaultOptions: {
      size: 20,
      color: '#00d4ff',
      lag: 0.1,
    },
    optionSchema: [
      { key: 'size', label: 'Size', labelRu: 'Размер', type: 'number', default: 20, min: 10, max: 50 },
    ],
    component: 'CursorFollower',
    performance: 'light',
  },
  {
    id: 'magnetic-button-1',
    type: 'magnetic-button',
    name: 'Magnetic Button',
    nameRu: 'Магнит',
    description: 'Button attracts cursor',
    descriptionRu: 'Кнопка притягивает курсор',
    defaultOptions: {
      strength: 0.5,
      distance: 100,
    },
    optionSchema: [
      { key: 'strength', label: 'Strength', labelRu: 'Сила', type: 'number', default: 0.5, min: 0.1, max: 1 },
    ],
    component: 'MagneticButton',
    performance: 'light',
  },

  // Scroll effects
  {
    id: 'scroll-reveal-1',
    type: 'scroll-reveal',
    name: 'Scroll Reveal',
    nameRu: 'Появление',
    description: 'Elements appear on scroll',
    descriptionRu: 'Элементы появляются при скролле',
    defaultOptions: {
      direction: 'up',
      distance: 20,
      delay: 0,
    },
    optionSchema: [
      { 
        key: 'direction', 
        label: 'Direction', 
        labelRu: 'Направление', 
        type: 'select', 
        default: 'up',
        options: [
          { value: 'up', label: 'Вверх' },
          { value: 'down', label: 'Вниз' },
          { value: 'left', label: 'Слева' },
          { value: 'right', label: 'Справа' },
        ],
      },
    ],
    component: 'ScrollReveal',
    performance: 'light',
  },
  {
    id: 'parallax-1',
    type: 'parallax',
    name: 'Parallax',
    nameRu: 'Параллакс',
    description: 'Parallax scrolling effect',
    descriptionRu: 'Эффект параллакса',
    defaultOptions: {
      speed: 0.5,
    },
    optionSchema: [
      { key: 'speed', label: 'Speed', labelRu: 'Скорость', type: 'number', default: 0.5, min: 0.1, max: 1 },
    ],
    component: 'Parallax',
    performance: 'medium',
  },

  // Transition effects
  {
    id: 'fade-transition-1',
    type: 'fade-transition',
    name: 'Fade Transition',
    nameRu: 'Плавное появление',
    description: 'Smooth fade transition',
    descriptionRu: 'Плавное появление',
    defaultOptions: {
      duration: 0.3,
    },
    optionSchema: [
      { key: 'duration', label: 'Duration', labelRu: 'Длительность', type: 'number', default: 0.3, min: 0.1, max: 1 },
    ],
    component: 'FadeTransition',
    performance: 'light',
  },
  {
    id: 'slide-transition-1',
    type: 'slide-transition',
    name: 'Slide Transition',
    nameRu: 'Скольжение',
    description: 'Slide in/out transition',
    descriptionRu: 'Скольжение',
    defaultOptions: {
      direction: 'left',
      duration: 0.3,
    },
    optionSchema: [
      { 
        key: 'direction', 
        label: 'Direction', 
        labelRu: 'Направление', 
        type: 'select', 
        default: 'left',
        options: [
          { value: 'left', label: 'Слева' },
          { value: 'right', label: 'Справа' },
          { value: 'up', label: 'Сверху' },
          { value: 'down', label: 'Снизу' },
        ],
      },
    ],
    component: 'SlideTransition',
    performance: 'light',
  },
  
  // 3D/WebGL Effects
  {
    id: 'particle-field-3d',
    type: 'particle-field-3d',
    name: '3D Particles',
    nameRu: '3D Частицы',
    description: 'Interactive particle field with Three.js',
    descriptionRu: 'Интерактивное поле частиц на Three.js',
    defaultOptions: {
      count: 1000,
      color: '#00d4ff',
      speed: 0.2,
      size: 0.02,
    },
    optionSchema: [
      { key: 'count', label: 'Count', labelRu: 'Количество', type: 'number', default: 1000, min: 100, max: 5000 },
      { key: 'speed', label: 'Speed', labelRu: 'Скорость', type: 'number', default: 0.2, min: 0.1, max: 1 },
    ],
    component: 'ParticleField',
    performance: 'heavy',
  },
  {
    id: 'wave-3d',
    type: 'wave-3d',
    name: '3D Wave',
    nameRu: '3D Волна',
    description: 'Animated wave mesh background',
    descriptionRu: 'Анимированная волновая сетка',
    defaultOptions: {
      color1: '#00d4ff',
      color2: '#7c3aed',
      speed: 1,
      amplitude: 0.3,
    },
    optionSchema: [
      { key: 'speed', label: 'Speed', labelRu: 'Скорость', type: 'number', default: 1, min: 0.1, max: 3 },
      { key: 'amplitude', label: 'Amplitude', labelRu: 'Амплитуда', type: 'number', default: 0.3, min: 0.1, max: 1 },
    ],
    component: 'WaveBackground',
    performance: 'heavy',
  },
  {
    id: 'floating-spheres-3d',
    type: 'floating-spheres-3d',
    name: 'Floating Spheres',
    nameRu: 'Парящие сферы',
    description: 'Morphing floating spheres with distortion',
    descriptionRu: 'Плавающие сферы с морфингом',
    defaultOptions: {
      color: '#00d4ff',
      count: 5,
      distort: 0.4,
    },
    optionSchema: [
      { key: 'count', label: 'Count', labelRu: 'Количество', type: 'number', default: 5, min: 1, max: 10 },
      { key: 'distort', label: 'Distortion', labelRu: 'Искажение', type: 'number', default: 0.4, min: 0, max: 1 },
    ],
    component: 'FloatingSpheres',
    performance: 'heavy',
  },
  {
    id: 'gradient-blob-3d',
    type: 'gradient-blob-3d',
    name: 'Gradient Blob',
    nameRu: 'Градиентный блоб',
    description: 'Organic morphing 3D blob',
    descriptionRu: 'Органический морфинговый 3D блоб',
    defaultOptions: {
      color1: '#00d4ff',
      color2: '#7c3aed',
      speed: 2,
      distort: 0.5,
    },
    optionSchema: [
      { key: 'speed', label: 'Speed', labelRu: 'Скорость', type: 'number', default: 2, min: 0.5, max: 5 },
      { key: 'distort', label: 'Distortion', labelRu: 'Искажение', type: 'number', default: 0.5, min: 0.1, max: 1 },
    ],
    component: 'GradientBlob',
    performance: 'heavy',
  },
  {
    id: 'noise-shader-3d',
    type: 'noise-shader-3d',
    name: 'Noise Shader',
    nameRu: 'Шейдер шума',
    description: 'Custom GLSL noise shader background',
    descriptionRu: 'Кастомный GLSL шейдер шума',
    defaultOptions: {
      color1: '#00d4ff',
      color2: '#7c3aed',
      speed: 1,
      scale: 3,
    },
    optionSchema: [
      { key: 'speed', label: 'Speed', labelRu: 'Скорость', type: 'number', default: 1, min: 0.1, max: 3 },
      { key: 'scale', label: 'Scale', labelRu: 'Масштаб', type: 'number', default: 3, min: 1, max: 10 },
    ],
    component: 'NoiseShader',
    performance: 'heavy',
  },
];

export const getEffectsByCategory = (category: EffectCategory): EffectDefinition[] => {
  const categoryToTypes: Record<EffectCategory, string[]> = {
    background: ['gradient-bg', 'noise-bg', 'particles', 'blob-bg', 'grid-pattern', 'dot-pattern'],
    text: ['shimmer-text', 'typewriter', 'blur-reveal', 'gradient-text', 'hover-highlight'],
    cards: ['glow-border', 'tilt-card', 'hover-lift'],
    cursor: ['cursor-follower', 'magnetic-button'],
    scroll: ['scroll-reveal', 'parallax'],
    transitions: ['fade-transition', 'slide-transition'],
    loaders: [],
    '3d': ['particle-field-3d', 'wave-3d', 'floating-spheres-3d', 'gradient-blob-3d', 'noise-shader-3d'],
  };

  return EFFECTS_LIBRARY.filter(effect => 
    categoryToTypes[category]?.includes(effect.type)
  );
};
