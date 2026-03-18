import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isApiConfigured } from "@/lib/api-client";
import {
  createProjectVersion,
  fetchProjectVersions,
  restoreProjectVersion,
} from "@/features/builder/api/project-versions-api";

export interface ProjectVersion {
  id: string;
  project_id: string;
  version_number: number;
  message: string | null;
  files: Record<string, string>;
  diff: { added: string[]; modified: string[]; removed: string[] } | null;
  files_changed: number;
  lines_added: number;
  lines_removed: number;
  is_published: boolean;
  created_at: string;
}

export function useProjectVersions(projectId: string) {
  const { user } = useAuth();
  const apiEnabled = isApiConfigured();
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVersions = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    if (!apiEnabled) {
      setVersions([]);
      setIsLoading(false);
      return;
    }

    const response = await fetchProjectVersions(projectId);
    setVersions((response.versions || []) as ProjectVersion[]);
    setIsLoading(false);
  }, [projectId, apiEnabled]);

  const createVersion = useCallback(async (
    files: Record<string, string>,
    message?: string
  ): Promise<ProjectVersion | null> => {
    if (!user || !projectId) return null;
    if (!apiEnabled) return null;

    const response = await createProjectVersion(projectId, {
      files,
      message: message || null,
    });
    if (response.version) {
      setVersions(prev => [response.version as ProjectVersion, ...prev]);
    }
    return response.version as ProjectVersion;
  }, [user, projectId, apiEnabled]);

  const restoreVersion = useCallback(async (versionId: string): Promise<ProjectVersion | null> => {
    if (!user) return null;
    if (!apiEnabled) return null;

    const response = await restoreProjectVersion(projectId, versionId);
    if (response.version) fetchVersions();
    return response.version as ProjectVersion;
  }, [user, projectId, apiEnabled, fetchVersions]);

  return { versions, isLoading, fetchVersions, createVersion, restoreVersion };
}
