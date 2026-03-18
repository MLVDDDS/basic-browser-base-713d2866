// Автоматический выбор модели на основе задачи
export type ModelKey = "opus" | "sonnet" | "haiku";

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

  // Opus для сложных задач
  for (const pattern of COMPLEX_PATTERNS) {
    if (taskLower.includes(pattern)) return "opus";
  }

  // Haiku для простых/быстрых задач
  for (const pattern of SIMPLE_PATTERNS) {
    if (taskLower.includes(pattern)) return "haiku";
  }

  // Short prompts → Haiku
  if (task.length < 80) return "haiku";

  // Sonnet по умолчанию
  return "sonnet";
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
        model: "opus",
        reason: `Обнаружен паттерн "${pattern}" — требуется глубокий анализ`,
        confidence: 0.9,
      };
    }
  }

  // Simple tasks
  for (const pattern of SIMPLE_PATTERNS) {
    if (taskLower.includes(pattern)) {
      return {
        model: "haiku",
        reason: `Обнаружен паттерн "${pattern}" — простая задача`,
        confidence: 0.85,
      };
    }
  }

  // Short prompts → Haiku
  if (task.length < 50) {
    return {
      model: "haiku",
      reason: "Короткий промпт — быстрая обработка",
      confidence: 0.7,
    };
  }

  // Default → Sonnet
  return {
    model: "sonnet",
    reason: "Стандартная задача — баланс качества и скорости",
    confidence: 0.8,
  };
}

// Get display name for model
export function getModelDisplayName(model: ModelKey): string {
  const names: Record<ModelKey, string> = {
    opus: "Gemini 2.5 Pro",
    sonnet: "Gemini 2.0 Flash",
    haiku: "Gemini 2.0 Flash-Lite",
  };
  return names[model];
}

// Model costs per 1M tokens (approx)
export const MODEL_COSTS: Record<ModelKey, { input: number; output: number }> = {
  opus: { input: 3.5, output: 10.5 },
  sonnet: { input: 0.35, output: 1.05 },
  haiku: { input: 0.075, output: 0.3 },
};
