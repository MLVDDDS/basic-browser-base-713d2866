import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  ChevronRight, 
  ChevronDown, 
  RotateCcw,
  Clock,
  FileCode,
  Plus,
  Minus,
  Eye,
  Check,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ProjectVersion } from '@/hooks/useProjectVersions';
export type { ProjectVersion };

interface VersionTimelineProps {
  versions: ProjectVersion[];
  currentVersionId?: string;
  isLoading?: boolean;
  onRestore?: (versionId: string) => void;
  onPreview?: (versionId: string) => void;
  onCompare?: (versionId: string, compareWith: string) => void;
  className?: string;
}

export function VersionTimeline({
  versions,
  currentVersionId,
  isLoading,
  onRestore,
  onPreview,
  onCompare,
  className,
}: VersionTimelineProps) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} д назад`;
  };

  if (versions.length === 0 && !isLoading) {
    return (
      <div className={cn(
        "rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground",
        className
      )}>
        <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Нет сохранённых версий</p>
        <p className="text-xs mt-1">Версии создаются автоматически при генерации</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">История версий</span>
          <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">
            {versions.length}
          </span>
        </div>
        
        {selectedForCompare && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedForCompare(null)}
            className="text-xs h-6"
          >
            Отменить сравнение
          </Button>
        )}
      </div>

      {/* Versions list */}
      <ScrollArea className="max-h-80">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            versions.map((version, index) => {
              const isExpanded = expandedVersion === version.id;
              const isCurrent = version.id === currentVersionId;
              const isSelected = selectedForCompare === version.id;
              
              return (
                <motion.div
                  key={version.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {index < versions.length - 1 && (
                    <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-border" />
                  )}
                  
                  <div
                    className={cn(
                      "rounded-lg border transition-all",
                      isCurrent && "border-primary/50 bg-primary/5",
                      isSelected && "border-blue-500/50 bg-blue-500/5",
                      !isCurrent && !isSelected && "border-transparent hover:border-border hover:bg-muted/30"
                    )}
                  >
                    {/* Version header */}
                    <button
                      onClick={() => setExpandedVersion(isExpanded ? null : version.id)}
                      className="w-full flex items-start gap-3 p-2.5 text-left"
                    >
                      {/* Version dot */}
                      <div className={cn(
                        "mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                        isCurrent ? "border-primary bg-primary" : "border-muted-foreground/50 bg-background"
                      )}>
                        {isCurrent && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                      
                      {/* Version info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">v{version.version_number}</span>
                          {version.is_published && (
                            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600">
                              <Globe className="w-2.5 h-2.5" />
                              Опубликовано
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                              Текущая
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {version.message || 'Без описания'}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(version.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileCode className="w-3 h-3" />
                            {version.files_changed} файлов
                          </span>
                          {version.lines_added > 0 && (
                            <span className="flex items-center gap-0.5 text-green-500">
                              <Plus className="w-3 h-3" />
                              {version.lines_added}
                            </span>
                          )}
                          {version.lines_removed > 0 && (
                            <span className="flex items-center gap-0.5 text-red-500">
                              <Minus className="w-3 h-3" />
                              {version.lines_removed}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Expand */}
                      <div className="text-muted-foreground">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                    
                    {/* Expanded actions */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-2.5 pb-2.5 flex items-center gap-2">
                            {!isCurrent && onRestore && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRestore(version.id)}
                                className="h-7 text-xs gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Восстановить
                              </Button>
                            )}
                            
                            {onPreview && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPreview(version.id)}
                                className="h-7 text-xs gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Просмотр
                              </Button>
                            )}
                            
                            {onCompare && (
                              selectedForCompare ? (
                                selectedForCompare !== version.id && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onCompare(selectedForCompare, version.id)}
                                    className="h-7 text-xs gap-1 border-blue-500/50 text-blue-600"
                                  >
                                    Сравнить с этой
                                  </Button>
                                )
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedForCompare(version.id)}
                                  className="h-7 text-xs gap-1"
                                >
                                  Сравнить
                                </Button>
                              )
                            )}
                          </div>
                          
                          {/* Date detail */}
                          <div className="px-2.5 pb-2 text-[10px] text-muted-foreground">
                            {formatDate(version.created_at)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}

export default VersionTimeline;
