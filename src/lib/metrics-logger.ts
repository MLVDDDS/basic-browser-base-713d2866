// Utility to log LLM model usage metrics.
// This file provides the interface - actual logging happens in edge functions

export interface ModelUsageMetric {
  model_id: string;
  model_tier: 'premium' | 'balanced' | 'fast';
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
export const MODEL_TIER_MAP: Record<string, 'premium' | 'balanced' | 'fast'> = {
  'gemini-3.1-pro-preview': 'premium',
  'gemini-3-pro-preview': 'balanced',
  'gemini-3-flash-preview': 'fast',
  'gemini-2.5-pro': 'premium',
  'gemini-2.5-flash': 'balanced',
  'gemini-2.5-flash-lite': 'fast',
};

// Get tier from model ID
export function getModelTier(modelId: string): 'premium' | 'balanced' | 'fast' {
  return MODEL_TIER_MAP[modelId] || 'balanced';
}
