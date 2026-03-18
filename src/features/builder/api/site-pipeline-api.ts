import { apiStreamRequest } from "@/lib/api-client";
import { warnOnProtocolVersionMismatch } from "@/lib/protocol-version";
import { consumeSseJsonStream } from "@/features/builder/api/sse-client";

export interface SitePipelineRequestPayload {
  prompt: string;
  context?: string;
  stream: true;
}

export async function runSitePipelineStream(
  payload: SitePipelineRequestPayload,
  onEvent: (event: Record<string, unknown>) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await apiStreamRequest("/site-pipeline", {
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

  warnOnProtocolVersionMismatch("/site-pipeline", response);
  await consumeSseJsonStream(response, onEvent);
}
