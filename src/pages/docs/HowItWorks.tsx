import { DocsLayout } from '@/components/docs/DocsLayout';
import { 
  LayoutTemplate, 
  MessageSquareText, 
  Wand2, 
  Pencil, 
  Globe, 
  Sparkles, 
  Smartphone, 
  MessageCircle, 
  Rocket,
  ArrowRight 
} from 'lucide-react';

const steps = [
  {
    icon: LayoutTemplate,
    num: '01',
    title: 'Выбери тип проекта',
    description: 'Сайт или Telegram Mini App — реши, что хочешь создать. Каждый формат оптимизирован под свои задачи.',
  },
  {
    icon: MessageSquareText,
    num: '02',
    title: 'Опиши свою идею',
    description: 'Напиши промпт — расскажи AI, каким должен быть твой проект. Чем подробнее, тем точнее результат.',
  },
  {
    icon: Wand2,
    num: '03',
    title: 'AI генерирует проект',
    description: 'Искусственный интеллект создаёт уникальный дизайн и структуру за считанные минуты.',
  },
  {
    icon: Pencil,
    num: '04',
    title: 'Доработай при необходимости',
    description: 'Добавь детали через диалог с AI или отредактируй вручную — полный контроль в твоих руках.',
  },
  {
    icon: Globe,
    num: '05',
    title: 'Опубликуй',
    description: 'Один клик — и твой проект доступен всему миру по уникальной ссылке.',
  },
];

const highlights = [
  {
    icon: Sparkles,
    title: 'AI-генерация',
    description: 'Уникальный дизайн и структура, созданные искусственным интеллектом специально под твою идею. Никаких шаблонов.',
  },
  {
    icon: Sparkles,
    title: 'Визуальные эффекты',
    description: 'Современные анимации, градиенты, тени и интерактивные элементы премиум-качества.',
  },
  {
    icon: MessageCircle,
    title: 'Диалог с AI',
    description: 'Дорабатывай проект через общение — AI понимает твои пожелания и вносит изменения.',
  },
  {
    icon: Smartphone,
    title: 'Telegram Mini Apps',
    description: 'Создавай приложения для Telegram — идеально для ботов, магазинов и сервисов с оплатой через Stars.',
  },
  {
    icon: Rocket,
    title: 'Мгновенная публикация',
    description: 'Один клик — и проект в сети. Без хостинга, без настроек, без головной боли.',
  },
];

const HowItWorks = () => {
  return (
    <DocsLayout
      title="Как это работает"
      description="Пошаговый процесс создания проекта в ЛЮБАКОДЪ"
    >
      {/* Steps */}
      <section className="mb-12">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.num}
              className="group flex items-start gap-4 p-5 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground/50">{step.num}</span>
                  <h3 className="font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Что ты получаешь</h2>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {highlights.map((item) => (
            <div key={item.title} className="group p-5 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
        <h2 className="text-lg font-semibold mb-2">Готов начать?</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Опиши свою идею — AI создаст уникальный проект
        </p>
        <a 
          href="/create" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Создать проект
          <ArrowRight className="w-4 h-4" />
        </a>
      </section>
    </DocsLayout>
  );
};

export default HowItWorks;
