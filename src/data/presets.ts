import { Preset, ProjectType } from '@/types/siteSpec';

export interface ExtendedPreset extends Preset {
  projectType: ProjectType;
  sectionsCount: number;
  features: string[];
}

export const PRESETS: ExtendedPreset[] = [
  // ==================== WEBSITE TEMPLATES ====================
  
  // 1. Лендинг стартапа
  {
    id: 'startup-landing',
    name: 'Startup Landing',
    nameRu: 'Лендинг стартапа',
    description: 'Modern startup landing page with all essential sections',
    descriptionRu: 'Полноценный лендинг для стартапа с hero, фичами, pricing и CTA',
    category: 'startup',
    projectType: 'website',
    thumbnail: '/presets/startup.png',
    tags: ['стартап', 'лендинг', 'SaaS'],
    sectionsCount: 6,
    features: ['Hero с градиентом', 'Блок фич', 'Тарифы', 'FAQ', 'CTA', 'Футер'],
    defaultSpec: {
      theme: {
        palette: {
          primary: '186 100% 50%',
          secondary: '222 30% 14%',
          accent: '38 92% 50%',
          background: '222 47% 6%',
          foreground: '210 40% 98%',
          muted: '222 30% 12%',
        },
        fontMode: 'normal',
        radius: 'lg',
        tokens: {},
        darkMode: true,
      },
      pages: [
        {
          id: 'home',
          slug: '/',
          title: 'Главная',
          sections: [
            {
              id: 'hero',
              type: 'hero',
              content: {
                heading: 'Запусти свой продукт за 24 часа',
                subheading: 'Платформа для быстрого создания и запуска MVP. Без кода, без головной боли.',
                cta: { text: 'Начать бесплатно', href: '#pricing', variant: 'primary' },
              },
              effects: [{ id: 'gradient-bg-1', type: 'gradient-bg', enabled: true, options: {} }],
              style: { padding: 'xl', background: 'transparent', align: 'center' },
            },
            {
              id: 'features',
              type: 'features',
              content: {
                heading: 'Всё что нужно для запуска',
                items: [
                  { id: '1', title: 'Быстрый старт', description: 'От идеи до рабочего продукта за день', icon: 'Zap' },
                  { id: '2', title: 'Без кода', description: 'Визуальный редактор для всего', icon: 'Layers' },
                  { id: '3', title: 'Масштабируемость', description: 'Растите вместе с бизнесом', icon: 'TrendingUp' },
                  { id: '4', title: 'Интеграции', description: 'Подключай любые сервисы', icon: 'Plug' },
                ],
              },
              effects: [],
              style: { padding: 'lg', background: 'muted', align: 'center' },
            },
            {
              id: 'pricing',
              type: 'pricing',
              content: {
                heading: 'Простые тарифы',
                items: [
                  { id: 'free', title: 'Бесплатно', description: '0 ₽/мес' },
                  { id: 'pro', title: 'Pro', description: '990 ₽/мес' },
                  { id: 'team', title: 'Команда', description: '2 490 ₽/мес' },
                ],
              },
              effects: [],
              style: { padding: 'lg', background: 'transparent', align: 'center' },
            },
            {
              id: 'faq',
              type: 'faq',
              content: {
                heading: 'Частые вопросы',
                items: [
                  { id: '1', title: 'Нужен ли опыт программирования?', description: 'Нет, платформа полностью визуальная' },
                  { id: '2', title: 'Можно ли подключить свой домен?', description: 'Да, на любом платном тарифе' },
                ],
              },
              effects: [],
              style: { padding: 'lg', background: 'muted', align: 'left' },
            },
            {
              id: 'cta',
              type: 'cta',
              content: {
                heading: 'Готов начать?',
                subheading: 'Присоединяйся к 10,000+ создателей',
                cta: { text: 'Создать проект', href: '/create', variant: 'primary' },
              },
              effects: [{ id: 'gradient-bg-2', type: 'gradient-bg', enabled: true, options: {} }],
              style: { padding: 'xl', background: 'transparent', align: 'center' },
            },
          ],
        },
      ],
    },
  },
  
  // 2. Портфолио
  {
    id: 'portfolio-creative',
    name: 'Portfolio Creative',
    nameRu: 'Портфолио',
    description: 'Clean portfolio for designers, photographers, developers',
    descriptionRu: 'Элегантное портфолио для дизайнеров, фотографов и разработчиков',
    category: 'portfolio',
    projectType: 'website',
    thumbnail: '/presets/portfolio.png',
    tags: ['портфолио', 'дизайн', 'творчество'],
    sectionsCount: 5,
    features: ['Hero с фото', 'Галерея работ', 'Обо мне', 'Навыки', 'Контакты'],
    defaultSpec: {
      theme: {
        palette: {
          primary: '0 0% 100%',
          secondary: '0 0% 96%',
          accent: '38 92% 50%',
          background: '0 0% 4%',
          foreground: '0 0% 98%',
          muted: '0 0% 12%',
        },
        fontMode: 'normal',
        radius: 'sm',
        tokens: {},
        darkMode: true,
      },
      pages: [
        {
          id: 'home',
          slug: '/',
          title: 'Портфолио',
          sections: [
            {
              id: 'hero',
              type: 'hero',
              content: {
                heading: 'Привет, я Дизайнер',
                subheading: 'Создаю цифровые продукты с душой. 5+ лет опыта в UI/UX.',
                cta: { text: 'Смотреть работы', href: '#gallery', variant: 'outline' },
              },
              effects: [],
              style: { padding: 'xl', background: 'transparent', align: 'left' },
            },
            {
              id: 'gallery',
              type: 'gallery',
              content: {
                heading: 'Избранные проекты',
                items: [
                  { id: '1', title: 'Fintech App', description: 'Мобильное приложение банка', image: '/projects/1.jpg' },
                  { id: '2', title: 'E-commerce', description: 'Редизайн интернет-магазина', image: '/projects/2.jpg' },
                  { id: '3', title: 'SaaS Dashboard', description: 'Панель аналитики', image: '/projects/3.jpg' },
                ],
              },
              effects: [{ id: 'hover-lift-1', type: 'hover-lift', enabled: true, options: {} }],
              style: { padding: 'lg', background: 'transparent', align: 'center' },
            },
            {
              id: 'about',
              type: 'custom',
              content: {
                heading: 'Обо мне',
                body: 'Специализируюсь на создании пользовательских интерфейсов для стартапов и корпораций. Работаю с Figma, React и современными инструментами.',
              },
              effects: [],
              style: { padding: 'lg', background: 'muted', align: 'left' },
            },
            {
              id: 'contact',
              type: 'contact',
              content: {
                heading: 'Давайте работать вместе',
                subheading: 'Открыт для интересных проектов и коллабораций',
                cta: { text: 'Написать', href: 'mailto:hello@example.com', variant: 'primary' },
              },
              effects: [],
              style: { padding: 'xl', background: 'transparent', align: 'center' },
            },
          ],
        },
      ],
    },
  },
  
  // 3. Интернет-магазин
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    nameRu: 'Интернет-магазин',
    description: 'Online store with products catalog and cart',
    descriptionRu: 'Магазин с каталогом товаров, карточками и корзиной',
    category: 'ecommerce',
    projectType: 'website',
    thumbnail: '/presets/ecommerce.png',
    tags: ['магазин', 'e-commerce', 'товары'],
    sectionsCount: 6,
    features: ['Hero баннер', 'Категории', 'Товары', 'Преимущества', 'Отзывы', 'Подписка'],
    defaultSpec: {
      theme: {
        palette: {
          primary: '142 76% 36%',
          secondary: '142 30% 20%',
          accent: '38 92% 50%',
          background: '222 47% 6%',
          foreground: '210 40% 98%',
          muted: '222 30% 12%',
        },
        fontMode: 'normal',
        radius: 'md',
        tokens: {},
        darkMode: true,
      },
      pages: [
        {
          id: 'home',
          slug: '/',
          title: 'Магазин',
          sections: [
            {
              id: 'hero',
              type: 'hero',
              content: {
                heading: 'Новая коллекция 2026',
                subheading: 'Скидки до 40% на все товары. Бесплатная доставка от 3000₽',
                cta: { text: 'Смотреть каталог', href: '#products', variant: 'primary' },
              },
              effects: [{ id: 'gradient-bg-1', type: 'gradient-bg', enabled: true, options: {} }],
              style: { padding: 'xl', background: 'transparent', align: 'center' },
            },
            {
              id: 'categories',
              type: 'features',
              content: {
                heading: 'Категории',
                items: [
                  { id: '1', title: 'Электроника', description: '120+ товаров', icon: 'Smartphone' },
                  { id: '2', title: 'Одежда', description: '340+ товаров', icon: 'Shirt' },
                  { id: '3', title: 'Дом и сад', description: '85+ товаров', icon: 'Home' },
                  { id: '4', title: 'Спорт', description: '95+ товаров', icon: 'Dumbbell' },
                ],
              },
              effects: [],
              style: { padding: 'lg', background: 'muted', align: 'center' },
            },
            {
              id: 'products',
              type: 'gallery',
              content: {
                heading: 'Популярные товары',
                items: [
                  { id: '1', title: 'Wireless наушники', description: '4 990 ₽', image: '/products/1.jpg' },
                  { id: '2', title: 'Смарт-часы', description: '12 990 ₽', image: '/products/2.jpg' },
                  { id: '3', title: 'Портативная колонка', description: '3 490 ₽', image: '/products/3.jpg' },
                  { id: '4', title: 'Фитнес-браслет', description: '2 990 ₽', image: '/products/4.jpg' },
                ],
              },
              effects: [{ id: 'hover-lift-1', type: 'hover-lift', enabled: true, options: {} }],
              style: { padding: 'lg', background: 'transparent', align: 'center' },
            },
            {
              id: 'benefits',
              type: 'features',
              content: {
                heading: 'Почему мы',
                items: [
                  { id: '1', title: 'Быстрая доставка', description: 'От 1 дня по России', icon: 'Truck' },
                  { id: '2', title: 'Гарантия качества', description: 'Возврат 14 дней', icon: 'Shield' },
                  { id: '3', title: 'Поддержка 24/7', description: 'Всегда на связи', icon: 'Headphones' },
                ],
              },
              effects: [],
              style: { padding: 'lg', background: 'muted', align: 'center' },
            },
            {
              id: 'testimonials',
              type: 'testimonials',
              content: {
                heading: 'Отзывы покупателей',
                items: [
                  { id: '1', title: 'Анна К.', description: 'Отличный магазин! Быстрая доставка и качественные товары.' },
                  { id: '2', title: 'Михаил П.', description: 'Покупаю уже третий раз. Всё всегда на высоте.' },
                ],
              },
              effects: [],
              style: { padding: 'lg', background: 'transparent', align: 'center' },
            },
          ],
        },
      ],
    },
  },
  
  // 4. Корпоративный сайт
  {
    id: 'corporate-site',
    name: 'Corporate Site',
    nameRu: 'Корпоративный сайт',
    description: 'Professional business website',
    descriptionRu: 'Профессиональный сайт для компании с услугами и командой',
    category: 'corporate',
    projectType: 'website',
    thumbnail: '/presets/corporate.png',
    tags: ['бизнес', 'компания', 'услуги'],
    sectionsCount: 6,
    features: ['Hero', 'О компании', 'Услуги', 'Команда', 'Партнёры', 'Контакты'],
    defaultSpec: {
      theme: {
        palette: {
          primary: '221 83% 53%',
          secondary: '215 20% 65%',
          accent: '38 92% 50%',
          background: '222 47% 6%',
          foreground: '210 40% 98%',
          muted: '220 15% 20%',
        },
        fontMode: 'normal',
        radius: 'lg',
        tokens: {},
        darkMode: true,
      },
      pages: [
        {
          id: 'home',
          slug: '/',
          title: 'Компания',
          sections: [
            {
              id: 'hero',
              type: 'hero',
              content: {
                heading: 'Решения для вашего бизнеса',
                subheading: '15 лет опыта. 500+ успешных проектов. Надёжный партнёр для роста.',
                cta: { text: 'Получить консультацию', href: '#contact', variant: 'primary' },
              },
              effects: [],
              style: { padding: 'xl', background: 'transparent', align: 'left' },
            },
            {
              id: 'about',
              type: 'custom',
              content: {
                heading: 'О компании',
                body: 'Мы — команда профессионалов, которая помогает бизнесу расти и развиваться. Наш опыт и экспертиза позволяют решать задачи любой сложности.',
              },
              effects: [],
              style: { padding: 'lg', background: 'muted', align: 'left' },
            },
            {
              id: 'services',
              type: 'features',
              content: {
                heading: 'Наши услуги',
                items: [
                  { id: '1', title: 'Консалтинг', description: 'Стратегическое планирование и оптимизация', icon: 'Briefcase' },
                  { id: '2', title: 'Разработка', description: 'Цифровые продукты под ключ', icon: 'Code' },
                  { id: '3', title: 'Маркетинг', description: 'Продвижение и рост продаж', icon: 'TrendingUp' },
                  { id: '4', title: 'Поддержка', description: 'Сопровождение 24/7', icon: 'Headphones' },
                ],
              },
              effects: [],
              style: { padding: 'lg', background: 'transparent', align: 'center' },
            },
            {
              id: 'team',
              type: 'gallery',
              content: {
                heading: 'Наша команда',
                items: [
                  { id: '1', title: 'Иван Петров', description: 'CEO', image: '/team/1.jpg' },
                  { id: '2', title: 'Мария Сидорова', description: 'CTO', image: '/team/2.jpg' },
                  { id: '3', title: 'Алексей Козлов', description: 'Head of Sales', image: '/team/3.jpg' },
                ],
              },
              effects: [],
              style: { padding: 'lg', background: 'muted', align: 'center' },
            },
            {
              id: 'contact',
              type: 'contact',
              content: {
                heading: 'Свяжитесь с нами',
                subheading: 'Обсудим ваш проект и предложим лучшее решение',
                cta: { text: 'Оставить заявку', href: '#', variant: 'primary' },
              },
              effects: [],
              style: { padding: 'xl', background: 'transparent', align: 'center' },
            },
          ],
        },
      ],
    },
  },
  
  // ==================== TMA TEMPLATES ====================
  
  // 5. TMA Магазин
  {
    id: 'tma-shop',
    name: 'TMA Shop',
    nameRu: 'Магазин в боте',
    description: 'Telegram Mini App for e-commerce',
    descriptionRu: 'Mini App магазин с каталогом и корзиной для Telegram бота',
    category: 'tma-shop',
    projectType: 'tma',
    thumbnail: '/presets/tma-shop.png',
    tags: ['telegram', 'магазин', 'бот'],
    sectionsCount: 4,
    features: ['Каталог товаров', 'Корзина', 'Оформление заказа', 'Telegram Pay'],
    defaultSpec: {
      theme: {
        palette: {
          primary: '200 100% 50%',
          secondary: '200 30% 20%',
          accent: '38 92% 50%',
          background: '222 47% 6%',
          foreground: '210 40% 98%',
          muted: '222 30% 12%',
        },
        fontMode: 'normal',
        radius: 'lg',
        tokens: {},
        darkMode: true,
      },
      pages: [
        {
          id: 'catalog',
          slug: '/',
          title: 'Каталог',
          sections: [
            {
              id: 'header',
              type: 'custom',
              content: {
                heading: '🛍️ Магазин',
                subheading: 'Выберите товары',
              },
              effects: [],
              style: { padding: 'sm', background: 'transparent', align: 'center' },
            },
            {
              id: 'categories',
              type: 'features',
              content: {
                items: [
                  { id: '1', title: 'Популярное', icon: 'Star' },
                  { id: '2', title: 'Новинки', icon: 'Sparkles' },
                  { id: '3', title: 'Скидки', icon: 'Percent' },
                ],
              },
              effects: [],
              style: { padding: 'sm', background: 'transparent', align: 'center' },
            },
            {
              id: 'products',
              type: 'gallery',
              content: {
                items: [
                  { id: '1', title: 'Товар 1', description: '990 ₽', image: '/tma/product1.jpg' },
                  { id: '2', title: 'Товар 2', description: '1 490 ₽', image: '/tma/product2.jpg' },
                  { id: '3', title: 'Товар 3', description: '2 990 ₽', image: '/tma/product3.jpg' },
                  { id: '4', title: 'Товар 4', description: '4 990 ₽', image: '/tma/product4.jpg' },
                ],
              },
              effects: [],
              style: { padding: 'sm', background: 'transparent', align: 'center' },
            },
          ],
        },
        {
          id: 'cart',
          slug: '/cart',
          title: 'Корзина',
          sections: [
            {
              id: 'cart-items',
              type: 'custom',
              content: {
                heading: 'Корзина',
              },
              effects: [],
              style: { padding: 'sm', background: 'transparent', align: 'left' },
            },
          ],
        },
      ],
    },
  },
  
  // 6. TMA Сервис записи
  {
    id: 'tma-booking',
    name: 'TMA Booking',
    nameRu: 'Сервис записи',
    description: 'Telegram Mini App for appointments booking',
    descriptionRu: 'Mini App для записи на услуги с календарём и слотами',
    category: 'tma-booking',
    projectType: 'tma',
    thumbnail: '/presets/tma-booking.png',
    tags: ['telegram', 'запись', 'услуги'],
    sectionsCount: 3,
    features: ['Выбор услуги', 'Календарь', 'Выбор времени', 'Подтверждение'],
    defaultSpec: {
      theme: {
        palette: {
          primary: '142 76% 36%',
          secondary: '142 30% 20%',
          accent: '38 92% 50%',
          background: '222 47% 6%',
          foreground: '210 40% 98%',
          muted: '222 30% 12%',
        },
        fontMode: 'normal',
        radius: 'lg',
        tokens: {},
        darkMode: true,
      },
      pages: [
        {
          id: 'services',
          slug: '/',
          title: 'Услуги',
          sections: [
            {
              id: 'header',
              type: 'custom',
              content: {
                heading: '📅 Запись онлайн',
                subheading: 'Выберите услугу',
              },
              effects: [],
              style: { padding: 'sm', background: 'transparent', align: 'center' },
            },
            {
              id: 'services-list',
              type: 'features',
              content: {
                items: [
                  { id: '1', title: 'Стрижка', description: '1 500 ₽ • 45 мин', icon: 'Scissors' },
                  { id: '2', title: 'Окрашивание', description: '3 500 ₽ • 2 часа', icon: 'Palette' },
                  { id: '3', title: 'Маникюр', description: '2 000 ₽ • 1 час', icon: 'Sparkles' },
                  { id: '4', title: 'Массаж', description: '2 500 ₽ • 1 час', icon: 'Heart' },
                ],
              },
              effects: [],
              style: { padding: 'sm', background: 'transparent', align: 'left' },
            },
          ],
        },
        {
          id: 'calendar',
          slug: '/calendar',
          title: 'Календарь',
          sections: [
            {
              id: 'date-picker',
              type: 'custom',
              content: {
                heading: 'Выберите дату',
              },
              effects: [],
              style: { padding: 'sm', background: 'transparent', align: 'center' },
            },
            {
              id: 'time-slots',
              type: 'custom',
              content: {
                heading: 'Доступное время',
                items: [
                  { id: '1', title: '10:00' },
                  { id: '2', title: '11:00' },
                  { id: '3', title: '14:00' },
                  { id: '4', title: '15:30' },
                  { id: '5', title: '17:00' },
                ],
              },
              effects: [],
              style: { padding: 'sm', background: 'transparent', align: 'center' },
            },
          ],
        },
      ],
    },
  },
  
  // 7. TMA Мини-игра
  {
    id: 'tma-game',
    name: 'TMA Game',
    nameRu: 'Мини-игра',
    description: 'Telegram Mini App game with gamification',
    descriptionRu: 'Игровая Mini App с очками, уровнями и лидербордом',
    category: 'tma-game',
    projectType: 'tma',
    thumbnail: '/presets/tma-game.png',
    tags: ['telegram', 'игра', 'геймификация'],
    sectionsCount: 3,
    features: ['Игровое поле', 'Очки и уровни', 'Лидерборд', 'Награды'],
    defaultSpec: {
      theme: {
        palette: {
          primary: '280 100% 60%',
          secondary: '142 76% 36%',
          accent: '38 92% 50%',
          background: '240 10% 4%',
          foreground: '0 0% 98%',
          muted: '240 5% 15%',
        },
        fontMode: 'normal',
        radius: 'lg',
        tokens: {},
        darkMode: true,
      },
      pages: [
        {
          id: 'game',
          slug: '/',
          title: 'Игра',
          sections: [
            {
              id: 'header',
              type: 'custom',
              content: {
                heading: '🎮 Tap Coin',
              },
              effects: [],
              style: { padding: 'sm', background: 'transparent', align: 'center' },
            },
            {
              id: 'stats',
              type: 'custom',
              content: {
                items: [
                  { id: '1', title: 'Очки', description: '12,450' },
                  { id: '2', title: 'Уровень', description: '7' },
                  { id: '3', title: 'Энергия', description: '80/100' },
                ],
              },
              effects: [],
              style: { padding: 'sm', background: 'muted', align: 'center' },
            },
            {
              id: 'game-area',
              type: 'custom',
              content: {
                heading: 'Нажми на монету!',
              },
              effects: [{ id: 'glow-border-1', type: 'glow-border', enabled: true, options: {} }],
              style: { padding: 'xl', background: 'transparent', align: 'center' },
            },
          ],
        },
        {
          id: 'leaderboard',
          slug: '/leaderboard',
          title: 'Рейтинг',
          sections: [
            {
              id: 'leaders',
              type: 'custom',
              content: {
                heading: '🏆 Топ игроков',
                items: [
                  { id: '1', title: '1. @player1', description: '98,500 очков' },
                  { id: '2', title: '2. @player2', description: '87,200 очков' },
                  { id: '3', title: '3. @player3', description: '76,100 очков' },
                ],
              },
              effects: [],
              style: { padding: 'sm', background: 'transparent', align: 'left' },
            },
          ],
        },
      ],
    },
  },
  
  // 8. TMA Визитка/Меню
  {
    id: 'tma-menu',
    name: 'TMA Menu',
    nameRu: 'Визитка / Меню',
    description: 'Telegram Mini App for business card or restaurant menu',
    descriptionRu: 'Mini App визитка компании или меню ресторана',
    category: 'tma-menu',
    projectType: 'tma',
    thumbnail: '/presets/tma-menu.png',
    tags: ['telegram', 'визитка', 'меню'],
    sectionsCount: 4,
    features: ['Информация', 'Меню/Услуги', 'Контакты', 'Карта'],
    defaultSpec: {
      theme: {
        palette: {
          primary: '24 80% 50%',
          secondary: '24 30% 20%',
          accent: '38 92% 50%',
          background: '24 5% 6%',
          foreground: '24 5% 95%',
          muted: '24 5% 15%',
        },
        fontMode: 'normal',
        radius: 'md',
        tokens: {},
        darkMode: true,
      },
      pages: [
        {
          id: 'home',
          slug: '/',
          title: 'Главная',
          sections: [
            {
              id: 'header',
              type: 'hero',
              content: {
                heading: '🍕 Пиццерия Белла',
                subheading: 'Итальянская кухня с доставкой',
              },
              effects: [],
              style: { padding: 'md', background: 'transparent', align: 'center' },
            },
            {
              id: 'menu-categories',
              type: 'features',
              content: {
                heading: 'Меню',
                items: [
                  { id: '1', title: 'Пицца', description: 'от 490 ₽', icon: 'Pizza' },
                  { id: '2', title: 'Паста', description: 'от 390 ₽', icon: 'UtensilsCrossed' },
                  { id: '3', title: 'Салаты', description: 'от 290 ₽', icon: 'Salad' },
                  { id: '4', title: 'Напитки', description: 'от 150 ₽', icon: 'Wine' },
                ],
              },
              effects: [],
              style: { padding: 'sm', background: 'transparent', align: 'left' },
            },
            {
              id: 'info',
              type: 'custom',
              content: {
                heading: 'Информация',
                items: [
                  { id: '1', title: '📍 Адрес', description: 'ул. Пушкина, 10' },
                  { id: '2', title: '🕐 Режим работы', description: '10:00 – 23:00' },
                  { id: '3', title: '📞 Телефон', description: '+7 (999) 123-45-67' },
                ],
              },
              effects: [],
              style: { padding: 'sm', background: 'muted', align: 'left' },
            },
            {
              id: 'cta',
              type: 'cta',
              content: {
                cta: { text: 'Забронировать столик', href: '#', variant: 'primary' },
              },
              effects: [],
              style: { padding: 'md', background: 'transparent', align: 'center' },
            },
          ],
        },
      ],
    },
  },
];

export const getPresetById = (id: string): ExtendedPreset | undefined => {
  return PRESETS.find(preset => preset.id === id);
};

export const getPresetsByCategory = (category: string): ExtendedPreset[] => {
  return PRESETS.filter(preset => preset.category === category);
};

export const getPresetsByProjectType = (type: ProjectType): ExtendedPreset[] => {
  return PRESETS.filter(preset => preset.projectType === type);
};

export const getWebsitePresets = (): ExtendedPreset[] => {
  return PRESETS.filter(preset => preset.projectType === 'website');
};

export const getTMAPresets = (): ExtendedPreset[] => {
  return PRESETS.filter(preset => preset.projectType === 'tma');
};
