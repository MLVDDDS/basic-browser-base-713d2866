import { describe, expect, it } from 'vitest';
import { deriveBuilderRunHistory } from '@/features/builder/history/run-history';
import type { ChatMessage } from '@/hooks/useChatHistory';
import type { ProjectVersion } from '@/hooks/useProjectVersions';

describe('run-history', () => {
  it('projects persisted assistant messages into run history linked with versions', () => {
    const messages: ChatMessage[] = [
      {
        id: 'msg-1',
        role: 'assistant',
        content: '✅ Собран новый экран',
        timestamp: new Date('2026-03-18T01:00:00.000Z'),
        metadata: {
          runId: 'run-1',
          runSummary: {
            status: 'success',
            steps: 3,
            tools: 2,
            fileOps: 2,
            workedSeconds: 12,
            creditsUsed: 1,
          },
          chatTimeline: [
            {
              contractVersion: 'chat-ui-v1',
              id: 'evt-1',
              eventType: 'phase',
              label: 'Этап: Выполнение',
              status: 'info',
              timestamp: 1710723600000,
            },
          ],
          versionDiff: {
            contractVersion: 'chat-ui-v1',
            fromVersion: null,
            toVersion: 1,
            filesChanged: [{ path: '/src/App.tsx', action: 'created' }],
          },
          versionRef: {
            id: 'version-1',
            number: 1,
          },
        },
      },
    ];

    const versions: ProjectVersion[] = [
      {
        id: 'version-1',
        project_id: 'project-1',
        version_number: 1,
        message: 'Первая генерация',
        files: {
          '/src/App.tsx': 'export default function App() { return <div>Hello</div>; }',
        },
        diff: {
          added: ['/src/App.tsx'],
          modified: [],
          removed: [],
        },
        files_changed: 1,
        lines_added: 1,
        lines_removed: 0,
        is_published: false,
        created_at: '2026-03-18T01:00:00.000Z',
      },
    ];

    const runs = deriveBuilderRunHistory(messages, versions);

    expect(runs).toHaveLength(1);
    expect(runs[0].runId).toBe('run-1');
    expect(runs[0].title).toContain('Собран новый экран');
    expect(runs[0].version?.id).toBe('version-1');
    expect(runs[0].timelineEvents).toHaveLength(1);
    expect(runs[0].fileDiffs).toHaveLength(1);
    expect(runs[0].fileDiffs[0].path).toBe('/src/App.tsx');
  });
});
