import { cn } from '@/lib/utils';

export interface RunSummary {
  status?: 'success' | 'failed' | 'cancelled';
  steps?: number;
  tools?: number;
  fileOps?: number;
  workedSeconds?: number;
  creditsUsed?: number;
  totalTokens?: number;
  pricingVersion?: string;
}

export function RunSummaryCard({ summary }: { summary: RunSummary }) {
  const status = summary.status || 'success';
  const statusLabel =
    status === 'success' ? 'Успех' : status === 'failed' ? 'Ошибка' : 'Остановлено';

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-xs font-medium text-foreground">Итог анализа</div>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-medium',
            status === 'success' && 'bg-green-500/15 text-green-700 dark:text-green-400',
            status === 'failed' && 'bg-red-500/15 text-red-700 dark:text-red-400',
            status === 'cancelled' && 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
          )}
        >
          {statusLabel}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
        <span>Шаги: {summary.steps ?? 0}</span>
        <span>Инструменты: {summary.tools ?? 0}</span>
        <span>Изменения файлов: {summary.fileOps ?? 0}</span>
        <span>Время: {summary.workedSeconds ?? 0}с</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        Кредиты: {summary.creditsUsed ?? 0}
        {summary.totalTokens ? ` • Токены: ${summary.totalTokens}` : ''}
      </div>
    </div>
  );
}
