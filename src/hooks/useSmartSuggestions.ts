import { useState, useCallback, useRef } from 'react';
import {
  fetchContextualSuggestions,
  type ContextualSuggestion,
} from '@/features/builder/api/contextual-suggestions-api';

export interface SmartSuggestion {
  id: string;
  text: string;
  type: 'improve' | 'add' | 'fix' | 'effect';
  priority: 'high' | 'medium' | 'low';
  reasoning?: string;
}

interface SuggestionContext {
  projectType: string;
  projectName?: string;
  existingFiles: string[];
  lastUserMessage?: string;
  lastAssistantMessage?: string;
  recentErrors?: string[];
  hasCompletedBuild: boolean;
}

interface UseSmartSuggestionsReturn {
  suggestions: SmartSuggestion[];
  isLoading: boolean;
  fetchSuggestions: (context: SuggestionContext) => Promise<void>;
  clearSuggestions: () => void;
}

export function useSmartSuggestions(): UseSmartSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastContextHashRef = useRef<string>('');

  const fetchSuggestions = useCallback(async (context: SuggestionContext) => {
    // Don't fetch if no build yet
    if (!context.hasCompletedBuild) {
      setSuggestions([]);
      return;
    }

    // Simple hash to avoid duplicate requests
    const contextHash = JSON.stringify({
      projectType: context.projectType,
      projectName: context.projectName || '',
      files: context.existingFiles.slice(0, 20),
      lastMsg: context.lastUserMessage?.slice(0, 50),
      lastAssistant: context.lastAssistantMessage?.slice(0, 50),
      recentErrors: (context.recentErrors || []).slice(0, 3),
    });
    
    if (contextHash === lastContextHashRef.current) {
      return; // Context hasn't changed
    }
    lastContextHashRef.current = contextHash;

    setIsLoading(true);
    
    try {
      const response = await fetchContextualSuggestions(context);
      const nextSuggestions = Array.isArray(response?.suggestions)
        ? response.suggestions
        : [];
      setSuggestions(nextSuggestions.map(normalizeSuggestion).filter(Boolean) as SmartSuggestion[]);
    } catch (err) {
      console.error('[useSmartSuggestions] Fetch error:', err);
      setSuggestions(buildContextFallbackSuggestions(context));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    lastContextHashRef.current = '';
  }, []);

  return {
    suggestions,
    isLoading,
    fetchSuggestions,
    clearSuggestions,
  };
}

function normalizeSuggestion(input: ContextualSuggestion | SmartSuggestion | null | undefined): SmartSuggestion | null {
  if (!input?.text) return null;
  return {
    id: String(input.id || input.text).trim(),
    text: String(input.text).trim(),
    type: ['improve', 'add', 'fix', 'effect'].includes(String(input.type))
      ? input.type
      : 'improve',
    priority: ['high', 'medium', 'low'].includes(String(input.priority))
      ? input.priority
      : 'medium',
    reasoning: input.reasoning,
  };
}

function buildContextFallbackSuggestions(context: SuggestionContext): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  const lowerMessage = (context.lastUserMessage || '').toLowerCase();

  if (context.recentErrors?.length) {
    suggestions.push({
      id: 'api-fix-errors',
      text: 'Исправить текущие ошибки и повторить сборку',
      type: 'fix',
      priority: 'high',
      reasoning: 'Обнаружены ошибки в последних шагах сборки',
    });
  }

  if (!context.existingFiles.some((file) => file.includes('README'))) {
    suggestions.push({
      id: 'api-add-readme',
      text: 'Добавить README с инструкцией запуска',
      type: 'add',
      priority: 'medium',
      reasoning: 'В проекте нет файла с базовой документацией',
    });
  }

  if (
    lowerMessage.includes('дизайн') ||
    lowerMessage.includes('красив') ||
    lowerMessage.includes('style')
  ) {
    suggestions.push({
      id: 'api-improve-style',
      text: 'Улучшить типографику и систему отступов',
      type: 'improve',
      priority: 'high',
      reasoning: 'Последний запрос связан с визуальным качеством',
    });
  }

  if (
    lowerMessage.includes('форма') ||
    lowerMessage.includes('form') ||
    lowerMessage.includes('авторизац')
  ) {
    suggestions.push({
      id: 'api-add-validation',
      text: 'Добавить валидацию форм и обработку ошибок',
      type: 'add',
      priority: 'medium',
      reasoning: 'Формы обычно требуют явной валидации на UI',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: 'api-default-improve',
      text: 'Сделать интерфейс более структурным и читаемым',
      type: 'improve',
      priority: 'medium',
    });
    suggestions.push({
      id: 'api-default-feature',
      text: 'Добавить полезный интерактивный блок для пользователя',
      type: 'add',
      priority: 'low',
    });
  }

  return suggestions.slice(0, 3);
}

export function getInitialSuggestions(): SmartSuggestion[] {
  return [];
}
