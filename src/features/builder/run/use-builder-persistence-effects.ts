import { useEffect, useRef } from "react";
import type { Project, ReactProjectFile } from "@/hooks/useProject";
import type { ChatMessage } from "@/hooks/useChatHistory";
import type { ProjectStructure } from "@/types/project";

interface UseBuilderPersistenceEffectsParams {
  orchestratorCompleted: boolean;
  orchestratorRunning: boolean;
  reactProject: ProjectStructure | null;
  project: Project | null;
  messages: ChatMessage[];
  cacheProject: (
    project: ProjectStructure,
    options?: { id?: string; name?: string; prompt?: string }
  ) => string;
  saveProject: (
    updates: Partial<Project>,
    options?: { silent?: boolean }
  ) => Promise<boolean>;
}

export function useBuilderPersistenceEffects({
  orchestratorCompleted,
  orchestratorRunning,
  reactProject,
  project,
  messages,
  cacheProject,
  saveProject,
}: UseBuilderPersistenceEffectsParams) {
  const hasSavedRef = useRef(false);

  useEffect(() => {
    if (orchestratorCompleted && reactProject && !hasSavedRef.current) {
      hasSavedRef.current = true;

      cacheProject(reactProject, {
        id: project?.id || `local_${Date.now()}`,
        name: project?.name || "Новый проект",
        prompt: messages[messages.length - 2]?.content,
      });

      if (project?.id) {
        const filesToSave: ReactProjectFile[] = reactProject.files.map((file) => ({
          path: file.path,
          content: file.content,
          type: file.type,
          language: file.language,
        }));
        void saveProject(
          {
            react_files: filesToSave,
            dependencies: reactProject.dependencies,
          },
          { silent: true }
        );
      }
    }

    if (orchestratorRunning) {
      hasSavedRef.current = false;
    }
  }, [
    cacheProject,
    messages,
    orchestratorCompleted,
    orchestratorRunning,
    project?.id,
    project?.name,
    reactProject,
    saveProject,
  ]);
}
