import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface StreamingContentProps {
  content: string;
  isStreaming?: boolean;
  showCursor?: boolean;
}

export function StreamingContent({
  content,
  isStreaming = false,
  showCursor = true
}: StreamingContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  // Simple code block detection and rendering
  const renderContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {text.slice(lastIndex, match.index)}
          </span>
        );
      }

      // Code block
      const language = match[1] || 'code';
      const code = match[2];
      parts.push(
        <div key={`code-${match.index}`} className="my-2">
          <div className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-t-md border-b border-border">
            {language}
          </div>
          <pre className="bg-muted/50 p-3 rounded-b-md overflow-x-auto text-sm">
            <code>{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div
      ref={containerRef}
      className="prose prose-sm dark:prose-invert max-w-none overflow-auto text-sm"
    >
      {renderContent(content)}

      {/* Typing cursor */}
      {isStreaming && showCursor && (
        <motion.span
          className="inline-block w-2 h-4 bg-primary ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}
