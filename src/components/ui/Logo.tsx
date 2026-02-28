import { cn } from '@/lib/utils';
import logoSvg from '@/assets/logo.svg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: { icon: 'h-7 w-7', text: 'text-base', gap: 'gap-1.5' },
    md: { icon: 'h-9 w-9', text: 'text-lg', gap: 'gap-2' },
    lg: { icon: 'h-12 w-12', text: 'text-xl', gap: 'gap-2.5' },
  };

  return (
    <div className={cn('flex items-center logo-hover-wrapper', sizeClasses[size].gap, className)}>
      <div 
        className={cn(
          sizeClasses[size].icon, 
          'bg-foreground'
        )}
        style={{
          WebkitMaskImage: `url(${logoSvg})`,
          maskImage: `url(${logoSvg})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
      <span className={cn('brand-wordmark text-foreground', sizeClasses[size].text)}>
        ЛЮБАКОДЪ
      </span>
    </div>
  );
};
