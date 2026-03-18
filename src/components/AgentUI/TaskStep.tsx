import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Check, 
  Loader2,
  FileCode,
  Search,
  Bug,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StepStatus = 'pending' | 'active' | 'completed' | 'error';
type StepType = 'thinking' | 'tool_use' | 'text' | 'file_change';

interface TaskStepProps {
  id: string;
  type: StepType;
  label: string;
  status: StepStatus;
  content?: string;
  data?: Record<string, unknown>;
  duration?: number;
}

const STEP_ICONS: Record<string, React.ElementType> = {
  read_file: FileCode,
  write_file: FileCode,
  search_codebase: Search,
  analyze_error: Bug,
  apply_fix: Wrench,
  generate_component: FileCode,
  default: Wrench
};

export function TaskStep({
  id,
  type,
  label,
  status,
  content,
  data,
  duration
}: TaskStepProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toolName = (data?.name as string) || 'default';
  const Icon = STEP_ICONS[toolName] || STEP_ICONS.default;

  const statusColors = {
    pending: 'text-muted-foreground bg-muted',
    active: 'text-primary bg-primary/20',
    completed: 'text-green-500 bg-green-500/20',
    error: 'text-destructive bg-destructive/20'
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border rounded-lg overflow-hidden bg-card"
    >
      <button
        onClick={() => content && setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center gap-3 p-3 transition-colors",
          content && "hover:bg-muted/50 cursor-pointer"
        )}
        disabled={!content}
      >
        <div className={cn("p-1.5 rounded-md", statusColors[status])}>
          {status === 'active' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : status === 'completed' ? (
            <Check className="w-4 h-4" />
          ) : status === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>

        <span className="flex-1 text-left text-sm font-medium">
          {label}
        </span>

        {duration && (
          <span className="text-xs text-muted-foreground">
            {formatDuration(duration)}
          </span>
        )}

        {content && (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )
        )}
      </button>

      <AnimatePresence>
        {isExpanded && content && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 border-t border-border">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/50 p-2 rounded">
                {content}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
