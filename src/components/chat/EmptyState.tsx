/**
 * 🔧 EmptyState Component
 * Shows welcome message when chat is empty
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, History, RefreshCw, Trash2, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function EmptyState({
  showCacheRestore = false,
  cachedProjects = [],
  hasCachedProjects = false,
  onRestoreFromCache,
  onDismissCacheRestore,
  onClearCache,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-8", className)}>
      {/* Welcome icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/10"
      >
        <Sparkles className="w-7 h-7 text-primary" />
      </motion.div>
      
      {/* Welcome text */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-base font-semibold mb-1">Привет! Я AI-помощник</h3>
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
        {['Лендинг', 'Дашборд', 'Магазин', 'Портфолио'].map((hint, idx) => (
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
