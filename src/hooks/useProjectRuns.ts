import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isApiConfigured } from "@/lib/api-client";
import {
  createProjectRun,
  fetchProjectRuns,
  replaceProjectRunEvents,
  updateProjectRun,
  type ProjectRunDto,
  type ProjectRunEventWritePayload,
  type ProjectRunWritePayload,
} from "@/features/builder/api/project-runs-api";

function upsertRun(prev: ProjectRunDto[], run: ProjectRunDto): ProjectRunDto[] {
  const next = [...prev];
  const index = next.findIndex((item) => item.run_id === run.run_id);
  if (index >= 0) {
    next[index] = {
      ...next[index],
      ...run,
      events: run.events || next[index].events || [],
    };
  } else {
    next.unshift(run);
  }
  return next.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function useProjectRuns(projectId?: string) {
  const { user } = useAuth();
  const apiEnabled = isApiConfigured();
  const [runs, setRuns] = useState<ProjectRunDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRuns = useCallback(async () => {
    if (!projectId || !apiEnabled) {
      setRuns([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchProjectRuns(projectId);
      setRuns(response.runs || []);
    } finally {
      setIsLoading(false);
    }
  }, [apiEnabled, projectId]);

  const createRun = useCallback(async (payload: ProjectRunWritePayload) => {
    if (!projectId || !user || !apiEnabled) return null;
    const response = await createProjectRun(projectId, payload);
    if (response.run) {
      setRuns((prev) => upsertRun(prev, response.run));
    }
    return response.run || null;
  }, [apiEnabled, projectId, user]);

  const patchRun = useCallback(async (runId: string, payload: Omit<ProjectRunWritePayload, "runId">) => {
    if (!projectId || !user || !apiEnabled) return null;
    const response = await updateProjectRun(projectId, runId, payload);
    if (response.run) {
      setRuns((prev) => upsertRun(prev, response.run));
    }
    return response.run || null;
  }, [apiEnabled, projectId, user]);

  const replaceRunEvents = useCallback(async (runId: string, events: ProjectRunEventWritePayload[]) => {
    if (!projectId || !user || !apiEnabled) return null;
    await replaceProjectRunEvents(projectId, runId, events);
    setRuns((prev) =>
      prev.map((run) =>
        run.run_id === runId
          ? {
              ...run,
              events: events.map((event, index) => ({
                run_id: runId,
                seq: event.seq || index + 1,
                event_type: event.eventType,
                label: event.label,
                status: event.status,
                phase: event.phase || null,
                tool_name: event.toolName || null,
                path: event.path || null,
                payload: event.payload || {},
                created_at:
                  typeof event.createdAt === "string"
                    ? event.createdAt
                    : typeof event.createdAt === "number"
                    ? new Date(event.createdAt).toISOString()
                    : new Date().toISOString(),
              })),
            }
          : run
      )
    );
    return true;
  }, [apiEnabled, projectId, user]);

  return {
    runs,
    isLoading,
    fetchRuns,
    createRun,
    updateRun: patchRun,
    replaceRunEvents,
  };
}
