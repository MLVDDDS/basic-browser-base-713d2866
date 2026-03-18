/**
 * 🚩 Feature Flags
 * 
 * Флаги для управления функциональностью.
 * Позволяют включать/выключать новые функции без деплоя.
 */

// ============ FLAGS ============

export const FEATURE_FLAGS = {
  // ═══════════════════════════════════════════════════════════════════════
  // AUTOFIX FLAGS
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Включить сохранение snapshot перед автофиксом
   */
  ENABLE_AUTOFIX_SNAPSHOTS: true,
  
  /**
   * Включить сбор метрик автофикса
   */
  ENABLE_AUTOFIX_METRICS: true,
  
  /**
   * Показывать UI для rollback после автофикса
   */
  ENABLE_AUTOFIX_ROLLBACK_UI: true,
  
  /**
   * Включить автоматическую эскалацию моделей
   */
  ENABLE_MODEL_ESCALATION: true,
  
  // ═══════════════════════════════════════════════════════════════════════
  // LLM OPTIMIZATION FLAGS
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Включить логирование токенов в БД
   */
  ENABLE_TOKEN_LOGGING: true,
  
  /**
   * Включить кэширование LLM запросов
   */
  ENABLE_LLM_CACHE: true,
  
  /**
   * Включить сжатие контекста
   */
  ENABLE_CONTEXT_COMPRESSION: true,
  
  /**
   * Включить умный роутинг моделей по сложности
   */
  ENABLE_SMART_MODEL_ROUTING: true,
  
  /**
   * Включить сжатие истории чата в summary
   */
  ENABLE_CHAT_HISTORY_COMPRESSION: true,
  
  /**
   * Максимальное количество сообщений в контексте перед сжатием
   */
  MAX_CHAT_MESSAGES_BEFORE_COMPRESSION: 10,
  
  // ═══════════════════════════════════════════════════════════════════════
  // DESIGN SYSTEM FLAGS (v2.0)
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Включить новый генератор дизайна v2
   */
  ENABLE_DESIGN_SYSTEM_V2: true,
  
  /**
   * Использовать расширенные шаблоны с дизайн-токенами
   */
  ENABLE_EXTENDED_TEMPLATES: true,
  
  /**
   * Включить валидацию дизайна (контрастность, доступность)
   */
  ENABLE_DESIGN_VALIDATION: true,
  
  /**
   * Включить автоматические UI-компоненты из библиотеки
   */
  ENABLE_UI_COMPONENT_LIBRARY: true,
  
  // ═══════════════════════════════════════════════════════════════════════
  // CHAT UI FLAGS
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Включить новый модульный UI чата
   */
  ENABLE_NEW_CHAT_UI: true,
  
  /**
   * Показывать метки времени на сообщениях
   */
  ENABLE_MESSAGE_TIMESTAMPS: true,
  
  /**
   * Включить расширенный режим просмотра (развёрнутые шаги)
   */
  ENABLE_EXPANDED_VIEW_MODE: true,
  
  // ═══════════════════════════════════════════════════════════════════════
  // DEBUG FLAGS
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Режим отладки - показывать дополнительные логи
   */
  DEBUG_MODE: import.meta.env.DEV,
} as const;

// ============ HELPERS ============

/**
 * Проверить, включён ли флаг
 */
export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  const value = FEATURE_FLAGS[flag];
  return typeof value === 'boolean' ? value : false;
}

/**
 * Получить значение флага (для числовых флагов)
 */
export function getFeatureValue<K extends keyof typeof FEATURE_FLAGS>(
  flag: K
): typeof FEATURE_FLAGS[K] {
  return FEATURE_FLAGS[flag];
}

/**
 * Получить все включённые флаги
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, value]) => value === true)
    .map(([flag]) => flag);
}

/**
 * Логировать состояние флагов (для отладки)
 */
export function logFeatureFlags(): void {
  if (FEATURE_FLAGS.DEBUG_MODE) {
    console.log('[FeatureFlags] Current state:', FEATURE_FLAGS);
  }
}
