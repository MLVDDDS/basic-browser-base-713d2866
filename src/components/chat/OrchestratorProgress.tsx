import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Loader2, 
  CheckCircle,
  Cpu,
  Sparkles,
  Zap,
  ClipboardList,
  Play,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  TrendingUp,
  FileCode,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { PipelineMode, PipelinePhase, UnifiedState } from '@/hooks/useUnifiedOrchestrator';

interface OrchestratorProgressProps {
  state: UnifiedState;
  currentMode: PipelineMode | null;
  currentPhase: PipelinePhase | null;
}

const MODE_CONFIG: Record<PipelineMode, { 
  label: string; 
  color: string; 
  bgColor: string;
  description: string;
}> = {
  light: { 
    label: 'LIGHT', 
    color: 'text-green-600', 
    bgColor: 'bg-green-500/10 border-green-500/20',
    description: 'Quick task with Haiku'
  },
  low: { 
    label: 'LOW', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    description: 'Standard task with Sonnet'
  },
  medium: { 
    label: 'MEDIUM', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-500/10 border-yellow-500/20',
    description: 'Planning + Execution + Validation'
  },
  high: { 
    label: 'HIGH', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    description: 'Multi-model orchestration with Opus'
  },
};

// Only define phases that are actively used in the UI
// Other phases from PipelinePhase type are handled dynamically
const PHASE_CONFIG: Partial<Record<PipelinePhase, {
  label: string;
  emoji: string;
  icon: typeof Brain;
}>> = {
  intake: { label: 'Приём запроса', emoji: '📥', icon: Brain },
  analyze: { label: 'Анализ', emoji: '🔍', icon: Brain },
  plan: { label: 'Планирование', emoji: '📋', icon: ClipboardList },
  execute: { label: 'Выполнение', emoji: '⚡', icon: Play },
  validate: { label: 'Валидация', emoji: '✅', icon: ShieldCheck },
  fix: { label: 'Автоисправление', emoji: '🔧', icon: Wrench },
  preview: { label: 'Preview', emoji: '👁️', icon: Play },
  deploy: { label: 'Публикация', emoji: '🚀', icon: Play },
  complete: { label: 'Готово', emoji: '✨', icon: CheckCircle },
};

// Helper to get phase config with fallback
function getPhaseConfig(phase: PipelinePhase) {
  return PHASE_CONFIG[phase] || { label: phase, emoji: '📌', icon: Brain };
}

// Auto-Fix Progress Component
function AutoFixProgress({ state }: { state: UnifiedState }) {
  if (!state.isAutoFixing && state.autoFixAttempt === 0) return null;

  const scoreImproved = state.autoFixScore > state.autoFixPreviousScore;
  const scoreDiff = state.autoFixScore - state.autoFixPreviousScore;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "rounded-lg border p-3 space-y-2",
        state.isAutoFixing 
          ? "bg-amber-500/5 border-amber-500/20" 
          : scoreImproved 
            ? "bg-green-500/5 border-green-500/20"
            : "bg-muted/30 border-border/50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {state.isAutoFixing ? (
            <Wrench className="w-4 h-4 text-amber-500 animate-pulse" />
          ) : scoreImproved ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {state.isAutoFixing ? 'AI Auto-Fix' : 'Auto-Fix завершён'}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {state.autoFixAttempt}/{state.autoFixMaxAttempts}
          </span>
        </div>
        
        {/* Score indicator */}
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-sm font-mono font-semibold",
            state.autoFixScore >= 70 ? "text-green-600" : 
            state.autoFixScore >= 50 ? "text-yellow-600" : "text-red-500"
          )}>
            {state.autoFixScore}
          </span>
          {state.autoFixPreviousScore > 0 && scoreDiff !== 0 && (
            <span className={cn(
              "text-xs flex items-center gap-0.5",
              scoreDiff > 0 ? "text-green-500" : "text-red-400"
            )}>
              {scoreDiff > 0 ? <TrendingUp className="w-3 h-3" /> : null}
              {scoreDiff > 0 ? '+' : ''}{scoreDiff}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar during fixing */}
      {state.isAutoFixing && (
        <div className="space-y-1">
          <Progress 
            value={(state.autoFixAttempt / state.autoFixMaxAttempts) * 100} 
            className="h-1.5"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Исправляю {state.autoFixErrorCount} ошибок...
            </span>
          </div>
        </div>
      )}

      {/* Files being fixed */}
      {state.autoFixFilesFixed.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {state.autoFixFilesFixed.slice(-5).map((file, idx) => (
            <motion.span
              key={`${file}-${idx}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary"
            >
              <FileCode className="w-2.5 h-2.5" />
              {file.split('/').pop()}
            </motion.span>
          ))}
          {state.autoFixFilesFixed.length > 5 && (
            <span className="text-[10px] text-muted-foreground">
              +{state.autoFixFilesFixed.length - 5} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function OrchestratorProgress({ 
  state, 
  currentMode, 
  currentPhase 
}: OrchestratorProgressProps) {
  if (!state.isRunning && !state.isAutoFixing) return null;

  const modeConfig = currentMode ? MODE_CONFIG[currentMode] : null;
  const phaseConfig = currentPhase ? PHASE_CONFIG[currentPhase] : null;
  const PhaseIcon = phaseConfig?.icon || Brain;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3 items-start"
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2",
        state.isAutoFixing
          ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25 ring-amber-500/20"
          : currentMode === 'high' 
            ? "bg-gradient-to-br from-purple-500 to-blue-500 shadow-purple-500/25 ring-purple-500/20"
            : "bg-gradient-to-br from-primary to-primary/60 shadow-primary/25 ring-primary/20"
      )}>
        {state.isAutoFixing ? (
          <Wrench className="w-4 h-4 text-white animate-pulse" />
        ) : currentMode === 'high' ? (
          <Cpu className="w-4 h-4 text-white animate-pulse" />
        ) : (
          <Brain className="w-4 h-4 text-primary-foreground animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Mode and Phase badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {modeConfig && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-semibold border",
              modeConfig.bgColor,
              modeConfig.color
            )}>
              {modeConfig.label}
            </span>
          )}
          
          {phaseConfig && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <PhaseIcon className="w-3 h-3" />
              {phaseConfig.label}
            </span>
          )}
          
          {state.isAutoFixing && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Wrench className="w-3 h-3" />
              Auto-Fix
            </span>
          )}
          
          <span className="text-xs text-muted-foreground">
            Итерация {state.iteration}/{state.maxIterations}
          </span>
          
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        </div>

        {/* Auto-Fix Progress (when active) */}
        <AnimatePresence>
          {(state.isAutoFixing || state.autoFixAttempt > 0) && (
            <AutoFixProgress state={state} />
          )}
        </AnimatePresence>

        {/* Current step */}
        {!state.isAutoFixing && (() => {
          const last = state.steps[state.steps.length - 1];
          if (!last) return null;

          const getLabel = () => {
            switch (last.type) {
              case 'phase': 
                return last.name === 'auto_fix' ? 'AI Auto-Fix...' : `Фаза: ${last.name}`;
              case 'plan': return 'Планирую архитектуру…';
              case 'tool_call': return `${last.name || 'Выполняю'}…`;
              case 'tool_result': return last.success ? 'Готово' : 'Проверяю ошибку…';
              case 'validation': return 'Проверяю качество…';
              case 'error': return 'Ошибка';
              default: return 'Работаю…';
            }
          };

          return (
            <motion.div
              key={last.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "text-xs p-2.5 rounded-lg border",
                last.type === 'error' 
                  ? "bg-red-500/5 border-red-500/20" 
                  : "bg-muted/30 border-border/50"
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {last.type === 'error' ? (
                  <XCircle className="w-3 h-3 text-red-500" />
                ) : (
                  <Sparkles className="w-3 h-3 text-primary" />
                )}
                <span className="font-medium text-foreground">{getLabel()}</span>
              </div>
              {last.content && (
                <p className="text-muted-foreground line-clamp-2">
                  {last.content.slice(0, 100)}
                </p>
              )}
            </motion.div>
          );
        })()}

        {/* Text output */}
        {state.textOutput && !state.isAutoFixing && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border/30">
            {state.textOutput.slice(-200)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default OrchestratorProgress;
