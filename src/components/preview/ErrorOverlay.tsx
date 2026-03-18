import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useCallback } from 'react';

interface ErrorOverlayProps {
  error: string | null;
  onShowLogs?: () => void;
  onTryFix?: (errorMessage?: string) => void;
  isFixing?: boolean;
}

export function ErrorOverlay({ 
  error, 
  onShowLogs, 
  onTryFix,
  isFixing = false
}: ErrorOverlayProps) {
  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!error) return;
    
    if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      onShowLogs?.();
    }
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      onTryFix?.(error);
    }
  }, [error, onShowLogs, onTryFix]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none z-50"
        >
          <motion.div 
            className="bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl p-4 min-w-[380px] max-w-md pointer-events-auto"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Error</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  The app encountered an error
                </p>
              </div>
            </div>
            
            {/* Error details (collapsed by default) */}
            {error && (
              <div className="mb-4 p-2 bg-muted/50 rounded-lg max-h-24 overflow-auto">
                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words">
                  {error}
                </pre>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 gap-2"
                onClick={onShowLogs}
              >
                Show logs
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded">L</kbd>
              </Button>
              <Button 
                size="sm"
                className="flex-1 gap-2 bg-neutral-800 hover:bg-neutral-700 text-white"
                onClick={() => onTryFix?.(error || undefined)}
                disabled={isFixing}
              >
                {isFixing ? 'Fixing...' : 'Try to fix'}
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-700 rounded">F</kbd>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ErrorOverlay;
