/**
 * ⚠️ SystemMessage Component
 * Displays system notifications, warnings, errors, and info messages
 */
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, X, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type SystemMessageType = 'error' | 'warning' | 'info' | 'success' | 'limit';

interface SystemMessageProps {
  type: SystemMessageType;
  title: string;
  message: string;
  timestamp?: number;
  className?: string;
  animationDelay?: number;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const typeConfig = {
  error: {
    icon: AlertCircle,
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    iconColor: 'text-destructive',
    titleColor: 'text-destructive',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-600 dark:text-blue-400',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    iconColor: 'text-green-500',
    titleColor: 'text-green-600 dark:text-green-400',
  },
  limit: {
    icon: Coins,
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    iconColor: 'text-orange-500',
    titleColor: 'text-orange-600 dark:text-orange-400',
  },
};

export function SystemMessage({ 
  type,
  title,
  message,
  timestamp,
  className,
  animationDelay = 0,
  onDismiss,
  action
}: SystemMessageProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.2, delay: animationDelay * 0.05 }}
      className={cn(
        "rounded-xl border p-3 shadow-sm",
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          config.bg
        )}>
          <Icon className={cn("w-4 h-4", config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn("text-sm font-medium", config.titleColor)}>
              {title}
            </h4>
            {onDismiss && (
              <button 
                onClick={onDismiss}
                className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {message}
          </p>
          {action && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={action.onClick}
              className="mt-2 h-7 text-xs"
            >
              {action.label}
            </Button>
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
      </div>
    </motion.div>
  );
}
