import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { VersionTimeline, type ProjectVersion } from './VersionTimeline';
import { createFileDiff, type FileDiff } from './DiffViewer';
import type { UnifiedState } from '@/hooks/useUnifiedOrchestrator';

export { createFileDiff };
export type { FileDiff, ProjectVersion };

interface TimelinePanelProps {
  // Orchestrator state
  orchestratorState: UnifiedState;
  
  // Version history
  versions?: ProjectVersion[];
  currentVersionId?: string;
  onRestoreVersion?: (versionId: string) => void;
  onPreviewVersion?: (versionId: string) => void;
  onCompareVersions?: (v1: string, v2: string) => void;
  
  // Diff view (kept for API compatibility)
  currentDiffs?: FileDiff[];
  showDiffViewer?: boolean;
  onCloseDiff?: () => void;
  
  // Layout
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function TimelinePanel({
  versions = [],
  currentVersionId,
  onRestoreVersion,
  onPreviewVersion,
  onCompareVersions,
  isOpen,
  onToggle,
  className,
}: TimelinePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "h-full border-l border-border bg-card overflow-hidden flex flex-col",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-sm">История версий</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Versions List - directly show versions */}
          <div className="flex-1 overflow-y-auto p-3">
            <VersionTimeline
              versions={versions}
              currentVersionId={currentVersionId}
              onRestore={onRestoreVersion}
              onPreview={onPreviewVersion}
              onCompare={onCompareVersions}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TimelinePanel;
