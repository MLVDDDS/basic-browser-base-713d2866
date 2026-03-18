import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { ChatMessage } from "@/hooks/useChatHistory";
import type { Project } from "@/hooks/useProject";
import type { SmartSuggestion } from "@/hooks/useSmartSuggestions";
import type { ProjectStructure } from "@/types/project";

type ProjectType = "website" | "tma";

interface UseBuilderSyncEffectsParams {
  project: Project | null;
  projectType: ProjectType;
  setProjectType: Dispatch<SetStateAction<ProjectType>>;
  smartSuggestionItems: SmartSuggestion[];
  setSuggestions: Dispatch<SetStateAction<SmartSuggestion[]>>;
  isGenerating: boolean;
  messages: ChatMessage[];
  orchestratorTextOutput: string;
  currentRunId: string | null;
  hasContent: boolean;
  reactProject: ProjectStructure | null;
  fetchSmartSuggestions: (context: {
    projectType: string;
    projectName?: string;
    existingFiles: string[];
    lastUserMessage?: string;
    lastAssistantMessage?: string;
    recentErrors?: string[];
    hasCompletedBuild: boolean;
  }) => Promise<void>;
  fetchProjectVersions: () => Promise<void>;
  isNewProject: boolean;
  isProjectCacheLoaded: boolean;
  hasCachedProjects: boolean;
  setShowCacheRestore: Dispatch<SetStateAction<boolean>>;
  setReactProject: (project: ProjectStructure) => void;
  setHasContent: Dispatch<SetStateAction<boolean>>;
  setMessages: (messages: ChatMessage[]) => void;
}

export function useBuilderSyncEffects({
  project,
  projectType,
  setProjectType,
  smartSuggestionItems,
  setSuggestions,
  isGenerating,
  messages,
  orchestratorTextOutput,
  currentRunId,
  hasContent,
  reactProject,
  fetchSmartSuggestions,
  fetchProjectVersions,
  isNewProject,
  isProjectCacheLoaded,
  hasCachedProjects,
  setShowCacheRestore,
  setReactProject,
  setHasContent,
  setMessages,
}: UseBuilderSyncEffectsParams) {
  useEffect(() => {
    setSuggestions(smartSuggestionItems);
  }, [setSuggestions, smartSuggestionItems]);

  useEffect(() => {
    if (project?.type && project.type !== projectType) {
      console.log(`[Builder] Syncing projectType from DB: ${project.type}`);
      setProjectType(project.type as ProjectType);
    }
  }, [project?.type, projectType, setProjectType]);

  useEffect(() => {
    if (project?.id) {
      void fetchProjectVersions();
    }
  }, [project?.id, fetchProjectVersions]);

  useEffect(() => {
    if (isGenerating || messages.length === 0) return;

    const lastUserMsg = messages.filter((m) => m.role === "user").pop();
    const lastAssistantMsg = messages.filter((m) => m.role === "assistant").pop();

    const hasBuild = hasContent || (reactProject?.files.length || 0) > 0;
    if (!hasBuild) return;

    void fetchSmartSuggestions({
      projectType,
      projectName: project?.name,
      existingFiles: reactProject?.files.map((f) => f.path) || [],
      lastUserMessage: lastUserMsg?.content,
      lastAssistantMessage: lastAssistantMsg?.content,
      recentErrors: messages
        .filter((message) => message.role === "assistant" && /ошиб|error|failed|broken/i.test(message.content || ""))
        .slice(-3)
        .map((message) => message.content),
      hasCompletedBuild: hasBuild,
    });
  }, [
    project?.name,
    messages,
    isGenerating,
    hasContent,
    reactProject?.files,
    projectType,
    fetchSmartSuggestions,
  ]);

  useEffect(() => {
    if (isNewProject && isProjectCacheLoaded && hasCachedProjects && !reactProject) {
      setShowCacheRestore(true);
    }
  }, [hasCachedProjects, isNewProject, isProjectCacheLoaded, reactProject, setShowCacheRestore]);

  useEffect(() => {
    if (project?.react_files && project.react_files.length > 0 && !reactProject) {
      const files = project.react_files.map((f) => {
        let filePath = f.path;
        if (!filePath.startsWith("/")) filePath = `/${filePath}`;
        if (filePath === "/App.tsx") filePath = "/src/App.tsx";
        if (filePath === "/main.tsx") filePath = "/src/main.tsx";
        if (filePath === "/index.css") filePath = "/src/index.css";
        return { ...f, path: filePath };
      });

      setReactProject({
        entryPoint: "/src/App.tsx",
        files,
        dependencies: project.dependencies || {},
      });
      setHasContent(true);
    }
  }, [project?.react_files, project?.dependencies, reactProject, setHasContent, setReactProject]);

  useEffect(() => {
    const completedRunIds = new Set(
      messages
        .filter((message) => message.role === 'assistant' && message.metadata?.runSummary)
        .map((message) => String(message.metadata?.runId || '').trim())
        .filter(Boolean)
    );

    if (completedRunIds.size === 0) return;

    const nextMessages = messages.filter((message) => {
      if (message.metadata?.type !== 'live_assistant') return true;
      const runId = String(message.metadata?.runId || '').trim();
      return !runId || !completedRunIds.has(runId);
    });

    if (nextMessages.length !== messages.length) {
      setMessages(nextMessages);
    }
  }, [currentRunId, isGenerating, messages, orchestratorTextOutput, setMessages]);
}
