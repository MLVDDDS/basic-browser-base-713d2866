import { useAgentCore } from "./useAgentCore";
import { useAutoDebug } from "./useAutoDebug";

export type {
  AgentModel,
  AgentMode,
  AgentOptions,
  AgentResult,
  AgentState,
} from "./useAgentCore";
export type { DebugResult } from "./useAutoDebug";

export function useAgent() {
  const core = useAgentCore();
  const debug = useAutoDebug();

  return {
    runAgent: core.runAgent,
    stopAgent: core.stopAgent,
    autoDebug: debug.autoDebug,
    isLoading: core.isLoading || debug.isLoading,
    error: core.error || debug.error,
    streamedContent: core.streamedContent,
    thinkingContent: core.thinkingContent,
    steps: core.steps,
    currentStep: core.currentStep,
    files: core.files,
    clearError: () => {
      core.clearError();
      debug.clearError();
    },
    clearContent: core.clearContent,
  };
}

export default useAgent;
