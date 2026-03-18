// Автоматический выбор модели на основе задачи
export type ModelKey = "premium" | "balanced" | "fast";

// Patterns for routing
const COMPLEX_PATTERNS = [
  "architect", "design system", "security audit", "complex", "refactor entire",
  "migration", "optimize performance", "full audit", "deep review",
  "архитектур", "дизайн систем", "безопасност", "аудит", "сложн",
  "рефакторинг", "миграция", "оптимиз", "полный аудит", "глубок"
];

const SIMPLE_PATTERNS = [
  "classify", "extract", "summarize", "format", "list", "count", "simple",
  "quick", "fast", "short", "brief", "small",
  "классифиц", "извлечь", "резюме", "формат", "список", "подсчит",
  "простой", "быстр", "коротк", "малень"
];

export function selectModel(task: string): ModelKey {
  const taskLower = task.toLowerCase();

  // Premium для сложных задач
  for (const pattern of COMPLEX_PATTERNS) {
    if (taskLower.includes(pattern)) return "premium";
  }

  // Fast для простых/быстрых задач
  for (const pattern of SIMPLE_PATTERNS) {
    if (taskLower.includes(pattern)) return "fast";
  }

  // Short prompts → Fast
  if (task.length < 80) return "fast";

  // Balanced по умолчанию
  return "balanced";
}

export interface ModelRecommendation {
  model: ModelKey;
  reason: string;
  confidence: number;
}

export function getModelRecommendation(task: string): ModelRecommendation {
  const taskLower = task.toLowerCase();

  // Complex tasks
  for (const pattern of COMPLEX_PATTERNS) {
    if (taskLower.includes(pattern)) {
      return {
        model: "premium",
        reason: `Обнаружен паттерн "${pattern}" — требуется глубокий анализ`,
        confidence: 0.9,
      };
    }
  }

  // Simple tasks
  for (const pattern of SIMPLE_PATTERNS) {
    if (taskLower.includes(pattern)) {
      return {
        model: "fast",
        reason: `Обнаружен паттерн "${pattern}" — простая задача`,
        confidence: 0.85,
      };
    }
  }

  // Short prompts → Fast
  if (task.length < 50) {
    return {
      model: "fast",
      reason: "Короткий промпт — быстрая обработка",
      confidence: 0.7,
    };
  }

  // Default → Balanced
  return {
    model: "balanced",
    reason: "Стандартная задача — баланс качества и скорости",
    confidence: 0.8,
  };
}

// Get display name for model
export function getModelDisplayName(model: ModelKey): string {
  const names: Record<ModelKey, string> = {
    premium: "Gemini 2.5 Pro",
    balanced: "Gemini 2.0 Flash",
    fast: "Gemini 2.0 Flash-Lite",
  };
  return names[model];
}

// Model costs per 1M tokens (approx)
export const MODEL_COSTS: Record<ModelKey, { input: number; output: number }> = {
  premium: { input: 3.5, output: 10.5 },
  balanced: { input: 0.35, output: 1.05 },
  fast: { input: 0.075, output: 0.3 },
};
