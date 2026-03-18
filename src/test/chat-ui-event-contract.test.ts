import { describe, it, expect } from 'vitest';
import {
  CHAT_UI_EVENT_CONTRACT_VERSION,
  buildVersionDiff,
  dedupeAgentSteps,
  extractTokenUsageFromSteps,
  normalizeAgentStepsToTimeline,
} from '@/lib/chat-ui-event-contract';
import type { AgentStep } from '@/hooks/useUnifiedOrchestrator';

describe('chat-ui-event-contract', () => {
  it('dedupes duplicate non-plan steps by id keeping latest timestamp', () => {
    const steps: AgentStep[] = [
      {
        id: 'a1',
        type: 'tool_call',
        name: 'create_file',
        timestamp: 100,
      },
      {
        id: 'a1',
        type: 'tool_call',
        name: 'create_file',
        timestamp: 200,
      },
    ];

    const result = dedupeAgentSteps(steps);
    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBe(200);
  });

  it('dedupes plan steps by normalized task list fingerprint', () => {
    const steps: AgentStep[] = [
      {
        id: 'plan-1',
        type: 'plan',
        content: 'План',
        data: { tasks: ['Сделать header', 'Сделать footer'] },
        timestamp: 100,
      },
      {
        id: 'plan-2',
        type: 'plan',
        content: 'План',
        data: { tasks: ['Сделать header', 'Сделать footer'] },
        timestamp: 110,
      },
    ];

    const result = dedupeAgentSteps(steps);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('plan-2');
  });

  it('normalizes timeline with contract version and humanized tool labels', () => {
    const steps: AgentStep[] = [
      {
        id: 't1',
        type: 'tool_call',
        name: 'create_file',
        args: { path: 'src/App.tsx' },
        timestamp: 123,
      },
    ];

    const timeline = normalizeAgentStepsToTimeline(steps);
    expect(timeline).toHaveLength(1);
    expect(timeline[0].contractVersion).toBe(CHAT_UI_EVENT_CONTRACT_VERSION);
    expect(timeline[0].eventType).toBe('tool_call');
    expect(timeline[0].label).toContain('Создание файла');
    expect(timeline[0].path).toBe('src/App.tsx');
  });

  it('extracts token usage from complete step payload', () => {
    const steps: AgentStep[] = [
      {
        id: 'done',
        type: 'complete',
        data: {
          totalInputTokens: 120,
          totalOutputTokens: 80,
        },
        timestamp: Date.now(),
      },
    ];

    const usage = extractTokenUsageFromSteps(steps);
    expect(usage.inputTokens).toBe(120);
    expect(usage.outputTokens).toBe(80);
    expect(usage.totalTokens).toBe(200);
  });

  it('builds version diff with created/modified/deleted file actions', () => {
    const diff = buildVersionDiff({
      version_number: 7,
      diff: {
        added: ['src/New.tsx'],
        modified: ['src/App.tsx'],
        removed: ['src/Old.tsx'],
      },
    } as never);

    expect(diff).not.toBeNull();
    expect(diff?.contractVersion).toBe(CHAT_UI_EVENT_CONTRACT_VERSION);
    expect(diff?.fromVersion).toBe(6);
    expect(diff?.toVersion).toBe(7);
    expect(diff?.filesChanged).toEqual([
      { path: 'src/New.tsx', action: 'created' },
      { path: 'src/App.tsx', action: 'modified' },
      { path: 'src/Old.tsx', action: 'deleted' },
    ]);
  });
});
