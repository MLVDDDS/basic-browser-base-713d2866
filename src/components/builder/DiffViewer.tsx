import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCode, 
  ChevronRight, 
  ChevronDown, 
  Plus,
  Minus,
  Equal,
  Copy,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  lineNumber: number;
  oldLineNumber?: number;
}

export interface FileDiff {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  hunks: DiffLine[][];
  additions: number;
  deletions: number;
}

interface DiffViewerProps {
  diffs: FileDiff[];
  title?: string;
  onClose?: () => void;
  className?: string;
}

// Simple diff algorithm to generate line-by-line comparison
function generateDiffLines(before: string, after: string): DiffLine[][] {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const hunks: DiffLine[][] = [];
  let currentHunk: DiffLine[] = [];
  
  // Simple LCS-based diff for small files
  const maxLines = Math.max(beforeLines.length, afterLines.length);
  let oldLine = 1;
  let newLine = 1;
  
  for (let i = 0; i < maxLines; i++) {
    const oldContent = beforeLines[i] ?? null;
    const newContent = afterLines[i] ?? null;
    
    if (oldContent === newContent) {
      // Context line
      if (currentHunk.length > 0 || (i > 0 && i < maxLines - 1)) {
        currentHunk.push({
          type: 'context',
          content: oldContent || '',
          lineNumber: newLine,
          oldLineNumber: oldLine,
        });
      }
      oldLine++;
      newLine++;
    } else {
      if (oldContent !== null && !afterLines.includes(oldContent)) {
        currentHunk.push({
          type: 'remove',
          content: oldContent,
          lineNumber: newLine,
          oldLineNumber: oldLine,
        });
        oldLine++;
      }
      if (newContent !== null && !beforeLines.includes(newContent)) {
        currentHunk.push({
          type: 'add',
          content: newContent,
          lineNumber: newLine,
        });
        newLine++;
      }
    }
    
    // Split hunks at natural breaks
    if (currentHunk.length > 20) {
      hunks.push(currentHunk);
      currentHunk = [];
    }
  }
  
  if (currentHunk.length > 0) {
    hunks.push(currentHunk);
  }
  
  return hunks.length > 0 ? hunks : [[{ type: 'context', content: '(no changes)', lineNumber: 1 }]];
}

export function DiffViewer({
  diffs,
  title = 'Изменения',
  onClose,
  className,
}: DiffViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(
    new Set(diffs.slice(0, 3).map(d => d.path))
  );
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const toggleFile = (path: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const copyPath = async (path: string) => {
    await navigator.clipboard.writeText(path);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const stats = useMemo(() => ({
    additions: diffs.reduce((sum, d) => sum + d.additions, 0),
    deletions: diffs.reduce((sum, d) => sum + d.deletions, 0),
    files: diffs.length,
  }), [diffs]);

  if (diffs.length === 0) {
    return (
      <div className={cn(
        "rounded-xl border border-border bg-card p-6 text-center",
        className
      )}>
        <Equal className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">Нет изменений</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm">{title}</span>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-green-500">
              <Plus className="w-3 h-3" />
              {stats.additions}
            </span>
            <span className="flex items-center gap-1 text-red-500">
              <Minus className="w-3 h-3" />
              {stats.deletions}
            </span>
            <span className="text-muted-foreground">
              {stats.files} файл{stats.files > 1 ? (stats.files < 5 ? 'а' : 'ов') : ''}
            </span>
          </div>
        </div>
        
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Files list */}
      <ScrollArea className="max-h-[500px]">
        <div className="divide-y divide-border">
          {diffs.map((diff) => {
            const isExpanded = expandedFiles.has(diff.path);
            const isCopied = copiedFile === diff.path;
            
            return (
              <div key={diff.path}>
                {/* File header */}
                <button
                  onClick={() => toggleFile(diff.path)}
                  className="w-full flex items-center gap-2 p-2.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="text-muted-foreground">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  
                  <FileCode className={cn(
                    "w-4 h-4",
                    diff.status === 'added' && "text-green-500",
                    diff.status === 'deleted' && "text-red-500",
                    diff.status === 'modified' && "text-blue-500"
                  )} />
                  
                  <span className="flex-1 text-left text-sm font-mono truncate">
                    {diff.path}
                  </span>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium",
                      diff.status === 'added' && "bg-green-500/10 text-green-600",
                      diff.status === 'deleted' && "bg-red-500/10 text-red-600",
                      diff.status === 'modified' && "bg-blue-500/10 text-blue-600"
                    )}>
                      {diff.status === 'added' ? 'Добавлен' : 
                       diff.status === 'deleted' ? 'Удалён' : 'Изменён'}
                    </span>
                    
                    {diff.additions > 0 && (
                      <span className="text-green-500">+{diff.additions}</span>
                    )}
                    {diff.deletions > 0 && (
                      <span className="text-red-500">-{diff.deletions}</span>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPath(diff.path);
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </button>
                
                {/* Diff content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-muted/20 border-t border-border">
                        {diff.hunks.map((hunk, hunkIndex) => (
                          <div key={hunkIndex} className="font-mono text-xs">
                            {hunk.map((line, lineIndex) => (
                              <div
                                key={`${hunkIndex}-${lineIndex}`}
                                className={cn(
                                  "flex",
                                  line.type === 'add' && "bg-green-500/10",
                                  line.type === 'remove' && "bg-red-500/10"
                                )}
                              >
                                {/* Line number */}
                                <span className={cn(
                                  "w-12 px-2 py-0.5 text-right text-muted-foreground select-none border-r border-border shrink-0",
                                  line.type === 'add' && "bg-green-500/5",
                                  line.type === 'remove' && "bg-red-500/5"
                                )}>
                                  {line.type === 'remove' ? line.oldLineNumber : line.lineNumber}
                                </span>
                                
                                {/* Symbol */}
                                <span className={cn(
                                  "w-6 text-center py-0.5 shrink-0",
                                  line.type === 'add' && "text-green-500",
                                  line.type === 'remove' && "text-red-500"
                                )}>
                                  {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                                </span>
                                
                                {/* Content */}
                                <span className="flex-1 py-0.5 pr-2 whitespace-pre overflow-x-auto">
                                  {line.content || ' '}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </motion.div>
  );
}

// Helper to create FileDiff from before/after content
export function createFileDiff(
  path: string, 
  before: string | null, 
  after: string | null
): FileDiff {
  const status = before === null ? 'added' : after === null ? 'deleted' : 'modified';
  const hunks = generateDiffLines(before || '', after || '');
  
  let additions = 0;
  let deletions = 0;
  hunks.forEach(hunk => {
    hunk.forEach(line => {
      if (line.type === 'add') additions++;
      if (line.type === 'remove') deletions++;
    });
  });
  
  return { path, status, hunks, additions, deletions };
}

export default DiffViewer;
