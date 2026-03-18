import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export const ThemeToggle = ({ className }: { className?: string }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (stored === 'dark' || (!stored && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsAnimating(true);
    
    // Smooth transition for all elements
    document.documentElement.style.setProperty('--theme-transition', '0.4s');
    document.body.style.transition = 'background-color 0.4s ease, color 0.4s ease';
    
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Reset transition after animation
    setTimeout(() => {
      setIsAnimating(false);
      document.body.style.transition = '';
    }, 400);
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        'relative p-2 rounded-full text-muted-foreground hover:text-foreground',
        'bg-muted/50 hover:bg-muted transition-colors overflow-hidden',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
    >
      {/* Background glow effect */}
      <AnimatePresence mode="wait">
        {isAnimating && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={cn(
              'absolute inset-0 rounded-full',
              isDark ? 'bg-yellow-400' : 'bg-indigo-600'
            )}
          />
        )}
      </AnimatePresence>
      
      {/* Icon container */}
      <div className="relative w-4 h-4">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Sun className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Moon className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
};
