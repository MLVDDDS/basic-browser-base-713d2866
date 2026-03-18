import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileCode2,
  FileDiff,
  History,
  OctagonX,
  Square,
  Wrench,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { BuilderHistoryTab, BuilderRunHistoryItem } from '@/features/builder/history/run-history';

interface RunHistoryPanelProps {
  runs: BuilderRunHistoryItem[];
  activeTab: BuilderHistoryTab;
  isLoading?: boolean;
  className?: string;
}

function formatTimeAgo(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'только что';
  if (diffMinutes < 60) return `${diffMinutes} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  return `${diffDays} д назад`;
}

function getStatusMeta(status?: 'success' | 'failed' | 'cancelled') {
  if (status === 'failed') {
    return { label: 'Ошибка', icon: OctagonX, className: 'bg-red-500/10 text-red-600' };
  }
  if (status === 'cancelled') {
    return { label: 'Остановлено', icon: Square, className: 'bg-yellow-500/10 text-yellow-700' };
  }
  return { label: 'Успех', icon: CheckCircle2, className: 'bg-green-500/10 text-green-600' };
}

function TimelineList({ run }: { run: BuilderRunHistoryItem }) {
  if (run.timelineEvents.length === 0) {
    return <div className="text-xs text-muted-foreground">Нет сохранённой хронологии для этого запуска.</div>;
  }

  return (
    <div className="space-y-2">
      {run.timelineEvents.map((event) => (
        <div key={event.id} className="flex items-start gap-2 text-xs">
          <span
            className={cn(
              'mt-1 inline-block h-1.5 w-1.5 rounded-full',
              event.status === 'success' && 'bg-green-500',
              event.status === 'error' && 'bg-red-500',
              event.status === 'info' && 'bg-blue-500'
            )}
          />
          <div className="min-w-0">
            <div className="text-foreground">{event.label}</div>
            <div className="text-muted-foreground">
              {new Date(event.timestamp).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {event.path ? ` • ${event.path}` : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChangesList({ run }: { run: BuilderRunHistoryItem }) {
  const visibleDiffs = useMemo(() => run.fileDiffs.slice(0, 8), [run.fileDiffs]);
  if (visibleDiffs.length === 0) {
    return <div className="text-xs text-muted-foreground">Для этого запуска нет сохранённых изменений файлов.</div>;
  }

  return (
    <div className="space-y-3">
      {visibleDiffs.map((diff) => (
        <div key={diff.path} className="rounded-md border border-border/60 bg-background/70 p-2.5">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-foreground">{diff.path}</div>
              <div className="text-[11px] text-muted-foreground">
                {diff.status === 'added' && 'Создан'}
                {diff.status === 'modified' && 'Изменён'}
                {diff.status === 'deleted' && 'Удалён'}
              </div>
            </div>
            <div className="shrink-0 text-[11px] text-muted-foreground">+{diff.additions} / -{diff.deletions}</div>
          </div>
          <div className="max-h-40 overflow-auto rounded border border-border/50 bg-muted/20 p-2 font-mono text-[11px]">
            {diff.hunks.slice(0, 2).map((hunk, hunkIndex) => (
              <div key={`${diff.path}-${hunkIndex}`} className="mb-2 last:mb-0 space-y-0.5">
                {hunk.slice(0, 12).map((line, lineIndex) => (
                  <div
                    key={`${diff.path}-${hunkIndex}-${lineIndex}`}
                    className={cn(
                      'whitespace-pre-wrap break-words',
                      line.type === 'add' && 'text-green-700 dark:text-green-400',
                      line.type === 'remove' && 'text-red-700 dark:text-red-400',
                      line.type === 'context' && 'text-muted-foreground'
                    )}
                  >
                    {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                    {line.content}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RunHistoryPanel({
  runs,
  activeTab,
  isLoading = false,
  className,
}: RunHistoryPanelProps) {
  const [expandedRunId, setExpandedRunId] = useState<string | null>(runs[0]?.runId || null);

  useEffect(() => {
    if (!expandedRunId && runs[0]?.runId) {
      setExpandedRunId(runs[0].runId);
    }
  }, [expandedRunId, runs]);

  return (
    <aside className={cn('h-full border-r border-border bg-card/95 flex flex-col overflow-hidden min-w-[300px]', className)}>
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <div>
            <div className="text-sm font-medium text-foreground">История запусков</div>
            <div className="text-xs text-muted-foreground">
              {runs.length > 0 ? `${runs.length} сохранённых итераций` : 'Сохранённые запуски появятся после первой генерации'}
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 h-0">
        <div className="space-y-2 p-4">
          {isLoading ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              Загружаю историю...
            </div>
          ) : runs.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              Пока нет завершённых запусков с сохранённой историей.
            </div>
          ) : (
            runs.map((run) => {
              const expanded = expandedRunId === run.runId;
              const status = getStatusMeta(run.runSummary?.status);
              const StatusIcon = status.icon;
              const changedFilesCount = run.versionDiff?.filesChanged.length || run.runSummary?.fileOps || 0;

              return (
                <motion.div
                  key={run.runId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border/60 bg-background/60"
                >
                  <button
                    onClick={() => setExpandedRunId(expanded ? null : run.runId)}
                    className="flex w-full items-start gap-3 px-3 py-3 text-left"
                  >
                    <span className={cn('mt-0.5 rounded-full p-1.5', status.className)}>
                      <StatusIcon className="h-3.5 w-3.5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">{run.title}</span>
                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', status.className)}>
                          {status.label}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3 w-3" />
                          {formatTimeAgo(run.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          {run.runSummary?.tools ?? 0} инструментов
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FileCode2 className="h-3 w-3" />
                          {changedFilesCount} файлов
                        </span>
                        {run.version && (
                          <span className="inline-flex items-center gap-1">
                            <FileDiff className="h-3 w-3" />
                            v{run.version.version_number}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="shrink-0 text-muted-foreground">
                      {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border/60 px-3 py-3">
                          {activeTab === 'timeline' ? <TimelineList run={run} /> : <ChangesList run={run} />}
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
    </aside>
  );
}

export default RunHistoryPanel;
