import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Search, 
  HelpCircle, 
  Sparkles,
  FileCode,
  Palette,
  Layout,
  Layers,
  FolderOpen,
  Code,
  Gauge,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IntentIndicatorProps {
  actionType: string;
  target: string;
  complexity: 'low' | 'medium' | 'high';
  isVisible: boolean;
  isProcessing?: boolean;
  className?: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  create: <Plus className="w-3.5 h-3.5" />,
  edit: <Edit className="w-3.5 h-3.5" />,
  fix: <Wrench className="w-3.5 h-3.5" />,
  add: <Plus className="w-3.5 h-3.5" />,
  remove: <Trash2 className="w-3.5 h-3.5" />,
  refactor: <RefreshCw className="w-3.5 h-3.5" />,
  audit: <Search className="w-3.5 h-3.5" />,
  explain: <HelpCircle className="w-3.5 h-3.5" />,
  other: <Sparkles className="w-3.5 h-3.5" />,
};

const actionLabels: Record<string, string> = {
  create: 'Создать',
  edit: 'Изменить',
  fix: 'Исправить',
  add: 'Добавить',
  remove: 'Удалить',
  refactor: 'Рефакторинг',
  audit: 'Проверить',
  explain: 'Объяснить',
  other: 'Выполнить',
};

const targetIcons: Record<string, React.ReactNode> = {
  page: <Layout className="w-3.5 h-3.5" />,
  component: <Layers className="w-3.5 h-3.5" />,
  style: <Palette className="w-3.5 h-3.5" />,
  feature: <Sparkles className="w-3.5 h-3.5" />,
  project: <FolderOpen className="w-3.5 h-3.5" />,
  section: <FileCode className="w-3.5 h-3.5" />,
  code: <Code className="w-3.5 h-3.5" />,
  other: <Sparkles className="w-3.5 h-3.5" />,
};

const targetLabels: Record<string, string> = {
  page: 'страницу',
  component: 'компонент',
  style: 'стили',
  feature: 'функцию',
  project: 'проект',
  section: 'секцию',
  code: 'код',
  other: 'элемент',
};

const complexityConfig = {
  low: {
    label: 'Быстро',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    icon: <Gauge className="w-3.5 h-3.5" />,
  },
  medium: {
    label: 'Средне',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    icon: <Gauge className="w-3.5 h-3.5" />,
  },
  high: {
    label: 'Сложно',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    icon: <Gauge className="w-3.5 h-3.5" />,
  },
};

export function IntentIndicator({
  actionType,
  target,
  complexity,
  isVisible,
  isProcessing = false,
  className,
}: IntentIndicatorProps) {
  const complexityInfo = complexityConfig[complexity];
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            boxShadow: isProcessing 
              ? ['0 0 0 0 hsl(var(--primary) / 0)', '0 0 0 4px hsl(var(--primary) / 0.15)', '0 0 0 0 hsl(var(--primary) / 0)']
              : '0 0 0 0 hsl(var(--primary) / 0)'
          }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ 
            duration: 0.2,
            boxShadow: isProcessing ? {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            } : { duration: 0.2 }
          }}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg",
            "bg-card/80 backdrop-blur-sm border border-border/50",
            "text-xs text-muted-foreground",
            isProcessing && "border-primary/30",
            className
          )}
        >
          {/* Processing indicator */}
          {isProcessing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-3.5 h-3.5 text-primary" />
            </motion.div>
          )}
          
          {/* Action */}
          <motion.div 
            className="flex items-center gap-1.5 text-primary"
            animate={isProcessing ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
            transition={isProcessing ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
          >
            {actionIcons[actionType] || actionIcons.other}
            <span className="font-medium">
              {actionLabels[actionType] || actionLabels.other}
            </span>
          </motion.div>
          
          <span className="text-border">→</span>
          
          {/* Target */}
          <motion.div 
            className="flex items-center gap-1.5"
            animate={isProcessing ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
            transition={isProcessing ? { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 } : {}}
          >
            {targetIcons[target] || targetIcons.other}
            <span>{targetLabels[target] || targetLabels.other}</span>
          </motion.div>
          
          <span className="text-border">•</span>
          
          {/* Complexity */}
          <motion.div 
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded",
              complexityInfo.bgColor,
              complexityInfo.color
            )}
            animate={isProcessing ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
            transition={isProcessing ? { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 } : {}}
          >
            {complexityInfo.icon}
            <span className="font-medium">{complexityInfo.label}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
