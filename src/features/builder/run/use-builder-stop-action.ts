import { useCallback, type MutableRefObject } from 'react';
import { toast } from 'sonner';
import { CHAT_UI_EVENT_CONTRACT_VERSION } from '@/lib/chat-ui-event-contract';
import { buildRunSummary, computeWorkedSeconds, formatRunFinalMessage, type RunStats } from './run-execution';
import type { PipelineMode, PipelinePhase } from '@/hooks/useUnifiedOrchestrator';
import type { ChatMessage } from '@/hooks/useChatHistory';
import type { ChatTimelineEvent } from '@/lib/chat-ui-event-contract';

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
  ) => Promise<ChatMessage | null>;
  currentRunIdRef: MutableRefObject<string | null>;
  runStartedAtRef: MutableRefObject<number | null>;
  runStatsRef: MutableRefObject<RunStats>;
  timelineEvents: ChatTimelineEvent[];
  updatePersistedRun: (
    runId: string,
    payload: {
      status?: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
      summary?: Record<string, unknown>;
      latestMessageId?: string | null;
      completedAt?: string | null;
    }
  ) => Promise<unknown>;
  replacePersistedRunEvents: (
    runId: string,
    events: Array<{
      seq?: number;
      eventType: string;
      label: string;
      status: 'info' | 'success' | 'error';
      phase?: string | null;
      toolName?: string | null;
      path?: string | null;
      payload?: Record<string, unknown>;
      createdAt?: string | number | null;
    }>
  ) => Promise<unknown>;
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
  timelineEvents,
  updatePersistedRun,
  replacePersistedRunEvents,
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
    const runSummary = buildRunSummary({
      status: 'cancelled',
      stats,
      workedSeconds,
      creditsUsed: 0,
      totalTokens: 0,
    });

    if (projectId && runStartedAtRef.current) {
      const content = formatRunFinalMessage({
        headline: '🛑 Генерация остановлена',
      });
      const saveMessagePromise = addMessage(
        {
          role: 'assistant',
          content,
          metadata: {
            chatUiEventContractVersion: CHAT_UI_EVENT_CONTRACT_VERSION,
            runId,
            runSummary,
          },
        },
        projectId
      );

      if (runId) {
        void updatePersistedRun(runId, {
          status: 'cancelled',
          summary: runSummary as unknown as Record<string, unknown>,
          completedAt: new Date().toISOString(),
        });
        void replacePersistedRunEvents(
          runId,
          timelineEvents.map((event, index) => ({
            seq: index + 1,
            eventType: event.eventType,
            label: event.label,
            status: event.status,
            phase: event.phase || null,
            toolName: event.toolName || null,
            path: event.path || null,
            createdAt: event.timestamp,
            payload: {},
          }))
        );
        void saveMessagePromise.then((savedMessage) => {
          if (!savedMessage?.id) return;
          void updatePersistedRun(runId, {
            latestMessageId: savedMessage.id,
          });
        });
      }
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
    replacePersistedRunEvents,
    resetSession,
    runStartedAtRef,
    runStatsRef,
    setCurrentMode,
    setCurrentPhase,
    timelineEvents,
    updatePersistedRun,
  ]);
}
