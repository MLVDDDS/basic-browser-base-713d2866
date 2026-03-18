import { apiRequest } from "@/lib/api-client";

interface ChatMessagePayload {
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessageRowDto {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export async function fetchProjectMessages(projectId: string, limit = 1000) {
  return apiRequest<{ messages: ChatMessageRowDto[] }>(
    `/projects/${projectId}/messages?limit=${limit}`
  );
}

export async function createProjectMessage(projectId: string, payload: ChatMessagePayload) {
  return apiRequest<{ message: ChatMessageRowDto }>(`/projects/${projectId}/messages`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createProjectMessagesBulk(
  projectId: string,
  messages: ChatMessagePayload[]
) {
  return apiRequest<{ messages: ChatMessageRowDto[] }>(`/projects/${projectId}/messages/bulk`, {
    method: "POST",
    body: JSON.stringify({ messages }),
  });
}

export async function deleteProjectMessages(projectId: string) {
  return apiRequest(`/projects/${projectId}/messages`, {
    method: "DELETE",
  });
}
