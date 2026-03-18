import type { MutableRefObject } from 'react';
import { createEmptyRunStats, type RunStats } from '@/features/builder/run/run-execution';

interface RunSessionRefs {
  runStartedAtRef: MutableRefObject<number | null>;
  currentRunIdRef: MutableRefObject<string | null>;
  seenRunStepKeysRef: MutableRefObject<Set<string>>;
  runStatsRef: MutableRefObject<RunStats>;
  pendingFilesRef?: MutableRefObject<Record<string, string>>;
}

export function beginRunSession(refs: RunSessionRefs): string {
  const runId = `run_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  refs.currentRunIdRef.current = runId;
  refs.seenRunStepKeysRef.current.clear();
  refs.runStartedAtRef.current = Date.now();
  refs.runStatsRef.current = createEmptyRunStats();
  if (refs.pendingFilesRef) {
    refs.pendingFilesRef.current = {};
  }
  return runId;
}

export function resetRunSession(
  refs: RunSessionRefs,
  options: { clearPendingFiles?: boolean } = {}
): void {
  refs.runStartedAtRef.current = null;
  refs.currentRunIdRef.current = null;
  refs.seenRunStepKeysRef.current.clear();
  refs.runStatsRef.current = createEmptyRunStats();
  if (options.clearPendingFiles && refs.pendingFilesRef) {
    refs.pendingFilesRef.current = {};
  }
}
