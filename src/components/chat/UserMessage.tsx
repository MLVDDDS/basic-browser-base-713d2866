/**
 * 👤 UserMessage Component
 * Displays user messages with right-aligned styling
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMessageContent } from './utils/formatMessageContent';

interface UserMessageProps {
  content: string;
  timestamp?: number;
  className?: string;
  animationDelay?: number;
}

export function UserMessage({ 
  content, 
  timestamp,
  className,
  animationDelay = 0 
}: UserMessageProps) {
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, delay: animationDelay * 0.05 }}
      className={cn("flex gap-2 justify-end group", className)}
    >
      <div className="max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-[13px] shadow-sm bg-primary text-primary-foreground relative">
        <button
          onClick={handleCopy}
          className={cn(
            "absolute top-2 right-2 p-1 rounded-md transition-all duration-200",
            "opacity-0 group-hover:opacity-100 focus:opacity-100",
            "hover:bg-primary-foreground/20 text-primary-foreground/70 hover:text-primary-foreground",
            copied && "opacity-100 text-green-300 hover:text-green-300"
          )}
          title="Копировать"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
        <div className="whitespace-pre-wrap break-words leading-relaxed pr-6">
          {formatMessageContent(content, 'user')}
        </div>
        {timestamp && (
          <div className="text-[10px] mt-1.5 opacity-70 text-right">
            {new Date(timestamp).toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border border-border">
        <span className="text-xs font-medium text-muted-foreground">Вы</span>
      </div>
    </motion.div>
  );
}
