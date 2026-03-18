import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FileCode, 
  Palette, 
  Layers, 
  CheckCircle2,
  Loader2,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerationStage {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const STAGES: GenerationStage[] = [
  { id: 'analyze', label: 'Анализ запроса', icon: Sparkles, description: 'Понимаю, что нужно создать' },
  { id: 'structure', label: 'Структура проекта', icon: Layers, description: 'Проектирую компоненты' },
  { id: 'design', label: 'Дизайн-система', icon: Palette, description: 'Подбираю стили и цвета' },
  { id: 'code', label: 'Генерация кода', icon: FileCode, description: 'Пишу React компоненты' },
  { id: 'ready', label: 'Готово!', icon: Rocket, description: 'Проект создан' },
];

interface GenerationOverlayProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function GenerationOverlay({ isVisible, onComplete }: GenerationOverlayProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  
  // Store onComplete in a ref to avoid useEffect re-running when it changes
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isVisible) {
      setCurrentStage(0);
      setStageProgress(0);
      return;
    }

    // Simulate stage progression
    const stageTimings = [800, 1200, 1000, 1500, 500]; // ms per stage
    let totalTime = 0;

    const timers: NodeJS.Timeout[] = [];
    const intervals: NodeJS.Timeout[] = [];

    stageTimings.forEach((duration, index) => {
      const timer = setTimeout(() => {
        setCurrentStage(index);
        setStageProgress(0);
        
        // Animate progress within stage
        const progressInterval = setInterval(() => {
          setStageProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + 5;
          });
        }, duration / 20);
        
        intervals.push(progressInterval);
      }, totalTime);
      
      timers.push(timer);
      totalTime += duration;
    });

    // Complete callback - use ref to get latest value
    const completeTimer = setTimeout(() => {
      onCompleteRef.current?.();
    }, totalTime + 300);
    timers.push(completeTimer);

    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [isVisible]); // Only depend on isVisible, not onComplete

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Animated background gradient */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-r from-primary/20 via-transparent to-primary/10 blur-3xl" />
            </motion.div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative z-10 w-full max-w-md mx-4"
          >
            {/* Main card */}
            <div className="bg-card/90 backdrop-blur-2xl rounded-3xl border border-border/50 shadow-2xl shadow-primary/10 p-8">
              {/* Animated icon */}
              <div className="flex justify-center mb-8">
                <motion.div
                  className="relative"
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
                    <Sparkles className="w-10 h-10 text-primary-foreground" />
                  </div>
                  
                  {/* Orbiting particles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-primary"
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: i * 0.5,
                      }}
                      style={{
                        top: '50%',
                        left: '50%',
                        transformOrigin: `${40 + i * 15}px 0px`,
                      }}
                    />
                  ))}
                </motion.div>
              </div>

              {/* Title */}
              <motion.h2 
                className="text-xl font-semibold text-center mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Создаём проект
              </motion.h2>
              <motion.p 
                className="text-sm text-muted-foreground text-center mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                AI генерирует структуру и код
              </motion.p>

              {/* Stages */}
              <div className="space-y-3">
                {STAGES.map((stage, index) => {
                  const StageIcon = stage.icon;
                  const isActive = index === currentStage;
                  const isComplete = index < currentStage;
                  const isPending = index > currentStage;

                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-xl transition-all duration-300',
                        isActive && 'bg-primary/10 border border-primary/20',
                        isComplete && 'opacity-60',
                        isPending && 'opacity-30'
                      )}
                    >
                      {/* Icon */}
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                        isComplete && 'bg-green-500/20',
                        isActive && 'bg-primary/20',
                        isPending && 'bg-muted'
                      )}>
                        {isComplete ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 10 }}
                          >
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </motion.div>
                        ) : isActive ? (
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        ) : (
                          <StageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          isActive && 'text-primary',
                          isComplete && 'text-muted-foreground'
                        )}>
                          {stage.label}
                        </p>
                        {isActive && (
                          <motion.p 
                            className="text-xs text-muted-foreground truncate"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                          >
                            {stage.description}
                          </motion.p>
                        )}
                      </div>

                      {/* Progress indicator for active stage */}
                      {isActive && (
                        <div className="w-12 text-right">
                          <span className="text-xs text-primary font-mono">
                            {Math.round(stageProgress)}%
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: `${((currentStage + stageProgress / 100) / STAGES.length) * 100}%` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
