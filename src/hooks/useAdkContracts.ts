import { useCallback, useState } from "react";
import {
  fetchAdkContracts,
  type AdkContractsFetchOptions,
  type AdkContractsSnapshot,
} from "@/features/builder/api/adk-contracts-api";

export function useAdkContracts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<AdkContractsSnapshot | null>(null);

  const refresh = useCallback(async (options?: AdkContractsFetchOptions) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdkContracts(options);

      setSnapshot(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    snapshot,
    refresh,
  };
}
