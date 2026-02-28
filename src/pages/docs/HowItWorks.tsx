import { DocsLayout } from '@/components/docs/DocsLayout';
import { ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Выбери тип проекта',
      description: 'Сайт или Telegram Mini App — реши, что хочешь создать',
    },
    {
      number: '02',
      title: 'Опиши свою идею',
      description: 'Напиши промпт — расскажи AI, каким должен быть твой проект',
    },
    {
      number: '03',
      title: 'AI генерирует проект',
      description: 'Искусственный интеллект создаёт уникальный дизайн и структуру',
    },
    {
      number: '04',
      title: 'Доработай при необходимости',
      description: 'Добавь детали через диалог с AI или вручную',
    },
    {
      number: '05',
      title: 'Опубликуй',
      description: 'Один клик — и твой проект доступен всему миру',
    },
  ];

  return (
    <DocsLayout
      title="Как это работает"
      description="Пошаговый процесс создания проекта в ЛЮБАКОДЪ"
    >
      {/* Steps */}
      <section className="mb-12">
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className="flex gap-4 p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">{step.number}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground self-center hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Что ты получаешь</h2>
        
        <div className="grid gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">◈ AI-генерация</h3>
            <p className="text-sm text-muted-foreground">
              Уникальный дизайн и структура, созданные искусственным интеллектом 
              специально под твою идею. Никаких шаблонов.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">⬡ Визуальные эффекты</h3>
            <p className="text-sm text-muted-foreground">
              Современные анимации, градиенты, тени и интерактивные элементы 
              премиум-качества.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">◎ Диалог с AI</h3>
            <p className="text-sm text-muted-foreground">
              Дорабатывай проект через общение — AI понимает твои пожелания 
              и вносит изменения.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">⌁ Telegram Mini Apps</h3>
            <p className="text-sm text-muted-foreground">
              Создавай приложения для Telegram — идеально для ботов, 
              магазинов и сервисов с оплатой через Stars.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">△ Мгновенная публикация</h3>
            <p className="text-sm text-muted-foreground">
              Один клик — и проект в сети. Без хостинга, без настроек, 
              без головной боли.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="p-6 rounded-lg border border-primary/30 bg-primary/5 text-center">
        <h2 className="text-lg font-semibold mb-2">Готов начать?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Опиши свою идею — AI создаст уникальный проект
        </p>
        <a 
          href="/create" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Создать проект
          <ArrowRight className="w-4 h-4" />
        </a>
      </section>
    </DocsLayout>
  );
};

export default HowItWorks;