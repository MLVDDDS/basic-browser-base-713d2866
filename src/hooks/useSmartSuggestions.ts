/**
 * 🧠 useSmartSuggestions Hook
 * 
 * Fetches LLM-based contextual suggestions from edge function.
 * Returns 0-3 highly relevant suggestions.
 */

import { useState, useCallback, useRef } from 'react';

export interface SmartSuggestion {
  id: string;
  text: string;
  type: 'improve' | 'add' | 'fix' | 'effect';
  priority: 'high' | 'medium' | 'low';
  reasoning?: string;
}

interface SuggestionContext {
  projectType: string;
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
      files: context.existingFiles.length,
      lastMsg: context.lastUserMessage?.slice(0, 50),
    });
    
    if (contextHash === lastContextHashRef.current) {
      return; // Context hasn't changed
    }
    lastContextHashRef.current = contextHash;

    setIsLoading(true);
    
    try {
      const localSuggestions = buildLocalSuggestions(context);
      setSuggestions(localSuggestions);
    } catch (err) {
      console.error('[useSmartSuggestions] Fetch error:', err);
      setSuggestions([]);
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

function buildLocalSuggestions(context: SuggestionContext): SmartSuggestion[] {
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

// Fallback for initial state (before first build)
export function getInitialSuggestions(): SmartSuggestion[] {
  return [
    { id: '1', text: 'Создать лендинг для SaaS продукта', type: 'add', priority: 'high' },
    { id: '2', text: 'Сделать портфолио дизайнера', type: 'add', priority: 'medium' },
    { id: '3', text: 'Запустить интернет-магазин', type: 'add', priority: 'medium' },
  ];
}
