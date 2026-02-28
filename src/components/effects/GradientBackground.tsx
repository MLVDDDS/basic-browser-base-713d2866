import { cn } from '@/lib/utils';

interface GradientBackgroundProps {
  className?: string;
  animate?: boolean;
}

export const GradientBackground = ({ className, animate = true }: GradientBackgroundProps) => {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <div 
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10',
          animate && 'animate-gradient'
        )}
        style={{ backgroundSize: '200% 200%' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
};
