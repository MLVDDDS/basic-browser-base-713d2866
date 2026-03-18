import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Zap,
  Shield,
  Wrench,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineStage, PipelineProgress } from "@/hooks/useSitePipeline";

interface PipelineStatusProps {
  progress: PipelineProgress;
  isRunning: boolean;
  className?: string;
}

const stageConfig: Record<PipelineStage, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
}> = {
  idle: {
    icon: Sparkles,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    label: "Готов к генерации",
  },
  analyzing: {
    icon: Brain,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    label: "Анализирую запрос",
  },
  generating: {
    icon: Sparkles,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Генерирую сайт",
  },
  validating: {
    icon: Shield,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Проверяю качество",
  },
  fixing: {
    icon: Wrench,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    label: "Автоматически исправляю",
  },
  complete: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Готово",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Не удалось",
  },
};

const stages: PipelineStage[] = ["analyzing", "generating", "validating", "fixing", "complete"];

export function PipelineStatus({ progress, isRunning, className }: PipelineStatusProps) {
  const config = stageConfig[progress.stage];
  const Icon = config.icon;
  const currentIndex = stages.indexOf(progress.stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-4 space-y-4",
        config.bgColor,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          config.bgColor,
          config.color
        )}>
          {isRunning && progress.stage !== "complete" && progress.stage !== "failed" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <p className={cn("font-medium", config.color)}>{config.label}</p>
          <p className="text-xs text-muted-foreground">{progress.message}</p>
        </div>
        {progress.model && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/50 text-xs">
            <Zap className="w-3 h-3" />
            <span className="capitalize">{progress.model}</span>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      {isRunning && (
        <div className="flex items-center gap-1">
          {stages.slice(0, -1).map((stage, index) => {
            const isActive = stage === progress.stage;
            const isComplete = currentIndex > index;
            const isFailed = progress.stage === "failed" && index === currentIndex;
            
            return (
              <div key={stage} className="flex-1 flex items-center gap-1">
                <motion.div
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors duration-300",
                    isComplete ? "bg-green-500" : 
                    isActive ? "bg-blue-500" :
                    isFailed ? "bg-red-500" :
                    "bg-muted"
                  )}
                  initial={false}
                  animate={{
                    opacity: isActive ? [0.5, 1, 0.5] : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: isActive ? Infinity : 0,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Quality Score */}
      <AnimatePresence>
        {progress.qualityScore !== undefined && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <BarChart3 className="w-3.5 h-3.5" />
                Качество
              </span>
              <span className={cn(
                "font-medium",
                progress.qualityScore >= 80 ? "text-green-500" :
                progress.qualityScore >= 60 ? "text-amber-500" :
                "text-red-500"
              )}>
                {progress.qualityScore}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  progress.qualityScore >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                  progress.qualityScore >= 60 ? "bg-gradient-to-r from-amber-500 to-yellow-500" :
                  "bg-gradient-to-r from-red-500 to-orange-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress.qualityScore}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issues */}
      <AnimatePresence>
        {progress.issues && progress.issues.length > 0 && progress.stage !== "complete" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs space-y-1"
          >
            <p className="text-muted-foreground">Исправляю:</p>
            <div className="flex flex-wrap gap-1">
              {progress.issues.slice(0, 4).map((issue, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-background/50 text-muted-foreground"
                >
                  {issue}
                </span>
              ))}
              {progress.issues.length > 4 && (
                <span className="px-2 py-0.5 rounded-full bg-background/50 text-muted-foreground">
                  +{progress.issues.length - 4}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attempt indicator */}
      {progress.attempt && progress.attempt > 1 && (
        <p className="text-xs text-muted-foreground">
          Попытка {progress.attempt}/3
        </p>
      )}
    </motion.div>
  );
}

export default PipelineStatus;
