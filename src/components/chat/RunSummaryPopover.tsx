import { MoreHorizontal } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { RunSummaryCard, type RunSummary } from './RunSummaryCard';

interface RunSummaryPopoverProps {
  summary: RunSummary;
}

export function RunSummaryPopover({ summary }: RunSummaryPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          title="Итог анализа"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        <RunSummaryCard summary={summary} />
      </PopoverContent>
    </Popover>
  );
}

