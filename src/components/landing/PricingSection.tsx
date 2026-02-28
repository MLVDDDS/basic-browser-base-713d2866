import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check, Rocket, Hammer, Building2, Zap } from 'lucide-react';

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
      'Свой домен',
      'Приватные проекты',
      'Экспорт кода + GitHub',
      'Расширенная AI-модель',
      'Приоритетная поддержка',
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
    ],
    cta: 'Выбрать Архитектор',
    icon: Building2,
  },
];

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (plan: Plan) => {
    return isYearly ? plan.priceYearly : plan.priceMonthly;
  };

  const getSavings = (plan: Plan) => {
    if (plan.priceMonthly === 0) return 0;
    return Math.round((1 - plan.priceYearly / plan.priceMonthly) * 100);
  };

  return (
    <section className="section-padding border-t border-border">
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 md:mb-3">Тарифы</h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Начни бесплатно, масштабируй по мере роста
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 md:mb-12">
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
            <span className="badge-primary animate-fade-in text-xs">
              −20%
            </span>
          )}
        </div>

        {/* Plans */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const savings = getSavings(plan);

            return (
              <div 
                key={plan.id}
                className={`
                  rounded-xl border p-4 md:p-6 cursor-pointer
                  transition-all duration-300 ease-out
                  ${plan.popular ? 'border-primary bg-primary/5' : 'border-border bg-card'}
                  hover:border-primary/50 hover:shadow-lg hover:-translate-y-1
                `}
              >
                {/* Badges row */}
                <div className="flex items-center gap-2 mb-3 md:mb-4 min-h-[24px]">
                  {plan.popular && (
                    <span className="badge-primary flex items-center gap-1 text-[10px] md:text-xs">
                      <Zap className="w-3 h-3" />
                      Популярный
                    </span>
                  )}
                  {isYearly && savings > 0 && (
                    <span className="bg-green-500/20 text-green-400 text-[10px] md:text-xs px-2 py-1 rounded-full font-medium animate-fade-in">
                      −{savings}%
                    </span>
                  )}
                </div>

                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className={`
                    w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center
                    ${plan.popular ? 'bg-primary/20' : 'bg-muted'}
                    transition-colors duration-300
                  `}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-medium font-sans">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-baseline gap-1">
                    <span 
                      key={`${plan.id}-${isYearly}`}
                      className="text-2xl md:text-3xl font-bold animate-fade-in"
                    >
                      {getPrice(plan).toLocaleString()}
                    </span>
                    <span className="text-base md:text-lg text-muted-foreground">₽</span>
                  </div>
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {plan.priceMonthly === 0 ? 'навсегда' : isYearly ? '/ мес при оплате за год' : '/ месяц'}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-2 md:space-y-2.5 mb-5 md:mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs md:text-sm">
                      <Check className="w-3.5 h-3.5 md:w-4 md:h-4 mt-0.5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to={plan.id === 'team' ? '/contact' : '/signup'}>
                  <Button 
                    variant={plan.popular ? 'default' : 'outline'} 
                    className={`w-full ${plan.popular ? 'btn-glow' : ''}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
