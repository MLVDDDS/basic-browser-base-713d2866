import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight,
  FileEdit,
  Eye,
  Wrench,
  Loader2,
  CheckCircle2,
  XCircle,
  Link2
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { AgentStep } from '@/hooks/useUnifiedOrchestrator';

interface AgentMessageBlockProps {
  content: string;
  steps: AgentStep[];
  isComplete?: boolean;
  thinkingDuration?: number;
  mode?: 'light' | 'low' | 'medium' | 'high' | null;
}

// Count files created/edited from steps
function countFilesFromSteps(steps: AgentStep[]): number {
  const fileActions = new Set<string>();
  steps.forEach(step => {
    if (step.type === 'tool_result' && step.data) {
      const data = step.data as { path?: string; action?: string };
      if (data.path) {
        fileActions.add(data.path);
      }
    }
  });
  return fileActions.size;
}

// Count tools used
function countToolsFromSteps(steps: AgentStep[]): number {
  return steps.filter(s => s.type === 'tool_call').length;
}

// Compact tools/edits badge with collapsible
function ToolsBadge({ steps }: { steps: AgentStep[] }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const toolCalls = steps.filter(s => s.type === 'tool_call');
  const toolCount = toolCalls.length;
  
  if (toolCount === 0) return null;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-full transition-colors border border-border/50">
          <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-foreground">{toolCount} tools used</span>
          <span className="text-xs text-muted-foreground hover:text-foreground ml-1">
            {isOpen ? 'Hide' : 'Show all'}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 space-y-1 pl-1"
        >
          {toolCalls.map((step, i) => {
            const resultStep = steps.find(
              s => s.type === 'tool_result' && s.id === step.id
            );
            const data = step.data as { path?: string } | undefined;
            
            return (
              <div 
                key={step.id} 
                className="flex items-center gap-2 text-xs text-muted-foreground py-0.5"
              >
                {resultStep?.success === false ? (
                  <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                ) : resultStep?.success === true ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                ) : (
                  <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
                )}
                <span className="font-medium text-foreground">{step.name || 'Tool'}</span>
                {data?.path && (
                  <code className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono truncate max-w-[150px]">
                    {data.path.split('/').pop()}
                  </code>
                )}
              </div>
            );
          })}
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Edits made badge with collapsible details
function EditsBadge({ steps }: { steps: AgentStep[] }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const fileEdits = useMemo(() => {
    const edits: Array<{ path: string; action: string }> = [];
    steps.forEach(step => {
      if (step.type === 'tool_result' && step.data) {
        const data = step.data as { path?: string; action?: string };
        if (data.path && data.action) {
          edits.push({ path: data.path, action: data.action });
        }
      }
    });
    return edits;
  }, [steps]);
  
  if (fileEdits.length === 0) return null;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-full transition-colors border border-border/50">
          <FileEdit className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-foreground">{fileEdits.length} edit{fileEdits.length > 1 ? 's' : ''} made</span>
          <span className="text-xs text-muted-foreground hover:text-foreground ml-1">
            {isOpen ? 'Hide' : 'Show all'}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 space-y-1 pl-1"
        >
          {fileEdits.map((edit, i) => (
            <div 
              key={`${edit.path}-${i}`} 
              className="flex items-center gap-2 text-xs py-0.5"
            >
              {edit.action === 'created' ? (
                <span className="text-green-500 font-bold">+</span>
              ) : edit.action === 'deleted' ? (
                <span className="text-red-500 font-bold">−</span>
              ) : (
                <span className="text-yellow-500 font-bold">~</span>
              )}
              <span className={cn(
                'font-medium',
                edit.action === 'created' && 'text-green-600 dark:text-green-400',
                edit.action === 'deleted' && 'text-red-600 dark:text-red-400 line-through',
                edit.action === 'modified' && 'text-yellow-600 dark:text-yellow-400'
              )}>
                {edit.action === 'created' ? 'Created' : 
                 edit.action === 'deleted' ? 'Deleted' : 'Edited'}
              </span>
              <code className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                {edit.path.split('/').pop()}
              </code>
            </div>
          ))}
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AgentMessageBlock({ 
  content, 
  steps, 
  isComplete,
  thinkingDuration,
  mode
}: AgentMessageBlockProps) {
  const filesCount = countFilesFromSteps(steps);
  const toolsCount = countToolsFromSteps(steps);
  
  // Generate a compact summary message
  const summaryMessage = useMemo(() => {
    if (content && content.trim().length > 0) {
      // If content already starts with emoji, use as is
      if (content.startsWith('✅') || content.startsWith('❌')) {
        return content;
      }
      // Check if this is a completion message
      if (filesCount > 0) {
        return `✅ Готово. Создано ${filesCount} файлов.`;
      }
      return content;
    }
    if (filesCount > 0) {
      return `✅ Готово. Создано ${filesCount} файлов.`;
    }
    return '✅ Готово.';
  }, [content, filesCount]);

  return (
    <div className="space-y-2">
      {/* Main summary message */}
      <div className="text-sm text-foreground">
        {summaryMessage}
      </div>
      
      {/* Tools used badge */}
      {toolsCount > 0 && (
        <ToolsBadge steps={steps} />
      )}
      
      {/* Edits badge - optional, shown if there are file edits */}
      {filesCount > 0 && (
        <EditsBadge steps={steps} />
      )}
    </div>
  );
}

export default AgentMessageBlock;
