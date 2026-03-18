import { apiRequest } from "@/lib/api-client";

export interface PreviewSessionDto {
  id: string;
  status: string;
  runtime_state?: string | null;
  runtime_state_reason?: string | null;
  preview_url?: string | null;
  canvas_url?: string | null;
  runner_endpoint?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  started_at?: string | null;
  ready_at?: string | null;
  expires_at?: string | null;
}

export function createPreviewSession(projectId: string, versionId?: string | null) {
  return apiRequest<{ session: PreviewSessionDto }>("/preview/sessions", {
    method: "POST",
    body: JSON.stringify({ projectId, versionId }),
  });
}

export function fetchPreviewSessionStatus(sessionId: string) {
  return apiRequest<{ session: PreviewSessionDto }>(`/preview/sessions/${sessionId}/status`);
}

export function restartPreviewSession(sessionId: string) {
  return apiRequest<{ session: PreviewSessionDto }>(`/preview/sessions/${sessionId}/restart`, {
    method: "POST",
  });
}

export function stopPreviewSession(sessionId: string) {
  return apiRequest(`/preview/sessions/${sessionId}`, { method: "DELETE" });
}

export function pushPreviewSessionFiles(sessionId: string, files: Record<string, string | null>) {
  return apiRequest(`/preview/sessions/${sessionId}/files`, {
    method: "POST",
    body: JSON.stringify({ files }),
  });
}
