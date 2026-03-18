import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClarificationPromptProps {
  questions: string[];
  isVisible: boolean;
  onQuestionSelect: (question: string) => void;
  onSkip: () => void;
  className?: string;
}

export function ClarificationPrompt({
  questions,
  isVisible,
  onQuestionSelect,
  onSkip,
  className,
}: ClarificationPromptProps) {
  if (!questions.length) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, type: 'spring', bounce: 0.25 }}
          className={cn(
            "p-4 rounded-xl",
            "bg-gradient-to-br from-primary/5 to-primary/10",
            "border border-primary/20",
            "shadow-lg shadow-primary/5",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-primary">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Уточняющие вопросы</h4>
                <p className="text-xs text-muted-foreground">
                  Помогите мне лучше понять задачу
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Пропустить
            </Button>
          </div>
          
          {/* Questions */}
          <div className="space-y-2">
            {questions.map((question, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onQuestionSelect(question)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left",
                  "bg-background/50 hover:bg-background",
                  "border border-transparent hover:border-primary/30",
                  "transition-all duration-200 group"
                )}
              >
                <div className="flex-shrink-0 p-1 rounded-md bg-muted">
                  <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-sm text-foreground">
                  {question}
                </span>
                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
          
          {/* Hint */}
          <p className="mt-3 text-xs text-muted-foreground text-center">
            Нажмите на вопрос чтобы ответить, или пропустите для автоматического решения
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
