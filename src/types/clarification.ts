/**
 * 🔮 Clarification Types
 * 
 * Structured types for wizard-style clarification questions
 * with checkbox options, custom answers, and multi-question flow
 */

export interface ClarificationQuestion {
  /** Unique identifier for the question */
  id: string;
  
  /** The question text to display */
  question: string;
  
  /** Predefined options for checkboxes/radio (optional) */
  options?: string[];
  
  /** Allow selecting multiple options (checkbox mode) */
  allowMultiple?: boolean;
  
  /** Show custom answer input field */
  allowCustom?: boolean;
}

export interface ClarificationAnswer {
  /** ID of the question being answered */
  questionId: string;
  
  /** Selected predefined options */
  selectedOptions: string[];
  
  /** Custom text answer (if provided) */
  customAnswer?: string;
}

export interface ClarificationResult {
  /** All answers provided by user */
  answers: ClarificationAnswer[];
  
  /** Was the clarification skipped? */
  skipped: boolean;
  
  /** Formatted text summary of all answers */
  formattedText: string;
}

/**
 * Format clarification answers into readable text for the AI
 */
export function formatClarificationAnswers(
  questions: ClarificationQuestion[],
  answers: ClarificationAnswer[]
): string {
  if (answers.length === 0) return '';
  
  const lines = answers.map(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (!question) return null;
    
    const parts: string[] = [];
    
    if (answer.selectedOptions.length > 0) {
      parts.push(answer.selectedOptions.join(', '));
    }
    
    if (answer.customAnswer?.trim()) {
      parts.push(answer.customAnswer.trim());
    }
    
    if (parts.length === 0) return null;
    
    return `[${question.question}]: ${parts.join('; ')}`;
  }).filter(Boolean);
  
  return lines.join('\n');
}

/**
 * Convert legacy string[] questions to structured format
 * (For backward compatibility with existing preprocessor)
 */
export function convertLegacyQuestions(questions: string[]): ClarificationQuestion[] {
  return questions.map((question, index) => ({
    id: `q_${index}`,
    question,
    options: generateDefaultOptions(question),
    allowMultiple: false,
    allowCustom: true,
  }));
}

/**
 * Generate smart default options based on question text
 */
function generateDefaultOptions(question: string): string[] {
  const lower = question.toLowerCase();
  
  // Yes/No questions
  if (
    lower.includes('нужн') ||
    lower.includes('хотите') ||
    lower.includes('требуется') ||
    lower.includes('добавить') ||
    lower.includes('включить') ||
    lower.includes('want') ||
    lower.includes('need') ||
    lower.includes('should') ||
    lower.includes('would you like')
  ) {
    return ['Да', 'Нет', 'Опционально'];
  }
  
  // Style questions
  if (
    lower.includes('стиль') ||
    lower.includes('дизайн') ||
    lower.includes('style') ||
    lower.includes('design') ||
    lower.includes('look')
  ) {
    return ['Минималистичный', 'Современный', 'Яркий', 'Корпоративный'];
  }
  
  // Color questions
  if (
    lower.includes('цвет') ||
    lower.includes('color') ||
    lower.includes('theme')
  ) {
    return ['Светлая тема', 'Тёмная тема', 'Авто (системная)'];
  }
  
  // Complexity questions
  if (
    lower.includes('сложность') ||
    lower.includes('complexity') ||
    lower.includes('уровень')
  ) {
    return ['Простой', 'Средний', 'Продвинутый'];
  }
  
  // Platform questions
  if (
    lower.includes('платформ') ||
    lower.includes('устройств') ||
    lower.includes('platform') ||
    lower.includes('device')
  ) {
    return ['Десктоп', 'Мобильный', 'Все устройства'];
  }
  
  // Auth questions
  if (
    lower.includes('авториз') ||
    lower.includes('регистрац') ||
    lower.includes('auth') ||
    lower.includes('login') ||
    lower.includes('signup')
  ) {
    return ['Email + пароль', 'Через соцсети', 'Telegram', 'Не нужна'];
  }
  
  // Section/feature questions  
  if (
    lower.includes('раздел') ||
    lower.includes('секц') ||
    lower.includes('section') ||
    lower.includes('feature')
  ) {
    return ['Hero', 'Features', 'Pricing', 'Testimonials', 'Contact'];
  }
  
  // Default - no predefined options, only custom input
  return [];
}
