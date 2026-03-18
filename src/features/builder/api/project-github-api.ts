import { apiRequest } from "@/lib/api-client";

export interface ProjectGithubLink {
  linked: boolean;
  repoOwner: string | null;
  repoName: string | null;
  branch: string | null;
  repoUrl: string | null;
  connectedAt: string | null;
  updatedAt: string | null;
}

export interface ProjectGithubStatusResponse {
  ok: boolean;
  projectId: string;
  github: ProjectGithubLink;
  account?: {
    connected: boolean;
    login: string | null;
    githubUserId: number | null;
    scope: string | null;
  };
}

export interface LinkProjectGithubPayload {
  repoOwner: string;
  repoName: string;
  branch?: string;
}

export interface GithubOauthStartResponse {
  ok: boolean;
  authorizeUrl: string;
  stateIssuedAt: number;
}

export interface ProjectGithubSyncRun {
  id: string;
  projectId: string;
  userId: string;
  direction: "push" | "pull" | string;
  status: string;
  repoOwner: string | null;
  repoName: string | null;
  branch: string | null;
  commitSha: string | null;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProjectGithubSyncRunsResponse {
  ok: boolean;
  projectId: string;
  runs: ProjectGithubSyncRun[];
}

export interface EnqueueProjectGithubSyncRunResponse {
  ok: boolean;
  projectId: string;
  run: ProjectGithubSyncRun | null;
}

export async function fetchProjectGithubStatus(projectId: string) {
  return apiRequest<ProjectGithubStatusResponse>(`/projects/${projectId}/github/status`);
}

export async function linkProjectGithub(projectId: string, payload: LinkProjectGithubPayload) {
  return apiRequest<ProjectGithubStatusResponse>(`/projects/${projectId}/github/link`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function disconnectProjectGithub(projectId: string) {
  return apiRequest<ProjectGithubStatusResponse>(`/projects/${projectId}/github/disconnect`, {
    method: "POST",
  });
}

export async function startGithubOauth(payload: { projectId?: string; returnPath?: string }) {
  return apiRequest<GithubOauthStartResponse>(`/integrations/github/oauth/start`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchProjectGithubSyncRuns(projectId: string, limit = 20) {
  const search = new URLSearchParams({ limit: String(limit) });
  return apiRequest<ProjectGithubSyncRunsResponse>(
    `/projects/${projectId}/github/sync-runs?${search.toString()}`
  );
}

export async function enqueueProjectGithubSyncRun(
  projectId: string,
  direction: "push" | "pull"
) {
  return apiRequest<EnqueueProjectGithubSyncRunResponse>(`/projects/${projectId}/github/sync-runs`, {
    method: "POST",
    body: JSON.stringify({ direction }),
  });
}
