/**
 * 🔔 TMA Toast / Bottom Sheet Component
 * 
 * Bottom-sliding notification and sheet for Telegram Mini Apps.
 * Supports toast notifications and draggable bottom sheets.
 */

import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface TMAToastContextValue {
  toasts: ToastData[];
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  hideToast: (id: string) => void;
  clearAll: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const TMAToastContext = createContext<TMAToastContextValue | null>(null);

export function useTMAToast() {
  const context = useContext(TMAToastContext);
  if (!context) {
    throw new Error('useTMAToast must be used within TMAToastProvider');
  }
  return context;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

interface TMAToastProviderProps {
  children: React.ReactNode;
}

export function TMAToastProvider({ children }: TMAToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const { haptic } = useTelegramWebApp();

  const showToast = useCallback(
    (toast: Omit<ToastData, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      
      // Haptic feedback based on type
      if (haptic) {
        if (toast.type === 'success') {
          haptic.notificationOccurred('success');
        } else if (toast.type === 'error') {
          haptic.notificationOccurred('error');
        } else if (toast.type === 'warning') {
          haptic.notificationOccurred('warning');
        } else {
          haptic.impactOccurred('light');
        }
      }

      setToasts((prev) => [...prev, { ...toast, id }]);

      // Auto-dismiss
      const duration = toast.duration ?? 3000;
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    [haptic]
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <TMAToastContext.Provider value={{ toasts, showToast, hideToast, clearAll }}>
      {children}
      <TMAToastContainer />
    </TMAToastContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TOAST CONTAINER
// ═══════════════════════════════════════════════════════════════════════════

function TMAToastContainer() {
  const { toasts, hideToast } = useTMAToast();

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] pointer-events-none pb-safe-bottom p-4">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <TMAToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => hideToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TOAST ITEM
// ═══════════════════════════════════════════════════════════════════════════

interface TMAToastItemProps {
  toast: ToastData;
  onDismiss: () => void;
}

function TMAToastItem({ toast, onDismiss }: TMAToastItemProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-tma-destructive" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-tma-link" />,
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 50 || info.velocity.y > 500) {
      onDismiss();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className={cn(
        'pointer-events-auto mb-2',
        'bg-tma-card backdrop-blur-xl',
        'rounded-xl shadow-lg',
        'border border-tma-border/20',
        'p-4',
        'flex items-start gap-3',
        'cursor-grab active:cursor-grabbing'
      )}
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-tma-text">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-tma-hint mt-0.5">{toast.description}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-tma-link active:opacity-70"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 rounded-full hover:bg-tma-hint/10 active:bg-tma-hint/20"
      >
        <X className="w-4 h-4 text-tma-hint" />
      </button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOTTOM SHEET
// ═══════════════════════════════════════════════════════════════════════════

interface TMABottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  /** Height as percentage of viewport (0-100) */
  height?: number;
  /** Allow dragging to dismiss */
  draggable?: boolean;
}

export function TMABottomSheet({
  open,
  onOpenChange,
  children,
  title,
  height = 50,
  draggable = true,
}: TMABottomSheetProps) {
  const { haptic } = useTelegramWebApp();

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      haptic?.impactOccurred('light');
      onOpenChange(false);
    }
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
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag={draggable ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ height: `${height}vh` }}
            className={cn(
              'fixed inset-x-0 bottom-0 z-50',
              'bg-tma-bg rounded-t-3xl',
              'shadow-2xl',
              'flex flex-col',
              'pb-safe-bottom'
            )}
          >
            {/* Drag handle */}
            {draggable && (
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-tma-hint/30" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="px-4 pb-3 border-b border-tma-border/10">
                <h2 className="text-lg font-semibold text-tma-text text-center">
                  {title}
                </h2>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default TMAToastProvider;
