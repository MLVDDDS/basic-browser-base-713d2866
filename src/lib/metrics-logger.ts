// Utility to log LLM model usage metrics.
// This file provides the interface - actual logging happens in edge functions

export interface ModelUsageMetric {
  model_id: string;
  model_tier: 'opus' | 'sonnet' | 'haiku';
  input_tokens: number;
  output_tokens: number;
  request_type: 'agent_loop' | 'orchestrated' | 'preprocessor' | 'agent' | 'section_gen';
  prompt_complexity?: 'low' | 'medium' | 'high';
  duration_ms?: number;
  user_id?: string;
  project_id?: string;
  metadata?: Record<string, unknown>;
}

// Tier mapping for current Gemini models
export const MODEL_TIER_MAP: Record<string, 'opus' | 'sonnet' | 'haiku'> = {
  'gemini-2.5-pro': 'opus',
  'gemini-2.0-flash': 'sonnet',
  'gemini-2.0-flash-lite': 'haiku',
};

// Get tier from model ID
export function getModelTier(modelId: string): 'opus' | 'sonnet' | 'haiku' {
  return MODEL_TIER_MAP[modelId] || 'sonnet';
}
