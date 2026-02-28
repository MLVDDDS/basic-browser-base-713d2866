import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Send, ShoppingCart, User, CreditCard, Heart } from 'lucide-react';

const tmaScreens = [
  { 
    id: 'main', 
    name: 'Главная',
    icon: ShoppingCart,
    content: {
      title: 'Каталог товаров',
      items: ['Товар 1', 'Товар 2', 'Товар 3'],
      button: 'В корзину',
    }
  },
  { 
    id: 'profile', 
    name: 'Профиль',
    icon: User,
    content: {
      title: 'Мой профиль',
      items: ['Заказы: 12', 'Баланс: 500₽', 'Бонусы: 150'],
      button: 'Редактировать',
    }
  },
  { 
    id: 'payment', 
    name: 'Оплата',
    icon: CreditCard,
    content: {
      title: 'Telegram Stars',
      items: ['100 ⭐ = 100₽', '500 ⭐ = 450₽', '1000 ⭐ = 800₽'],
      button: 'Пополнить',
    }
  },
  { 
    id: 'favorites', 
    name: 'Избранное',
    icon: Heart,
    content: {
      title: 'Избранное',
      items: ['Сохранено: 8', 'Новинки: 3', 'Скидки: 2'],
      button: 'Открыть',
    }
  },
];

export const TMASection = () => {
  const [activeScreen, setActiveScreen] = useState('main');
  
  const currentScreen = tmaScreens.find(s => s.id === activeScreen) || tmaScreens[0];
  const ActiveIcon = currentScreen.icon;

  return (
    <section className="section-padding border-t border-border">
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Interactive Mobile frame */}
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[220px] sm:w-[240px] md:w-[260px] h-[440px] sm:h-[480px] md:h-[520px] bg-card rounded-[32px] sm:rounded-[36px] border-4 border-border p-1.5 sm:p-2 shadow-lg">
                {/* Screen */}
                <div className="w-full h-full bg-background rounded-[24px] sm:rounded-[28px] overflow-hidden flex flex-col">
                  {/* Telegram header */}
                  <div className="bg-muted px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 shrink-0">
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-xs sm:text-sm font-medium">Мой бот</span>
                  </div>
                  
                  {/* TMA content */}
                  <div className="flex-1 p-3 sm:p-4 transition-all duration-300">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 mb-3 sm:mb-4 flex items-center justify-center">
                      <ActiveIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    
                    <div className="h-3.5 sm:h-4 w-3/4 bg-muted rounded mb-2 sm:mb-3 flex items-center">
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground px-2 truncate">
                        {currentScreen.content.title}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                      {currentScreen.content.items.map((item, i) => (
                        <div 
                          key={i} 
                          className="h-2.5 sm:h-3 bg-muted/50 rounded flex items-center animate-fade-in"
                          style={{ 
                            width: `${85 - i * 10}%`,
                            animationDelay: `${i * 100}ms` 
                          }}
                        >
                          <span className="text-[8px] sm:text-[9px] text-muted-foreground/70 px-2 truncate">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="h-8 sm:h-10 w-full bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs text-primary-foreground font-medium">
                        {currentScreen.content.button}
                      </span>
                    </div>
                  </div>
                  
                  {/* Bottom navigation */}
                  <div className="shrink-0 border-t border-border px-1.5 sm:px-2 py-1.5 sm:py-2 flex justify-around">
                    {tmaScreens.map((screen) => {
                      const Icon = screen.icon;
                      return (
                        <button
                          key={screen.id}
                          onClick={() => setActiveScreen(screen.id)}
                          className={`flex flex-col items-center gap-0.5 p-1.5 sm:p-2 rounded-lg transition-colors ${
                            activeScreen === screen.id 
                              ? 'text-primary bg-primary/10' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="text-[8px] sm:text-[9px]">{screen.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Glow effect - subtle */}
              <div className="absolute -inset-4 bg-primary/5 rounded-[48px] -z-10 blur-xl" />
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 md:mb-3">Обернуть в Telegram</h2>
            <p className="text-muted-foreground text-base md:text-lg mb-6 md:mb-8 max-w-md">
              Готовый сайт → Mini App за 1 клик. Минимум настроек.
            </p>

            {/* Features */}
            <ul className="space-y-1.5 md:space-y-2 mb-6 md:mb-8 text-xs md:text-sm text-muted-foreground">
              <li>• Запускается внутри Telegram</li>
              <li>• Авторизация через Telegram</li>
              <li>• Оплата через Telegram Stars</li>
            </ul>

            {/* CTA */}
            <Link to="/create?type=tma">
              <Button className="btn-glow gap-2">
                <Send className="w-4 h-4" />
                Собрать Mini App
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
