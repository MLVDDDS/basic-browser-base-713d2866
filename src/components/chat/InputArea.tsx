/**
 * ⌨️ InputArea Component v3.0
 * Chat input with dynamic height, send button, voice recording, and file upload
 */
import { RefObject, useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Square, Paperclip, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AudioWaveform } from '@/components/ui/AudioWaveform';
import { FilePreview } from '@/components/chat/FilePreview';
import { DropZoneOverlay } from '@/components/chat/DropZoneOverlay';
import { cn } from '@/lib/utils';
import type { UploadedFile } from '@/hooks/useFileUpload';

// Configuration constants
const MIN_TEXTAREA_HEIGHT = 44; // px - single line
const MAX_TEXTAREA_HEIGHT = 160; // px - ~6 lines

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  isGenerating?: boolean;
  isRecording?: boolean;
  isSpeechSupported?: boolean;
  onToggleRecording?: () => void;
  className?: string;
  textareaRef?: RefObject<HTMLTextAreaElement>;
  // File upload props
  attachedFiles?: UploadedFile[];
  onFilesAdd?: (files: File[]) => void;
  onFileRemove?: (fileId: string) => void;
  isUploading?: boolean;
}

export function InputArea({
  value,
  onChange,
  onSubmit,
  onStop,
  placeholder = "Опиши что хочешь создать...",
  disabled = false,
  isGenerating = false,
  isRecording = false,
  isSpeechSupported = false,
  onToggleRecording,
  className,
  textareaRef: externalRef,
  attachedFiles = [],
  onFilesAdd,
  onFileRemove,
  isUploading = false,
}: InputAreaProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef || internalRef;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Dynamic textarea height adjustment
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${MIN_TEXTAREA_HEIGHT}px`;
    
    const scrollHeight = textarea.scrollHeight;
    
    if (!textarea.value || textarea.value.trim() === '') {
      textarea.style.height = `${MIN_TEXTAREA_HEIGHT}px`;
      textarea.style.overflowY = 'hidden';
      return;
    }
    
    const newHeight = Math.min(Math.max(scrollHeight, MIN_TEXTAREA_HEIGHT), MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = newHeight >= MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  }, [textareaRef]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isGenerating && (value.trim() || attachedFiles.length > 0)) {
        onSubmit();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Handle paste event for images/files
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (!onFilesAdd) return;
    
    const items = e.clipboardData?.items;
    if (!items) return;
    
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    
    if (files.length > 0) {
      e.preventDefault();
      onFilesAdd(files);
    }
  }, [onFilesAdd]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!onFilesAdd) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesAdd(files);
    }
  }, [onFilesAdd]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onFilesAdd || !e.target.files) return;
    
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFilesAdd(files);
    }
    
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [onFilesAdd]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const hasContent = value.trim() || attachedFiles.length > 0;

  return (
    <div 
      className={cn("p-4 border-t border-border bg-card/50 relative", className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop zone overlay */}
      <DropZoneOverlay isVisible={isDragging} />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        accept="image/*,.txt,.md,.json,.js,.ts,.tsx,.jsx,.css,.html,.xml,.yaml,.yml,.csv,.pdf"
      />
      
      {/* Attached files preview */}
      {attachedFiles.length > 0 && onFileRemove && (
        <div className="mb-3">
          <FilePreview files={attachedFiles} onRemove={onFileRemove} />
        </div>
      )}
      
      <div className="relative flex items-end gap-2">
        {/* Attachment button */}
        {onFilesAdd && (
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "w-9 h-9 rounded-lg shrink-0 mb-1.5",
              isUploading && "animate-pulse"
            )}
            onClick={openFileDialog}
            disabled={isGenerating || isUploading}
            title="Прикрепить файлы (Ctrl+V для вставки)"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </Button>
        )}
        
        <Textarea
          ref={textareaRef as RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          style={{ 
            minHeight: MIN_TEXTAREA_HEIGHT,
            maxHeight: MAX_TEXTAREA_HEIGHT,
            resize: 'none',
          }}
          className={cn(
            "flex-1 pr-4 py-3 text-sm leading-6 transition-all duration-200",
            "focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
            "placeholder:text-muted-foreground/60",
            "rounded-xl border-border/60",
            "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          )}
          disabled={disabled || isGenerating}
        />
        
        {/* Buttons container */}
        <div className="flex items-center gap-1.5 pb-1.5 shrink-0">
          {/* Voice input button */}
          {isSpeechSupported && onToggleRecording && (
            <Button
              size="icon"
              variant={isRecording ? 'destructive' : 'ghost'}
              className={cn(
                "w-9 h-9 rounded-lg transition-all",
                isRecording && "animate-pulse shadow-lg shadow-destructive/25"
              )}
              onClick={onToggleRecording}
              disabled={isGenerating}
              title={isRecording ? "Остановить запись" : "Голосовой ввод"}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          )}
          
          {/* Send/Stop button */}
          {isGenerating ? (
            <Button 
              size="icon" 
              variant="outline" 
              className="w-9 h-9 rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all" 
              onClick={onStop}
              title="Остановить генерацию"
            >
              <Square className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button 
              size="icon" 
              className={cn(
                "w-9 h-9 rounded-lg transition-all shadow-sm",
                hasContent && !disabled 
                  ? "bg-primary hover:bg-primary/90 hover:shadow" 
                  : "bg-primary/40 cursor-not-allowed"
              )}
              onClick={onSubmit} 
              disabled={!hasContent || disabled}
              title="Отправить (Enter)"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Voice recording indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center gap-3 overflow-hidden px-1"
          >
            <div className="flex-1">
              <AudioWaveform isActive={isRecording} />
            </div>
            <span className="text-xs text-muted-foreground animate-pulse font-medium">
              Говорите...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Keyboard hint */}
      <p className="text-[10px] text-muted-foreground/60 mt-3 text-center">
        <kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-[9px] font-mono border border-border/30">Shift</kbd>
        {' + '}
        <kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-[9px] font-mono border border-border/30">Enter</kbd>
        {' — новая строка • '}
        <kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-[9px] font-mono border border-border/30">Ctrl</kbd>
        {' + '}
        <kbd className="px-1.5 py-0.5 bg-muted/50 rounded text-[9px] font-mono border border-border/30">V</kbd>
        {' — вставить файл'}
      </p>
    </div>
  );
}
