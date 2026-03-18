import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { apiRequest, isApiConfigured } from '@/lib/api-client';
import { CREDITS_PRICING_VERSION, calculateCreditsFromTokens } from '@/lib/credits-pricing';

export function useCredits() {
  const { user } = useAuth();
  const apiEnabled = isApiConfigured();
  const [credits, setCredits] = useState<number>(0);
  const [totalUsed, setTotalUsed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user credits
  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(0);
      setTotalUsed(0);
      setIsLoading(false);
      return;
    }
    if (!apiEnabled) {
      setCredits(0);
      setTotalUsed(0);
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{ credits: number; total_used: number }>('/credits');
      setCredits(Number(data.credits || 0));
      setTotalUsed(Number(data.total_used || 0));
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, apiEnabled]);

  // Use credits (deduct from balance)
  const useCredits = useCallback(async (amount: number, reason?: string): Promise<boolean> => {
    if (!user) {
      toast.error('Необходима авторизация');
      return false;
    }

    if (credits < amount) {
      toast.error('Недостаточно кредитов', {
        description: `Нужно ${amount}, доступно ${credits}`,
      });
      return false;
    }

    try {
      if (!apiEnabled) throw new Error('API не настроен');
      const data = await apiRequest<{ credits: number; total_used: number }>('/credits/use', {
        method: 'POST',
        body: JSON.stringify({ amount, reason: reason || null }),
      });
      setCredits(Number(data.credits || 0));
      setTotalUsed(Number(data.total_used || 0));
      return true;
    } catch (error) {
      console.error('Error using credits:', error);
      toast.error('Ошибка списания кредитов');
      return false;
    }
  }, [user, credits, apiEnabled]);

  const useCreditsByTokens = useCallback(async (tokens: number, reason?: string): Promise<number | null> => {
    if (!user) {
      toast.error('Необходима авторизация');
      return null;
    }

    const estimatedAmount = calculateCreditsFromTokens(tokens);
    if (credits < estimatedAmount) {
      toast.error('Недостаточно кредитов', {
        description: `Нужно ~${estimatedAmount}, доступно ${credits}`,
      });
      return null;
    }

    try {
      if (!apiEnabled) throw new Error('API не настроен');
      const data = await apiRequest<{
        credits: number;
        total_used: number;
        charged_credits?: number | null;
      }>('/credits/use', {
        method: 'POST',
        body: JSON.stringify({
          tokens: Math.max(0, Math.floor(tokens || 0)),
          reason: reason || null,
          pricingVersion: CREDITS_PRICING_VERSION,
        }),
      });
      setCredits(Number(data.credits || 0));
      setTotalUsed(Number(data.total_used || 0));
      const charged = Number(data.charged_credits || 0);
      return Number.isFinite(charged) && charged > 0 ? charged : estimatedAmount;
    } catch (error) {
      console.error('Error charging credits by tokens:', error);
      toast.error('Ошибка списания кредитов');
      return null;
    }
  }, [user, credits, apiEnabled]);

  // Add credits (for purchases, bonuses, etc.)
  const addCredits = useCallback(async (amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      if (!apiEnabled) throw new Error('API не настроен');
      const data = await apiRequest<{ credits: number; total_used: number }>('/credits/add', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
      setCredits(Number(data.credits || 0));
      setTotalUsed(Number(data.total_used || 0));
      toast.success(`Добавлено ${amount} кредитов`);
      return true;
    } catch (error) {
      console.error('Error adding credits:', error);
      return false;
    }
  }, [user, apiEnabled]);

  // Check if user has enough credits
  const hasCredits = useCallback((amount: number): boolean => {
    return credits >= amount;
  }, [credits]);

  // Load credits on mount and when user changes
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;
    if (!apiEnabled) return;
    const timer = setInterval(() => {
      fetchCredits();
    }, 15000);
    return () => clearInterval(timer);
  }, [user, apiEnabled, fetchCredits]);

  return {
    credits,
    totalUsed,
    isLoading,
    useCredits,
    useCreditsByTokens,
    addCredits,
    hasCredits,
    refetch: fetchCredits,
  };
}
