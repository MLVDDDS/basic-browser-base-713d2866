import { useCallback, useRef } from 'react';
import type { AgentStep } from '@/hooks/useUnifiedOrchestrator';
import { applyStepToRunStats, createEmptyRunStats, createRunStepKey } from '@/features/builder/run/run-execution';
import { beginRunSession, resetRunSession } from '@/features/builder/run/run-session';

type RunFileChange = {
  path: string;
  content: string;
  action: 'created' | 'modified' | 'deleted';
};

export function useRunLifecycle() {
  const runStartedAtRef = useRef<number | null>(null);
  const currentRunIdRef = useRef<string | null>(null);
  const seenRunStepKeysRef = useRef<Set<string>>(new Set());
  const pendingFilesRef = useRef<Record<string, string>>({});
  const runTerminatedByUserRef = useRef(false);
  const runStatsRef = useRef(createEmptyRunStats());

  const startRunSession = useCallback(() => {
    runTerminatedByUserRef.current = false;
    return beginRunSession({
      runStartedAtRef,
      currentRunIdRef,
      seenRunStepKeysRef,
      runStatsRef,
      pendingFilesRef,
    });
  }, []);

  const resetSession = useCallback((clearPendingFiles = false) => {
    resetRunSession(
      {
        runStartedAtRef,
        currentRunIdRef,
        seenRunStepKeysRef,
        runStatsRef,
        pendingFilesRef,
      },
      { clearPendingFiles }
    );
  }, []);

  const trackStep = useCallback((step: AgentStep): boolean => {
    const runId = currentRunIdRef.current || 'no-run';
    const stepKey = createRunStepKey(runId, step);
    if (seenRunStepKeysRef.current.has(stepKey)) {
      return false;
    }
    seenRunStepKeysRef.current.add(stepKey);
    applyStepToRunStats(runStatsRef.current, step);
    return true;
  }, []);

  const trackFileChange = useCallback((file: RunFileChange) => {
    if (file.action === 'deleted') return;
    const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
    pendingFilesRef.current[normalizedPath] = file.content;
  }, []);

  const mergePendingFiles = useCallback((runtimeFiles: Record<string, string>) => {
    return { ...pendingFilesRef.current, ...runtimeFiles };
  }, []);

  const clearPendingFiles = useCallback(() => {
    pendingFilesRef.current = {};
  }, []);

  const markTerminated = useCallback((value: boolean) => {
    runTerminatedByUserRef.current = value;
  }, []);

  const consumeTerminated = useCallback(() => {
    const value = runTerminatedByUserRef.current;
    runTerminatedByUserRef.current = false;
    return value;
  }, []);

  const clearTerminated = useCallback(() => {
    runTerminatedByUserRef.current = false;
  }, []);

  return {
    runStartedAtRef,
    currentRunIdRef,
    runStatsRef,
    startRunSession,
    resetSession,
    trackStep,
    trackFileChange,
    mergePendingFiles,
    clearPendingFiles,
    markTerminated,
    consumeTerminated,
    clearTerminated,
  };
}
