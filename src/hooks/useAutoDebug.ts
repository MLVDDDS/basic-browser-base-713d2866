import { useState, useCallback } from "react";
import type { AgentModel } from "./useAgentCore";

export interface DebugResult {
  session: {
    errors: string[];
    attempts: number;
    fixes: Array<{ file: string; patch: string }>;
    status: "analyzing" | "fixing" | "verifying" | "success" | "failed";
  };
  finalStatus: string;
  totalAttempts: number;
  fixes: Array<{ file: string; patch: string }>;
}

interface AutoDebugState {
  isLoading: boolean;
  error: string | null;
}

export function useAutoDebug() {
  const [state, setState] = useState<AutoDebugState>({
    isLoading: false,
    error: null,
  });

  const autoDebug = useCallback(
    async (
      errorLog: string,
      context?: string,
      model: AgentModel = "sonnet"
    ): Promise<DebugResult | null> => {
      void errorLog;
      void context;
      void model;
      setState({ isLoading: true, error: null });

      const message =
        "Auto-debug через отдельный endpoint пока не реализован. Используй основной агент с mode=debug.";
      setState({ isLoading: false, error: message });
      return null;
    },
    []
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    autoDebug,
    isLoading: state.isLoading,
    error: state.error,
    clearError,
  };
}
