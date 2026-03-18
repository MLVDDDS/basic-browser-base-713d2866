/**
 * 🤖 AssistantMessage Component
 * Displays AI assistant messages with left-aligned styling and markdown support
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMessageContent } from './utils/formatMessageContent';
import type { RunSummary } from './RunSummaryCard';
import { RunSummaryPopover } from './RunSummaryPopover';

interface AssistantMessageProps {
  content: string;
  runSummary?: RunSummary;
  timestamp?: number;
  className?: string;
  animationDelay?: number;
  showAvatar?: boolean;
}

function stripRunSummarySection(value: string): string {
  const marker = '\n\nИтог анализа:';
  const idx = value.indexOf(marker);
  if (idx === -1) return value;
  return value.slice(0, idx).trim();
}

function stripSystemCompletionHeaders(value: string): string {
  const lines = String(value || "").split('\n');
  while (lines.length > 0) {
    const normalized = lines[0]
      .replace(/[✅✔]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    if (
      normalized === 'generation complete' ||
      normalized === 'генерация завершена' ||
      normalized === 'generation finished'
    ) {
      lines.shift();
      continue;
    }
    break;
  }
  return lines.join('\n').trim();
}

export function AssistantMessage({ 
  content, 
  runSummary,
  timestamp,
  className,
  animationDelay = 0,
  showAvatar = false 
}: AssistantMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const displayContent = stripSystemCompletionHeaders(
    runSummary ? stripRunSummarySection(content) : content
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, delay: animationDelay * 0.05 }}
      className={cn("flex gap-2 group", className)}
    >
      {showAvatar ? <div className="w-1.5 rounded-full bg-border/80 flex-shrink-0" /> : null}
      <div className={cn(
        "flex-1 max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] shadow-sm relative",
        "bg-card/80 border border-border/60"
      )}>
        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-100 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          {runSummary ? <RunSummaryPopover summary={runSummary} /> : null}
          <button
            onClick={handleCopy}
            className={cn(
              "p-1 rounded-md transition-all duration-200",
              "hover:bg-background/80 text-muted-foreground hover:text-foreground",
              copied && "text-green-500 hover:text-green-500"
            )}
            title="Копировать"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <div className="text-foreground leading-relaxed pr-6">
          {formatMessageContent(displayContent, 'assistant')}
        </div>
        {timestamp && (
          <div className="text-[10px] mt-1.5 text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
