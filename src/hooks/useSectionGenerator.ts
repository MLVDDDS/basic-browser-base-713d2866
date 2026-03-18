import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api-client';

interface GenerateSectionOptions {
  sectionType?: string;
  context?: string;
  /**
   * Модель генерации на бэке.
   * - "auto" — умный выбор (и/или эскалация по попыткам)
   */
  model?: "auto" | "premium" | "balanced" | "fast";
}


interface QualityCheck {
  passed: boolean;
  score: number;
  issues: string[];
}

interface GenerateSectionResult {
  html: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  quality?: QualityCheck;
}

export function useSectionGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSection = useCallback(async (
    prompt: string,
    options?: GenerateSectionOptions
  ): Promise<GenerateSectionResult | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const scope = options?.sectionType
        ? `Сгенерируй секцию типа "${options.sectionType}" как самостоятельный блок.`
        : 'Сгенерируй одну секцию лендинга как самостоятельный блок.';

      const response = await apiRequest<{
        html?: string;
        usage?: { input_tokens: number; output_tokens: number };
        quality?: QualityCheck;
      }>('/site-pipeline', {
        method: 'POST',
        body: JSON.stringify({
          prompt: `${scope}\n\n${prompt}`,
          context: options?.context,
          stream: false,
          model: options?.model,
        }),
      });

      if (!response?.html) {
        throw new Error('Пустой ответ генерации');
      }

      return {
        html: response.html,
        usage: response.usage,
        quality: response.quality,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка генерации';
      setError(message);
      toast.error('Не удалось сгенерировать секцию', { description: message });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateMultipleSections = useCallback(async (
    prompts: { prompt: string; type: string }[]
  ): Promise<GenerateSectionResult[]> => {
    setIsGenerating(true);
    setError(null);

    try {
      const results = await Promise.all(
        prompts.map(({ prompt, type }) =>
          generateSection(prompt, { sectionType: type })
        )
      );

      return results.filter((r): r is GenerateSectionResult => r !== null);
    } finally {
      setIsGenerating(false);
    }
  }, [generateSection]);

  return {
    generateSection,
    generateMultipleSections,
    isGenerating,
    error,
    clearError: () => setError(null),
  };
}
