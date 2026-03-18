import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ShimmerTextProps {
  children: ReactNode;
  className?: string;
}

export const ShimmerText = ({ children, className }: ShimmerTextProps) => {
  return (
    <span 
      className={cn(
        'relative inline-block bg-clip-text text-transparent',
        'bg-gradient-to-r from-foreground via-primary to-foreground',
        'bg-[length:200%_100%] animate-shimmer',
        className
      )}
      style={{
        animation: 'shimmer 3s ease-in-out infinite',
      }}
    >
      {children}
    </span>
  );
};
