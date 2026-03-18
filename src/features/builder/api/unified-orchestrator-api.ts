import { apiStreamRequest } from "@/lib/api-client";
import { warnOnProtocolVersionMismatch } from "@/lib/protocol-version";
import { consumeSseJsonStream } from "@/features/builder/api/sse-client";

export interface UnifiedOrchestratorStreamPayload {
  prompt: string;
  files: Record<string, string>;
  packages: string[];
  mode?: string;
  projectId?: string;
  userId?: string;
  tenantId?: string;
  builderContext?: unknown;
  attachedImages?: string[];
}

interface UnifiedOrchestratorStreamOptions {
  signal?: AbortSignal;
  tenantId?: string;
}

type UnifiedOrchestratorEventHandler = (event: Record<string, unknown>) => void;

export async function runUnifiedOrchestratorStream(
  payload: UnifiedOrchestratorStreamPayload,
  onEvent: UnifiedOrchestratorEventHandler,
  options: UnifiedOrchestratorStreamOptions = {}
): Promise<void> {
  const response = await apiStreamRequest("/unified-orchestrator", {
    method: "POST",
    headers: options.tenantId ? { "X-Tenant-Id": options.tenantId } : undefined,
    body: JSON.stringify(payload),
    signal: options.signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({} as Record<string, unknown>));
    const message =
      typeof errorData?.error === "string" ? errorData.error : `HTTP ${response.status}`;
    throw new Error(message);
  }

  warnOnProtocolVersionMismatch("/unified-orchestrator", response);
  await consumeSseJsonStream(response, onEvent);
}
