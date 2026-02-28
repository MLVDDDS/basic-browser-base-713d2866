import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Users, HelpCircle, Rocket, Hammer, Building2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { PageTitle } from '@/components/ui/PageTitle';

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  icon: React.ElementType;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Новичок',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Попробуй возможности AI-платформы',
    features: [
      '50 рубов / мес',
      'AI-генерация сайтов и TMA',
      'Поддомен lyubakod.app',
      'Публичные проекты',
      'Базовая поддержка',
    ],
    cta: 'Начать бесплатно',
    icon: Rocket,
  },
  {
    id: 'pro',
    name: 'Строитель',
    priceMonthly: 990,
    priceYearly: 790,
    description: 'Для тех, кто строит на полную',
    features: [
      '500 рубов / мес',
      'Докупка рубов в любой момент',
      'Свой домен',
      'Приватные проекты',
      'Экспорт кода + GitHub',
      'Telegram Mini App',
      'Приоритетная поддержка',
      'Расширенная AI-модель',
    ],
    cta: 'Выбрать Строитель',
    popular: true,
    icon: Hammer,
  },
  {
    id: 'team',
    name: 'Архитектор',
    priceMonthly: 2490,
    priceYearly: 1990,
    description: 'Максимум возможностей и ресурсов',
    features: [
      '2 000 рубов / мес',
      'Всё из Строителя',
      'До 5 участников',
      'Совместная работа',
      'API-доступ',
      'White-label',
      'SLA 99.9%',
      'Персональный менеджер',
    ],
    cta: 'Выбрать Архитектор',
    icon: Building2,
  },
];

const faqs = [
  { q: 'Можно ли сменить тариф?', a: 'Да, вы можете перейти на другой тариф в любой момент. При апгрейде разница будет рассчитана пропорционально.' },
  { q: 'Есть ли пробный период?', a: 'Бесплатный тариф доступен без ограничений по времени. Для Pro есть 14-дневный trial.' },
  { q: 'Как работает оплата?', a: 'Принимаем карты РФ, СБП и криптовалюту. Счёт для юрлиц по запросу.' },
  { q: 'Что будет с проектами при отмене?', a: 'Проекты остаются доступными, но переходят на лимиты бесплатного тарифа.' },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelectPlan = (planId: string) => {
    setIsAnimating(true);
    setSelectedPlan(planId);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const getPrice = (plan: Plan) => {
    return isYearly ? plan.priceYearly : plan.priceMonthly;
  };

  const getSavings = (plan: Plan) => {
    if (plan.priceMonthly === 0) return 0;
    return Math.round((1 - plan.priceYearly / plan.priceMonthly) * 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container-main">
          {/* Header */}
          <PageTitle 
            description="Начни бесплатно, масштабируй по мере роста" 
            centered 
            className="mb-12"
          >
            Тарифы
          </PageTitle>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm transition-colors ${!isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Месяц
            </span>
            <Switch 
              checked={isYearly} 
              onCheckedChange={setIsYearly}
            />
            <span className={`text-sm transition-colors ${isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Год
            </span>
            {isYearly && (
              <span className="badge-primary animate-fade-in">
                −20%
              </span>
            )}
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              const savings = getSavings(plan);

              return (
                <div 
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`
                    rounded-xl border p-6 cursor-pointer
                    transition-all duration-300 ease-out
                    ${plan.popular ? 'border-primary bg-primary/5' : 'border-border bg-card'}
                    ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]' : ''}
                    ${isSelected && isAnimating ? 'animate-pulse' : ''}
                    hover:border-primary/50 hover:shadow-lg
                  `}
                >
                  {/* Badges row - inside card */}
                  <div className="flex items-center gap-2 mb-4 min-h-[24px]">
                    {plan.popular && (
                      <span className="badge-primary flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Популярный
                      </span>
                    )}
                    {isYearly && savings > 0 && (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                        −{savings}%
                      </span>
                    )}
                  </div>

                  {/* Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${plan.popular ? 'bg-primary/20' : 'bg-muted'}
                      ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                      transition-colors duration-300
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span 
                        key={`${plan.id}-${isYearly}`}
                        className="text-4xl font-bold animate-fade-in"
                      >
                        {getPrice(plan).toLocaleString()}
                      </span>
                      <span className="text-lg text-muted-foreground">₽</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {plan.priceMonthly === 0 ? 'навсегда' : isYearly ? '/ мес при оплате за год' : '/ месяц'}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature, i) => (
                      <li 
                        key={feature} 
                        className="flex items-start gap-2 text-sm"
                        style={{ 
                          animationDelay: isSelected ? `${i * 50}ms` : '0ms',
                        }}
                      >
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-colors ${
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button 
                    variant={plan.popular ? 'default' : 'outline'} 
                    className={`w-full transition-all duration-300 ${
                      plan.popular ? 'btn-glow' : ''
                    } ${isSelected ? 'scale-105' : ''}`}
                    asChild
                  >
                    <Link to={plan.id === 'team' ? '/contact' : '/signup'}>
                      {isSelected && isAnimating ? (
                        <span className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Выбрано!
                        </span>
                      ) : (
                        plan.cta
                      )}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Comparison note */}
          <div className="text-center mb-20">
            <p className="text-sm text-muted-foreground">
              Все тарифы включают SSL, CDN и 99.9% uptime. Без скрытых платежей.
            </p>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-medium text-center mb-8">Частые вопросы</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="card-base p-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium mb-1">{faq.q}</h4>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
