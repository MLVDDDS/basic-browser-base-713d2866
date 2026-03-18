/**
 * 🔘 TMA Button Component
 * 
 * Native-feeling button for Telegram Mini Apps.
 * Matches Telegram's design language.
 */

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface TMAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'full';
  /** Show loading state */
  loading?: boolean;
  /** Icon before text */
  icon?: React.ReactNode;
  /** Icon after text */
  iconAfter?: React.ReactNode;
  /** Enable haptic feedback */
  haptic?: boolean;
}

export const TMAButton = forwardRef<HTMLButtonElement, TMAButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconAfter,
      haptic = true,
      disabled,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const { haptic: hapticFeedback } = useTelegramWebApp();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback
      if (haptic && hapticFeedback && !disabled && !loading) {
        hapticFeedback.impactOccurred('light');
      }
      
      if (onClick && !disabled && !loading) {
        onClick(e);
      }
    };

    const variants = {
      primary: cn(
        'bg-tma-button text-tma-button-text',
        'hover:opacity-90 active:opacity-80',
        'shadow-sm'
      ),
      secondary: cn(
        'bg-tma-secondary-bg text-tma-text',
        'hover:opacity-90 active:opacity-80'
      ),
      outline: cn(
        'bg-transparent text-tma-link',
        'border border-tma-link',
        'hover:bg-tma-link/10 active:bg-tma-link/20'
      ),
      ghost: cn(
        'bg-transparent text-tma-link',
        'hover:bg-tma-hint/10 active:bg-tma-hint/20'
      ),
      destructive: cn(
        'bg-tma-destructive/10 text-tma-destructive',
        'hover:bg-tma-destructive/20 active:bg-tma-destructive/30'
      ),
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
      md: 'h-10 px-4 text-base rounded-xl gap-2',
      lg: 'h-12 px-6 text-lg rounded-xl gap-2.5',
      full: 'h-12 px-6 text-base rounded-xl gap-2 w-full',
    };

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium',
          'transition-all duration-150',
          'select-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-tma-link/50',
          
          // Active state animation
          'active:scale-[0.97]',
          
          // Variant styles
          variants[variant],
          
          // Size styles
          sizes[size],
          
          // Disabled state
          (disabled || loading) && 'opacity-50 pointer-events-none',
          
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
            {iconAfter && <span className="shrink-0">{iconAfter}</span>}
          </>
        )}
      </button>
    );
  }
);

TMAButton.displayName = 'TMAButton';

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default TMAButton;
