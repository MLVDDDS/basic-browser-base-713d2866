import type { AgentStep } from '@/hooks/useUnifiedOrchestrator';
import { CREDITS_PRICING_VERSION } from '@/lib/credits-pricing';

export type RunStatus = 'success' | 'failed' | 'cancelled';

export interface RunStats {
  steps: number;
  tools: number;
  fileOps: number;
}

export interface RunSummaryPayload {
  status: RunStatus;
  steps: number;
  tools: number;
  fileOps: number;
  workedSeconds: number;
  creditsUsed: number;
  totalTokens: number;
  pricingVersion: string;
}

export function createEmptyRunStats(): RunStats {
  return { steps: 0, tools: 0, fileOps: 0 };
}

export function createRunStepKey(runId: string, step: AgentStep): string {
  if (step.type === 'plan') {
    const tasks = (step.data as { tasks?: string[] } | undefined)?.tasks || [];
    return `${runId}:plan:${step.content || ''}:${tasks.join('|')}`;
  }
  return `${runId}:${step.type}:${step.id}`;
}

export function applyStepToRunStats(stats: RunStats, step: AgentStep): void {
  stats.steps += 1;
  if (step.type !== 'tool_call') return;

  stats.tools += 1;
  const toolName = step.name?.toLowerCase() || '';
  if (
    toolName.includes('create') ||
    toolName.includes('edit') ||
    toolName.includes('write') ||
    toolName.includes('delete')
  ) {
    stats.fileOps += 1;
  }
}

export function computeWorkedSeconds(runStartedAtMs: number | null): number {
  if (!runStartedAtMs) return 1;
  return Math.max(1, Math.round(Math.max(0, Date.now() - runStartedAtMs) / 1000));
}

export function formatRunFinalMessage(params: {
  headline: string;
  errorText?: string;
  extraNote?: string;
}): string {
  const lines = [params.headline];
  if (params.errorText) {
    lines.push('', `Ошибка: ${params.errorText}`);
  }
  if (params.extraNote) {
    lines.push('', params.extraNote);
  }
  return lines.join('\n');
}

export function buildRunSummary(params: {
  status: RunStatus;
  stats: RunStats;
  workedSeconds: number;
  creditsUsed: number;
  totalTokens?: number;
}): RunSummaryPayload {
  return {
    status: params.status,
    steps: params.stats.steps,
    tools: params.stats.tools,
    fileOps: params.stats.fileOps,
    workedSeconds: params.workedSeconds,
    creditsUsed: params.creditsUsed,
    totalTokens: params.totalTokens || 0,
    pricingVersion: CREDITS_PRICING_VERSION,
  };
}
