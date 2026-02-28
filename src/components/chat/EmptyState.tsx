/**
 * 🔧 EmptyState Component
 * Shows welcome message when chat is empty
 */
import { motion, AnimatePresence } from 'framer-motion';
import { History, RefreshCw, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import logoSvg from '@/assets/logo.svg';

interface CachedProject {
  id: string;
  name: string;
  updatedAt: number;
  structure: {
    files: Array<{ path: string; content: string }>;
  };
}

interface EmptyStateProps {
  showCacheRestore?: boolean;
  cachedProjects?: CachedProject[];
  hasCachedProjects?: boolean;
  onRestoreFromCache?: (cached: CachedProject) => void;
  onDismissCacheRestore?: () => void;
  onClearCache?: () => void;
  className?: string;
}

const GREETINGS = [
  'Какая идея на сегодня?',
  'Что будем создавать?',
  'Расскажи, что задумал',
  'Давай построим что-то новое',
  'Что хочешь воплотить?',
  'Опиши — я соберу',
];

/** Small heart used for the orbiting decoration */
const MiniHeart = ({ size = 10, className }: { size?: number; className?: string }) => (
  <div
    className={cn('opacity-60', className)}
    style={{
      width: size,
      height: size,
      WebkitMaskImage: `url(${logoSvg})`,
      maskImage: `url(${logoSvg})`,
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
    }}
  />
);

export function EmptyState({
  showCacheRestore = false,
  cachedProjects = [],
  hasCachedProjects = false,
  onRestoreFromCache,
  onDismissCacheRestore,
  onClearCache,
  className
}: EmptyStateProps) {
  const greeting = useMemo(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)], []);

  return (
    <div className={cn("text-center py-8", className)}>
      {/* Logo heart with orbiting mini hearts */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative w-20 h-20 mx-auto mb-5"
      >
        {/* Central heart */}
        <div
          className="absolute inset-2 bg-foreground"
          style={{
            WebkitMaskImage: `url(${logoSvg})`,
            maskImage: `url(${logoSvg})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />

        {/* Orbiting mini hearts */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * 72) * (Math.PI / 180);
          const radius = 34;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [0.8, 1, 0.8],
                x: x - 5,
                y: y - 5,
              }}
              transition={{
                opacity: { duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
                x: { delay: i * 0.1, duration: 0.4 },
                y: { delay: i * 0.1, duration: 0.4 },
              }}
            >
              <MiniHeart size={10} className="bg-primary" />
            </motion.div>
          );
        })}
      </motion.div>
      
      {/* Welcome text */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-base font-semibold mb-1 brand-wordmark">{greeting}</h3>
        <p className="text-sm text-muted-foreground">
          Опиши что хочешь создать — я помогу
        </p>
      </motion.div>
      
      {/* Quick start hints */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 flex flex-wrap gap-2 justify-center px-4"
      >
        {['Лендинг', 'Дашборд', 'Магазин', 'Портфолио'].map((hint) => (
          <span
            key={hint}
            className="text-xs px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border/50"
          >
            {hint}
          </span>
        ))}
      </motion.div>
      
      {/* Cache restore banner */}
      <AnimatePresence>
        {showCacheRestore && hasCachedProjects && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 mx-4 p-4 rounded-xl bg-muted/50 border border-border text-left"
          >
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Восстановить проект?</span>
              {onDismissCacheRestore && (
                <button 
                  onClick={onDismissCacheRestore}
                  className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cachedProjects.slice(0, 5).map((cached) => (
                <button
                  key={cached.id}
                  onClick={() => onRestoreFromCache?.(cached)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg bg-background hover:bg-primary/5 border border-border/50 hover:border-primary/30 transition-all group"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-medium truncate">{cached.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(cached.updatedAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {cached.structure.files.length} файлов
                  </span>
                </button>
              ))}
            </div>
            {onClearCache && (
              <button
                onClick={onClearCache}
                className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Очистить кэш
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
