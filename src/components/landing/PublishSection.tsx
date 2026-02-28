import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, ExternalLink, Upload, Globe, Shield, Copy, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type PublishStage = 'idle' | 'uploading' | 'building' | 'deploying' | 'done';

const stages: { id: PublishStage; label: string; icon: React.ElementType }[] = [
  { id: 'uploading', label: 'Загрузка файлов...', icon: Upload },
  { id: 'building', label: 'Сборка проекта...', icon: Globe },
  { id: 'deploying', label: 'Публикация...', icon: Shield },
  { id: 'done', label: 'Готово!', icon: Check },
];

export const PublishSection = () => {
  const [stage, setStage] = useState<PublishStage>('idle');
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const startPublishing = () => {
    setStage('uploading');
    setProgress(0);
  };

  const resetDemo = () => {
    setStage('idle');
    setProgress(0);
    setCopied(false);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (stage === 'idle' || stage === 'done') return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5;
        
        if (newProgress >= 100) {
          // Move to next stage
          if (stage === 'uploading') {
            setStage('building');
            return 0;
          } else if (stage === 'building') {
            setStage('deploying');
            return 0;
          } else if (stage === 'deploying') {
            setStage('done');
            return 100;
          }
        }
        
        return Math.min(newProgress, 95);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [stage]);

  const currentStageIndex = stages.findIndex(s => s.id === stage);
  const CurrentIcon = stages.find(s => s.id === stage)?.icon || Upload;

  return (
    <section className="section-padding border-t border-border">
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 md:mb-3">Опубликовать за 10 секунд</h2>
            <p className="text-muted-foreground text-base md:text-lg mb-6 md:mb-8 max-w-md">
              Нажми кнопку — получи ссылку. Никаких хостингов и настроек.
            </p>

            {/* Benefits */}
            <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              {[
                'Мгновенная публикация',
                'Бесплатный поддомен lyubakod.app',
                'SSL-сертификат включён',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link to="/create">
              <Button className="btn-glow">Создать и опубликовать</Button>
            </Link>
          </div>

          {/* Interactive Preview */}
          <div className="lg:pl-4 xl:pl-8">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Window header */}
              <div className="border-b border-border px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-muted-foreground/30" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-muted-foreground/30" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Публикация проекта</span>
                </div>
              </div>

              <div className="p-4 sm:p-5 md:p-6">
                {/* Idle state */}
                {stage === 'idle' && (
                  <div className="text-center py-6 md:py-8">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                      <Upload className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
                      Нажми кнопку, чтобы увидеть процесс публикации
                    </p>
                    <Button onClick={startPublishing} className="gap-2">
                      <Globe className="w-4 h-4" />
                      Опубликовать
                    </Button>
                  </div>
                )}

                {/* Publishing stages */}
                {stage !== 'idle' && stage !== 'done' && (
                  <div className="py-3 md:py-4">
                    {/* Stage indicators */}
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      {stages.slice(0, 3).map((s, i) => {
                        const Icon = s.icon;
                        const isActive = s.id === stage;
                        const isComplete = currentStageIndex > i;
                        
                        return (
                          <div key={s.id} className="flex items-center">
                            <div className={`
                              w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all
                              ${isComplete ? 'bg-primary text-primary-foreground' : ''}
                              ${isActive ? 'bg-primary/20 text-primary animate-pulse' : ''}
                              ${!isActive && !isComplete ? 'bg-muted text-muted-foreground' : ''}
                            `}>
                              {isComplete ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Icon className="w-4 h-4 md:w-5 md:h-5" />}
                            </div>
                            {i < 2 && (
                              <div className={`w-8 sm:w-12 md:w-16 lg:w-12 xl:w-20 h-0.5 mx-1.5 sm:mx-2 ${isComplete ? 'bg-primary' : 'bg-muted'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Current stage info */}
                    <div className="text-center mb-3 md:mb-4">
                      <CurrentIcon className="w-5 h-5 md:w-6 md:h-6 text-primary mx-auto mb-2 animate-pulse" />
                      <p className="text-xs md:text-sm font-medium">{stages.find(s => s.id === stage)?.label}</p>
                    </div>

                    {/* Progress bar */}
                    <Progress value={progress} className="h-1.5 md:h-2" />
                    <p className="text-[10px] md:text-xs text-muted-foreground text-center mt-2">
                      {Math.round(progress)}%
                    </p>
                  </div>
                )}

                {/* Done state */}
                {stage === 'done' && (
                  <div className="py-3 md:py-4 animate-fade-in">
                    {/* Success icon */}
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/20 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                      <Check className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>

                    <p className="text-center text-xs md:text-sm font-medium mb-3 md:mb-4">Твой проект опубликован!</p>

                    {/* URL */}
                    <div className="flex items-center gap-2 p-2.5 md:p-3 rounded-lg bg-muted mb-3 md:mb-4">
                      <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs md:text-sm truncate flex-1">lyubakod.app/p/moy-proekt</span>
                      <button 
                        onClick={handleCopy}
                        className="p-1 md:p-1.5 hover:bg-background rounded transition-colors flex-shrink-0"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
                      <div className="text-center p-1.5 md:p-2 rounded bg-muted/50">
                        <div className="text-sm md:text-lg font-bold text-primary">2.3s</div>
                        <div className="text-[9px] md:text-[10px] text-muted-foreground">Сборка</div>
                      </div>
                      <div className="text-center p-1.5 md:p-2 rounded bg-muted/50">
                        <div className="text-sm md:text-lg font-bold text-primary">48KB</div>
                        <div className="text-[9px] md:text-[10px] text-muted-foreground">Размер</div>
                      </div>
                      <div className="text-center p-1.5 md:p-2 rounded bg-muted/50">
                        <div className="text-sm md:text-lg font-bold text-primary">A+</div>
                        <div className="text-[9px] md:text-[10px] text-muted-foreground">SSL</div>
                      </div>
                    </div>

                    {/* Reset button */}
                    <Button variant="outline" size="sm" onClick={resetDemo} className="w-full gap-2">
                      <RotateCcw className="w-3 h-3" />
                      Повторить демо
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
