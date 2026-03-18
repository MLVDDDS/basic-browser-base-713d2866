import { useCallback, useState } from "react";
import {
  executeAdkSkillAction,
  fetchAdkSkills,
  type AdkSkillExecutePayload,
  type AdkSkillsListOptions,
  type AdkSkillsSnapshot,
} from "@/features/builder/api/adk-skills-api";

export function useAdkSkills() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<AdkSkillsSnapshot | null>(null);

  const listSkills = useCallback(
    async (options?: AdkSkillsListOptions) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdkSkills(options);
        setSnapshot(data);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const executeSkillAction = useCallback(
    async (skillId: string, payload: AdkSkillExecutePayload) => {
      return executeAdkSkillAction(skillId, payload);
    },
    []
  );

  return {
    loading,
    error,
    snapshot,
    listSkills,
    executeSkillAction,
  };
}
