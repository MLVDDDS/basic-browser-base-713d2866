import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ThinkingSection } from './ThinkingSection';
import { TaskStep } from './TaskStep';
import { FileBadge } from './FileBadge';
import { StreamingContent } from './StreamingContent';

export interface AgentStep {
  id: string;
  type: 'thinking' | 'tool_use' | 'text' | 'file_change';
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  content?: string;
  data?: Record<string, unknown>;
  duration?: number;
  startTime?: number;
}

interface AgentProgressProps {
  steps: AgentStep[];
  currentStep: AgentStep | null;
  thinkingContent: string;
  streamedContent: string;
  files: Array<{ path: string; action: 'created' | 'modified' }>;
  isRunning: boolean;
  onFileClick?: (path: string) => void;
}

export const AgentProgress = forwardRef<HTMLDivElement, AgentProgressProps>(function AgentProgress({
  steps,
  currentStep,
  thinkingContent,
  streamedContent,
  files,
  isRunning,
  onFileClick
}, ref) {
  return (
    <div className="space-y-3">
      {/* Completed steps */}
      {steps.map((step) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {step.type === 'thinking' ? (
            <ThinkingSection
              content={step.content || ''}
              duration={step.duration}
              isActive={false}
            />
          ) : (
            <TaskStep
              id={step.id}
              type={step.type}
              label={step.label}
              status={step.status}
              content={step.content}
              data={step.data}
              duration={step.duration}
            />
          )}
        </motion.div>
      ))}

      {/* Current step */}
      {currentStep && (
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {currentStep.type === 'thinking' ? (
            <ThinkingSection
              content={thinkingContent}
              isActive={true}
            />
          ) : (
            <TaskStep
              id={currentStep.id}
              type={currentStep.type}
              label={currentStep.label}
              status="active"
              data={currentStep.data}
            />
          )}
        </motion.div>
      )}

      {/* Streamed content */}
      {streamedContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-muted/30 rounded-lg border border-border"
        >
          <StreamingContent
            content={streamedContent}
            isStreaming={isRunning}
          />
        </motion.div>
      )}

      {/* Generated files */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4"
        >
          <p className="text-xs text-muted-foreground mb-2">Файлы:</p>
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <FileBadge
                key={file.path}
                filename={file.path.split('/').pop() || file.path}
                action={file.action}
                onClick={() => onFileClick?.(file.path)}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
});
