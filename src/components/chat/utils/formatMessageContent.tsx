/**
 * 📝 Message Content Formatter
 * Utility to parse and format message content with markdown-like syntax
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { AttachmentCard, parseAttachments } from '../AttachmentCard';

type MessageRole = 'user' | 'assistant' | 'system';

interface FormattedPart {
  type: 'text' | 'bold' | 'code' | 'bullet' | 'emoji-header' | 'link';
  content: string;
}

/**
 * Parse a single line for inline formatting (bold, code)
 */
function parseInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Process bold **text** and code `text`
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold text
      parts.push(
        <strong key={`bold-${key++}`} className="font-semibold text-foreground">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Inline code
      parts.push(
        <code 
          key={`code-${key++}`} 
          className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-primary"
        >
          {match[3]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Format message content with markdown-like syntax
 */
export function formatMessageContent(
  content: string, 
  role: MessageRole
): React.ReactNode {
  if (!content) return null;
  
  // Parse attachments from content
  const { textContent, attachments } = parseAttachments(content);
  
  const lines = textContent.split('\n');
  const emojiHeaders = ['💭', '⚡', '📁', '✅', '🔧', '🎨', '🚀', '💡', '📋', '🎯', '✨', '🔍', '📝', '🛠️', '⚙️', '🔥', '💻', '📦', '🌟'];
  
  return (
    <div className="space-y-1">
      {/* Text content */}
      {lines.map((line, lineIdx) => {
        const trimmedLine = line.trim();
        
        // Empty line = paragraph break
        if (!trimmedLine) {
          return <div key={lineIdx} className="h-2" />;
        }
        
        // Bullet points (• or -)
        if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          const bulletContent = trimmedLine.replace(/^[•\-*]\s*/, '');
          return (
            <div 
              key={lineIdx} 
              className={cn(
                "flex gap-2 pl-2",
                role === 'assistant' ? "text-muted-foreground" : ""
              )}
            >
              <span className="text-primary flex-shrink-0">•</span>
              <span className="text-sm">{parseInlineFormatting(bulletContent)}</span>
            </div>
          );
        }
        
        // Numbered lists (1. or 1))
        if (/^\d+[.)]\s/.test(trimmedLine)) {
          const [num, ...rest] = trimmedLine.split(/[.)]\s/);
          return (
            <div 
              key={lineIdx} 
              className={cn(
                "flex gap-2 pl-2",
                role === 'assistant' ? "text-muted-foreground" : ""
              )}
            >
              <span className="text-primary flex-shrink-0 font-medium w-5">{num}.</span>
              <span className="text-sm">{parseInlineFormatting(rest.join('. '))}</span>
            </div>
          );
        }
        
        // Emoji headers (💭, ⚡, 📁, ✅, 🔧, 🎨, etc.)
        if (emojiHeaders.some((emoji) => trimmedLine.startsWith(emoji))) {
          return (
            <div 
              key={lineIdx} 
              className={cn(
                "mt-2 first:mt-0 font-medium",
                role === 'assistant' ? "text-foreground" : ""
              )}
            >
              {parseInlineFormatting(trimmedLine)}
            </div>
          );
        }
        
        // Headers (## or ###)
        if (trimmedLine.startsWith('##')) {
          const headerContent = trimmedLine.replace(/^#+\s*/, '');
          return (
            <div 
              key={lineIdx} 
              className="mt-2 first:mt-0 font-semibold text-foreground"
            >
              {headerContent}
            </div>
          );
        }
        
        // Regular text
        return (
          <div key={lineIdx} className="text-sm">
            {parseInlineFormatting(line)}
          </div>
        );
      })}
      
      {/* Attachments as beautiful cards */}
      {attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          {attachments.map((attachment, idx) => (
            <AttachmentCard 
              key={`${attachment.name}-${idx}`}
              attachment={attachment}
              variant={role === 'user' ? 'user' : 'assistant'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Extract preview from content (first N characters)
 */
export function getContentPreview(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trim() + '...';
}
