/**
 * 🔘 TMA Switch Component
 * 
 * Native iOS-style toggle switch for Telegram Mini Apps.
 * Includes haptic feedback on state change.
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { motion } from 'framer-motion';

interface TMASwitchProps {
  /** Current checked state */
  checked?: boolean;
  /** Called when state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Disable interaction */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Additional classes */
  className?: string;
  /** Accessible label */
  'aria-label'?: string;
}

export const TMASwitch = forwardRef<HTMLButtonElement, TMASwitchProps>(
  (
    {
      checked = false,
      onCheckedChange,
      disabled = false,
      size = 'md',
      haptic = true,
      className,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const { haptic: hapticFeedback } = useTelegramWebApp();

    const handleClick = () => {
      if (disabled) return;
      
      if (haptic && hapticFeedback) {
        hapticFeedback.impactOccurred('light');
      }
      
      onCheckedChange?.(!checked);
    };

    const sizes = {
      sm: { track: 'w-9 h-5', thumb: 'w-4 h-4', translate: 'translate-x-4' },
      md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
      lg: { track: 'w-14 h-8', thumb: 'w-7 h-7', translate: 'translate-x-6' },
    };

    const currentSize = sizes[size];

    return (
      <button
        ref={ref}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          // Track styles
          'relative inline-flex shrink-0 cursor-pointer items-center rounded-full',
          'transition-colors duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-tma-link/50',
          currentSize.track,
          
          // Background color based on state
          checked ? 'bg-tma-button' : 'bg-tma-hint/30',
          
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed',
          
          className
        )}
      >
        <motion.span
          layout
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className={cn(
            // Thumb styles
            'pointer-events-none inline-block rounded-full',
            'bg-white shadow-sm',
            'transform ring-0',
            currentSize.thumb,
            
            // Position
            checked ? currentSize.translate : 'translate-x-0.5'
          )}
        />
      </button>
    );
  }
);

TMASwitch.displayName = 'TMASwitch';

export default TMASwitch;
