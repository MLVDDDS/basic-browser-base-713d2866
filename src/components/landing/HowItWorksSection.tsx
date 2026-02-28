import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Globe, Lightbulb, ArrowRight, Wand2, Check } from 'lucide-react';

const steps = [
  {
    icon: Wand2,
    num: '01',
    title: 'Опиши одной фразой',
    description: 'Что хочешь сделать? AI сгенерирует структуру.',
  },
  {
    icon: FileText,
    num: '02',
    title: 'Посмотри превью',
    description: 'Сразу видишь результат. Не устраивает — скажи что поменять.',
  },
  {
    icon: Sparkles,
    num: '03',
    title: 'Добавь эффекты',
    description: 'Градиенты, анимации — включаются в 1 клик.',
  },
  {
    icon: Globe,
    num: '04',
    title: 'Опубликуй',
    description: 'Ссылка готова за 10 секунд.',
  },
];

const demoSuggestions = [
  { id: '1', text: 'Добавить секцию отзывов', applied: false },
  { id: '2', text: 'Улучшить Hero с анимацией', applied: false },
  { id: '3', text: 'Добавить форму связи', applied: false },
];

export const HowItWorksSection = () => {
  const [suggestions, setSuggestions] = useState(demoSuggestions);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const handleApply = (id: string) => {
    setApplyingId(id);
    setTimeout(() => {
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, applied: true } : s));
      setApplyingId(null);
    }, 800);
  };

  const handleReset = () => {
    setSuggestions(demoSuggestions);
  };

  const allApplied = suggestions.every(s => s.applied);

  return (
    <section className="section-padding border-t border-border">
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left - Steps */}
          <div>
            {/* Header */}
            <div className="mb-8 md:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 md:mb-3">Сайт за вечер</h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-md">
                Четыре шага от идеи до готового проекта
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
              {steps.map((step, i) => (
                <div key={step.num} className="group flex gap-3 md:gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
                      <step.icon className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px h-full min-h-[20px] md:min-h-[24px] bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-4 md:pb-6">
                    <div className="flex items-center gap-2 md:gap-3 mb-1">
                      <span className="text-[10px] md:text-xs text-muted-foreground/50">{step.num}</span>
                      <h3 className="text-sm md:text-base font-medium font-sans">{step.title}</h3>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link to="/create">
              <Button className="btn-glow">Создать сайт</Button>
            </Link>
          </div>

          {/* Right - Interactive AI Demo */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Window header */}
              <div className="border-b border-border px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground">AI-подсказки</span>
                </div>
              </div>

              <div className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Рекомендации</div>
                    <div className="text-xs text-muted-foreground">
                      AI проанализировал твой проект
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="space-y-2 mb-5">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => !suggestion.applied && handleApply(suggestion.id)}
                      disabled={suggestion.applied}
                      className={`
                        w-full group flex items-center gap-3 px-3 py-3 rounded-lg border transition-all text-left
                        ${suggestion.applied 
                          ? 'border-primary/30 bg-primary/5 cursor-default' 
                          : 'border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                        }
                        ${applyingId === suggestion.id ? 'scale-[1.02] border-primary bg-primary/10' : ''}
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                        ${suggestion.applied 
                          ? 'bg-primary text-primary-foreground' 
                          : applyingId === suggestion.id
                            ? 'bg-primary/20 text-primary animate-pulse'
                            : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                        }
                      `}>
                        {suggestion.applied ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : applyingId === suggestion.id ? (
                          <Wand2 className="w-3.5 h-3.5 animate-pulse" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className={`text-sm flex-1 ${suggestion.applied ? 'text-muted-foreground line-through' : ''}`}>
                        {suggestion.text}
                      </span>
                      {!suggestion.applied && applyingId !== suggestion.id && (
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      {applyingId === suggestion.id && (
                        <span className="text-xs text-primary animate-pulse">Применяю...</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Reset or completion */}
                {allApplied ? (
                  <div className="text-center py-3 rounded-lg bg-primary/10 border border-primary/20">
                    <Check className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-primary mb-2">Все рекомендации применены!</p>
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
                      Показать снова
                    </Button>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground text-center">
                    Нажми на подсказку — AI применит изменения автоматически
                  </p>
                )}
              </div>
            </div>

            {/* Feature highlight */}
            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium mb-1">Умные подсказки</div>
                  <p className="text-xs text-muted-foreground">
                    AI анализирует структуру, контент и дизайн твоего проекта и предлагает конкретные улучшения. Один клик — изменение применено.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
