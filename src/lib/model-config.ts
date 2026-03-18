/**
 * 🚀 UNIFIED MODEL CONFIGURATION
 * 
 * Централизованная конфигурация моделей для всего приложения.
 * Используется как на фронтенде, так и синхронизируется с бэкендом.
 * 
 * @version 1.0.0
 */

// ============ TYPES ============

export type ModelTier = 'fast' | 'balanced' | 'quality' | 'expert';
export type LLMModelKey = 'fast' | 'balanced' | 'premium';
export type AgentModelKey = LLMModelKey;

export interface ModelConfig {
  tier: ModelTier;
  model: LLMModelKey;
  modelId: string;
  displayName: string;
  maxTokens: number;
  temperature: number;
  description: string;
  costPerMToken: { input: number; output: number };
  avgLatencyMs: number;
  capabilities: string[];
  useCases: string[];
}

export interface TaskModelMapping {
  taskType: string;
  defaultTier: ModelTier;
  allowedTiers: ModelTier[];
  description: string;
}

export interface EscalationRule {
  fromTier: ModelTier;
  toTier: ModelTier;
  maxAttempts: number;
  conditions: string[];
}

// ============ MODEL CONFIGURATIONS ============

export const MODEL_CONFIGS: Record<ModelTier, ModelConfig> = {
  fast: {
    tier: 'fast',
    model: 'fast',
    modelId: 'gemini-2.5-flash-lite',
    displayName: 'Fast (Gemini 2.5 Flash Lite)',
    maxTokens: 4096,
    temperature: 0.3,
    description: 'Быстрые исправления: синтаксис, импорты, опечатки',
    costPerMToken: { input: 0.075, output: 0.30 },
    avgLatencyMs: 600,
    capabilities: ['classification', 'context_compression', 'syntax_fix', 'simple_imports', 'typo_fix', 'style_fix'],
    useCases: ['Исправление опечаток', 'Простые импорты', 'Быстрые стили', 'Классификация ошибок'],
  },
  balanced: {
    tier: 'balanced',
    model: 'balanced',
    modelId: 'gemini-2.5-flash',
    displayName: 'Balanced (Gemini 2.5 Flash)',
    maxTokens: 8192,
    temperature: 0.5,
    description: 'Стандартные задачи: типы, логика, компоненты',
    costPerMToken: { input: 0.35, output: 1.05 },
    avgLatencyMs: 1500,
    capabilities: ['type_fix', 'logic_fix', 'multi_file', 'api_fix', 'component_creation'],
    useCases: ['Создание компонентов', 'Исправление типов', 'API интеграции'],
  },
  quality: {
    tier: 'quality',
    model: 'balanced',
    modelId: 'gemini-2.5-pro',
    displayName: 'Quality (Gemini 2.5 Pro)',
    maxTokens: 16384,
    temperature: 0.6,
    description: 'Сложные задачи: стратегия, рефакторинг, архитектура',
    costPerMToken: { input: 3.50, output: 10.50 },
    avgLatencyMs: 2500,
    capabilities: ['strategy_mode', 'refactoring', 'architecture', 'complex_api', 'optimization', 'testing'],
    useCases: ['Strategy Mode', 'Рефакторинг кода', 'Архитектурные решения'],
  },
  expert: {
    tier: 'expert',
    model: 'premium',
    modelId: 'gemini-2.5-pro',
    displayName: 'Expert (Gemini 2.5 Pro)',
    maxTokens: 32768,
    temperature: 0.7,
    description: 'Экспертный уровень: глубокий анализ, root cause, редизайн',
    costPerMToken: { input: 3.50, output: 10.50 },
    avgLatencyMs: 4000,
    capabilities: ['deep_analysis', 'root_cause', 'architecture_redesign', 'deep_debugging', 'major_refactoring'],
    useCases: ['Глубокий анализ', 'Root Cause Analysis', 'Критические исправления'],
  },
};

// ============ TASK TYPE MAPPINGS ============

export const TASK_MODEL_MAPPINGS: TaskModelMapping[] = [
  // Generation tasks
  {
    taskType: 'generate_component',
    defaultTier: 'balanced',
    allowedTiers: ['balanced', 'quality'],
    description: 'Генерация нового компонента',
  },
  {
    taskType: 'generate_page',
    defaultTier: 'balanced',
    allowedTiers: ['balanced', 'quality', 'expert'],
    description: 'Генерация страницы',
  },
  {
    taskType: 'generate_site',
    defaultTier: 'quality',
    allowedTiers: ['quality', 'expert'],
    description: 'Генерация полного сайта',
  },
  
  // Fix tasks
  {
    taskType: 'fix_syntax',
    defaultTier: 'fast',
    allowedTiers: ['fast', 'balanced'],
    description: 'Исправление синтаксических ошибок',
  },
  {
    taskType: 'fix_types',
    defaultTier: 'balanced',
    allowedTiers: ['balanced', 'quality'],
    description: 'Исправление TypeScript ошибок',
  },
  {
    taskType: 'fix_logic',
    defaultTier: 'quality',
    allowedTiers: ['balanced', 'quality', 'expert'],
    description: 'Исправление логических ошибок',
  },
  {
    taskType: 'fix_imports',
    defaultTier: 'fast',
    allowedTiers: ['fast', 'balanced'],
    description: 'Исправление импортов',
  },
  
  // Debug tasks
  {
    taskType: 'auto_debug',
    defaultTier: 'balanced',
    allowedTiers: ['balanced', 'quality', 'expert'],
    description: 'Автоматический дебаг',
  },
  {
    taskType: 'smart_debug',
    defaultTier: 'quality',
    allowedTiers: ['quality', 'expert'],
    description: 'Умный дебаг с анализом',
  },
  
  // Validation tasks
  {
    taskType: 'validate',
    defaultTier: 'fast',
    allowedTiers: ['fast', 'balanced'],
    description: 'Валидация кода',
  },
  {
    taskType: 'validate_deep',
    defaultTier: 'balanced',
    allowedTiers: ['balanced', 'quality'],
    description: 'Глубокая валидация',
  },
  
  // Planning tasks
  {
    taskType: 'plan_simple',
    defaultTier: 'balanced',
    allowedTiers: ['balanced'],
    description: 'Простое планирование',
  },
  {
    taskType: 'plan_complex',
    defaultTier: 'quality',
    allowedTiers: ['quality', 'expert'],
    description: 'Сложное планирование',
  },
  {
    taskType: 'plan_epic',
    defaultTier: 'expert',
    allowedTiers: ['quality', 'expert'],
    description: 'Планирование эпиков',
  },
];

// ============ ESCALATION RULES ============

export const ESCALATION_RULES: EscalationRule[] = [
  {
    fromTier: 'fast',
    toTier: 'balanced',
    maxAttempts: 2,
    conditions: ['failed_attempts >= 2', 'severity >= high', 'confidence < 50'],
  },
  {
    fromTier: 'balanced',
    toTier: 'quality',
    maxAttempts: 2,
    conditions: ['failed_attempts >= 2', 'severity >= critical', 'multi_file_error'],
  },
  {
    fromTier: 'quality',
    toTier: 'expert',
    maxAttempts: 2,
    conditions: ['failed_attempts >= 2', 'architecture_issue', 'rollback_needed'],
  },
];

// ============ TIER ORDER ============

const TIER_ORDER: Record<ModelTier, number> = {
  fast: 0,
  balanced: 1,
  quality: 2,
  expert: 3,
};

// ============ HELPER FUNCTIONS ============

/**
 * Get model config by tier
 */
export function getModelConfig(tier: ModelTier): ModelConfig {
  return MODEL_CONFIGS[tier];
}

/**
 * Get model config for task type
 */
export function getModelForTask(taskType: string): ModelConfig {
  const mapping = TASK_MODEL_MAPPINGS.find(m => m.taskType === taskType);
  const tier = mapping?.defaultTier ?? 'balanced';
  return MODEL_CONFIGS[tier];
}

/**
 * Get all allowed tiers for task type
 */
export function getAllowedTiersForTask(taskType: string): ModelTier[] {
  const mapping = TASK_MODEL_MAPPINGS.find(m => m.taskType === taskType);
  return mapping?.allowedTiers ?? ['balanced'];
}

/**
 * Check if tier can be used for task
 */
export function canUseTierForTask(tier: ModelTier, taskType: string): boolean {
  const allowed = getAllowedTiersForTask(taskType);
  return allowed.includes(tier);
}

/**
 * Get next tier for escalation
 */
export function getNextTier(currentTier: ModelTier): ModelTier {
  const nextTiers: Record<ModelTier, ModelTier> = {
    fast: 'balanced',
    balanced: 'quality',
    quality: 'expert',
    expert: 'expert',
  };
  return nextTiers[currentTier];
}

/**
 * Check if escalation is possible
 */
export function canEscalate(currentTier: ModelTier): boolean {
  return currentTier !== 'expert';
}

/**
 * Check if escalation is needed based on attempts and success
 */
export function checkEscalation(
  currentTier: LLMModelKey,
  attempts: number,
  lastSuccess: boolean
): { shouldEscalate: boolean; nextTier: string | null; reason: string } {
  const tierMap: Record<string, ModelTier> = {
    fast: 'fast',
    balanced: 'balanced',
    premium: 'expert',
  };
  
  const modelTier = tierMap[currentTier] || 'balanced';
  
  if (!canEscalate(modelTier)) {
    return { shouldEscalate: false, nextTier: null, reason: 'Already at max tier' };
  }
  
  if (lastSuccess) {
    return { shouldEscalate: false, nextTier: null, reason: 'Last attempt succeeded' };
  }
  
  const rule = ESCALATION_RULES.find(r => r.fromTier === modelTier);
  if (rule && attempts >= rule.maxAttempts) {
    const reverseTierMap: Record<ModelTier, string> = {
      fast: 'fast',
      balanced: 'balanced',
      quality: 'balanced',
      expert: 'premium',
    };
    return { 
      shouldEscalate: true, 
      nextTier: reverseTierMap[rule.toTier], 
      reason: `Failed ${attempts} attempts at ${currentTier} tier` 
    };
  }
  
  return { shouldEscalate: false, nextTier: null, reason: 'Under attempt threshold' };
}

/**
 * Compare two tiers
 */
export function compareTiers(a: ModelTier, b: ModelTier): number {
  return TIER_ORDER[a] - TIER_ORDER[b];
}

/**
 * Get display name for tier
 */
export function getTierDisplayName(tier: ModelTier): string {
  return MODEL_CONFIGS[tier].displayName;
}

/**
 * Get tier description
 */
export function getTierDescription(tier: ModelTier): string {
  return MODEL_CONFIGS[tier].description;
}

/**
 * Estimate cost for operation
 */
export function estimateCost(
  tier: ModelTier,
  inputTokens: number,
  outputTokens: number
): { inputCost: number; outputCost: number; totalCost: number } {
  const config = MODEL_CONFIGS[tier];
  const inputCost = (inputTokens / 1_000_000) * config.costPerMToken.input;
  const outputCost = (outputTokens / 1_000_000) * config.costPerMToken.output;
  
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

/**
 * Get recommended tier based on complexity
 */
export function getRecommendedTier(options: {
  taskType: string;
  fileCount: number;
  errorSeverity?: 'low' | 'medium' | 'high' | 'critical';
  previousAttempts?: number;
}): ModelTier {
  const { taskType, fileCount, errorSeverity, previousAttempts = 0 } = options;
  
  // Start with default tier for task
  let tier = getModelForTask(taskType).tier;
  
  // Escalate based on file count
  if (fileCount >= 5 && TIER_ORDER[tier] < TIER_ORDER.quality) {
    tier = 'quality';
  }
  
  // Escalate based on severity
  if (errorSeverity === 'critical' && TIER_ORDER[tier] < TIER_ORDER.quality) {
    tier = 'quality';
  }
  
  // Escalate based on previous attempts
  if (previousAttempts >= 2 && canEscalate(tier)) {
    tier = getNextTier(tier);
  }
  
  return tier;
}

/**
 * Format tier for display in UI
 */
export function formatTierBadge(tier: ModelTier): {
  label: string;
  color: string;
  icon: string;
} {
  const badges: Record<ModelTier, { label: string; color: string; icon: string }> = {
    fast: { label: 'Fast', color: 'bg-green-500', icon: '⚡' },
    balanced: { label: 'Balanced', color: 'bg-blue-500', icon: '⚖️' },
    quality: { label: 'Quality', color: 'bg-purple-500', icon: '✨' },
    expert: { label: 'Expert', color: 'bg-orange-500', icon: '🧠' },
  };
  return badges[tier];
}

/**
 * Get all available tiers
 */
export function getAvailableTiers(): ModelTier[] {
  return ['fast', 'balanced', 'quality', 'expert'];
}

/**
 * Get all task types
 */
export function getTaskTypes(): string[] {
  return TASK_MODEL_MAPPINGS.map(m => m.taskType);
}
