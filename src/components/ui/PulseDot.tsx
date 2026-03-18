import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PulseDotProps {
  className?: string;
  /** Position relative to parent (parent must be relative) */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Delay before showing (ms) */
  delay?: number;
  /** Size in px */
  size?: number;
}

const positionClasses = {
  'top-right': '-top-1 -right-1',
  'top-left': '-top-1 -left-1',
  'bottom-right': '-bottom-1 -right-1',
  'bottom-left': '-bottom-1 -left-1',
};

export const PulseDot = ({ 
  className, 
  position = 'top-right', 
  delay = 0,
  size = 8 
}: PulseDotProps) => {
  return (
    <motion.div
      className={cn('absolute z-20 pointer-events-none', positionClasses[position], className)}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.4, ease: 'backOut' }}
    >
      {/* Outer pulse ring */}
      <motion.div
        className="absolute rounded-full bg-foreground/20"
        style={{ width: size * 2.5, height: size * 2.5, top: -(size * 0.75), left: -(size * 0.75) }}
        animate={{ 
          scale: [1, 1.8, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Core dot */}
      <div 
        className="rounded-full bg-foreground/60 shadow-sm"
        style={{ width: size, height: size }}
      />
    </motion.div>
  );
};
