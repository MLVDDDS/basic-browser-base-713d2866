/**
 * 📎 FilePreview Component
 * Displays attached file previews with remove button
 */
import { X, FileText, Image as ImageIcon, FileSpreadsheet, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UploadedFile, FileType } from '@/hooks/useFileUpload';
import { formatFileSize } from '@/hooks/useFileUpload';

interface FilePreviewProps {
  files: UploadedFile[];
  onRemove: (fileId: string) => void;
  className?: string;
}

const getFileIcon = (type: FileType) => {
  switch (type) {
    case 'image':
      return ImageIcon;
    case 'csv':
      return FileSpreadsheet;
    case 'text':
    case 'pdf':
      return FileText;
    default:
      return File;
  }
};

const getFileColor = (type: FileType): string => {
  switch (type) {
    case 'image':
      return 'text-purple-500 bg-purple-500/10';
    case 'csv':
      return 'text-green-500 bg-green-500/10';
    case 'text':
      return 'text-blue-500 bg-blue-500/10';
    case 'pdf':
      return 'text-red-500 bg-red-500/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

export function FilePreview({ files, onRemove, className }: FilePreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <AnimatePresence mode="popLayout">
        {files.map((file) => {
          const Icon = getFileIcon(file.type);
          const colorClass = getFileColor(file.type);
          
          return (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
              className={cn(
                "group relative flex items-center gap-2 px-2.5 py-1.5",
                "rounded-lg border border-border/60 bg-card/50",
                "hover:bg-card hover:border-border transition-colors"
              )}
            >
              {/* Image thumbnail or icon */}
              {file.type === 'image' && file.url ? (
                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className={cn("w-6 h-6 rounded flex items-center justify-center flex-shrink-0", colorClass)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              )}
              
              {/* File info */}
              <div className="flex flex-col min-w-0 max-w-[120px]">
                <span className="text-xs font-medium truncate">
                  {file.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
              </div>
              
              {/* Remove button */}
              <button
                onClick={() => onRemove(file.id)}
                className={cn(
                  "absolute -top-1.5 -right-1.5",
                  "w-4 h-4 rounded-full",
                  "bg-destructive text-destructive-foreground",
                  "flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  "hover:bg-destructive/80"
                )}
                title="Удалить файл"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
