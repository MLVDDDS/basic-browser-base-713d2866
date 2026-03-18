import { describe, it, expect } from 'vitest';
import { 
  analyzePromptComplexity, 
  analyzePromptComplexityDetailed,
  normalizeText,
  fuzzyMatch,
  containsTermFuzzy,
  SLANG_MAP,
  TYPO_CORRECTIONS
} from '@/lib/prompt-complexity';

describe('Prompt Complexity Analyzer - Multilingual Tests', () => {
  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🧹 TEXT NORMALIZATION TESTS (Voice input, typos, slang)
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Text Normalization (Voice Input Cleanup)', () => {
    it('Should remove Russian voice fillers (эээ, ммм, ну)', () => {
      const result = normalizeText('эээ ну сделай ммм магазин короче');
      expect(result).not.toContain('эээ');
      expect(result).not.toContain('ммм');
      expect(result).not.toContain('короче');
      expect(result).toContain('магазин');
    });
    
    it('Should remove English voice fillers (umm, like, you know)', () => {
      const result = normalizeText('umm like create a shop you know');
      expect(result).not.toContain('umm');
      expect(result).not.toContain('like');
      expect(result).not.toContain('you know');
      expect(result).toContain('shop');
    });
    
    it('Should expand Russian slang (магаз → магазин, юзер → пользователь)', () => {
      const result = normalizeText('сделай магаз для юзеров');
      expect(result).toContain('магазин');
      expect(result).toContain('пользователь');
    });
    
    it('Should expand English abbreviations (db → database, auth → authentication)', () => {
      const result = normalizeText('add db and auth');
      expect(result).toContain('database');
      expect(result).toContain('authentication');
    });
    
    it('Should handle mixed slang and fillers', () => {
      const result = normalizeText('эээ сделай апишку для магаза ммм с авторкой');
      expect(result).toContain('api');
      expect(result).toContain('магазин');
      expect(result).toContain('авторизация');
    });
  });
  
  describe('Fuzzy Matching (Typo Tolerance)', () => {
    it('Should match with 1 character typo', () => {
      expect(fuzzyMatch('databse', 'database')).toBe(true);
      expect(fuzzyMatch('pasword', 'password')).toBe(true);
      expect(fuzzyMatch('autentication', 'authentication')).toBe(true);
    });
    
    it('Should match with 2 character typos', () => {
      expect(fuzzyMatch('databaze', 'database')).toBe(true);
      expect(fuzzyMatch('dashbord', 'dashboard')).toBe(true);
    });
    
    it('Should NOT match with 3+ character difference', () => {
      expect(fuzzyMatch('data', 'database')).toBe(false);
      expect(fuzzyMatch('auth', 'authentication')).toBe(false);
    });
    
    it('Should find terms with known typo variants', () => {
      expect(containsTermFuzzy('добавь датабейс', 'database')).toBe(true);
      expect(containsTermFuzzy('сделай дашборда', 'dashboard')).toBe(true);
      expect(containsTermFuzzy('подключи страйп', 'stripe')).toBe(true);
    });
  });
  
  describe('Real-World Messy Prompts', () => {
    it('Should handle voice input with garbage: "эээ ну сделай типа магаз с корзинкой"', () => {
      const result = analyzePromptComplexityDetailed('эээ ну сделай типа магаз с корзинкой');
      expect(result.complexity).toBe('high');
      expect(result.matchedCategories).toContain('ecommerce');
    });
    
    it('Should handle typos: "databse with autentication"', () => {
      const result = analyzePromptComplexityDetailed('add databse with autentication');
      expect(result.complexity).toBe('high');
    });
    
    it('Should handle Russian transliteration typos: "сделай дашборда с аналитикой"', () => {
      const result = analyzePromptComplexityDetailed('сделай дашборда с аналитикой');
      expect(result.complexity).toBe('high');
    });
    
    it('Should handle slang: "нужна апишка для юзеров с авторкой"', () => {
      const result = analyzePromptComplexityDetailed('нужна апишка для юзеров с авторкой');
      expect(result.complexity).toBe('high');
      // After normalization: "api" + "пользователь" + "авторизация"
    });
    
    it('Should handle mixed: "эээ добавь btn для submita формочки"', () => {
      const result = analyzePromptComplexityDetailed('эээ добавь btn для submita формочки');
      expect(result.complexity).toBe('medium');
      // After normalization: "button" + "форма"
    });
    
    it('Should handle extreme garbage: "ну это ммм короче типа шопчик с чекаутиком"', () => {
      const result = analyzePromptComplexityDetailed('ну это ммм короче типа шопчик с чекаутиком');
      expect(result.complexity).toBe('high');
    });
    
    it('Should handle English voice garbage: "umm basically I need like a shop with like payments"', () => {
      const result = analyzePromptComplexityDetailed('umm basically I need like a shop with like payments');
      expect(result.complexity).toBe('high');
    });
  });


  
  // ═══════════════════════════════════════════════════════════════════════════
  // 🇷🇺 RUSSIAN TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Russian (Русский)', () => {
    it('HIGH: Сделай интернет-магазин с корзиной и оплатой через Stripe', () => {
      const result = analyzePromptComplexityDetailed('Сделай интернет-магазин с корзиной и оплатой через Stripe');
      expect(result.complexity).toBe('high');
      expect(result.detectedLanguage).toBe('russian');
      expect(result.matchedCategories).toContain('ecommerce');
      expect(result.matchedCategories).toContain('payments');
    });

    it('HIGH: Добавь авторизацию через Google и сохранение профиля пользователя', () => {
      const result = analyzePromptComplexityDetailed('Добавь авторизацию через Google и сохранение профиля пользователя');
      expect(result.complexity).toBe('high');
      expect(result.matchedCategories).toContain('authentication');
    });

    it('HIGH: Нужен дашборд с аналитикой и графиками продаж', () => {
      const result = analyzePromptComplexityDetailed('Нужен дашборд с аналитикой и графиками продаж');
      expect(result.complexity).toBe('high');
      expect(result.matchedCategories).toContain('admin_dashboards');
    });

    it('HIGH: Сделай чат с уведомлениями в реальном времени', () => {
      const result = analyzePromptComplexityDetailed('Сделай чат с уведомлениями в реальном времени');
      expect(result.complexity).toBe('high');
      expect(result.matchedCategories).toContain('realtime');
    });

    it('MEDIUM: Добавь форму обратной связи с валидацией', () => {
      const result = analyzePromptComplexityDetailed('Добавь форму обратной связи с валидацией');
      expect(result.complexity).toBe('medium');
      expect(result.matchedCategories).toContain('forms');
    });

    it('MEDIUM: Сделай галерею с красивыми анимациями', () => {
      const result = analyzePromptComplexityDetailed('Сделай галерею с красивыми анимациями');
      expect(result.complexity).toBe('medium');
    });

    it('LOW: Измени цвет кнопки на синий', () => {
      const result = analyzePromptComplexityDetailed('Измени цвет кнопки на синий');
      expect(result.complexity).toBe('low');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇬🇧 ENGLISH TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('English', () => {
    it('HIGH: Build an e-commerce platform with Stripe payments and user authentication', () => {
      const result = analyzePromptComplexityDetailed('Build an e-commerce platform with Stripe payments and user authentication');
      expect(result.complexity).toBe('high');
      expect(result.detectedLanguage).toBe('english');
    });

    it('HIGH: Create a real-time chat application with websockets', () => {
      const result = analyzePromptComplexityDetailed('Create a real-time chat application with websockets');
      expect(result.complexity).toBe('high');
      expect(result.matchedCategories).toContain('realtime');
    });

    it('HIGH: I need a dashboard with analytics and database integration', () => {
      const result = analyzePromptComplexityDetailed('I need a dashboard with analytics and database integration');
      expect(result.complexity).toBe('high');
    });

    it('MEDIUM: Add a contact form with validation', () => {
      const result = analyzePromptComplexityDetailed('Add a contact form with validation');
      expect(result.complexity).toBe('medium');
    });

    it('MEDIUM: Create an image carousel with smooth animations', () => {
      const result = analyzePromptComplexityDetailed('Create an image carousel with smooth animations');
      expect(result.complexity).toBe('medium');
    });

    it('LOW: Change the button color to blue', () => {
      const result = analyzePromptComplexityDetailed('Change the button color to blue');
      expect(result.complexity).toBe('low');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇺🇦 UKRAINIAN TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Ukrainian (Українська)', () => {
    it('HIGH: Зроби інтернет-магазин з кошиком та оплатою', () => {
      const result = analyzePromptComplexityDetailed('Зроби інтернет-магазин з кошиком та оплатою');
      expect(result.complexity).toBe('high');
      expect(result.detectedLanguage).toBe('ukrainian');
    });

    it('HIGH: Додай авторизацію користувачів з реєстрацією', () => {
      const result = analyzePromptComplexityDetailed('Додай авторизацію користувачів з реєстрацією');
      expect(result.complexity).toBe('high');
    });

    it('MEDIUM: Створи форму зворотного зв\'язку', () => {
      const result = analyzePromptComplexityDetailed('Створи форму зворотного зв\'язку');
      expect(result.complexity).toBe('medium');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇪🇸 SPANISH TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Spanish (Español)', () => {
    it('HIGH: Crea una tienda en línea con carrito de compras y pagos', () => {
      const result = analyzePromptComplexityDetailed('Crea una tienda en línea con carrito de compras y pagos');
      expect(result.complexity).toBe('high');
    });

    it('HIGH: Necesito autenticación de usuarios con registro', () => {
      const result = analyzePromptComplexityDetailed('Necesito autenticación de usuarios con registro');
      expect(result.complexity).toBe('high');
    });

    it('MEDIUM: Agrega un formulario de contacto con validación', () => {
      const result = analyzePromptComplexityDetailed('Agrega un formulario de contacto con validación');
      expect(result.complexity).toBe('medium');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇩🇪 GERMAN TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('German (Deutsch)', () => {
    it('HIGH: Erstelle einen Online-Shop mit Warenkorb und Zahlung', () => {
      const result = analyzePromptComplexityDetailed('Erstelle einen Online-Shop mit Warenkorb und Zahlung');
      expect(result.complexity).toBe('high');
    });

    it('HIGH: Ich brauche Benutzerauthentifizierung mit Registrierung', () => {
      const result = analyzePromptComplexityDetailed('Ich brauche Benutzerauthentifizierung mit Registrierung');
      expect(result.complexity).toBe('high');
    });

    it('MEDIUM: Füge ein Kontaktformular mit Validierung hinzu', () => {
      const result = analyzePromptComplexityDetailed('Füge ein Kontaktformular mit Validierung hinzu');
      expect(result.complexity).toBe('medium');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇫🇷 FRENCH TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('French (Français)', () => {
    it('HIGH: Crée une boutique en ligne avec panier et paiement', () => {
      const result = analyzePromptComplexityDetailed('Crée une boutique en ligne avec panier et paiement');
      expect(result.complexity).toBe('high');
    });

    it('HIGH: J\'ai besoin d\'authentification utilisateur avec inscription', () => {
      const result = analyzePromptComplexityDetailed('J\'ai besoin d\'authentification utilisateur avec inscription');
      expect(result.complexity).toBe('high');
    });

    it('MEDIUM: Ajoute un formulaire de contact avec validation', () => {
      const result = analyzePromptComplexityDetailed('Ajoute un formulaire de contact avec validation');
      expect(result.complexity).toBe('medium');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇨🇳 CHINESE TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Chinese (中文)', () => {
    it('HIGH: 创建一个带有购物车和支付功能的电商平台', () => {
      const result = analyzePromptComplexityDetailed('创建一个带有购物车和支付功能的电商平台');
      expect(result.complexity).toBe('high');
      expect(result.detectedLanguage).toBe('chinese');
    });

    it('HIGH: 添加用户认证和注册登录功能', () => {
      const result = analyzePromptComplexityDetailed('添加用户认证和注册登录功能');
      expect(result.complexity).toBe('high');
    });

    it('HIGH: 需要一个带有数据库的管理后台', () => {
      const result = analyzePromptComplexityDetailed('需要一个带有数据库的管理后台');
      expect(result.complexity).toBe('high');
    });

    it('MEDIUM: 添加一个带验证的联系表单', () => {
      const result = analyzePromptComplexityDetailed('添加一个带验证的联系表单');
      expect(result.complexity).toBe('medium');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇯🇵 JAPANESE TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Japanese (日本語)', () => {
    it('HIGH: カートと決済機能付きのECサイトを作成', () => {
      const result = analyzePromptComplexityDetailed('カートと決済機能付きのECサイトを作成');
      expect(result.complexity).toBe('high');
      expect(result.detectedLanguage).toBe('japanese');
    });

    it('HIGH: ユーザー認証とログイン機能を追加', () => {
      const result = analyzePromptComplexityDetailed('ユーザー認証とログイン機能を追加');
      expect(result.complexity).toBe('high');
    });

    it('MEDIUM: バリデーション付きのお問い合わせフォームを追加', () => {
      const result = analyzePromptComplexityDetailed('バリデーション付きのお問い合わせフォームを追加');
      expect(result.complexity).toBe('medium');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇰🇷 KOREAN TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Korean (한국어)', () => {
    it('HIGH: 장바구니와 결제 기능이 있는 쇼핑몰을 만들어주세요', () => {
      const result = analyzePromptComplexityDetailed('장바구니와 결제 기능이 있는 쇼핑몰을 만들어주세요');
      expect(result.complexity).toBe('high');
      expect(result.detectedLanguage).toBe('korean');
    });

    it('HIGH: 사용자 인증과 로그인 기능 추가', () => {
      const result = analyzePromptComplexityDetailed('사용자 인증과 로그인 기능 추가');
      expect(result.complexity).toBe('high');
    });

    it('MEDIUM: 유효성 검사가 있는 문의 양식 추가', () => {
      const result = analyzePromptComplexityDetailed('유효성 검사가 있는 문의 양식 추가');
      expect(result.complexity).toBe('medium');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇹🇷 TURKISH TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Turkish (Türkçe)', () => {
    it('HIGH: Sepet ve ödeme sistemi olan bir e-ticaret sitesi oluştur', () => {
      const result = analyzePromptComplexityDetailed('Sepet ve ödeme sistemi olan bir e-ticaret sitesi oluştur');
      expect(result.complexity).toBe('high');
    });

    it('HIGH: Kullanıcı kimlik doğrulama ve kayıt sistemi ekle', () => {
      const result = analyzePromptComplexityDetailed('Kullanıcı kimlik doğrulama ve kayıt sistemi ekle');
      expect(result.complexity).toBe('high');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 🇸🇦 ARABIC TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Arabic (العربية)', () => {
    it('HIGH: أنشئ متجرًا إلكترونيًا مع سلة التسوق والدفع', () => {
      const result = analyzePromptComplexityDetailed('أنشئ متجرًا إلكترونيًا مع سلة التسوق والدفع');
      expect(result.complexity).toBe('high');
      expect(result.detectedLanguage).toBe('arabic');
    });

    it('HIGH: أضف نظام مصادقة المستخدم وتسجيل الدخول', () => {
      const result = analyzePromptComplexityDetailed('أضف نظام مصادقة المستخدم وتسجيل الدخول');
      expect(result.complexity).toBe('high');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT BOOST TESTS - Automatic Relationship Detection
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Context Boosts (Automatic Detection)', () => {
    
    // User + Save = Backend needed
    describe('user-data-persistence boost', () => {
      it('EN: Save user preferences', () => {
        const result = analyzePromptComplexityDetailed('Save user preferences');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('user-data-persistence');
      });
      
      it('RU: Сохрани данные пользователя', () => {
        const result = analyzePromptComplexityDetailed('Сохрани данные пользователя');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('user-data-persistence');
      });
      
      it('CN: 保存用户数据', () => {
        const result = analyzePromptComplexityDetailed('保存用户数据');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('user-data-persistence');
      });
      
      it('JP: ユーザーの設定を保存', () => {
        const result = analyzePromptComplexityDetailed('ユーザーの設定を保存');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('user-data-persistence');
      });
      
      it('KR: 사용자 데이터 저장', () => {
        const result = analyzePromptComplexityDetailed('사용자 데이터 저장');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('user-data-persistence');
      });
    });
    
    // Profile + Edit = User management
    describe('user-profile-management boost', () => {
      it('EN: Let users edit their profile', () => {
        const result = analyzePromptComplexityDetailed('Let users edit their profile');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('user-profile-management');
      });
      
      it('RU: Добавь редактирование профиля', () => {
        const result = analyzePromptComplexityDetailed('Добавь редактирование профиля');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('user-profile-management');
      });
      
      it('CN: 编辑个人资料', () => {
        const result = analyzePromptComplexityDetailed('编辑个人资料');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('user-profile-management');
      });
      
      it('JP: プロフィールを編集する機能', () => {
        const result = analyzePromptComplexityDetailed('プロフィールを編集する機能');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('user-profile-management');
      });
    });
    
    // List + Delete = CRUD interface
    describe('crud-interface boost', () => {
      it('EN: Add delete button to the list items', () => {
        const result = analyzePromptComplexityDetailed('Add delete button to the list items');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('crud-interface');
      });
      
      it('RU: Добавь кнопку удаления в список', () => {
        const result = analyzePromptComplexityDetailed('Добавь кнопку удаления в список');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('crud-interface');
      });
      
      it('CN: 在列表中添加删除按钮', () => {
        const result = analyzePromptComplexityDetailed('在列表中添加删除按钮');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('crud-interface');
      });
    });
    
    // Image + Upload = File handling
    describe('file-upload boost', () => {
      it('EN: Allow users to upload profile images', () => {
        const result = analyzePromptComplexityDetailed('Allow users to upload profile images');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('file-upload');
      });
      
      it('RU: Загрузка фото пользователя', () => {
        const result = analyzePromptComplexityDetailed('Загрузка фото пользователя');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('file-upload');
      });
      
      it('CN: 上传用户照片', () => {
        const result = analyzePromptComplexityDetailed('上传用户照片');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('file-upload');
      });
      
      it('JP: 画像をアップロード', () => {
        const result = analyzePromptComplexityDetailed('画像をアップロード');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('file-upload');
      });
    });
    
    // Settings + Save = Persistent config
    describe('persistent-settings boost', () => {
      it('EN: Save application settings', () => {
        const result = analyzePromptComplexityDetailed('Save application settings');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('persistent-settings');
      });
      
      it('RU: Сохранить настройки приложения', () => {
        const result = analyzePromptComplexityDetailed('Сохранить настройки приложения');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('persistent-settings');
      });
      
      it('CN: 保存应用设置', () => {
        const result = analyzePromptComplexityDetailed('保存应用设置');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('persistent-settings');
      });
    });
    
    // Form + Submit = Backend needed (medium boost)
    describe('form-submission boost', () => {
      it('EN: Submit form to server', () => {
        const result = analyzePromptComplexityDetailed('Submit form to server');
        expect(result.complexity).toBe('medium');
        expect(result.contextBoosts).toContain('form-submission');
      });
      
      it('RU: Отправить форму на сервер', () => {
        const result = analyzePromptComplexityDetailed('Отправить форму на сервер');
        expect(result.complexity).toBe('medium');
        expect(result.contextBoosts).toContain('form-submission');
      });
    });
    
    // Multiple pages = Complex routing
    describe('multi-page-app boost', () => {
      it('EN: Create 15 pages for the website', () => {
        const result = analyzePromptComplexityDetailed('Create 15 pages for the website');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('multi-page-app');
      });
      
      it('RU: Сделай несколько страниц', () => {
        const result = analyzePromptComplexityDetailed('Сделай несколько страниц');
        expect(result.complexity).toBe('high');
        expect(result.contextBoosts).toContain('multi-page-app');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MIXED LANGUAGE TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Mixed Languages', () => {
    it('Should handle English technical terms in Russian text', () => {
      const result = analyzePromptComplexityDetailed('Сделай REST API для получения данных');
      expect(result.complexity).toBe('high');
      expect(result.matchedCategories).toContain('api_integrations');
    });

    it('Should handle Stripe in any language context', () => {
      const result = analyzePromptComplexityDetailed('Подключи Stripe для оплаты');
      expect(result.complexity).toBe('high');
      expect(result.matchedCategories).toContain('payments');
    });

    it('Should handle Firebase in Chinese context', () => {
      const result = analyzePromptComplexityDetailed('使用Firebase作为后端数据库');
      expect(result.complexity).toBe('high');
    });
    
    it('Should handle OAuth in Japanese context', () => {
      const result = analyzePromptComplexityDetailed('OAuthでログイン機能を実装');
      expect(result.complexity).toBe('high');
    });
    
    it('Should handle WebSocket in Korean context', () => {
      const result = analyzePromptComplexityDetailed('WebSocket으로 실시간 채팅');
      expect(result.complexity).toBe('high');
    });
    
    it('Should handle GraphQL in German context', () => {
      const result = analyzePromptComplexityDetailed('Erstelle eine GraphQL API');
      expect(result.complexity).toBe('high');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EDGE CASES & IMPLICIT PATTERNS
  // ═══════════════════════════════════════════════════════════════════════════
  
  describe('Edge Cases & Implicit Patterns', () => {
    it('Should detect implicit auth need from "remember me"', () => {
      const result = analyzePromptComplexityDetailed('Add remember me checkbox');
      // "remember me" implies user sessions = auth complexity
      expect(['medium', 'high']).toContain(result.complexity);
    });
    
    it('Should detect complexity from "sync across devices"', () => {
      const result = analyzePromptComplexityDetailed('Sync data across devices');
      // sync = backend/realtime needed
      expect(['medium', 'high']).toContain(result.complexity);
    });
    
    it('Should NOT boost simple visual requests', () => {
      const result = analyzePromptComplexityDetailed('Make the button bigger');
      expect(result.complexity).toBe('low');
      expect(result.contextBoosts.length).toBe(0);
    });
    
    it('Should NOT boost color changes', () => {
      const result = analyzePromptComplexityDetailed('Change text color to red');
      expect(result.complexity).toBe('low');
    });
  });
});
