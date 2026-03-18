export const CREDITS_PRICING_VERSION = 'credits-v1';
export const CREDITS_TOKENS_PER_CREDIT = 4000;
export const CREDITS_BASE_PER_RUN = 1;
export const CREDITS_MIN_PER_RUN = 1;
export const CREDITS_ESTIMATED_RESERVE = 5;

export function calculateCreditsFromTokens(totalTokens: number): number {
  const tokens = Math.max(0, Number(totalTokens) || 0);
  const usageCredits = Math.ceil(tokens / CREDITS_TOKENS_PER_CREDIT);
  return Math.max(CREDITS_MIN_PER_RUN, CREDITS_BASE_PER_RUN + usageCredits);
}

