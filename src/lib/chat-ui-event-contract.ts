import type { AgentStep } from '@/hooks/useUnifiedOrchestrator';
import type { ProjectVersion } from '@/hooks/useProjectVersions';

export const CHAT_UI_EVENT_CONTRACT_VERSION = 'chat-ui-v1';

export type ChatTimelineEventType =
  | 'phase'
  | 'tool_call'
  | 'tool_result'
  | 'validation'
  | 'plan'
  | 'thinking'
  | 'internal_event'
  | 'complete'
  | 'error'
  | 'text'
  | 'other';

export interface ChatTimelineEvent {
  contractVersion: typeof CHAT_UI_EVENT_CONTRACT_VERSION;
  id: string;
  eventType: ChatTimelineEventType;
  label: string;
  status: 'info' | 'success' | 'error';
  timestamp: number;
  phase?: string;
  toolName?: string;
  path?: string;
}

export interface VersionDiffEntry {
  path: string;
  action: 'created' | 'modified' | 'deleted';
}

export interface ChatVersionDiff {
  contractVersion: typeof CHAT_UI_EVENT_CONTRACT_VERSION;
  fromVersion: number | null;
  toVersion: number | null;
  filesChanged: VersionDiffEntry[];
}

const PHASE_LABELS: Record<string, string> = {
  plan: "Планирование",
  execute: "Выполнение",
  validate: "Проверка",
  planning: "Планирование",
  validation: "Проверка",
};

const TOOL_NAME_LABELS: Record<string, string> = {
  adk_executor: "Запуск генератора",
  create_file: "Создание файла",
  edit_file: "Изменение файла",
  write_file: "Запись файла",
  delete_file: "Удаление файла",
  read_file: "Чтение файла",
  "adk sequentialagent": "AI-агент сборки",
  sequentialagent: "AI-агент сборки",
  "generate operations": "Сборка экранов и компонентов",
  "critic review": "Проверка результата",
  review: "Проверка результата",
};

function normalizePath(rawPath: unknown): string | undefined {
  if (typeof rawPath !== 'string') return undefined;
  const value = rawPath.trim();
  return value.length > 0 ? value : undefined;
}

function resolveStepPath(step: AgentStep): string | undefined {
  const data = step.data as { path?: string } | undefined;
  const args = step.args as { path?: string } | undefined;
  return normalizePath(data?.path || args?.path);
}

function normalizePlanTasks(step: AgentStep): string {
  const data = step.data as { tasks?: string[] } | undefined;
  const tasks = Array.isArray(data?.tasks) ? data?.tasks : [];
  return tasks.map((task) => String(task || "").trim()).filter(Boolean).join("|");
}

function dedupeStepKey(step: AgentStep): string {
  if (step.type === "plan") {
    const tasksKey = normalizePlanTasks(step);
    return `plan:${tasksKey}:${String(step.content || "").trim()}`;
  }
  return `${step.type}:${String(step.id || "").trim()}`;
}

export function dedupeAgentSteps(steps: AgentStep[] = []): AgentStep[] {
  const byKey = new Map<string, AgentStep>();
  for (const step of steps) {
    const key = dedupeStepKey(step);
    const previous = byKey.get(key);
    if (!previous || (step.timestamp || 0) >= (previous.timestamp || 0)) {
      byKey.set(key, step);
    }
  }
  return [...byKey.values()].sort((a, b) => a.timestamp - b.timestamp);
}

export function humanizeToolName(toolName?: string): string | undefined {
  if (!toolName) return undefined;
  const normalized = String(toolName).trim().toLowerCase();
  return TOOL_NAME_LABELS[normalized] || toolName;
}

function resolvePhaseLabel(step: AgentStep): string | undefined {
  const phase = String(step.phase || step.name || "").trim().toLowerCase();
  if (!phase) return undefined;
  return PHASE_LABELS[phase] || step.phase || step.name;
}

function resolveTimelineLabel(step: AgentStep): string {
  if (step.type === "phase") {
    return `Этап: ${resolvePhaseLabel(step) || "обновление"}`;
  }
  if (step.type === "plan") {
    return "Сформирован план";
  }
  if (step.type === "thinking") {
    return "Анализирую запрос";
  }
  if (step.type === "tool_call") {
    return humanizeToolName(step.name) || "Запуск действия";
  }
  if (step.type === "tool_result") {
    if (step.success === false) {
      const data = step.data as
        | { errorCode?: string; shortReason?: string; stage?: string }
        | undefined;
      const errorCode = String(data?.errorCode || "").trim();
      const shortReason = String(data?.shortReason || "").trim();
      if (errorCode && shortReason) {
        return `Ошибка: ${errorCode} · ${shortReason}`;
      }
      if (errorCode) return `Ошибка: ${errorCode}`;
      if (shortReason) return `Ошибка: ${shortReason}`;
      return "Действие завершилось с ошибкой";
    }
    return "Действие выполнено";
  }
  if (step.type === "validation") {
    return "Проверка результата";
  }
  if (step.type === "complete") {
    return "Генерация завершена";
  }
  if (step.type === "internal_event") {
    return "Системное событие";
  }
  return step.content || step.name || step.type || "Событие";
}

function normalizeTimelineEventType(stepType: string): ChatTimelineEventType {
  switch (stepType) {
    case "phase":
    case "tool_call":
    case "tool_result":
    case "validation":
    case "plan":
    case "thinking":
    case "internal_event":
    case "complete":
    case "error":
    case "text":
      return stepType;
    default:
      return "other";
  }
}

export function normalizeAgentStepsToTimeline(steps: AgentStep[] = []): ChatTimelineEvent[] {
  return dedupeAgentSteps(steps).map((step) => {
    const stepType = normalizeTimelineEventType(String(step.type || "other"));
    const toolName = humanizeToolName(step.name);
    const phase = step.phase || undefined;
    const path = resolveStepPath(step);
    const status: ChatTimelineEvent['status'] = step.success === false
      ? 'error'
      : step.success === true
        ? 'success'
        : stepType === 'error'
          ? 'error'
          : 'info';

    const label = resolveTimelineLabel(step);
    return {
      contractVersion: CHAT_UI_EVENT_CONTRACT_VERSION,
      id: step.id,
      eventType: stepType,
      label,
      status,
      timestamp: step.timestamp,
      phase,
      toolName,
      path,
    };
  });
}

export function extractTokenUsageFromSteps(steps: AgentStep[] = []): {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
} {
  const completeStep = [...steps].reverse().find((step) => step.type === 'complete');
  const data = completeStep?.data as {
    totalInputTokens?: number;
    totalOutputTokens?: number;
  } | undefined;

  const inputTokens = Math.max(0, Number(data?.totalInputTokens || 0));
  const outputTokens = Math.max(0, Number(data?.totalOutputTokens || 0));
  const totalTokens = Math.max(inputTokens + outputTokens, 0);
  return { inputTokens, outputTokens, totalTokens };
}

export function buildVersionDiff(version: ProjectVersion | null | undefined): ChatVersionDiff | null {
  if (!version?.diff) return null;
  const added = Array.isArray(version.diff.added) ? version.diff.added : [];
  const modified = Array.isArray(version.diff.modified) ? version.diff.modified : [];
  const removed = Array.isArray(version.diff.removed) ? version.diff.removed : [];

  const filesChanged: VersionDiffEntry[] = [
    ...added.map((path) => ({ path, action: 'created' as const })),
    ...modified.map((path) => ({ path, action: 'modified' as const })),
    ...removed.map((path) => ({ path, action: 'deleted' as const })),
  ];

  return {
    contractVersion: CHAT_UI_EVENT_CONTRACT_VERSION,
    fromVersion: version.version_number > 1 ? version.version_number - 1 : null,
    toVersion: version.version_number,
    filesChanged,
  };
}
