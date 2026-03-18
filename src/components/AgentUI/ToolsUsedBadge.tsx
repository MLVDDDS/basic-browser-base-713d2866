import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  ChevronDown,
  ChevronUp,
  FileCode,
  Search,
  Wrench,
  Database,
  Globe,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToolUsage {
  name: string;
  count: number;
}

interface ToolsUsedBadgeProps {
  tools: ToolUsage[];
  totalCount: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const toolIcons: Record<string, React.ElementType> = {
  'read_file': FileCode,
  'write_file': FileCode,
  'search': Search,
  'web_search': Globe,
  'analyze': Lightbulb,
  'fix': Wrench,
  'database': Database,
  'generate': Zap,
  'default': Lightbulb,
};

const toolColors: Record<string, string> = {
  'read_file': 'text-blue-500 bg-blue-500/10',
  'write_file': 'text-green-500 bg-green-500/10',
  'search': 'text-purple-500 bg-purple-500/10',
  'web_search': 'text-cyan-500 bg-cyan-500/10',
  'analyze': 'text-amber-500 bg-amber-500/10',
  'fix': 'text-orange-500 bg-orange-500/10',
  'database': 'text-indigo-500 bg-indigo-500/10',
  'generate': 'text-pink-500 bg-pink-500/10',
  'default': 'text-muted-foreground bg-muted',
};

export function ToolsUsedBadge({ tools, totalCount, isExpanded, onToggle }: ToolsUsedBadgeProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const expanded = isExpanded ?? localExpanded;
  const handleToggle = onToggle ?? (() => setLocalExpanded(!localExpanded));

  if (totalCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-card overflow-hidden"
    >
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <Lightbulb className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">
            {totalCount} {totalCount === 1 ? 'tool' : 'tools'} used
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-primary font-medium">
            {expanded ? 'Hide' : 'Show all'}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border">
              <div className="pt-2 space-y-1.5">
                {tools.map((tool, index) => {
                  const Icon = toolIcons[tool.name] || toolIcons.default;
                  const colorClass = toolColors[tool.name] || toolColors.default;
                  
                  return (
                    <motion.div
                      key={tool.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1 rounded", colorClass)}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium capitalize">
                          {tool.name.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ×{tool.count}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
