/**
 * 📱 TMA Layout Component
 * 
 * Wrapper layout specifically designed for Telegram Mini Apps.
 * Handles safe areas, proper spacing, and TMA-optimized styling.
 */

import { cn } from '@/lib/utils';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface TMALayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Show header area with back button space */
  hasHeader?: boolean;
  /** Show bottom navigation/action area */
  hasBottomNav?: boolean;
  /** Background style variant */
  variant?: 'default' | 'card' | 'gradient';
}

export function TMALayout({
  children,
  className,
  hasHeader = false,
  hasBottomNav = false,
  variant = 'default',
}: TMALayoutProps) {
  const { isTMA, isExpanded, viewportHeight } = useTelegramWebApp();

  const bgVariants = {
    default: 'bg-tma-bg',
    card: 'bg-tma-card',
    gradient: 'bg-gradient-to-b from-tma-bg to-tma-card',
  };

  return (
    <div
      className={cn(
        // Base styles
        'tma-layout w-full min-h-screen',
        'flex flex-col',
        bgVariants[variant],
        'text-tma-text',
        
        // Safe area padding
        'pt-safe-top pb-safe-bottom',
        'px-safe-left pr-safe-right',
        
        // Header space
        hasHeader && 'pt-[env(safe-area-inset-top,_44px)]',
        
        // Bottom nav space
        hasBottomNav && 'pb-[calc(env(safe-area-inset-bottom,_34px)_+_60px)]',
        
        className
      )}
      style={{
        // Use Telegram's viewport height if available
        minHeight: isTMA && viewportHeight > 0 ? `${viewportHeight}px` : '100vh',
        // Prevent overscroll bounce
        overscrollBehavior: 'none',
      }}
      data-tma-layout="true"
      data-tma-expanded={isExpanded}
    >
      {children}
    </div>
  );
}

/**
 * TMA Header Component
 * Standard header with back button area and title
 */
interface TMAHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export function TMAHeader({ title, subtitle, className, children }: TMAHeaderProps) {
  return (
    <header
      className={cn(
        'tma-header',
        'sticky top-0 z-50',
        'bg-tma-header backdrop-blur-md',
        'px-4 py-3',
        'border-b border-tma-border/10',
        'pt-[calc(env(safe-area-inset-top,_0px)_+_12px)]',
        className
      )}
    >
      {children || (
        <div className="flex flex-col">
          {title && (
            <h1 className="text-lg font-semibold text-tma-text truncate">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm text-tma-hint truncate">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </header>
  );
}

/**
 * TMA Content Area
 * Main scrollable content area with proper padding
 */
interface TMAContentProps {
  children: React.ReactNode;
  className?: string;
  /** Add standard padding */
  padded?: boolean;
}

export function TMAContent({ children, className, padded = true }: TMAContentProps) {
  return (
    <main
      className={cn(
        'tma-content',
        'flex-1 overflow-y-auto overflow-x-hidden',
        'overscroll-contain',
        padded && 'px-4 py-4',
        className
      )}
    >
      {children}
    </main>
  );
}

/**
 * TMA Bottom Navigation / Action Area
 * Fixed bottom area for navigation or action buttons
 */
interface TMABottomNavProps {
  children: React.ReactNode;
  className?: string;
  /** Add blur backdrop */
  blur?: boolean;
}

export function TMABottomNav({ children, className, blur = true }: TMABottomNavProps) {
  return (
    <nav
      className={cn(
        'tma-bottom-nav',
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-tma-bg/95',
        blur && 'backdrop-blur-md',
        'border-t border-tma-border/10',
        'px-4 py-3',
        'pb-[calc(env(safe-area-inset-bottom,_0px)_+_12px)]',
        className
      )}
    >
      {children}
    </nav>
  );
}

/**
 * TMA Section
 * Grouped content section with optional title
 */
interface TMASectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function TMASection({ children, title, className }: TMASectionProps) {
  return (
    <section
      className={cn(
        'tma-section',
        'bg-tma-section rounded-xl',
        'overflow-hidden',
        className
      )}
    >
      {title && (
        <div className="px-4 py-2 border-b border-tma-border/10">
          <h3 className="text-xs font-medium text-tma-hint uppercase tracking-wide">
            {title}
          </h3>
        </div>
      )}
      <div className="divide-y divide-tma-border/10">
        {children}
      </div>
    </section>
  );
}

/**
 * TMA Card
 * Standard card component for TMA
 */
interface TMACardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** Card visual style */
  variant?: 'default' | 'elevated' | 'outlined';
}

export function TMACard({ children, className, onClick, variant = 'default' }: TMACardProps) {
  const variants = {
    default: 'bg-tma-card',
    elevated: 'bg-tma-card shadow-md',
    outlined: 'bg-transparent border border-tma-border',
  };

  return (
    <div
      className={cn(
        'tma-card',
        'rounded-xl p-4',
        variants[variant],
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {children}
    </div>
  );
}

export default TMALayout;
