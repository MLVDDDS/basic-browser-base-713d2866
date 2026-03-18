/**
 * 📎 AttachmentCard Component
 * Beautiful display of attached files in chat messages
 */
import { Image as ImageIcon, FileText, FileSpreadsheet, File, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentInfo {
  type: 'image' | 'text' | 'csv' | 'pdf' | 'file';
  name: string;
  url?: string;
  preview?: string;
}

interface AttachmentCardProps {
  attachment: AttachmentInfo;
  variant?: 'user' | 'assistant';
  className?: string;
}

const getIcon = (type: AttachmentInfo['type']) => {
  switch (type) {
    case 'image':
      return ImageIcon;
    case 'csv':
      return FileSpreadsheet;
    case 'pdf':
    case 'text':
      return FileText;
    default:
      return File;
  }
};

const getIconColor = (type: AttachmentInfo['type'], variant: 'user' | 'assistant') => {
  if (variant === 'user') {
    return 'text-primary-foreground/80';
  }
  switch (type) {
    case 'image':
      return 'text-purple-500';
    case 'csv':
      return 'text-green-500';
    case 'pdf':
      return 'text-red-500';
    case 'text':
      return 'text-blue-500';
    default:
      return 'text-muted-foreground';
  }
};

export function AttachmentCard({ attachment, variant = 'assistant', className }: AttachmentCardProps) {
  const Icon = getIcon(attachment.type);
  const iconColor = getIconColor(attachment.type, variant);
  
  const isImage = attachment.type === 'image' && attachment.url;
  
  return (
    <div 
      className={cn(
        "rounded-lg overflow-hidden",
        variant === 'user' 
          ? "bg-primary-foreground/10 border border-primary-foreground/20" 
          : "bg-muted/50 border border-border",
        className
      )}
    >
      {/* Image preview */}
      {isImage && (
        <a 
          href={attachment.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <img 
            src={attachment.url} 
            alt={attachment.name}
            className="w-full max-h-48 object-cover hover:opacity-90 transition-opacity"
          />
        </a>
      )}
      
      {/* File info bar */}
      <div className={cn(
        "flex items-center gap-2 px-3 py-2",
        isImage && "border-t border-border/50"
      )}>
        <div className={cn(
          "w-7 h-7 rounded flex items-center justify-center flex-shrink-0",
          variant === 'user' 
            ? "bg-primary-foreground/10" 
            : "bg-background"
        )}>
          <Icon className={cn("w-4 h-4", iconColor)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-xs font-medium truncate",
            variant === 'user' ? "text-primary-foreground" : "text-foreground"
          )}>
            {attachment.name}
          </p>
          {attachment.preview && (
            <p className={cn(
              "text-[10px] truncate",
              variant === 'user' ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {attachment.preview}
            </p>
          )}
        </div>
        
        {attachment.url && (
          <a 
            href={attachment.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(
              "p-1 rounded hover:bg-background/50 transition-colors",
              variant === 'user' ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
            title="Открыть файл"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Parse attachment blocks from message content
 * Returns { textContent: string, attachments: AttachmentInfo[] }
 */
export function parseAttachments(content: string): { 
  textContent: string; 
  attachments: AttachmentInfo[];
} {
  const attachments: AttachmentInfo[] = [];
  
  // Check for file attachment section
  const attachmentMarker = '--- Прикреплённые файлы ---';
  const markerIndex = content.indexOf(attachmentMarker);
  
  if (markerIndex === -1) {
    return { textContent: content, attachments: [] };
  }
  
  // Split content
  const textContent = content.slice(0, markerIndex).trim();
  const attachmentSection = content.slice(markerIndex + attachmentMarker.length);
  
  // Parse image attachments: [Изображение: name]\nURL: url
  const imageRegex = /\[Изображение:\s*([^\]]+)\](?:\s*\nURL:\s*(\S+))?/g;
  let match;
  while ((match = imageRegex.exec(attachmentSection)) !== null) {
    attachments.push({
      type: 'image',
      name: match[1].trim(),
      url: match[2]?.trim(),
    });
  }
  
  // Parse PDF attachments: [PDF: name] or 📄 PDF: name
  const pdfRegex = /(?:\[PDF:\s*([^\]]+)\]|📄\s*PDF:\s*([^\n(]+))/g;
  while ((match = pdfRegex.exec(attachmentSection)) !== null) {
    const name = (match[1] || match[2])?.trim();
    if (name && !attachments.some(a => a.name === name)) {
      attachments.push({
        type: 'pdf',
        name,
        preview: 'Документ PDF',
      });
    }
  }
  
  // Parse CSV attachments: [CSV: name] or 📊 CSV: name
  const csvRegex = /(?:\[CSV:\s*([^\]]+)\]|📊\s*CSV:\s*([^\n]+))/g;
  while ((match = csvRegex.exec(attachmentSection)) !== null) {
    const name = (match[1] || match[2])?.trim();
    if (name && !attachments.some(a => a.name === name)) {
      attachments.push({
        type: 'csv',
        name,
        preview: 'Таблица CSV',
      });
    }
  }
  
  // Parse generic file attachments: [Файл: name]
  const fileRegex = /\[Файл:\s*([^\]]+)\](?:\s*\nURL:\s*(\S+))?/g;
  while ((match = fileRegex.exec(attachmentSection)) !== null) {
    const name = match[1].trim();
    if (!attachments.some(a => a.name === name)) {
      attachments.push({
        type: 'text',
        name,
        url: match[2]?.trim(),
      });
    }
  }
  
  return { textContent, attachments };
}
