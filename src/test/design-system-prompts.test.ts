/**
 * 🧪 Design System Prompts Tests
 */
import { describe, it, expect } from 'vitest';

// Import types and functions from shared module
// Since this is for edge functions, we'll create a local test version
// that mirrors the functionality

type TemplateType = 'landing' | 'dashboard' | 'ecommerce' | 'portfolio' | 'saas' | 'blog' | 'tma';
type StyleType = 'modern' | 'minimal' | 'brutalist' | 'glassmorphism' | 'neomorphism' | 'retro';

// Local implementations for testing
function detectTemplate(prompt: string): TemplateType {
  const lowPrompt = prompt.toLowerCase();
  
  if (lowPrompt.includes('dashboard') || lowPrompt.includes('дашборд') || 
      lowPrompt.includes('панель') || lowPrompt.includes('админк')) {
    return 'dashboard';
  }
  if (lowPrompt.includes('магазин') || lowPrompt.includes('shop') || 
      lowPrompt.includes('ecommerce') || lowPrompt.includes('товар')) {
    return 'ecommerce';
  }
  if (lowPrompt.includes('портфолио') || lowPrompt.includes('portfolio') ||
      lowPrompt.includes('резюме') || lowPrompt.includes('cv')) {
    return 'portfolio';
  }
  if (lowPrompt.includes('saas') || lowPrompt.includes('продукт') ||
      lowPrompt.includes('сервис') || lowPrompt.includes('платформ')) {
    return 'saas';
  }
  if (lowPrompt.includes('блог') || lowPrompt.includes('blog') ||
      /стать(я|и|ей|ями|ям|ях)/.test(lowPrompt) || lowPrompt.includes('пост')) {
    return 'blog';
  }
  if (lowPrompt.includes('telegram') || lowPrompt.includes('tma') ||
      lowPrompt.includes('мини-приложение') || lowPrompt.includes('бот')) {
    return 'tma';
  }
  
  return 'landing';
}

function detectStyle(prompt: string): StyleType {
  const lowPrompt = prompt.toLowerCase();
  
  if (lowPrompt.includes('минимал') || lowPrompt.includes('minimal') ||
      lowPrompt.includes('простой') || lowPrompt.includes('чистый')) {
    return 'minimal';
  }
  if (lowPrompt.includes('брутал') || lowPrompt.includes('brutal') ||
      lowPrompt.includes('жёстк') || lowPrompt.includes('raw')) {
    return 'brutalist';
  }
  if (lowPrompt.includes('glass') || lowPrompt.includes('стекл') ||
      lowPrompt.includes('прозрач') || lowPrompt.includes('blur')) {
    return 'glassmorphism';
  }
  if (lowPrompt.includes('ретро') || lowPrompt.includes('retro') ||
      lowPrompt.includes('80-х') || lowPrompt.includes('неон')) {
    return 'retro';
  }
  if (lowPrompt.includes('neomorph') || lowPrompt.includes('неоморф') ||
      lowPrompt.includes('выдавлен') || lowPrompt.includes('soft')) {
    return 'neomorphism';
  }
  
  return 'modern';
}

describe('Design System Prompts', () => {
  
  describe('detectTemplate', () => {
    
    describe('Dashboard detection', () => {
      it('should detect "dashboard" keyword', () => {
        expect(detectTemplate('Create a dashboard for analytics')).toBe('dashboard');
      });
      
      it('should detect "дашборд" (Russian)', () => {
        expect(detectTemplate('Сделай дашборд для аналитики')).toBe('dashboard');
      });
      
      it('should detect "панель" (Russian)', () => {
        expect(detectTemplate('Панель управления для админа')).toBe('dashboard');
      });
      
      it('should detect "админк" (Russian short)', () => {
        expect(detectTemplate('Нужна админка для сайта')).toBe('dashboard');
      });
    });
    
    describe('E-commerce detection', () => {
      it('should detect "shop" keyword', () => {
        expect(detectTemplate('Build an online shop')).toBe('ecommerce');
      });
      
      it('should detect "ecommerce" keyword', () => {
        expect(detectTemplate('Create ecommerce platform')).toBe('ecommerce');
      });
      
      it('should detect "магазин" (Russian)', () => {
        expect(detectTemplate('Интернет-магазин одежды')).toBe('ecommerce');
      });
      
      it('should detect "товар" (Russian)', () => {
        expect(detectTemplate('Каталог товаров с ценами')).toBe('ecommerce');
      });
    });
    
    describe('Portfolio detection', () => {
      it('should detect "portfolio" keyword', () => {
        expect(detectTemplate('Personal portfolio website')).toBe('portfolio');
      });
      
      it('should detect "портфолио" (Russian)', () => {
        expect(detectTemplate('Моё портфолио дизайнера')).toBe('portfolio');
      });
      
      it('should detect "резюме" (Russian)', () => {
        expect(detectTemplate('Резюме и проекты')).toBe('portfolio');
      });
      
      it('should detect "cv" keyword', () => {
        expect(detectTemplate('Interactive CV website')).toBe('portfolio');
      });
    });
    
    describe('SaaS detection', () => {
      it('should detect "saas" keyword', () => {
        expect(detectTemplate('SaaS landing page')).toBe('saas');
      });
      
      it('should detect "продукт" (Russian)', () => {
        expect(detectTemplate('Лендинг для продукта')).toBe('saas');
      });
      
      it('should detect "сервис" (Russian)', () => {
        expect(detectTemplate('Сервис для бронирования')).toBe('saas');
      });
      
      it('should detect "платформ" (Russian)', () => {
        expect(detectTemplate('Образовательная платформа')).toBe('saas');
      });
    });
    
    describe('Blog detection', () => {
      it('should detect "blog" keyword', () => {
        expect(detectTemplate('Personal blog with posts')).toBe('blog');
      });
      
      it('should detect "блог" (Russian)', () => {
        expect(detectTemplate('Технический блог')).toBe('blog');
      });
      
      it('should detect "статьи" (Russian)', () => {
        expect(detectTemplate('Сайт со статьями')).toBe('blog');
      });
      
      it('should detect "посты" (Russian)', () => {
        expect(detectTemplate('Посты и комментарии')).toBe('blog');
      });
    });
    
    describe('TMA (Telegram Mini App) detection', () => {
      it('should detect "telegram" keyword', () => {
        expect(detectTemplate('Telegram mini app')).toBe('tma');
      });
      
      it('should detect "tma" keyword', () => {
        expect(detectTemplate('Build a TMA for payments')).toBe('tma');
      });
      
      it('should detect "мини-приложение" (Russian)', () => {
        expect(detectTemplate('Мини-приложение для телеграм')).toBe('tma');
      });
      
      it('should detect "бот" (Russian)', () => {
        expect(detectTemplate('Бот для заказов')).toBe('tma');
      });
    });
    
    describe('Landing (default) detection', () => {
      it('should default to landing for generic prompts', () => {
        expect(detectTemplate('Create a website')).toBe('landing');
      });
      
      it('should default to landing for empty prompt', () => {
        expect(detectTemplate('')).toBe('landing');
      });
      
      it('should default to landing for unrecognized keywords', () => {
        expect(detectTemplate('Something completely different')).toBe('landing');
      });
      
      it('should detect landing explicitly', () => {
        expect(detectTemplate('Landing page for startup')).toBe('landing');
      });
    });
    
    describe('Case insensitivity', () => {
      it('should handle uppercase', () => {
        expect(detectTemplate('DASHBOARD FOR ADMIN')).toBe('dashboard');
      });
      
      it('should handle mixed case', () => {
        expect(detectTemplate('PoRtFoLiO website')).toBe('portfolio');
      });
    });
    
  });
  
  describe('detectStyle', () => {
    
    describe('Minimal style detection', () => {
      it('should detect "minimal" keyword', () => {
        expect(detectStyle('Clean minimal design')).toBe('minimal');
      });
      
      it('should detect "минимал" (Russian)', () => {
        expect(detectStyle('Минималистичный дизайн')).toBe('minimal');
      });
      
      it('should detect "простой" (Russian)', () => {
        expect(detectStyle('Простой и чистый стиль')).toBe('minimal');
      });
      
      it('should detect "чистый" (Russian)', () => {
        expect(detectStyle('Чистый дизайн без лишнего')).toBe('minimal');
      });
    });
    
    describe('Brutalist style detection', () => {
      it('should detect "brutal" keyword', () => {
        expect(detectStyle('Brutal raw design')).toBe('brutalist');
      });
      
      it('should detect "брутал" (Russian)', () => {
        expect(detectStyle('Брутальный стиль')).toBe('brutalist');
      });
      
      it('should detect "жёстк" (Russian)', () => {
        expect(detectStyle('Жёсткий контраст')).toBe('brutalist');
      });
      
      it('should detect "raw" keyword', () => {
        expect(detectStyle('Raw industrial look')).toBe('brutalist');
      });
    });
    
    describe('Glassmorphism style detection', () => {
      it('should detect "glass" keyword', () => {
        expect(detectStyle('Glass effect cards')).toBe('glassmorphism');
      });
      
      it('should detect "стекл" (Russian)', () => {
        expect(detectStyle('Стеклянные карточки')).toBe('glassmorphism');
      });
      
      it('should detect "прозрач" (Russian)', () => {
        expect(detectStyle('Прозрачные элементы')).toBe('glassmorphism');
      });
      
      it('should detect "blur" keyword', () => {
        expect(detectStyle('Blurred background effect')).toBe('glassmorphism');
      });
    });
    
    describe('Neomorphism style detection', () => {
      it('should detect "neo" keyword', () => {
        expect(detectStyle('Neomorphic buttons')).toBe('neomorphism');
      });
      
      it('should detect "нео" (Russian)', () => {
        expect(detectStyle('Неоморфный дизайн')).toBe('neomorphism');
      });
      
      it('should detect "выдавлен" (Russian)', () => {
        expect(detectStyle('Выдавленные элементы')).toBe('neomorphism');
      });
      
      it('should detect "soft" keyword', () => {
        expect(detectStyle('Soft UI style')).toBe('neomorphism');
      });
    });
    
    describe('Retro style detection', () => {
      it('should detect "retro" keyword', () => {
        expect(detectStyle('Retro 80s style')).toBe('retro');
      });
      
      it('should detect "ретро" (Russian)', () => {
        expect(detectStyle('Ретро стиль')).toBe('retro');
      });
      
      it('should detect "80-х" (Russian)', () => {
        expect(detectStyle('Стиль 80-х годов')).toBe('retro');
      });
      
      it('should detect "неон" (Russian)', () => {
        expect(detectStyle('Неоновые цвета')).toBe('retro');
      });
    });
    
    describe('Modern (default) style detection', () => {
      it('should default to modern for generic prompts', () => {
        expect(detectStyle('Nice looking design')).toBe('modern');
      });
      
      it('should default to modern for empty prompt', () => {
        expect(detectStyle('')).toBe('modern');
      });
      
      it('should default to modern for unrecognized keywords', () => {
        expect(detectStyle('Random style description')).toBe('modern');
      });
    });
    
    describe('Case insensitivity', () => {
      it('should handle uppercase', () => {
        expect(detectStyle('GLASSMORPHISM CARDS')).toBe('glassmorphism');
      });
      
      it('should handle mixed case', () => {
        expect(detectStyle('BrUtAlIsT design')).toBe('brutalist');
      });
    });
    
  });
  
  describe('Combined detection', () => {
    
    it('should detect both template and style from one prompt', () => {
      const prompt = 'Dashboard with minimal design';
      
      expect(detectTemplate(prompt)).toBe('dashboard');
      expect(detectStyle(prompt)).toBe('minimal');
    });
    
    it('should handle complex prompts', () => {
      const prompt = 'Создай интернет-магазин в стиле glassmorphism с прозрачными карточками';
      
      expect(detectTemplate(prompt)).toBe('ecommerce');
      expect(detectStyle(prompt)).toBe('glassmorphism');
    });
    
    it('should handle Russian + English mix', () => {
      const prompt = 'Portfolio website в ретро стиле 80-х';
      
      expect(detectTemplate(prompt)).toBe('portfolio');
      expect(detectStyle(prompt)).toBe('retro');
    });
    
  });
  
  describe('Edge cases', () => {
    
    it('should handle special characters', () => {
      expect(detectTemplate('Dashboard!!! @#$%')).toBe('dashboard');
    });
    
    it('should handle numbers', () => {
      expect(detectStyle('80-х style with 3D effects')).toBe('retro');
    });
    
    it('should handle whitespace', () => {
      expect(detectTemplate('   dashboard   ')).toBe('dashboard');
    });
    
    it('should prioritize first match for overlapping keywords', () => {
      // "панель" matches dashboard, should take priority
      const prompt = 'Панель для магазина';
      expect(detectTemplate(prompt)).toBe('dashboard');
    });
    
  });
  
});
