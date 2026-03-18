import { useEffect } from "react";
import { toast } from "sonner";

interface UseBuilderRuntimeEffectsParams {
  isGenerating: boolean;
  orchestratorRunning: boolean;
  orchestratorStepsLength: number;
  orchestratorTextOutput: string;
  currentPhase: string | null;
  resetOrchestrator: () => void;
  orchestratorError: string | null;
}

export function useBuilderRuntimeEffects({
  isGenerating,
  orchestratorRunning,
  orchestratorStepsLength,
  orchestratorTextOutput,
  currentPhase,
  resetOrchestrator,
  orchestratorError,
}: UseBuilderRuntimeEffectsParams) {
  useEffect(() => {
    console.log("🔄 isGenerating changed:", {
      isGenerating,
      orchestrator: orchestratorRunning,
    });
  }, [isGenerating, orchestratorRunning]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasLiveAssistantText = Boolean(String(orchestratorTextOutput || "").trim());
      const hasActivePhase = Boolean(String(currentPhase || "").trim());
      if (
        orchestratorRunning &&
        !orchestratorStepsLength &&
        !hasLiveAssistantText &&
        !hasActivePhase
      ) {
        console.log("⚠️ Orchestrator stuck after timeout, resetting...");
        resetOrchestrator();
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [
    currentPhase,
    orchestratorRunning,
    orchestratorStepsLength,
    orchestratorTextOutput,
    resetOrchestrator,
  ]);

  useEffect(() => {
    if (orchestratorError) {
      toast.error("Ошибка оркестратора", { description: orchestratorError });
    }
  }, [orchestratorError]);
}
