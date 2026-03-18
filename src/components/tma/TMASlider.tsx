/**
 * 📊 TMA Slider Component
 * 
 * Touch-optimized range slider for Telegram Mini Apps.
 * Includes haptic feedback on value changes.
 */

import { forwardRef, useCallback, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface TMASliderProps {
  /** Current value */
  value?: number;
  /** Default value */
  defaultValue?: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Called when value changes */
  onValueChange?: (value: number) => void;
  /** Called when drag ends */
  onValueCommit?: (value: number) => void;
  /** Disable interaction */
  disabled?: boolean;
  /** Show value label above thumb */
  showValue?: boolean;
  /** Format value for display */
  formatValue?: (value: number) => string;
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Additional classes */
  className?: string;
}

export const TMASlider = forwardRef<HTMLDivElement, TMASliderProps>(
  (
    {
      value: controlledValue,
      defaultValue = 0,
      min = 0,
      max = 100,
      step = 1,
      onValueChange,
      onValueCommit,
      disabled = false,
      showValue = false,
      formatValue = (v) => String(Math.round(v)),
      haptic = true,
      className,
    },
    ref
  ) => {
    const { haptic: hapticFeedback } = useTelegramWebApp();
    const trackRef = useRef<HTMLDivElement>(null);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isDragging, setIsDragging] = useState(false);
    const lastHapticValue = useRef<number>(0);

    const value = controlledValue ?? internalValue;
    const percentage = ((value - min) / (max - min)) * 100;

    const triggerHaptic = useCallback(() => {
      if (haptic && hapticFeedback) {
        hapticFeedback.selectionChanged();
      }
    }, [haptic, hapticFeedback]);

    const updateValue = useCallback(
      (clientX: number) => {
        if (!trackRef.current || disabled) return;

        const rect = trackRef.current.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const rawValue = min + percentage * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;
        const clampedValue = Math.max(min, Math.min(max, steppedValue));

        // Trigger haptic on step changes
        if (Math.floor(clampedValue / step) !== Math.floor(lastHapticValue.current / step)) {
          triggerHaptic();
          lastHapticValue.current = clampedValue;
        }

        if (controlledValue === undefined) {
          setInternalValue(clampedValue);
        }
        onValueChange?.(clampedValue);
      },
      [min, max, step, disabled, controlledValue, onValueChange, triggerHaptic]
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragging(true);
        updateValue(e.clientX);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      },
      [disabled, updateValue]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!isDragging) return;
        updateValue(e.clientX);
      },
      [isDragging, updateValue]
    );

    const handlePointerUp = useCallback(
      (e: React.PointerEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        onValueCommit?.(value);
        
        if (haptic && hapticFeedback) {
          hapticFeedback.impactOccurred('light');
        }
      },
      [isDragging, value, onValueCommit, haptic, hapticFeedback]
    );

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center py-4',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
      >
        {/* Track */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative h-2 w-full rounded-full bg-tma-hint/30 cursor-pointer"
        >
          {/* Filled track */}
          <div
            className="absolute h-full rounded-full bg-tma-button transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
          
          {/* Thumb */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
              'w-6 h-6 rounded-full bg-white shadow-md',
              'border-2 border-tma-button',
              'transition-transform duration-75',
              isDragging && 'scale-110',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-tma-link/50'
            )}
            style={{ left: `${percentage}%` }}
          >
            {/* Value label */}
            {showValue && isDragging && (
              <div
                className={cn(
                  'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
                  'px-2 py-1 rounded-md',
                  'bg-tma-button text-tma-button-text',
                  'text-xs font-medium whitespace-nowrap',
                  'shadow-md'
                )}
              >
                {formatValue(value)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

TMASlider.displayName = 'TMASlider';

export default TMASlider;
