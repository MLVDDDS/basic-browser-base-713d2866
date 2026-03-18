/**
 * 📋 TMA Action Sheet Component
 * 
 * iOS-style action sheet with grouped actions.
 * Perfect for contextual menus and confirmations.
 */

import { cn } from '@/lib/utils';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ActionSheetAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  /** Action style */
  variant?: 'default' | 'destructive' | 'primary';
  /** Disable this action */
  disabled?: boolean;
  /** Called when action is selected */
  onSelect: () => void;
}

export interface ActionSheetGroup {
  title?: string;
  actions: ActionSheetAction[];
}

interface TMAActionSheetProps {
  /** Whether sheet is open */
  open: boolean;
  /** Called when sheet should close */
  onOpenChange: (open: boolean) => void;
  /** Sheet title */
  title?: string;
  /** Optional description */
  description?: string;
  /** Action groups */
  groups: ActionSheetGroup[];
  /** Cancel button label */
  cancelLabel?: string;
  /** Show cancel button */
  showCancel?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function TMAActionSheet({
  open,
  onOpenChange,
  title,
  description,
  groups,
  cancelLabel = 'Cancel',
  showCancel = true,
}: TMAActionSheetProps) {
  const { haptic } = useTelegramWebApp();

  const handleAction = (action: ActionSheetAction) => {
    if (action.disabled) return;
    
    // Haptic feedback
    if (haptic) {
      if (action.variant === 'destructive') {
        haptic.notificationOccurred('warning');
      } else {
        haptic.impactOccurred('light');
      }
    }
    
    action.onSelect();
    onOpenChange(false);
  };

  const handleCancel = () => {
    haptic?.impactOccurred('light');
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Sheet container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 px-2 pb-safe-bottom pb-2"
          >
            {/* Main sheet */}
            <div className="bg-tma-card/95 backdrop-blur-xl rounded-2xl overflow-hidden mb-2">
              {/* Header */}
              {(title || description) && (
                <div className="px-4 py-3 text-center border-b border-tma-border/10">
                  {title && (
                    <h3 className="text-sm font-medium text-tma-hint">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="text-xs text-tma-hint/70 mt-1">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* Action groups */}
              {groups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Group title */}
                  {group.title && (
                    <div className="px-4 py-2 bg-tma-bg/50">
                      <p className="text-xs font-medium text-tma-hint uppercase tracking-wide">
                        {group.title}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="divide-y divide-tma-border/10">
                    {group.actions.map((action) => (
                      <button
                        key={action.key}
                        onClick={() => handleAction(action)}
                        disabled={action.disabled}
                        className={cn(
                          'w-full px-4 py-3.5',
                          'flex items-center justify-center gap-2',
                          'text-base font-medium',
                          'transition-colors active:bg-tma-hint/10',
                          
                          // Variant styles
                          action.variant === 'destructive' && 'text-tma-destructive',
                          action.variant === 'primary' && 'text-tma-link',
                          action.variant !== 'destructive' && action.variant !== 'primary' && 'text-tma-link',
                          
                          // Disabled
                          action.disabled && 'opacity-40 pointer-events-none'
                        )}
                      >
                        {action.icon && (
                          <span className="shrink-0">{action.icon}</span>
                        )}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Cancel button */}
            {showCancel && (
              <button
                onClick={handleCancel}
                className={cn(
                  'w-full py-3.5 rounded-2xl',
                  'bg-tma-card/95 backdrop-blur-xl',
                  'text-base font-semibold text-tma-link',
                  'active:bg-tma-hint/10'
                )}
              >
                {cancelLabel}
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK FOR PROGRAMMATIC USAGE
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';

export function useTMAActionSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Omit<TMAActionSheetProps, 'open' | 'onOpenChange'>>({
    groups: [],
  });

  const showActionSheet = useCallback(
    (options: Omit<TMAActionSheetProps, 'open' | 'onOpenChange'>) => {
      setConfig(options);
      setIsOpen(true);
    },
    []
  );

  const hideActionSheet = useCallback(() => {
    setIsOpen(false);
  }, []);

  const ActionSheetComponent = useCallback(
    () => (
      <TMAActionSheet
        {...config}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    ),
    [isOpen, config]
  );

  return {
    showActionSheet,
    hideActionSheet,
    ActionSheet: ActionSheetComponent,
  };
}

export default TMAActionSheet;
