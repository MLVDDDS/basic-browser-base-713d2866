import { apiRequest } from "@/lib/api-client";

export interface ProjectRunEventDto {
  run_id?: string;
  seq: number;
  event_type: string;
  label: string;
  status: "info" | "success" | "error";
  phase?: string | null;
  tool_name?: string | null;
  path?: string | null;
  payload?: Record<string, unknown> | null;
  created_at: string;
}

export interface ProjectRunDto {
  run_id: string;
  project_id: string;
  user_id: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  prompt?: string | null;
  mode?: string | null;
  builder_context?: Record<string, unknown> | null;
  summary?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  version_id?: string | null;
  latest_message_id?: string | null;
  preview_url?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  events?: ProjectRunEventDto[];
}

export interface ProjectRunWritePayload {
  runId: string;
  status?: ProjectRunDto["status"];
  prompt?: string;
  mode?: string | null;
  builderContext?: Record<string, unknown>;
  summary?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  versionId?: string | null;
  latestMessageId?: string | null;
  previewUrl?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface ProjectRunEventWritePayload {
  seq?: number;
  eventType: string;
  label: string;
  status: "info" | "success" | "error";
  phase?: string | null;
  toolName?: string | null;
  path?: string | null;
  payload?: Record<string, unknown>;
  createdAt?: string | number | null;
}

export async function fetchProjectRuns(projectId: string, limit = 50) {
  return apiRequest<{ runs: ProjectRunDto[] }>(`/projects/${projectId}/runs?limit=${limit}`);
}

export async function fetchProjectRun(projectId: string, runId: string) {
  return apiRequest<{ run: ProjectRunDto }>(`/projects/${projectId}/runs/${encodeURIComponent(runId)}`);
}

export async function createProjectRun(projectId: string, payload: ProjectRunWritePayload) {
  return apiRequest<{ run: ProjectRunDto }>(`/projects/${projectId}/runs`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProjectRun(projectId: string, runId: string, payload: Omit<ProjectRunWritePayload, "runId">) {
  return apiRequest<{ run: ProjectRunDto }>(`/projects/${projectId}/runs/${encodeURIComponent(runId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function replaceProjectRunEvents(
  projectId: string,
  runId: string,
  events: ProjectRunEventWritePayload[]
) {
  return apiRequest<{ ok: boolean; count: number }>(
    `/projects/${projectId}/runs/${encodeURIComponent(runId)}/events`,
    {
      method: "POST",
      body: JSON.stringify({ events }),
    }
  );
}
