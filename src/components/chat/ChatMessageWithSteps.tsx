import { memo } from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentStepHistory, AgentStepData } from './AgentStepHistory';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    agentSteps?: AgentStepData[];
    filesCreated?: string[];
    packagesInstalled?: string[];
    model?: string;
    duration?: number;
    [key: string]: unknown;
  };
}

interface ChatMessageWithStepsProps {
  message: ChatMessageData;
  isLatest?: boolean;
}

export const ChatMessageWithSteps = memo(function ChatMessageWithSteps({
  message,
  isLatest = false,
}: ChatMessageWithStepsProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  const agentSteps = message.metadata?.agentSteps as AgentStepData[] | undefined;
  const hasSteps = agentSteps && agentSteps.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        isUser && "bg-primary/5 border border-primary/10",
        !isUser && !isSystem && "bg-muted/30",
        isSystem && "bg-amber-500/5 border border-amber-500/20"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser && "bg-primary text-primary-foreground",
        !isUser && !isSystem && "bg-gradient-to-br from-purple-500 to-blue-500 text-white",
        isSystem && "bg-amber-500/20 text-amber-500"
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">
            {isUser ? 'Вы' : isSystem ? 'Система' : 'Ассистент'}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Agent steps (if assistant message with steps) */}
        {!isUser && hasSteps && (
          <AgentStepHistory 
            steps={agentSteps} 
            defaultExpanded={isLatest}
          />
        )}

        {/* Message content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* Metadata footer */}
        {message.metadata && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
            {message.metadata.model && (
              <span className="text-xs px-2 py-0.5 bg-muted/50 rounded text-muted-foreground">
                {message.metadata.model}
              </span>
            )}
            {message.metadata.duration && (
              <span className="text-xs text-muted-foreground">
                {(message.metadata.duration / 1000).toFixed(1)}s
              </span>
            )}
            {message.metadata.filesCreated && message.metadata.filesCreated.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                {message.metadata.filesCreated.length} файлов
              </span>
            )}
            {message.metadata.packagesInstalled && message.metadata.packagesInstalled.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded">
                {message.metadata.packagesInstalled.length} пакетов
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});
