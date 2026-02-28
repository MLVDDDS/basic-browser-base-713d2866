import { DocsLayout } from '@/components/docs/DocsLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Sparkles, Target, Users, Zap, Fingerprint, Timer, CircleDot, Lightbulb, Wand2, Smartphone, Globe, Ban } from 'lucide-react';

const values = [
  {
    icon: Fingerprint,
    title: 'Уникальность',
    description: 'Каждый проект генерируется с нуля под твою идею. Никаких клонов и однотипных решений.',
  },
  {
    icon: Timer,
    title: 'Скорость',
    description: 'От промпта до готового продукта за минуты. AI делает всю тяжёлую работу.',
  },
  {
    icon: CircleDot,
    title: 'Простота',
    description: 'Опиши идею словами — получи готовый результат. Без сложных интерфейсов и настроек.',
  },
  {
    icon: Lightbulb,
    title: 'Инновации',
    description: 'Современный стек технологий и AI-генерация. Всегда на передовой.',
  },
];

const whyUs = [
  { icon: Wand2, text: 'AI-генерация уникального дизайна по твоему промпту' },
  { icon: Smartphone, text: 'Сайты и Telegram Mini Apps в одной платформе' },
  { icon: Globe, text: 'Мгновенная публикация в один клик' },
  { icon: Sparkles, text: 'Современные визуальные эффекты и анимации' },
  { icon: Ban, text: 'Никаких шаблонов — только твоё уникальное видение' },
];

const About = () => {
  return (
    <DocsLayout
      title="О нас"
      description="Познакомьтесь с командой и миссией ЛЮБАКОДЪ"
      lastUpdated="15 января 2026"
    >
      {/* Mission */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Наша миссия
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          ЛЮБАКОДЪ — AI-платформа для создания сайтов и Telegram Mini Apps. 
          Мы верим, что у каждого должна быть возможность воплотить свою идею в интернете — 
          без кода, без дизайнерского опыта, без ограничений шаблонами.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Просто опиши, что хочешь создать — искусственный интеллект сгенерирует 
          уникальный проект под твоё видение. Никаких готовых шаблонов. Только твоя идея.
        </p>
      </section>

      {/* Values - accordion format like FAQ */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold">Наши ценности</h2>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {values.map((value, index) => (
            <AccordionItem 
              key={index} 
              value={`value-${index}`}
              className="border border-border rounded-lg mb-2 px-4 bg-card/50 hover:bg-card transition-colors"
            >
              <AccordionTrigger className="text-left hover:no-underline py-3 text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <value.icon className="w-4 h-4 text-primary" />
                  {value.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-xs pb-3">
                {value.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Team */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Команда
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Мы — команда разработчиков и дизайнеров, влюблённых в AI и продуктовый дизайн. 
          Каждый день работаем над тем, чтобы ЛЮБАКОДЪ становился умнее и создавал 
          всё более впечатляющие проекты.
        </p>
      </section>

      {/* Why us */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Почему ЛЮБАКОДЪ?
        </h2>
        <div className="space-y-2">
          {whyUs.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
              <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </section>
    </DocsLayout>
  );
};

export default About;
