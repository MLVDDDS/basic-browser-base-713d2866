import { DocsLayout } from '@/components/docs/DocsLayout';
import { Sparkles, Target, Users, Zap } from 'lucide-react';

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

      {/* Values */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Наши ценности
        </h2>
        
        <div className="grid gap-4">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">◈ Уникальность</h3>
            <p className="text-sm text-muted-foreground">
              Каждый проект генерируется с нуля под твою идею. Никаких клонов и однотипных решений.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">⌁ Скорость</h3>
            <p className="text-sm text-muted-foreground">
              От промпта до готового продукта за минуты. AI делает всю тяжёлую работу.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">◎ Простота</h3>
            <p className="text-sm text-muted-foreground">
              Опиши идею словами — получи готовый результат. Без сложных интерфейсов и настроек.
            </p>
          </div>
          
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <h3 className="font-medium mb-2">△ Инновации</h3>
            <p className="text-sm text-muted-foreground">
              Современный стек технологий и AI-генерация. Всегда на передовой.
            </p>
          </div>
        </div>
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
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">⬡</span>
            AI-генерация уникального дизайна по твоему промпту
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">⬡</span>
            Сайты и Telegram Mini Apps в одной платформе
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">⬡</span>
            Мгновенная публикация в один клик
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">⬡</span>
            Современные визуальные эффекты и анимации
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">⬡</span>
            Никаких шаблонов — только твоё уникальное видение
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
};

export default About;