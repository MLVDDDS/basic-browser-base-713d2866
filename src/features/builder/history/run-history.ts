import type { RunSummary } from '@/components/chat/RunSummaryCard';
import { createFileDiff, type FileDiff } from '@/components/builder/diff-utils';
import type { ProjectRunDto } from '@/features/builder/api/project-runs-api';
import type { ChatMessage } from '@/hooks/useChatHistory';
import type { ProjectVersion } from '@/hooks/useProjectVersions';
import type { ChatTimelineEvent, ChatVersionDiff } from '@/lib/chat-ui-event-contract';

export type BuilderHistoryTab = 'timeline' | 'changes';

export interface BuilderRunHistoryItem {
  runId: string;
  messageId: string;
  createdAt: string;
  title: string;
  content: string;
  runSummary?: RunSummary;
  timelineEvents: ChatTimelineEvent[];
  versionDiff: ChatVersionDiff | null;
  version: ProjectVersion | null;
  previousVersion: ProjectVersion | null;
  fileDiffs: FileDiff[];
}

function isStructuredRunMessage(message: ChatMessage): boolean {
  if (message.role !== 'assistant') return false;
  if (message.metadata?.type === 'live_assistant') return false;

  const runId = String(message.metadata?.runId || '').trim();
  if (!runId) return false;

  return (
    Boolean(message.metadata?.runSummary) ||
    Boolean(message.metadata?.versionDiff) ||
    (Array.isArray(message.metadata?.chatTimeline) && message.metadata.chatTimeline.length > 0)
  );
}

function selectCanonicalRunMessage(messages: ChatMessage[]): ChatMessage {
  return [...messages].sort((a, b) => {
    const aScore =
      (a.metadata?.runSummary ? 100 : 0) +
      (Array.isArray(a.metadata?.chatTimeline) ? a.metadata.chatTimeline.length : 0);
    const bScore =
      (b.metadata?.runSummary ? 100 : 0) +
      (Array.isArray(b.metadata?.chatTimeline) ? b.metadata.chatTimeline.length : 0);
    if (aScore !== bScore) return bScore - aScore;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  })[0];
}

function resolveRunTitle(content: string, summary?: RunSummary): string {
  const firstLine = String(content || '')
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);
  if (firstLine) {
    return firstLine.replace(/^[^\p{L}\p{N}]+/gu, '').trim() || firstLine;
  }
  if (summary?.status === 'failed') return 'Ошибка генерации';
  if (summary?.status === 'cancelled') return 'Генерация остановлена';
  return 'Результат генерации';
}

function getVersionFile(files: Record<string, string> | null | undefined, targetPath: string): string | null {
  if (!files) return null;
  if (typeof files[targetPath] === 'string') return files[targetPath];

  const altPath = targetPath.startsWith('/') ? targetPath.slice(1) : `/${targetPath}`;
  for (const [path, content] of Object.entries(files)) {
    if (path === targetPath || path === altPath || `/${path}` === targetPath) {
      return content;
    }
  }
  return null;
}

function buildRunFileDiffs(
  versionDiff: ChatVersionDiff | null,
  version: ProjectVersion | null,
  previousVersion: ProjectVersion | null
): FileDiff[] {
  const entries = Array.isArray(versionDiff?.filesChanged) ? versionDiff.filesChanged : [];
  if (entries.length === 0) return [];

  return entries.map((entry) =>
    createFileDiff(
      entry.path,
      getVersionFile(previousVersion?.files, entry.path),
      getVersionFile(version?.files, entry.path)
    )
  );
}

export function deriveBuilderRunHistory(
  messages: ChatMessage[],
  versions: ProjectVersion[]
): BuilderRunHistoryItem[] {
  const runBuckets = new Map<string, ChatMessage[]>();
  for (const message of messages) {
    if (!isStructuredRunMessage(message)) continue;
    const runId = String(message.metadata?.runId || '').trim();
    const bucket = runBuckets.get(runId) || [];
    bucket.push(message);
    runBuckets.set(runId, bucket);
  }

  const versionsById = new Map(versions.map((version) => [version.id, version]));
  const versionsByNumber = new Map(versions.map((version) => [Number(version.version_number || 0), version]));

  return [...runBuckets.entries()]
    .map(([runId, runMessages]) => {
      const message = selectCanonicalRunMessage(runMessages);
      const runSummary = message.metadata?.runSummary as RunSummary | undefined;
      const timelineEvents = Array.isArray(message.metadata?.chatTimeline)
        ? (message.metadata?.chatTimeline as ChatTimelineEvent[])
        : [];
      const versionDiff = (message.metadata?.versionDiff as ChatVersionDiff | undefined) || null;
      const versionRef = message.metadata?.versionRef as { id?: string; number?: number } | undefined;
      const version =
        (versionRef?.id ? versionsById.get(String(versionRef.id)) : null) ||
        (versionRef?.number ? versionsByNumber.get(Number(versionRef.number)) : null) ||
        (versionDiff?.toVersion ? versionsByNumber.get(Number(versionDiff.toVersion)) : null) ||
        null;
      const previousVersion =
        version && Number(version.version_number) > 1
          ? versionsByNumber.get(Number(version.version_number) - 1) || null
          : null;

      return {
        runId,
        messageId: message.id,
        createdAt: message.timestamp.toISOString(),
        title: resolveRunTitle(message.content, runSummary),
        content: message.content,
        runSummary,
        timelineEvents,
        versionDiff,
        version,
        previousVersion,
        fileDiffs: buildRunFileDiffs(versionDiff, version, previousVersion),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function mapProjectRunsToBuilderHistory(
  runs: ProjectRunDto[],
  versions: ProjectVersion[]
): BuilderRunHistoryItem[] {
  const versionsById = new Map(versions.map((version) => [version.id, version]));
  const versionsByNumber = new Map(versions.map((version) => [Number(version.version_number || 0), version]));

  return runs
    .map((run) => {
      const metadata = run.metadata && typeof run.metadata === 'object' ? run.metadata : {};
      const versionRef = metadata.versionRef as { id?: string; number?: number } | undefined;
      const version =
        (run.version_id ? versionsById.get(String(run.version_id)) : null) ||
        (versionRef?.id ? versionsById.get(String(versionRef.id)) : null) ||
        (versionRef?.number ? versionsByNumber.get(Number(versionRef.number)) : null) ||
        null;
      const previousVersion =
        version && Number(version.version_number) > 1
          ? versionsByNumber.get(Number(version.version_number) - 1) || null
          : null;
      const summary = (run.summary || {}) as RunSummary;
      const versionDiff = (metadata.versionDiff || null) as ChatVersionDiff | null;
      const timelineEvents: ChatTimelineEvent[] = Array.isArray(run.events)
        ? run.events.map((event) => ({
            contractVersion: 'chat-ui-v1',
            id: `${run.run_id}:${event.seq}`,
            eventType: (event.event_type || 'other') as ChatTimelineEvent['eventType'],
            label: event.label,
            status: event.status,
            timestamp: new Date(event.created_at).getTime(),
            phase: event.phase || undefined,
            toolName: event.tool_name || undefined,
            path: event.path || undefined,
          }))
        : [];

      return {
        runId: run.run_id,
        messageId: String(run.latest_message_id || ''),
        createdAt: String(run.created_at || run.started_at || new Date(0).toISOString()),
        title: resolveRunTitle(run.prompt || '', summary),
        content: run.prompt || '',
        runSummary: summary,
        timelineEvents,
        versionDiff,
        version,
        previousVersion,
        fileDiffs: buildRunFileDiffs(versionDiff, version, previousVersion),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
