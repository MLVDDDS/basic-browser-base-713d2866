/**
 * 🔮 ClarificationWizard v1.0
 * 
 * Wizard-style clarification questions with:
 * - Checkbox options for predefined answers
 * - Custom text input field
 * - Navigation between multiple questions
 * - Swipe animation between questions
 * - Progress indicator
 * - Persistent answers when navigating back
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Check,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { 
  ClarificationQuestion, 
  ClarificationAnswer, 
  ClarificationResult,
  formatClarificationAnswers,
  convertLegacyQuestions
} from '@/types/clarification';

interface ClarificationWizardProps {
  /** Structured questions (new format) */
  questions?: ClarificationQuestion[];
  
  /** Legacy string questions (backward compatibility) */
  legacyQuestions?: string[];
  
  /** Is the wizard visible */
  isVisible: boolean;
  
  /** Called when user completes all questions */
  onComplete: (result: ClarificationResult) => void;
  
  /** Called when user skips clarification */
  onSkip: () => void;
  
  /** Additional CSS classes */
  className?: string;
}

export function ClarificationWizard({
  questions: structuredQuestions,
  legacyQuestions,
  isVisible,
  onComplete,
  onSkip,
  className,
}: ClarificationWizardProps) {
  // Convert legacy questions to structured format if needed
  const questions: ClarificationQuestion[] = structuredQuestions?.length
    ? structuredQuestions
    : convertLegacyQuestions(legacyQuestions || []);
  
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ClarificationAnswer>>({});
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Current question
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  
  // Current answer for this question
  const currentAnswer: ClarificationAnswer = answers[currentQuestion?.id] || {
    questionId: currentQuestion?.id || '',
    selectedOptions: [],
    customAnswer: '',
  };
  
  // Focus input when question changes
  useEffect(() => {
    if (isVisible && currentQuestion?.allowCustom) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [currentIndex, isVisible, currentQuestion?.allowCustom]);
  
  // Reset state when questions change
  useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
  }, [legacyQuestions, structuredQuestions]);
  
  // Toggle option selection
  const handleOptionToggle = useCallback((option: string) => {
    setAnswers(prev => {
      const current = prev[currentQuestion.id] || {
        questionId: currentQuestion.id,
        selectedOptions: [],
        customAnswer: '',
      };
      
      let newSelectedOptions: string[];
      
      if (currentQuestion.allowMultiple) {
        // Checkbox mode - toggle the option
        if (current.selectedOptions.includes(option)) {
          newSelectedOptions = current.selectedOptions.filter(o => o !== option);
        } else {
          newSelectedOptions = [...current.selectedOptions, option];
        }
      } else {
        // Radio mode - replace selection
        if (current.selectedOptions.includes(option)) {
          newSelectedOptions = []; // Deselect if already selected
        } else {
          newSelectedOptions = [option];
        }
      }
      
      return {
        ...prev,
        [currentQuestion.id]: {
          ...current,
          selectedOptions: newSelectedOptions,
        },
      };
    });
  }, [currentQuestion]);
  
  // Update custom answer
  const handleCustomChange = useCallback((value: string) => {
    setAnswers(prev => {
      const current = prev[currentQuestion.id] || {
        questionId: currentQuestion.id,
        selectedOptions: [],
        customAnswer: '',
      };
      
      return {
        ...prev,
        [currentQuestion.id]: {
          ...current,
          customAnswer: value,
        },
      };
    });
  }, [currentQuestion]);
  
  // Navigation
  const goToQuestion = useCallback((index: number) => {
    if (index < 0 || index >= totalQuestions) return;
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
  }, [currentIndex, totalQuestions]);
  
  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      goToQuestion(currentIndex + 1);
    }
  }, [currentIndex, totalQuestions, goToQuestion]);
  
  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  }, [currentIndex, goToQuestion]);
  
  // Check if current question has an answer
  const hasCurrentAnswer = 
    currentAnswer.selectedOptions.length > 0 || 
    (currentAnswer.customAnswer?.trim() || '').length > 0;
  
  // Check if all questions are answered
  const allAnswered = questions.every(q => {
    const ans = answers[q.id];
    return ans && (ans.selectedOptions.length > 0 || ans.customAnswer?.trim());
  });
  
  // Submit all answers
  const handleSubmitAll = useCallback(() => {
    const allAnswers = Object.values(answers).filter(
      a => a.selectedOptions.length > 0 || a.customAnswer?.trim()
    );
    
    const formattedText = formatClarificationAnswers(questions, allAnswers);
    
    onComplete({
      answers: allAnswers,
      skipped: false,
      formattedText,
    });
  }, [answers, questions, onComplete]);
  
  // Handle Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentIndex < totalQuestions - 1) {
        handleNext();
      } else if (hasCurrentAnswer) {
        handleSubmitAll();
      }
    } else if (e.key === 'Escape') {
      onSkip();
    }
  }, [currentIndex, totalQuestions, handleNext, handleSubmitAll, hasCurrentAnswer, onSkip]);
  
  if (!questions.length || !currentQuestion) return null;
  
  // Animation variants
  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'right' ? -100 : 100,
      opacity: 0,
    }),
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, type: 'spring', bounce: 0.25 }}
          className={cn(
            "p-4 rounded-xl overflow-hidden",
            "bg-gradient-to-br from-primary/5 to-primary/10",
            "border border-primary/20",
            "shadow-lg shadow-primary/5",
            className
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-primary">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium">
                  Вопрос {currentIndex + 1} из {totalQuestions}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Помогите уточнить задачу
                </p>
              </div>
            </div>
            
            {/* Navigation arrows & Skip */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="h-7 w-7"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex === totalQuestions - 1}
                className="h-7 w-7"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground ml-1"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Пропустить
              </Button>
            </div>
          </div>
          
          {/* Question content with swipe animation */}
          <div className="relative min-h-[180px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQuestion.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="space-y-3"
              >
                {/* Question text */}
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {currentQuestion.question}
                </p>
                
                {/* Options (checkboxes/radio) */}
                {currentQuestion.options && currentQuestion.options.length > 0 && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, idx) => (
                      <motion.button
                        key={option}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleOptionToggle(option)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2.5 rounded-lg text-left",
                          "bg-background/50 hover:bg-background",
                          "border transition-all duration-200",
                          currentAnswer.selectedOptions.includes(option)
                            ? "border-primary/50 bg-primary/5"
                            : "border-transparent hover:border-primary/30"
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
                          currentQuestion.allowMultiple ? "rounded-sm" : "rounded-full",
                          currentAnswer.selectedOptions.includes(option)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                        )}>
                          {currentAnswer.selectedOptions.includes(option) && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="flex-1 text-sm text-foreground">
                          {option}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}
                
                {/* Custom answer input */}
                {currentQuestion.allowCustom !== false && (
                  <div className="pt-1">
                    <Input
                      ref={inputRef}
                      value={currentAnswer.customAnswer || ''}
                      onChange={(e) => handleCustomChange(e.target.value)}
                      placeholder="Или напишите свой ответ..."
                      className="bg-background/50 border-muted-foreground/20 focus:border-primary/50"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Progress dots */}
          {totalQuestions > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4 mb-3">
              {questions.map((q, idx) => {
                const hasAnswer = answers[q.id] && (
                  answers[q.id].selectedOptions.length > 0 || 
                  answers[q.id].customAnswer?.trim()
                );
                
                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200",
                      idx === currentIndex
                        ? "w-4 bg-primary"
                        : hasAnswer
                          ? "bg-primary/60"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Вопрос ${idx + 1}`}
                  />
                );
              })}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            {currentIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Назад
              </Button>
            )}
            
            {currentIndex < totalQuestions - 1 ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleNext}
                disabled={!hasCurrentAnswer}
                className="flex-1"
              >
                Далее
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmitAll}
                disabled={!hasCurrentAnswer}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                <Send className="w-4 h-4 mr-1" />
                Отправить
              </Button>
            )}
          </div>
          
          {/* Hint */}
          <p className="mt-3 text-xs text-muted-foreground text-center">
            Enter — далее • Esc — пропустить
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { ClarificationQuestion, ClarificationAnswer, ClarificationResult };
