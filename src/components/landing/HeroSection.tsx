import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Send, Globe, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BuilderDemo } from './BuilderDemo';

const heroOptions = [
  { text: 'сайт', icon: Globe },
  { text: 'Telegram Mini App', icon: Send },
];

// Sound wave bars for voice effect
const VoiceWave = () => (
  <div className="flex items-center gap-[3px] h-5">
    {[0, 1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        className="w-[3px] bg-primary rounded-full"
        animate={{
          height: ['8px', '16px', '8px'],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.1,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

export const HeroSection = () => {
  const [heroIndex, setHeroIndex] = useState(0);

  // Cycle hero text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroOptions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-20 pb-16 md:pt-28 md:pb-24 lg:pt-32 lg:pb-28">
      <div className="container-main">
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-10 xl:gap-12 items-center">
          {/* Left column - Content */}
          <div className="stagger max-w-xl">
            <div className="mb-4 md:mb-6">
              {/* Voice input indicator */}
              <div className="flex items-center gap-3 mb-3">
                <motion.div 
                  className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 hsl(var(--primary) / 0.4)',
                      '0 0 20px 8px hsl(var(--primary) / 0.2)',
                      '0 0 0 0 hsl(var(--primary) / 0)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </motion.div>
                <VoiceWave />
              </div>
              
              <span className="iridescent-text block pt-2 text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-wide" style={{ fontFamily: "'Kramola', 'Prata', serif", letterSpacing: '0.08em' }}>
                Любакодъ,
              </span>
              <h1 className="leading-tight font-sans font-semibold mt-2 text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl">
                <span className="text-foreground">сделай мне </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={heroIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="inline-block text-primary"
                  >
                    {heroOptions[heroIndex].text}
                  </motion.span>
                </AnimatePresence>
              </h1>
            </div>
            
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-lg">
              Опиши идею → получи готовый продукт. Без шаблонов. Только твоё видение.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 md:mb-8">
              <Link to="/create?type=website" className="w-full sm:w-auto">
                <Button size="lg" className="btn-glow gap-2 w-full sm:w-auto">
                  <Globe className="w-4 h-4" />
                  Создать сайт
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/create?type=tma" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <Send className="w-4 h-4" />
                  Собрать Mini App
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Trust line */}
            <p className="text-xs sm:text-sm text-muted-foreground">
              AI-генерация · Уникальный дизайн · Мгновенная публикация
            </p>
          </div>

          {/* Right column - Interactive Builder Demo */}
          <div className="lg:pl-4 xl:pl-8">
            <BuilderDemo />
          </div>
        </div>
      </div>
    </section>
  );
};
