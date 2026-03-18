import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Brain, 
  Wrench, 
  FileCode, 
  Package, 
  CheckCircle2, 
  XCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AgentStepData {
  id: string;
  type: 'thinking' | 'tool_call' | 'tool_result' | 'file_created' | 'package_installed' | 'text' 
      | 'phase' | 'plan' | 'validation' | 'error' | 'complete' | 'epic' | 'story' | 'task' | 'intake';
  name?: string;
  content?: string;
  args?: Record<string, unknown>;
  success?: boolean;
  timestamp: number;
  duration?: number;
  phase?: string;
  model?: string;
  epicId?: string;
  storyId?: string;
  progress?: number;
}

interface AgentStepHistoryProps {
  steps: AgentStepData[];
  className?: string;
  defaultExpanded?: boolean;
}

export function AgentStepHistory({ steps, className, defaultExpanded = false }: AgentStepHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  if (!steps || steps.length === 0) return null;

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getStepIcon = (step: AgentStepData) => {
    switch (step.type) {
      case 'thinking':
        return <Brain className="h-4 w-4 text-purple-400" />;
      case 'phase':
        return <Sparkles className="h-4 w-4 text-primary" />;
      case 'plan':
        return <FileCode className="h-4 w-4 text-cyan-400" />;
      case 'validation':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'epic':
      case 'story':
      case 'task':
        return <Sparkles className="h-4 w-4 text-amber-400" />;
      case 'tool_call':
      case 'tool_result':
        if (step.name?.includes('file') || step.name?.includes('create') || step.name?.includes('edit')) {
          return <FileCode className="h-4 w-4 text-blue-400" />;
        }
        if (step.name?.includes('package') || step.name?.includes('install')) {
          return <Package className="h-4 w-4 text-green-400" />;
        }
        return <Wrench className="h-4 w-4 text-amber-400" />;
      case 'file_created':
        return <FileCode className="h-4 w-4 text-blue-400" />;
      case 'package_installed':
        return <Package className="h-4 w-4 text-green-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStepTitle = (step: AgentStepData) => {
    switch (step.type) {
      case 'thinking':
        return 'Размышление';
      case 'phase':
        return `Фаза: ${step.name || step.phase || 'processing'}`;
      case 'plan':
        return '📋 План работы';
      case 'validation':
        return step.success ? '✅ Валидация пройдена' : '⚠️ Найдены проблемы';
      case 'error':
        return '❌ Ошибка';
      case 'epic':
        return `🎯 Epic: ${step.name || 'task'}`;
      case 'story':
        return `📖 Story: ${step.name || 'story'}`;
      case 'task':
        return `✓ Task: ${step.name || 'task'}`;
      case 'tool_call':
        return `Вызов: ${step.name || 'tool'}`;
      case 'tool_result':
        return `Результат: ${step.name || 'tool'}`;
      case 'file_created':
        return `Файл создан`;
      case 'package_installed':
        return `Пакет установлен`;
      default:
        return step.name || 'Шаг';
    }
  };

  const thinkingSteps = steps.filter(s => s.type === 'thinking');
  const toolSteps = steps.filter(s => s.type === 'tool_call' || s.type === 'tool_result');
  const fileSteps = steps.filter(s => s.type === 'file_created' || s.name?.includes('create_file'));
  
  const summary = {
    thinking: thinkingSteps.length,
    tools: toolSteps.length,
    files: fileSteps.length,
  };

  return (
    <div className={cn("rounded-lg border border-border/50 bg-card/50 overflow-hidden", className)}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Действия агента</span>
        </div>
        
        {/* Summary badges */}
        <div className="flex items-center gap-2">
          {summary.thinking > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-purple-500/10 px-2 py-0.5 rounded-full">
              <Brain className="h-3 w-3" />
              {summary.thinking}
            </span>
          )}
          {summary.tools > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-amber-500/10 px-2 py-0.5 rounded-full">
              <Wrench className="h-3 w-3" />
              {summary.tools}
            </span>
          )}
          {summary.files > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-blue-500/10 px-2 py-0.5 rounded-full">
              <FileCode className="h-3 w-3" />
              {summary.files}
            </span>
          )}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 p-2 space-y-1 max-h-[400px] overflow-y-auto">
              {steps.map((step, index) => (
                <div key={step.id || index} className="rounded-md">
                  {/* Step header */}
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-muted/30 rounded-md transition-colors text-left"
                  >
                    {expandedSteps.has(step.id) ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                    
                    {getStepIcon(step)}
                    
                    <span className="text-sm flex-1 truncate">
                      {getStepTitle(step)}
                    </span>
                    
                    {step.success !== undefined && (
                      step.success ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      )
                    )}
                    
                    {step.duration !== undefined && step.duration > 0 ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" />
                        {step.duration}ms
                      </span>
                    ) : step.success !== undefined ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" />
                        &lt;1ms
                      </span>
                    ) : null}
                  </button>

                  {/* Step content */}
                  <AnimatePresence>
                    {expandedSteps.has(step.id) && step.content && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-8 mr-2 mb-2 p-2 rounded bg-muted/20 border border-border/30">
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words font-mono max-h-[200px] overflow-y-auto">
                            {typeof step.content === 'string' 
                              ? step.content 
                              : JSON.stringify(step.content, null, 2)
                            }
                          </pre>
                          
                          {step.args && Object.keys(step.args).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border/30">
                              <span className="text-xs text-muted-foreground font-medium">Args:</span>
                              <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words font-mono mt-1">
                                {JSON.stringify(step.args, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
