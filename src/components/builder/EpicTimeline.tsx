import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle, 
  Circle,
  Loader2,
  XCircle,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EpicProgress, AgentStep } from '@/hooks/useUnifiedOrchestrator';
import { useState } from 'react';

interface EpicTimelineProps {
  epics: EpicProgress[];
  currentEpicIndex: number;
  steps: AgentStep[];
  epicProgress: number;
  requirements?: {
    goals: string[];
    constraints: string[];
    integrations: string[];
    complexity?: {
      level: string;
      score: number;
    };
  };
  className?: string;
}

const statusColors = {
  pending: 'text-muted-foreground',
  active: 'text-blue-500',
  completed: 'text-green-500',
  failed: 'text-red-500',
};

const statusBg = {
  pending: 'bg-muted/50',
  active: 'bg-blue-500/10',
  completed: 'bg-green-500/10',
  failed: 'bg-red-500/10',
};

const statusBorder = {
  pending: 'border-muted',
  active: 'border-blue-500/30',
  completed: 'border-green-500/30',
  failed: 'border-red-500/30',
};

export function EpicTimeline({
  epics,
  currentEpicIndex,
  steps,
  epicProgress,
  requirements,
  className,
}: EpicTimelineProps) {
  const [expandedEpic, setExpandedEpic] = useState<string | null>(null);
  const [showRequirements, setShowRequirements] = useState(true);

  // Get stories for specific epic from steps
  const getEpicStories = (epicId: string) => {
    return steps.filter(s => s.type === 'story' && s.epicId === epicId);
  };

  if (epics.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border border-border bg-card p-4 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10">
            <Layers className="w-4 h-4 text-violet-500" />
          </div>
          <span className="font-medium text-sm">Эпик-план</span>
          <span className="text-xs text-muted-foreground">
            {epics.filter(e => e.status === 'completed').length}/{epics.length}
          </span>
        </div>
        
        {/* Overall progress */}
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${epicProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{epicProgress}%</span>
        </div>
      </div>

      {/* Requirements summary (collapsible) */}
      {requirements && (
        <motion.div layout className="space-y-2">
          <button
            onClick={() => setShowRequirements(!showRequirements)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showRequirements ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <Target className="w-3 h-3" />
            <span>Требования</span>
            {requirements.complexity && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                requirements.complexity.level === 'low' && "bg-green-500/10 text-green-600",
                requirements.complexity.level === 'medium' && "bg-yellow-500/10 text-yellow-600",
                requirements.complexity.level === 'high' && "bg-red-500/10 text-red-600",
              )}>
                {requirements.complexity.level.toUpperCase()}
              </span>
            )}
          </button>
          
          <AnimatePresence>
            {showRequirements && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {requirements.goals.length > 0 && (
                    <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <p className="text-blue-500 font-medium mb-1">Цели</p>
                      <ul className="text-muted-foreground space-y-0.5">
                        {requirements.goals.slice(0, 3).map((g, i) => (
                          <li key={i} className="truncate">• {g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {requirements.constraints.length > 0 && (
                    <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <p className="text-amber-500 font-medium mb-1">Ограничения</p>
                      <ul className="text-muted-foreground space-y-0.5">
                        {requirements.constraints.slice(0, 3).map((c, i) => (
                          <li key={i} className="truncate">• {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {requirements.integrations.length > 0 && (
                    <div className="p-2 rounded-lg bg-violet-500/5 border border-violet-500/20">
                      <p className="text-violet-500 font-medium mb-1">Интеграции</p>
                      <ul className="text-muted-foreground space-y-0.5">
                        {requirements.integrations.slice(0, 3).map((i, idx) => (
                          <li key={idx} className="truncate">• {i}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Epics list */}
      <div className="space-y-2">
        {epics.map((epic, index) => {
          const isExpanded = expandedEpic === epic.epicId;
          const stories = getEpicStories(epic.epicId);
          const StatusIcon = epic.status === 'completed' ? CheckCircle :
                             epic.status === 'active' ? Loader2 :
                             epic.status === 'failed' ? XCircle : Circle;
          
          return (
            <motion.div
              key={epic.epicId}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "rounded-lg border transition-all",
                statusBorder[epic.status],
                statusBg[epic.status]
              )}
            >
              {/* Epic header */}
              <button
                onClick={() => setExpandedEpic(isExpanded ? null : epic.epicId)}
                className="w-full flex items-center gap-3 p-3"
              >
                {/* Connector */}
                {index > 0 && (
                  <div className={cn(
                    "absolute -top-2 left-[23px] w-0.5 h-2",
                    index <= currentEpicIndex ? "bg-green-500/50" : "bg-muted"
                  )} />
                )}
                
                {/* Status icon */}
                <div className={cn("shrink-0", statusColors[epic.status])}>
                  <StatusIcon className={cn(
                    "w-4 h-4",
                    epic.status === 'active' && "animate-spin"
                  )} />
                </div>
                
                {/* Epic info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{epic.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {epic.storiesCount} stories
                    </span>
                  </div>
                  
                  {/* Progress for active epic */}
                  {epic.status === 'active' && epic.currentStory !== undefined && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${((epic.currentStory + 1) / epic.storiesCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {epic.currentStory + 1}/{epic.storiesCount}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Expand indicator */}
                {stories.length > 0 && (
                  <div className="text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                )}
              </button>
              
              {/* Stories list */}
              <AnimatePresence>
                {isExpanded && stories.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pl-10 space-y-1">
                      {stories.map((story, sIdx) => (
                        <div
                          key={story.id}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span className="truncate">{story.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default EpicTimeline;
