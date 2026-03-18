import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  ChevronRight, 
  RotateCcw,
  Clock,
  FileText,
  Check,
  Globe,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface VersionItem {
  id: string;
  number: number;
  description: string | null;
  createdAt: string;
  filesChanged: number;
  isPublished: boolean;
  isCurrent?: boolean;
}

interface HistoryPanelProps {
  versions: VersionItem[];
  currentVersionId?: string;
  isLoading?: boolean;
  onRestore?: (versionId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function HistoryPanel({
  versions,
  currentVersionId,
  isLoading,
  onRestore,
  isOpen,
  onToggle,
  className,
}: HistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'Вчера';
    return `${diffDays} дн назад`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "h-full border-l border-border bg-card overflow-hidden flex flex-col",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">История</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 px-2 text-xs"
            >
              Закрыть
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <History className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Пока нет сохранённых версий
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Версии создаются автоматически при генерации
                  </p>
                </div>
              ) : (
                versions.map((version, index) => {
                  const isCurrent = version.id === currentVersionId;
                  const isExpanded = expandedId === version.id;
                  
                  return (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        "rounded-lg border transition-all",
                        isCurrent ? "border-primary/50 bg-primary/5" : "border-transparent hover:bg-muted/30"
                      )}
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : version.id)}
                        className="w-full flex items-center gap-2 p-2.5 text-left"
                      >
                        {/* Version indicator */}
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                          isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {isCurrent ? <Check className="w-3 h-3" /> : version.number}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium truncate">
                              {version.description || `Версия ${version.number}`}
                            </span>
                            {version.isPublished && (
                              <Globe className="w-3 h-3 text-green-500 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {formatTimeAgo(version.createdAt)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <FileText className="w-2.5 h-2.5" />
                              {version.filesChanged}
                            </span>
                          </div>
                        </div>
                        
                        <ChevronDown className={cn(
                          "w-3.5 h-3.5 text-muted-foreground transition-transform",
                          isExpanded && "rotate-180"
                        )} />
                      </button>
                      
                      {/* Actions */}
                      <AnimatePresence>
                        {isExpanded && !isCurrent && onRestore && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2.5 pb-2.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRestore(version.id)}
                                className="w-full h-7 text-xs gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Вернуться к этой версии
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default HistoryPanel;
