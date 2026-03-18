import { useCallback, type MutableRefObject } from 'react';
import { toast } from 'sonner';
import { CHAT_UI_EVENT_CONTRACT_VERSION } from '@/lib/chat-ui-event-contract';
import { buildRunSummary, computeWorkedSeconds, formatRunFinalMessage, type RunStats } from './run-execution';
import type { PipelineMode, PipelinePhase } from '@/hooks/useUnifiedOrchestrator';

interface UseBuilderStopActionParams {
  projectId?: string;
  orchestrator: {
    stop: () => void;
    reset: () => void;
  };
  addMessage: (
    message: {
      role: 'assistant' | 'system' | 'user';
      content: string;
      metadata?: Record<string, unknown>;
    },
    pid?: string
  ) => Promise<unknown>;
  currentRunIdRef: MutableRefObject<string | null>;
  runStartedAtRef: MutableRefObject<number | null>;
  runStatsRef: MutableRefObject<RunStats>;
  markTerminated: (value: boolean) => void;
  resetSession: (clearTermination?: boolean) => void;
  setCurrentMode: (mode: PipelineMode | null) => void;
  setCurrentPhase: (phase: PipelinePhase | null) => void;
}

export function useBuilderStopAction({
  projectId,
  orchestrator,
  addMessage,
  currentRunIdRef,
  runStartedAtRef,
  runStatsRef,
  markTerminated,
  resetSession,
  setCurrentMode,
  setCurrentPhase,
}: UseBuilderStopActionParams) {
  return useCallback(() => {
    console.log('🛑 Force stopping orchestrator');
    markTerminated(true);

    const runId = currentRunIdRef.current;
    const workedSeconds = computeWorkedSeconds(runStartedAtRef.current);
    const stats = runStatsRef.current;

    if (projectId && runStartedAtRef.current) {
      const content = formatRunFinalMessage({
        headline: '🛑 Генерация остановлена',
      });
      addMessage(
        {
          role: 'assistant',
          content,
          metadata: {
            chatUiEventContractVersion: CHAT_UI_EVENT_CONTRACT_VERSION,
            runId,
            runSummary: buildRunSummary({
              status: 'cancelled',
              stats,
              workedSeconds,
              creditsUsed: 0,
              totalTokens: 0,
            }),
          },
        },
        projectId
      );
    }

    orchestrator.stop();
    orchestrator.reset();
    setCurrentMode(null);
    setCurrentPhase(null);
    resetSession(true);
    toast.info('Генерация остановлена');
  }, [
    addMessage,
    currentRunIdRef,
    markTerminated,
    orchestrator,
    projectId,
    resetSession,
    runStartedAtRef,
    runStatsRef,
    setCurrentMode,
    setCurrentPhase,
  ]);
}
