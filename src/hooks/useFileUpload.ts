/**
 * 📎 useFileUpload Hook
 * Handles file uploads, parsing, and preview generation for chat attachments
 */
import { useState, useCallback } from 'react';

export type FileType = 'image' | 'text' | 'csv' | 'pdf' | 'other';

export interface UploadedFile {
  id: string;
  name: string;
  type: FileType;
  mimeType: string;
  size: number;
  url?: string;        // For images - public URL from storage
  content?: string;    // For text files - file content
  preview?: string;    // For PDF/CSV - extracted summary
  file?: File;         // Original file reference
}

// File type detection based on MIME type and extension
const detectFileType = (file: File): FileType => {
  const mimeType = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  
  // Images
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return 'image';
  }
  
  // CSV
  if (mimeType === 'text/csv' || ext === 'csv') {
    return 'csv';
  }
  
  // PDF
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  
  // Text files (code, markdown, json, etc.)
  const textExtensions = ['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html', 'xml', 'yaml', 'yml', 'env', 'gitignore'];
  if (mimeType.startsWith('text/') || textExtensions.includes(ext)) {
    return 'text';
  }
  
  return 'other';
};

// Read text content from file
const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
};

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(String(e.target?.result || ""));
    reader.onerror = () => reject(new Error("Ошибка чтения изображения"));
    reader.readAsDataURL(file);
  });
};

// Parse CSV and return first N rows as preview
const parseCsvPreview = async (file: File, maxRows = 10): Promise<string> => {
  const content = await readTextFile(file);
  const lines = content.split('\n').filter(line => line.trim());
  const previewLines = lines.slice(0, maxRows + 1); // +1 for header
  
  if (previewLines.length === 0) return 'Пустой CSV файл';
  
  const header = previewLines[0];
  const rows = previewLines.slice(1);
  
  let preview = `📊 CSV: ${file.name}\n`;
  preview += `Колонки: ${header}\n`;
  preview += `Строк показано: ${rows.length}${lines.length > maxRows + 1 ? ` из ${lines.length - 1}` : ''}\n\n`;
  preview += rows.join('\n');
  
  return preview;
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Constants
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 10;

export function useFileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In API-only mode we keep uploads local (blob URLs / inline content)
  // until dedicated upload endpoints are enabled.
  const uploadToStorage = async (file: File): Promise<string | null> => {
    void file;
    return null;
  };

  // Process a single file
  const processFile = async (file: File): Promise<UploadedFile | null> => {
    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setError(`Файл ${file.name} слишком большой (макс. 20MB)`);
      return null;
    }
    
    const fileType = detectFileType(file);
    const baseFile: UploadedFile = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: fileType,
      mimeType: file.type,
      size: file.size,
      file,
    };
    
    try {
      switch (fileType) {
        case 'image': {
          // Upload to storage and get URL
          const url = await uploadToStorage(file);
          if (url) {
            return { ...baseFile, url };
          }
          // Fallback: keep inline base64 data URL so backend can pass image to Gemini vision.
          const dataUrl = await readFileAsDataUrl(file);
          return { ...baseFile, url: dataUrl };
        }
        
        case 'text': {
          // Read content directly
          const content = await readTextFile(file);
          // Limit content size for very large files
          const maxLength = 50000;
          const truncated = content.length > maxLength 
            ? content.slice(0, maxLength) + '\n...[усечено]'
            : content;
          return { ...baseFile, content: truncated };
        }
        
        case 'csv': {
          // Parse and create preview
          const content = await readTextFile(file);
          const preview = await parseCsvPreview(file);
          return { ...baseFile, content, preview };
        }
        
        case 'pdf': {
          // Upload to storage for reference
          const url = await uploadToStorage(file);
          
          const preview = `📄 PDF: ${file.name} (${formatFileSize(file.size)})\n[Документ прикреплён]`;
          
          return { 
            ...baseFile, 
            url: url || undefined,
            preview,
          };
        }
        
        default: {
          // Other files - keep local metadata
          const url = await uploadToStorage(file);
          return { ...baseFile, url: url || undefined };
        }
      }
    } catch (err) {
      console.error('File processing error:', err);
      setError(`Ошибка обработки файла ${file.name}`);
      return null;
    }
  };

  // Add multiple files
  const addFiles = useCallback(async (newFiles: File[]): Promise<void> => {
    if (files.length + newFiles.length > MAX_FILES) {
      setError(`Максимум ${MAX_FILES} файлов`);
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const processedFiles = await Promise.all(
        newFiles.map(file => processFile(file))
      );
      
      const validFiles = processedFiles.filter((f): f is UploadedFile => f !== null);
      setFiles(prev => [...prev, ...validFiles]);
    } finally {
      setIsUploading(false);
    }
  }, [files.length]);

  // Remove a file
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  // Build context string for prompt
  const buildFileContext = useCallback((): string => {
    if (files.length === 0) return '';
    
    const parts = files.map(file => {
      switch (file.type) {
        case 'image':
          if (file.url && !file.url.startsWith('data:')) {
            return `[Изображение: ${file.name}]\nURL: ${file.url}`;
          }
          return `[Изображение: ${file.name}]`;
        
        case 'text':
          return `[Файл: ${file.name}]\nСодержимое:\n\`\`\`\n${file.content}\n\`\`\``;
        
        case 'csv':
          return file.preview || `[CSV: ${file.name}]`;
        
        case 'pdf':
          return file.preview || `[PDF: ${file.name}]`;
        
        default:
          return `[Файл: ${file.name}]${file.url ? `\nURL: ${file.url}` : ''}`;
      }
    });
    
    return `\n\n--- Прикреплённые файлы ---\n${parts.join('\n\n')}`;
  }, [files]);

  return {
    files,
    isUploading,
    error,
    addFiles,
    removeFile,
    clearFiles,
    buildFileContext,
    hasFiles: files.length > 0,
    maxFiles: MAX_FILES,
    maxFileSize: MAX_FILE_SIZE,
  };
}
