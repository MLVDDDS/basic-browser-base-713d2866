import { useCallback, useRef } from 'react';
import type { AgentStep } from './useUnifiedOrchestrator';

interface SessionConfig {
  projectId: string;
  promptSnippet?: string;
  complexityScore?: number;
  promptType?: 'create' | 'modify' | 'fix' | 'style' | 'backend';
  complexity?: 'simple' | 'medium' | 'complex' | 'epic';
}

export function useAgentLogger() {
  const sessionIdRef = useRef<string | null>(null);
  const stepIndexRef = useRef(0);
  const configRef = useRef<SessionConfig | null>(null);

  const startSession = useCallback(async (config: SessionConfig): Promise<string> => {
    const sessionId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionIdRef.current = sessionId;
    stepIndexRef.current = 0;
    configRef.current = config;
    return sessionId;
  }, []);

  const logStep = useCallback((step: AgentStep) => {
    if (!sessionIdRef.current) return;
    stepIndexRef.current += 1;
    void step;
  }, []);

  const logSteps = useCallback((steps: AgentStep[]) => {
    if (!sessionIdRef.current) return;
    stepIndexRef.current += steps.length;
  }, []);

  const endSession = useCallback(async () => {
    sessionIdRef.current = null;
    stepIndexRef.current = 0;
    configRef.current = null;
  }, []);

  const cancelSession = useCallback(async () => {
    sessionIdRef.current = null;
    stepIndexRef.current = 0;
    configRef.current = null;
  }, []);

  const flushLogs = useCallback(async () => {
    return;
  }, []);

  return {
    startSession,
    logStep,
    logSteps,
    endSession,
    cancelSession,
    flushLogs,
    sessionId: sessionIdRef.current,
  };
}

export default useAgentLogger;
