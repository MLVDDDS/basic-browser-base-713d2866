import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PageTitleProps {
  children: ReactNode;
  description?: string;
  className?: string;
  size?: 'default' | 'compact';
  centered?: boolean;
}

export const PageTitle = ({ 
  children, 
  description, 
  className,
  size = 'default',
  centered = false 
}: PageTitleProps) => {
  const sizeClasses = {
    default: 'text-3xl sm:text-4xl md:text-5xl',
    compact: 'text-2xl sm:text-3xl md:text-4xl',
  };

  return (
    <div className={cn(centered && 'text-center', className)}>
      <h1 className={cn(
        'font-sans font-semibold leading-tight',
        sizeClasses[size]
      )}>
        {children}
      </h1>
      {description && (
        <p className={cn(
          'text-muted-foreground mt-2 font-sans',
          size === 'default' ? 'text-lg md:text-xl' : 'text-base md:text-lg'
        )}>
          {description}
        </p>
      )}
    </div>
  );
};
