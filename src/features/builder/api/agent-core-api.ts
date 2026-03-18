import { apiRequest, apiStreamRequest } from "@/lib/api-client";
import { warnOnProtocolVersionMismatch } from "@/lib/protocol-version";
import { consumeSseJsonStream } from "@/features/builder/api/sse-client";

export interface AgentCoreRequestPayload {
  prompt: string;
  model: "auto" | "premium" | "balanced" | "fast";
  mode: "codeGen" | "debug" | "review";
  stream: boolean;
  extendedThinking: boolean;
  tools: boolean;
  maxTokens: number;
  context: {
    files?: Record<string, string>;
    error?: string;
  };
}

export interface AgentCoreResponsePayload {
  content?: Array<{ type?: string; text?: string }>;
  usage?: { input_tokens: number; output_tokens: number };
  model?: string;
}

export async function runAgentCore(
  payload: AgentCoreRequestPayload,
  signal?: AbortSignal
): Promise<AgentCoreResponsePayload> {
  return apiRequest<AgentCoreResponsePayload>("/agent", {
    method: "POST",
    body: JSON.stringify(payload),
    signal,
  });
}

export async function runAgentCoreStream(
  payload: AgentCoreRequestPayload,
  onEvent: (event: Record<string, unknown>) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await apiStreamRequest("/agent", {
    method: "POST",
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({} as Record<string, unknown>));
    const message =
      typeof errorData?.error === "string" ? errorData.error : `HTTP ${response.status}`;
    throw new Error(message);
  }

  warnOnProtocolVersionMismatch("/agent", response);
  await consumeSseJsonStream(response, onEvent);
}
