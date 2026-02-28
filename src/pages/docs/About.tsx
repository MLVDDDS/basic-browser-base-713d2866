import { DocsLayout } from '@/components/docs/DocsLayout';
import { Sparkles, Target, Users, Zap, Fingerprint, Timer, CircleDot, Lightbulb, Wand2, Smartphone, Globe, Eye, Ban } from 'lucide-react';

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
          <div className="group p-5 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Fingerprint className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Уникальность</h3>
                <p className="text-sm text-muted-foreground">
                  Каждый проект генерируется с нуля под твою идею. Никаких клонов и однотипных решений.
                </p>
              </div>
            </div>
          </div>
          
          <div className="group p-5 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Timer className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Скорость</h3>
                <p className="text-sm text-muted-foreground">
                  От промпта до готового продукта за минуты. AI делает всю тяжёлую работу.
                </p>
              </div>
            </div>
          </div>
          
          <div className="group p-5 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <CircleDot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Простота</h3>
                <p className="text-sm text-muted-foreground">
                  Опиши идею словами — получи готовый результат. Без сложных интерфейсов и настроек.
                </p>
              </div>
            </div>
          </div>
          
          <div className="group p-5 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Инновации</h3>
                <p className="text-sm text-muted-foreground">
                  Современный стек технологий и AI-генерация. Всегда на передовой.
                </p>
              </div>
            </div>
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
        <div className="space-y-3">
          {[
            { icon: Wand2, text: 'AI-генерация уникального дизайна по твоему промпту' },
            { icon: Smartphone, text: 'Сайты и Telegram Mini Apps в одной платформе' },
            { icon: Globe, text: 'Мгновенная публикация в один клик' },
            { icon: Sparkles, text: 'Современные визуальные эффекты и анимации' },
            { icon: Ban, text: 'Никаких шаблонов — только твоё уникальное видение' },
          ].map((item, i) => (
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
