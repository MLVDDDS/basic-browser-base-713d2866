/**
 * 📂 DropZoneOverlay Component
 * Visual overlay when dragging files over the chat area
 */
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropZoneOverlayProps {
  isVisible: boolean;
  className?: string;
}

export function DropZoneOverlay({ isVisible, className }: DropZoneOverlayProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "absolute inset-0 z-50",
        "bg-primary/10 backdrop-blur-sm",
        "border-2 border-dashed border-primary rounded-xl",
        "flex flex-col items-center justify-center gap-3",
        "pointer-events-none",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center"
      >
        <Upload className="w-8 h-8 text-primary" />
      </motion.div>
      
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">
          Отпустите файлы
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          для загрузки в чат
        </p>
      </div>
    </motion.div>
  );
}
