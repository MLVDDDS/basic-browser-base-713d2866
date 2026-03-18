import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface StreamingTextProps {
  text: string;
  /** Speed in ms per character (lower = faster) */
  speed?: number;
  /** If true, shows all text immediately without animation */
  skipAnimation?: boolean;
  /** Callback when streaming is complete */
  onComplete?: () => void;
  className?: string;
}

/**
 * StreamingText - typing animation
 * 
 * Отображает текст с эффектом "печатающейся машинки" — символы 
 * появляются постепенно, создавая ощущение что ИИ генерирует 
 * ответ в реальном времени.
 * 
 * Как это работает:
 * 1. Текст разбивается на символы
 * 2. Каждый символ добавляется с заданной задержкой (speed)
 * 3. Курсор мигает в конце пока текст не завершён
 * 4. После завершения вызывается onComplete callback
 */
export function StreamingText({ 
  text, 
  speed = 15, 
  skipAnimation = false,
  onComplete,
  className 
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  
  // If animation should be skipped, show full text immediately
  useEffect(() => {
    if (skipAnimation) {
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }
    
    // Reset when text changes
    setDisplayedText('');
    setIsComplete(false);
    
    let currentIndex = 0;
    const chars = text.split('');
    
    const interval = setInterval(() => {
      if (currentIndex < chars.length) {
        // Add next character
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        // Animation complete
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed, skipAnimation, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {/* Blinking cursor while typing */}
      {!isComplete && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-foreground ml-0.5 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  );
}

/**
 * StreamingTextByWord - Word-by-word streaming animation
 * 
 * Более быстрый вариант: текст появляется по словам, 
 * а не по символам. Выглядит более естественно для 
 * длинных ответов.
 */
export function StreamingTextByWord({ 
  text, 
  speed = 50, 
  skipAnimation = false,
  onComplete,
  className 
}: StreamingTextProps) {
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  
  const words = useMemo(() => text.split(/(\s+)/), [text]); // Split preserving spaces
  
  useEffect(() => {
    if (skipAnimation) {
      setDisplayedWords(words);
      setIsComplete(true);
      onComplete?.();
      return;
    }
    
    setDisplayedWords([]);
    setIsComplete(false);
    
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedWords(prev => [...prev, words[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, words, speed, skipAnimation, onComplete]);

  return (
    <span className={className}>
      {displayedWords.join('')}
      {!isComplete && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-foreground ml-0.5 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  );
}

export default StreamingText;
