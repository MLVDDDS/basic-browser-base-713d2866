import { motion } from "framer-motion";
import { Wrench, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoFixIndicatorProps {
  isAutoFixing: boolean;
  attempt: number;
  maxAttempts: number;
  currentScore?: number;
  className?: string;
}

export function AutoFixIndicator({
  isAutoFixing,
  attempt,
  maxAttempts,
  currentScore,
  className,
}: AutoFixIndicatorProps) {
  if (!isAutoFixing && attempt === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border",
        isAutoFixing
          ? "bg-amber-500/10 border-amber-500/30"
          : "bg-green-500/10 border-green-500/30",
        className
      )}
    >
      {/* Icon */}
      <div className="relative">
        {isAutoFixing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Wrench className="w-5 h-5 text-amber-500" />
          </motion.div>
        ) : (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {isAutoFixing ? "Исправляю ошибки..." : "Авто-исправление завершено"}
          </span>
          {isAutoFixing && (
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isAutoFixing
            ? `Попытка ${attempt} из ${maxAttempts}`
            : `Выполнено ${attempt} ${attempt === 1 ? "попытка" : "попытки"}`}
          {currentScore !== undefined && (
            <span className="ml-2">
              • Score: <span className={cn(
                "font-mono font-medium",
                currentScore >= 70 ? "text-green-500" : "text-amber-500"
              )}>{currentScore}</span>
            </span>
          )}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxAttempts }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "w-2 h-2 rounded-full",
              i < attempt
                ? "bg-amber-500"
                : isAutoFixing && i === attempt
                ? "bg-amber-500/50 animate-pulse"
                : "bg-muted"
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}
