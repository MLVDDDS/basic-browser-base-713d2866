import { apiRequest } from "@/lib/api-client";
import type { ProjectVersion } from "@/hooks/useProjectVersions";

export async function fetchProjectVersions(projectId: string) {
  return apiRequest<{ versions: ProjectVersion[] }>(`/projects/${projectId}/versions`);
}

export async function createProjectVersion(
  projectId: string,
  payload: { files: Record<string, string>; message?: string | null }
) {
  return apiRequest<{ version: ProjectVersion }>(`/projects/${projectId}/versions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function restoreProjectVersion(projectId: string, versionId: string) {
  return apiRequest<{ version: ProjectVersion }>(
    `/projects/${projectId}/versions/${versionId}/restore`,
    { method: "POST" }
  );
}
