/**
 * 🤖 AssistantMessage Component
 * Displays AI assistant messages with left-aligned styling and markdown support
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMessageContent } from './utils/formatMessageContent';
import { RunSummaryCard, type RunSummary } from './RunSummaryCard';

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

export function AssistantMessage({ 
  content, 
  runSummary,
  timestamp,
  className,
  animationDelay = 0,
  showAvatar = true 
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

  const displayContent = runSummary ? stripRunSummarySection(content) : content;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, delay: animationDelay * 0.05 }}
      className={cn("flex gap-2 group", className)}
    >
      {showAvatar && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={cn(
        "flex-1 max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] shadow-sm relative",
        "bg-card/80 border border-border/60"
      )}>
        <button
          onClick={handleCopy}
          className={cn(
            "absolute top-2 right-2 p-1 rounded-md transition-all duration-200",
            "opacity-0 group-hover:opacity-100 focus:opacity-100",
            "hover:bg-background/80 text-muted-foreground hover:text-foreground",
            copied && "opacity-100 text-green-500 hover:text-green-500"
          )}
          title="Копировать"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
        <div className="text-foreground leading-relaxed pr-6">
          {formatMessageContent(displayContent, 'assistant')}
        </div>
        {runSummary && (
          <div className="mt-2">
            <RunSummaryCard summary={runSummary} />
          </div>
        )}
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
