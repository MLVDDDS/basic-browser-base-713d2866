import { cn } from '@/lib/utils';
import { ReactNode, HTMLAttributes } from 'react';

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  glowColor?: 'primary' | 'accent';
}

export const GlowCard = ({ children, className, glowColor = 'primary', ...props }: GlowCardProps) => {
  return (
    <div 
      {...props}
      className={cn(
        'relative group rounded-xl bg-card border border-border transition-all duration-300',
        'hover:border-transparent',
        className
      )}
    >
      {/* Glow effect */}
      <div 
        className={cn(
          'absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10',
          glowColor === 'primary' && 'bg-gradient-to-r from-primary/50 to-accent/50 blur-sm',
          glowColor === 'accent' && 'bg-gradient-to-r from-accent/50 to-primary/50 blur-sm'
        )}
      />
      {/* Border gradient */}
      <div 
        className={cn(
          'absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          'bg-gradient-to-r from-primary to-accent'
        )}
        style={{ 
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />
      {children}
    </div>
  );
};
