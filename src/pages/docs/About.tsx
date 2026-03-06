import { DocsLayout } from '@/components/docs/DocsLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Sparkles, Target, Users, Zap, Fingerprint, Timer, CircleDot, Lightbulb, 
  Wand2, Smartphone, Globe, Ban, Code2, Brain, Blocks, Rocket, 
  Instagram, ExternalLink, Layers, Server, Cpu
} from 'lucide-react';

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

const teamMembers = [
  {
    name: 'Mlad',
    role: 'Co-Founder & AI Engineer',
    experience: 'AI/ML инженер и блокчейн-разработчик. Опыт в создании AI-powered продуктов, проектировании нейросетевых пайплайнов и разработке децентрализованных приложений.',
    instagram: 'https://www.instagram.com/__mlad__',
  },
  {
    name: 'Max Biiruza',
    role: 'Co-Founder & Full-Stack Developer',
    experience: 'Full-stack разработчик с экспертизой в AI-интеграциях и блокчейн-технологиях. Специализация на построении масштабируемых веб-платформ и Telegram Mini Apps.',
    instagram: 'https://www.instagram.com/max.biiruza',
  },
];

const techStack = [
  { icon: Brain, name: 'AI/ML Pipeline', desc: 'Генерация кода и дизайна через LLM' },
  { icon: Code2, name: 'React + TypeScript', desc: 'Современный фронтенд-стек' },
  { icon: Layers, name: 'Telegram Mini Apps SDK', desc: 'Нативная интеграция с Telegram' },
  { icon: Server, name: 'Cloud Infrastructure', desc: 'Автоматический деплой и хостинг' },
  { icon: Cpu, name: 'AI Orchestrator', desc: 'Многошаговый агент для сложных задач' },
  { icon: Blocks, name: 'Modular Architecture', desc: 'Компонентная система и дизайн-токены' },
];

const About = () => {
  return (
    <DocsLayout
      title="О нас"
      description="Познакомьтесь с командой и миссией ЛЮБАКОДЪ"
      lastUpdated="6 марта 2026"
    >
      {/* Business Description */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Что такое ЛЮБАКОДЪ
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">ЛЮБАКОДЪ</strong> — AI-платформа для автоматической генерации веб-сайтов 
          и Telegram Mini Apps. Пользователь описывает свою идею на естественном языке, а наш AI-агент 
          создаёт полноценный, уникальный цифровой продукт: от дизайна и кода до деплоя и публикации.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Мы решаем ключевую проблему: <strong className="text-foreground">создание цифровых продуктов 
          остаётся дорогим и сложным процессом</strong>, недоступным для большинства предпринимателей, 
          малых бизнесов и креативных специалистов. Традиционные конструкторы ограничены шаблонами, 
          а заказная разработка требует значительных бюджетов и времени.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          ЛЮБАКОДЪ устраняет этот барьер: наш AI генерирует каждый проект с нуля — уникальный дизайн, 
          адаптивная вёрстка, анимации и интерактивные элементы — без необходимости писать код или 
          иметь навыки дизайна.
        </p>
      </section>

      {/* Target Audience */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Целевая аудитория
        </h2>
        <div className="space-y-2">
          {[
            { label: 'Предприниматели и стартапы', desc: 'Быстрый запуск MVP и лендингов без найма разработчиков' },
            { label: 'Малый и средний бизнес', desc: 'Создание веб-присутствия и Telegram Mini Apps для клиентов' },
            { label: 'Фрилансеры и креативные специалисты', desc: 'Портфолио, персональные сайты, промо-страницы' },
            { label: 'Telegram-сообщества', desc: 'Интерактивные Mini Apps для каналов и ботов' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg border border-border bg-card/50">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          Продукт и стадия разработки
        </h2>
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">MVP</span>
            <span className="text-sm font-medium text-foreground">Early Access</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Платформа находится на стадии MVP с рабочим ядром. Активно тестируется с ранними пользователями.
          </p>
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          ЛЮБАКОДЪ — это cloud-based SaaS платформа, которая предоставляет:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            'AI-генератор сайтов по текстовому описанию (промпт → готовый сайт)',
            'AI-генератор Telegram Mini Apps с нативным SDK',
            'Визуальный билдер для доработки сгенерированных проектов через чат с AI',
            'Систему мгновенной публикации с кастомными доменами',
            'AI-оркестратор для многошаговой генерации сложных проектов',
            'Автоматический деплой и хостинг',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          Технологический стек
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {techStack.map((tech, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50">
              <tech.icon className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-foreground">{tech.name}</span>
                <p className="text-xs text-muted-foreground">{tech.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Команда
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          ЛЮБАКОДЪ основан двумя инженерами с опытом в AI, блокчейне и full-stack разработке. 
          Мы bootstrapped — развиваем проект на собственные средства.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teamMembers.map((member, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">{member.name}</h3>
                <a 
                  href={member.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                {member.role}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{member.experience}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
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
