import { useState, useCallback, useRef } from "react";
import type { AgentStep } from "@/components/AgentUI";
import { isApiConfigured } from "@/lib/api-client";
import {
  runAgentCore,
  runAgentCoreStream,
  type AgentCoreRequestPayload,
} from "@/features/builder/api/agent-core-api";

export type AgentModel = "premium" | "balanced" | "fast";
export type AgentMode = "codeGen" | "debug" | "review";

export interface AgentOptions {
  model?: AgentModel | "auto";
  mode?: AgentMode;
  stream?: boolean;
  extendedThinking?: boolean;
  tools?: boolean;
  maxTokens?: number;
  context?: {
    files?: Record<string, string>;
    error?: string;
  };
  onStep?: (step: AgentStep) => void;
  onComplete?: (result: unknown) => void;
  onError?: (error: string) => void;
}

export interface AgentResult {
  content: string;
  usage?: { input_tokens: number; output_tokens: number };
  model?: string;
}

export interface AgentState {
  isLoading: boolean;
  error: string | null;
  streamedContent: string;
  thinkingContent: string;
  steps: AgentStep[];
  currentStep: AgentStep | null;
  files: Array<{ path: string; action: "created" | "modified" }>;
}

interface StreamAgentEvent {
  type?: string;
  content?: string;
  text?: string;
  data?: unknown;
}

export const getToolLabel = (toolName: string): string => {
  const labels: Record<string, string> = {
    read_file: "Чтение файла",
    write_file: "Запись файла",
    search_codebase: "Поиск в коде",
    analyze_error: "Анализ ошибки",
    apply_fix: "Применение исправления",
    generate_component: "Генерация компонента",
  };
  return labels[toolName] || toolName;
};

export function useAgentCore() {
  const [state, setState] = useState<AgentState>({
    isLoading: false,
    error: null,
    streamedContent: "",
    thinkingContent: "",
    steps: [],
    currentStep: null,
    files: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const processAgentEvent = useCallback(
    (event: {
      type: string;
      data: unknown;
      timestamp: number;
    }) => {
      void event.timestamp;
      setState((prev) => {
        switch (event.type) {
          case "thinking_start":
            return {
              ...prev,
              thinkingContent: "",
              currentStep: {
                id: `thinking-${Date.now()}`,
                type: "thinking" as const,
                label: "Думаю...",
                status: "active" as const,
                startTime: Date.now(),
              },
            };

          case "thinking_delta":
            return {
              ...prev,
              thinkingContent:
                prev.thinkingContent +
                ((event.data as { thinking?: string }).thinking || ""),
            };

          case "thinking_end": {
            const completedThinking = prev.currentStep
              ? {
                  ...prev.currentStep,
                  status: "completed" as const,
                  content: prev.thinkingContent,
                  duration:
                    Date.now() - (prev.currentStep.startTime || Date.now()),
                }
              : null;
            return {
              ...prev,
              steps: completedThinking
                ? [...prev.steps, completedThinking]
                : prev.steps,
              currentStep: null,
            };
          }

          case "tool_start": {
            const toolData = event.data as { id: string; name: string };
            return {
              ...prev,
              currentStep: {
                id: toolData.id,
                type: "tool_use" as const,
                label: getToolLabel(toolData.name),
                status: "active" as const,
                data: { name: toolData.name },
                startTime: Date.now(),
              },
            };
          }

          case "tool_end": {
            const completedTool = prev.currentStep
              ? {
                  ...prev.currentStep,
                  status: "completed" as const,
                  duration:
                    Date.now() - (prev.currentStep.startTime || Date.now()),
                }
              : null;
            return {
              ...prev,
              steps: completedTool ? [...prev.steps, completedTool] : prev.steps,
              currentStep: null,
            };
          }

          case "text_delta":
            return {
              ...prev,
              streamedContent:
                prev.streamedContent +
                ((event.data as { text?: string }).text || ""),
            };

          case "file_modified":
          case "file_created": {
            const fileData = event.data as {
              tool_name?: string;
              result?: { file?: string };
            };
            void fileData.tool_name;
            const filePath = fileData.result?.file;
            if (!filePath) return prev;
            return {
              ...prev,
              files: [
                ...prev.files,
                {
                  path: filePath,
                  action: event.type === "file_created" ? "created" : "modified",
                },
              ],
            };
          }

          case "error":
            return {
              ...prev,
              error: (event.data as { message?: string }).message || "Unknown error",
              isLoading: false,
            };

          case "complete":
            return {
              ...prev,
              isLoading: false,
              currentStep: null,
            };

          default:
            return prev;
        }
      });
    },
    []
  );

  const runAgent = useCallback(
    async (prompt: string, options: AgentOptions = {}): Promise<AgentResult | null> => {
      const {
        model = "auto",
        mode = "codeGen",
        stream = true,
        extendedThinking = false,
        tools = true,
        maxTokens = 8192,
        context = {},
        onStep,
        onComplete,
        onError,
      } = options;

      setState({
        isLoading: true,
        error: null,
        streamedContent: "",
        thinkingContent: "",
        steps: [],
        currentStep: null,
        files: [],
      });

      abortControllerRef.current = new AbortController();

      try {
        if (!isApiConfigured()) {
          throw new Error("API не настроен");
        }

        const payload: AgentCoreRequestPayload = {
          prompt,
          model,
          mode,
          stream,
          extendedThinking,
          tools,
          maxTokens,
          context,
        };

        if (stream) {
          let fullContent = "";

          await runAgentCoreStream(
            payload,
            (rawEvent: Record<string, unknown>) => {
              const data = rawEvent as StreamAgentEvent;
              if (data.type) {
                processAgentEvent({
                  type: String(data.type),
                  data: data.data,
                  timestamp: Date.now(),
                });
                if (onStep && String(data.type).includes("_end") && state.currentStep) {
                  onStep(state.currentStep);
                }
              }
              if (data.type === "text" || data.type === "text_delta") {
                fullContent += String(data.content || data.text || "");
              }
            },
            abortControllerRef.current.signal
          );

          if (onComplete) {
            onComplete({
              content: fullContent,
              steps: state.steps,
              files: state.files,
            });
          }

          return { content: fullContent };
        }

        const data = await runAgentCore({
          ...payload,
          stream: false,
        }, abortControllerRef.current.signal);
        const textContent =
          data.content?.find((c: { type: string; text?: string }) => c.type === "text")
            ?.text || "";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          streamedContent: textContent,
        }));

        return {
          content: textContent,
          usage: data.usage,
          model: data.model,
        };
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return null;
        }

        const message = err instanceof Error ? err.message : "Agent error";
        setState((prev) => ({ ...prev, error: message, isLoading: false }));
        if (onError) {
          onError(message);
        }
        return null;
      }
    },
    [processAgentEvent, state.currentStep, state.steps, state.files]
  );

  const stopAgent = useCallback(() => {
    if (!abortControllerRef.current) return;
    abortControllerRef.current.abort();
    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearContent = useCallback(() => {
    setState((prev) => ({
      ...prev,
      streamedContent: "",
      thinkingContent: "",
      steps: [],
      currentStep: null,
      files: [],
    }));
  }, []);

  return {
    runAgent,
    stopAgent,
    isLoading: state.isLoading,
    error: state.error,
    streamedContent: state.streamedContent,
    thinkingContent: state.thinkingContent,
    steps: state.steps,
    currentStep: state.currentStep,
    files: state.files,
    clearError,
    clearContent,
  };
}
