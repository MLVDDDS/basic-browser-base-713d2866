import { apiRequest } from "@/lib/api-client";

export interface PromptPreprocessorRequest {
  prompt: string;
  context?: unknown;
  attachedFiles?: unknown[];
}

export async function preprocessPromptRequest<T = Record<string, unknown>>(
  payload: PromptPreprocessorRequest
) {
  return apiRequest<T>("/prompt-preprocessor", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
