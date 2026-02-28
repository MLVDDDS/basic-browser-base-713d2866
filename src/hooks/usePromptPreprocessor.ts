import { useState, useCallback } from 'react';
import { preprocessPromptRequest } from '@/features/builder/api/prompt-preprocessor-api';

// Context about the user's environment - passed to AI for better understanding
export interface BuilderContext {
  // Where the user is in the app
  environment: 'builder' | 'dashboard' | 'landing' | 'unknown';
  
  // Does the user have an existing project?
  hasProject: boolean;
  
  // Current project info
  projectName?: string;
  projectType?: 'website' | 'tma' | 'landing';
  
  // List of existing files (for context)
  existingFiles?: string[];
  
  // Last few actions/messages for conversation context
  recentActions?: string[];
}

// Structured clarifying question with options
export interface ClarificationQuestion {
  id: string;
  question: string;
  options?: string[];
  allowMultiple?: boolean;
  allowCustom?: boolean;
}

// Attached file metadata for preprocessing
export interface AttachedFileMetadata {
  type: 'image' | 'text' | 'csv' | 'pdf' | 'other';
  name: string;
  url?: string;
  preview?: string;
}

// Options for preprocessing
export interface PreprocessOptions {
  attachedFiles?: AttachedFileMetadata[];
}

export interface PreprocessedPrompt {
  original: string;
  cleaned: string;
  language: string;
  intent: string;
  
  // New fields for action understanding
  actionType: 'create' | 'edit' | 'fix' | 'add' | 'remove' | 'refactor' | 'audit' | 'review' | 'improve' | 'explain' | 'other';
  target: 'page' | 'component' | 'style' | 'feature' | 'project' | 'section' | 'code' | 'other';
  
  categories: string[];
  suggestedComplexity: 'low' | 'medium' | 'high';
  planDetailLevel: 'none' | 'micro' | 'standard' | 'detailed';
  planTaskLimit: number;
  entities: string[];
  needsClarification: boolean;
  clarifyingQuestions?: ClarificationQuestion[];
  
  // Context that was used
  usedContext?: BuilderContext;
  
  processingTime: number;
  
  // === Review mode flags (auto-detected from prompt) ===
  forceDeepReview?: boolean;
  minQualityScore?: number;
  
  // === Recreate from scratch flag ===
  recreateFromScratch?: boolean;
}

interface UsePromptPreprocessorReturn {
  preprocess: (prompt: string, context?: BuilderContext, options?: PreprocessOptions) => Promise<PreprocessedPrompt>;
  isPreprocessing: boolean;
  lastResult: PreprocessedPrompt | null;
  error: string | null;
}

/**
 * Hook for preprocessing user prompts using Haiku AI with AUTO-CONTEXT
 * 
 * Now context-aware:
 * - Knows user is in Builder working on a project
 * - Understands "fix button" = edit code, not generate image
 * - Provides actionType and target for better routing
 * 
 * Cleans up:
 * - Voice input garbage (эээ, ммм, like, umm)
 * - Slang and abbreviations
 * - Typos and grammar issues
 */
export function usePromptPreprocessor(): UsePromptPreprocessorReturn {
  const [isPreprocessing, setIsPreprocessing] = useState(false);
  const [lastResult, setLastResult] = useState<PreprocessedPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preprocess = useCallback(async (
    prompt: string, 
    context?: BuilderContext,
    options?: PreprocessOptions
  ): Promise<PreprocessedPrompt> => {
    setIsPreprocessing(true);
    setError(null);

    // Default context if not provided
    const builderContext: BuilderContext = context || {
      environment: 'builder',
      hasProject: false,
    };

    // Check for attached files - if present, suppress clarification
    const hasAttachedFiles = options?.attachedFiles && options.attachedFiles.length > 0;
    const hasImages = options?.attachedFiles?.some(f => f.type === 'image');

    try {
      // Skip preprocessing for very short prompts (local handling with context)
      const wordCount = prompt.trim().split(/\s+/).length;
      
      // If we have attached files with short prompt, skip clarification entirely
      if (wordCount <= 3 || (hasAttachedFiles && wordCount <= 10)) {
        const quickAction = inferQuickAction(prompt, builderContext);
        const reviewFlags = detectReviewModeLocal(prompt);
        const suggestedComplexity = quickAction.recreateFromScratch
          ? 'high'
          : (reviewFlags.forceDeepReview ? 'medium' : 'low');
        const planFields = normalizePlanFieldsLocal({
          prompt,
          actionType: quickAction.actionType,
          target: quickAction.target,
          suggestedComplexity,
        });

        const quickResult: PreprocessedPrompt = {
          original: prompt,
          cleaned: quickAction.recreateFromScratch 
            ? 'Полностью пересоздать проект с нуля' 
            : prompt.toLowerCase().trim(),
          language: detectLanguageLocal(prompt),
          intent: hasImages 
            ? 'Работа с прикреплённым изображением' 
            : hasAttachedFiles 
              ? 'Работа с прикреплённым файлом'
              : quickAction.intent,
          actionType: quickAction.actionType,
          target: quickAction.target,
          categories: [],
          suggestedComplexity,
          planDetailLevel: planFields.planDetailLevel,
          planTaskLimit: planFields.planTaskLimit,
          entities: [],
          needsClarification: false, // Never clarify when files are attached
          usedContext: builderContext,
          processingTime: 0,
          forceDeepReview: reviewFlags.forceDeepReview,
          minQualityScore: reviewFlags.minQualityScore,
          recreateFromScratch: quickAction.recreateFromScratch,
        };
        setLastResult(quickResult);
        return quickResult;
      }

      const data = await preprocessPromptRequest<Record<string, unknown>>({
          prompt,
          context: builderContext,
          attachedFiles: options?.attachedFiles,
      });

      if (data.error) {
        // Use fallback data if available
        if (data.fallback) {
          console.warn('Using fallback preprocessing result');
          const fallbackResult: PreprocessedPrompt = {
            ...data,
            original: prompt,
            cleaned: prompt,
          };
          setLastResult(fallbackResult);
          return fallbackResult;
        }
        throw new Error(data.error);
      }

      const result = data as PreprocessedPrompt;
      setLastResult(result);
      
      console.log('🧹 Prompt preprocessed:', {
        original: prompt.slice(0, 30) + '...',
        cleaned: result.cleaned.slice(0, 30) + '...',
        complexity: result.suggestedComplexity,
        categories: result.categories,
        time: result.processingTime + 'ms',
      });

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Preprocessing failed';
      setError(errorMessage);
      console.error('Preprocessing error:', err);
      
      // Return a fallback result with context-aware defaults
      const fallbackAction = inferQuickAction(prompt, builderContext);
      const reviewFlags = detectReviewModeLocal(prompt);
      const planFields = normalizePlanFieldsLocal({
        prompt,
        actionType: fallbackAction.actionType,
        target: fallbackAction.target,
        suggestedComplexity: reviewFlags.forceDeepReview ? 'medium' : 'medium',
      });
      const fallback: PreprocessedPrompt = {
        original: prompt,
        cleaned: prompt,
        language: detectLanguageLocal(prompt),
        intent: fallbackAction.intent,
        actionType: fallbackAction.actionType,
        target: fallbackAction.target,
        categories: [],
        suggestedComplexity: reviewFlags.forceDeepReview ? 'medium' : 'medium',
        planDetailLevel: planFields.planDetailLevel,
        planTaskLimit: planFields.planTaskLimit,
        entities: [],
        needsClarification: false,
        usedContext: builderContext,
        processingTime: 0,
        forceDeepReview: reviewFlags.forceDeepReview,
        minQualityScore: reviewFlags.minQualityScore,
      };
      setLastResult(fallback);
      return fallback;

    } finally {
      setIsPreprocessing(false);
    }
  }, []);

  return {
    preprocess,
    isPreprocessing,
    lastResult,
    error,
  };
}

// Local language detection for quick fallback
function detectLanguageLocal(text: string): string {
  if (/[а-яё]/i.test(text)) {
    if (/[їієґ]/i.test(text)) return 'ukrainian';
    return 'russian';
  }
  if (/[\u4e00-\u9fff]/.test(text)) return 'chinese';
  if (/[\u3040-\u30ff]/.test(text)) return 'japanese';
  if (/[\uac00-\ud7af]/.test(text)) return 'korean';
  if (/[\u0600-\u06ff]/.test(text)) return 'arabic';
  return 'english';
}

// Minimal fallback when LLM preprocessing is unavailable.
function inferQuickAction(
  prompt: string, 
  context: BuilderContext
): { 
  intent: string; 
  actionType: PreprocessedPrompt['actionType']; 
  target: PreprocessedPrompt['target'];
  recreateFromScratch?: boolean;
} {
  // Minimal fallback - avoid brittle intent guessing.
  return {
    intent: prompt.slice(0, 100),
    actionType: 'other',
    target: 'code',
  };
}

// Local review mode detection (mirrors server logic)
function detectReviewModeLocal(prompt: string): { forceDeepReview: boolean; minQualityScore: number } {
  const lower = prompt.toLowerCase();
  
  // Deep review patterns - highest quality threshold (90+)
  const deepReviewPatterns = [
    /глубок.*аудит/i, /deep.*review/i, /deep.*audit/i,
    /техническ.*аудит/i, /technical.*audit/i,
    /полн.*провер/i, /full.*check/i, /complete.*review/i,
    /всё.*подробн/i, /очень.*внимательн/i,
    /профессиональн/i, /professional/i,
    /enterprise/i, /production.*ready/i,
  ];
  
  // Standard review patterns - high quality threshold (85)
  const reviewPatterns = [
    /исправь.*всё/i, /исправь.*все/i, /fix.*everything/i, /fix.*all/i,
    /почини.*всё/i, /почини.*все/i, /repair.*all/i,
    /сделай.*красив/i, /make.*beautiful/i, /make.*pretty/i,
    /приведи.*порядок/i, /clean.*up/i, /polish/i,
    /причеш/i, /tidy.*up/i,
    /улучш/i, /improve/i, /enhance/i,
    /оптимиз/i, /optimize/i,
    /рефактор/i, /refactor/i,
    /аудит/i, /audit/i, /review/i,
    /провер.*код/i, /check.*code/i,
  ];
  
  // Check for deep review first
  for (const pattern of deepReviewPatterns) {
    if (pattern.test(lower)) {
      return { forceDeepReview: true, minQualityScore: 90 };
    }
  }
  
  // Check for standard review
  for (const pattern of reviewPatterns) {
    if (pattern.test(lower)) {
      return { forceDeepReview: true, minQualityScore: 85 };
    }
  }
  
  // Default - no review mode
  return { forceDeepReview: false, minQualityScore: 70 };
}

function normalizePlanFieldsLocal(options: {
  prompt: string;
  actionType?: PreprocessedPrompt['actionType'];
  target?: PreprocessedPrompt['target'];
  suggestedComplexity?: 'low' | 'medium' | 'high';
}): { planDetailLevel: PreprocessedPrompt['planDetailLevel']; planTaskLimit: number } {
  const wordCount = options.prompt.trim().split(/\s+/).length;
  const complexity = options.suggestedComplexity || 'medium';
  const actionType = options.actionType || 'other';
  const target = options.target || 'code';

  const isSingleFix = ['fix', 'edit', 'add', 'remove', 'improve'].includes(actionType) &&
    ['component', 'style', 'section', 'code'].includes(target) &&
    wordCount <= 20;

  let planDetailLevel: PreprocessedPrompt['planDetailLevel'];
  if (isSingleFix || complexity === 'low') {
    planDetailLevel = 'micro';
  } else if (complexity === 'high') {
    planDetailLevel = 'detailed';
  } else {
    planDetailLevel = 'standard';
  }

  const defaultLimit: Record<PreprocessedPrompt['planDetailLevel'], number> = {
    none: 0,
    micro: 2,
    standard: 4,
    detailed: 5,
  };

  const planTaskLimit = defaultLimit[planDetailLevel];
  return { planDetailLevel, planTaskLimit };
}

export default usePromptPreprocessor;
