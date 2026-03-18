import { DocsLayout } from '@/components/docs/DocsLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
    title: 'Выбери тип проекта',
    description: 'Сайт или Telegram Mini App — реши, что хочешь создать. Каждый формат оптимизирован под свои задачи.',
  },
  {
    icon: MessageSquareText,
    title: 'Опиши свою идею',
    description: 'Напиши промпт — расскажи AI, каким должен быть твой проект. Чем подробнее, тем точнее результат.',
  },
  {
    icon: Wand2,
    title: 'AI генерирует проект',
    description: 'Искусственный интеллект создаёт уникальный дизайн и структуру за считанные минуты.',
  },
  {
    icon: Pencil,
    title: 'Доработай при необходимости',
    description: 'Добавь детали через диалог с AI или отредактируй вручную — полный контроль в твоих руках.',
  },
  {
    icon: Globe,
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
      {/* Steps - accordion */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold">Шаги</h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {steps.map((step, index) => (
            <AccordionItem 
              key={index} 
              value={`step-${index}`}
              className="border border-border rounded-lg mb-2 px-4 bg-card/50 hover:bg-card transition-colors"
            >
              <AccordionTrigger className="text-left hover:no-underline py-3 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <step.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground/50 mr-1">0{index + 1}</span>
                  {step.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-xs pb-3">
                {step.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Highlights - accordion */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold">Что ты получаешь</h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {highlights.map((item, index) => (
            <AccordionItem 
              key={index} 
              value={`highlight-${index}`}
              className="border border-border rounded-lg mb-2 px-4 bg-card/50 hover:bg-card transition-colors"
            >
              <AccordionTrigger className="text-left hover:no-underline py-3 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <item.icon className="w-4 h-4 text-primary" />
                  {item.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-xs pb-3">
                {item.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
