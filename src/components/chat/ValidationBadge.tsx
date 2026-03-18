import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { ValidationState } from "@/hooks/useUnifiedOrchestrator";
import { cn } from "@/lib/utils";

interface ValidationBadgeProps {
  validation: ValidationState;
  className?: string;
}

const categoryLabels: Record<string, string> = {
  typescript: 'TypeScript',
  syntax: 'Синтаксис',
  structure: 'Структура',
  css: 'CSS/Tailwind',
  a11y: 'Доступность',
  style: 'Стиль кода',
};

const categoryIcons: Record<string, React.ReactNode> = {
  typescript: <span className="text-blue-500">TS</span>,
  syntax: <span className="text-yellow-500">{ }</span>,
  structure: <span className="text-purple-500">◫</span>,
  css: <span className="text-cyan-500">🎨</span>,
  a11y: <span className="text-green-500">♿</span>,
  style: <span className="text-orange-500">✨</span>,
};

export function ValidationBadge({ validation, className }: ValidationBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const { valid, score, summary, issuesByCategory } = validation;

  const getScoreColor = () => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = () => {
    if (score >= 90) return 'bg-green-500/10 border-green-500/20';
    if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/20';
    if (score >= 50) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const hasIssues = Object.keys(issuesByCategory || {}).length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border p-3 text-sm",
        getScoreBg(),
        className
      )}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => hasIssues && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {valid ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="font-medium">
            {valid ? 'Валидация пройдена' : 'Найдены проблемы'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Summary badges */}
          <div className="flex items-center gap-1.5 text-xs">
            {summary.errors > 0 && (
              <span className="flex items-center gap-0.5 text-red-500">
                <AlertCircle className="w-3 h-3" />
                {summary.errors}
              </span>
            )}
            {summary.warnings > 0 && (
              <span className="flex items-center gap-0.5 text-yellow-500">
                <AlertTriangle className="w-3 h-3" />
                {summary.warnings}
              </span>
            )}
            {summary.info > 0 && (
              <span className="flex items-center gap-0.5 text-blue-500">
                <Info className="w-3 h-3" />
                {summary.info}
              </span>
            )}
          </div>
          
          {/* Score */}
          <div className={cn("font-mono font-bold", getScoreColor())}>
            {score}/100
          </div>
          
          {/* Expand toggle */}
          {hasIssues && (
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && issuesByCategory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
              {Object.entries(issuesByCategory).map(([category, issues]) => (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    {categoryIcons[category]}
                    <span>{categoryLabels[category] || category}</span>
                    <span className="text-muted-foreground/60">({issues.length})</span>
                  </div>
                  
                  <div className="space-y-1 pl-4">
                    {issues.slice(0, 5).map((issue, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "text-xs flex items-start gap-1.5 py-0.5",
                          issue.type === 'error' && 'text-red-400',
                          issue.type === 'warning' && 'text-yellow-400',
                          issue.type === 'info' && 'text-blue-400'
                        )}
                      >
                        {issue.type === 'error' && <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />}
                        {issue.type === 'warning' && <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />}
                        {issue.type === 'info' && <Info className="w-3 h-3 mt-0.5 shrink-0" />}
                        <div>
                          <span className="font-mono text-muted-foreground">{issue.file.split('/').pop()}</span>
                          {issue.line && <span className="text-muted-foreground/60">:{issue.line}</span>}
                          <span className="mx-1">—</span>
                          <span>{issue.message}</span>
                          {issue.suggestion && (
                            <p className="text-muted-foreground/70 mt-0.5">
                              💡 {issue.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {issues.length > 5 && (
                      <p className="text-xs text-muted-foreground/60 pl-4">
                        + ещё {issues.length - 5} проблем
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
