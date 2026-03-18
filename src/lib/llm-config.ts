/**
 * 🤖 LLM Configuration
 * 
 * Централизованная конфигурация моделей для оптимизации расходов.
 * Определяет правила выбора моделей по типу задачи и сложности.
 */

// ═══════════════════════════════════════════════════════════════════════════
// MODEL TIERS
// ═══════════════════════════════════════════════════════════════════════════

export type ModelTier = 'fast' | 'balanced' | 'quality' | 'expert';

export interface ModelConfig {
  id: string;
  tier: ModelTier;
  inputCostPer1k: number;  // $ per 1K input tokens
  outputCostPer1k: number; // $ per 1K output tokens
  maxOutputTokens: number;
  contextWindow: number;
  description: string;
}

/**
 * Model configurations with pricing (Jan 2026)
 */
export const MODELS: Record<ModelTier, ModelConfig> = {
  fast: {
    id: 'gemini-2.0-flash-lite',
    tier: 'fast',
    inputCostPer1k: 0.000075,
    outputCostPer1k: 0.0003,
    maxOutputTokens: 8000,
    contextWindow: 1000000,
    description: 'Fastest/cheapest - preprocessing, classification, simple fixes',
  },
  balanced: {
    id: 'gemini-2.0-flash',
    tier: 'balanced',
    inputCostPer1k: 0.00035,
    outputCostPer1k: 0.00105,
    maxOutputTokens: 16000,
    contextWindow: 1000000,
    description: 'Balanced - UI components, CRUD, standard coding',
  },
  quality: {
    id: 'gemini-2.0-flash',
    tier: 'quality',
    inputCostPer1k: 0.00035,
    outputCostPer1k: 0.00105,
    maxOutputTokens: 16000,
    contextWindow: 1000000,
    description: 'High quality - complex components, integrations',
  },
  expert: {
    id: 'gemini-2.5-pro',
    tier: 'expert',
    inputCostPer1k: 0.0035,
    outputCostPer1k: 0.0105,
    maxOutputTokens: 32000,
    contextWindow: 1000000,
    description: 'Expert - architecture, AI integrations, complex reasoning',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TASK TYPES AND ROUTING
// ═══════════════════════════════════════════════════════════════════════════

export type TaskType = 
  | 'classification'      // Error/prompt classification
  | 'preprocessing'       // Prompt preprocessing
  | 'planning'            // Plan generation
  | 'simple_fix'          // Simple syntax/import fixes
  | 'component_gen'       // Component generation
  | 'crud'                // CRUD operations
  | 'form'                // Form components
  | 'dashboard'           // Dashboard layouts
  | 'ai_integration'      // AI/LLM integrations
  | 'realtime'            // Realtime/WebSocket
  | 'payments'            // Payment integrations
  | 'auth'                // Authentication flows
  | 'complex_logic'       // Complex business logic
  | 'architecture'        // Architecture decisions
  | 'full_project'        // Full project generation
  | 'chat'                // Chat responses
  | 'autofix';            // Auto-fix errors

/**
 * Task to model tier mapping
 */
export const TASK_MODEL_MAPPING: Record<TaskType, ModelTier> = {
  // Fast tier - simple/cheap tasks
  classification: 'fast',
  preprocessing: 'fast',
  simple_fix: 'fast',
  
  // Balanced tier - standard coding
  planning: 'balanced',
  component_gen: 'balanced',
  crud: 'balanced',
  form: 'balanced',
  dashboard: 'balanced',
  chat: 'balanced',
  autofix: 'balanced',
  
  // Quality tier - complex but not expert
  auth: 'quality',
  realtime: 'quality',
  
  // Expert tier - complex/critical
  ai_integration: 'expert',
  payments: 'expert',
  complex_logic: 'expert',
  architecture: 'expert',
  full_project: 'expert',
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPLEXITY DETECTION
// ═══════════════════════════════════════════════════════════════════════════

export type ComplexityLevel = 'low' | 'medium' | 'high' | 'epic';

export interface ComplexitySignals {
  wordCount: number;
  hasMultipleFeatures: boolean;
  hasAI: boolean;
  hasPayments: boolean;
  hasRealtime: boolean;
  hasAuth: boolean;
  hasDashboard: boolean;
  hasComplexLogic: boolean;
}

/**
 * Complexity patterns for detection
 */
export const COMPLEXITY_PATTERNS = {
  ai: /\b(ai|gpt|llm|openai|gemini|искусственн|нейросет|чат.?бот|генераци)/i,
  payments: /\b(stripe|payment|checkout|оплат|платеж|подписк|billing|subscription)/i,
  realtime: /\b(realtime|websocket|socket|live|чат|messenger|real.?time)/i,
  auth: /\b(auth|login|signup|регистрац|авторизац|oauth|sso)/i,
  dashboard: /\b(dashboard|админ|панел|аналитик|график|chart|статистик)/i,
  multiFeature: /\b(и|также|плюс|добав|with|plus|also|включ)/gi,
  complexLogic: /\b(алгоритм|оптимизац|машинн|рекомендац|персонализац|scoring)/i,
};

/**
 * Detect complexity level from prompt
 */
export function detectComplexity(prompt: string): {
  level: ComplexityLevel;
  signals: ComplexitySignals;
  recommendedTier: ModelTier;
} {
  const wordCount = prompt.split(/\s+/).length;
  const multiFeatureMatches = prompt.match(COMPLEXITY_PATTERNS.multiFeature) || [];
  
  const signals: ComplexitySignals = {
    wordCount,
    hasMultipleFeatures: multiFeatureMatches.length >= 3,
    hasAI: COMPLEXITY_PATTERNS.ai.test(prompt),
    hasPayments: COMPLEXITY_PATTERNS.payments.test(prompt),
    hasRealtime: COMPLEXITY_PATTERNS.realtime.test(prompt),
    hasAuth: COMPLEXITY_PATTERNS.auth.test(prompt),
    hasDashboard: COMPLEXITY_PATTERNS.dashboard.test(prompt),
    hasComplexLogic: COMPLEXITY_PATTERNS.complexLogic.test(prompt),
  };
  
  // Calculate complexity score
  let score = 0;
  if (wordCount > 100) score += 2;
  else if (wordCount > 50) score += 1;
  
  if (signals.hasMultipleFeatures) score += 2;
  if (signals.hasAI) score += 3;
  if (signals.hasPayments) score += 2;
  if (signals.hasRealtime) score += 2;
  if (signals.hasAuth) score += 1;
  if (signals.hasDashboard) score += 1;
  if (signals.hasComplexLogic) score += 2;
  
  // Determine level
  let level: ComplexityLevel;
  let recommendedTier: ModelTier;
  
  if (score >= 7) {
    level = 'epic';
    recommendedTier = 'expert';
  } else if (score >= 4) {
    level = 'high';
    recommendedTier = 'quality';
  } else if (score >= 2) {
    level = 'medium';
    recommendedTier = 'balanced';
  } else {
    level = 'low';
    recommendedTier = 'fast';
  }
  
  return { level, signals, recommendedTier };
}

// ═══════════════════════════════════════════════════════════════════════════
// MODEL SELECTION
// ═══════════════════════════════════════════════════════════════════════════

export interface ModelSelectionOptions {
  taskType?: TaskType;
  complexity?: ComplexityLevel;
  forceMinTier?: ModelTier;
  maxTier?: ModelTier;
}

const TIER_ORDER: ModelTier[] = ['fast', 'balanced', 'quality', 'expert'];

/**
 * Select optimal model based on task and complexity
 */
export function selectModel(options: ModelSelectionOptions = {}): ModelConfig {
  let tier: ModelTier = 'balanced';
  
  // Start with task-based tier
  if (options.taskType) {
    tier = TASK_MODEL_MAPPING[options.taskType];
  }
  
  // Upgrade based on complexity
  if (options.complexity) {
    const complexityTier = {
      low: 'fast',
      medium: 'balanced',
      high: 'quality',
      epic: 'expert',
    }[options.complexity] as ModelTier;
    
    // Take the higher tier
    if (TIER_ORDER.indexOf(complexityTier) > TIER_ORDER.indexOf(tier)) {
      tier = complexityTier;
    }
  }
  
  // Apply min tier constraint
  if (options.forceMinTier) {
    if (TIER_ORDER.indexOf(options.forceMinTier) > TIER_ORDER.indexOf(tier)) {
      tier = options.forceMinTier;
    }
  }
  
  // Apply max tier constraint
  if (options.maxTier) {
    if (TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(options.maxTier)) {
      tier = options.maxTier;
    }
  }
  
  return MODELS[tier];
}

/**
 * Get model by tier
 */
export function getModelByTier(tier: ModelTier): ModelConfig {
  return MODELS[tier];
}

/**
 * Escalate to next tier
 */
export function escalateModel(currentTier: ModelTier): ModelConfig | null {
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  if (currentIndex >= TIER_ORDER.length - 1) return null;
  return MODELS[TIER_ORDER[currentIndex + 1]];
}

// ═══════════════════════════════════════════════════════════════════════════
// COST ESTIMATION
// ═══════════════════════════════════════════════════════════════════════════

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  model: string;
  tier: ModelTier;
}

/**
 * Estimate cost for a request
 */
export function estimateCost(
  tier: ModelTier,
  inputTokens: number,
  outputTokens: number
): CostEstimate {
  const config = MODELS[tier];
  const inputCost = (inputTokens / 1000) * config.inputCostPer1k;
  const outputCost = (outputTokens / 1000) * config.outputCostPer1k;
  
  return {
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    model: config.id,
    tier,
  };
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 100).toFixed(4)}¢`;
  }
  return `$${cost.toFixed(4)}`;
}
