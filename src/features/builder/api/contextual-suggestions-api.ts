import { apiRequest } from "@/lib/api-client";

export interface ContextualSuggestion {
  id: string;
  text: string;
  type: "improve" | "add" | "fix" | "effect";
  priority: "high" | "medium" | "low";
  reasoning?: string;
}

export interface ContextualSuggestionsRequest {
  projectType: string;
  projectName?: string;
  existingFiles: string[];
  lastUserMessage?: string;
  lastAssistantMessage?: string;
  recentErrors?: string[];
  hasCompletedBuild: boolean;
}

export function fetchContextualSuggestions(payload: ContextualSuggestionsRequest) {
  return apiRequest<{
    suggestions: ContextualSuggestion[];
    source?: string;
  }>("/contextual-suggestions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
