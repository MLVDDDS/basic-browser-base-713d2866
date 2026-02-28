import { useCallback } from 'react';
import { toast } from 'sonner';
import type { Dispatch, SetStateAction } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { ProjectStructure } from '@/types/project';

interface UseBuilderSurfaceActionsParams {
  user: { id?: string } | null;
  project: { id?: string } | null;
  publishProject: () => Promise<string | null | undefined>;
  navigate: NavigateFunction;
  builderHistory: {
    undo: () => ProjectStructure | null;
    redo: () => ProjectStructure | null;
  };
  setReactProject: Dispatch<SetStateAction<ProjectStructure | null>>;
  autoHealingEnabled: boolean;
  setAutoHealingEnabled: Dispatch<SetStateAction<boolean>>;
}

export function useBuilderSurfaceActions({
  user,
  project,
  publishProject,
  navigate,
  builderHistory,
  setReactProject,
  autoHealingEnabled,
  setAutoHealingEnabled,
}: UseBuilderSurfaceActionsParams) {
  const handleUndo = useCallback(() => {
    const prev = builderHistory.undo();
    if (prev) {
      setReactProject(prev);
      toast.success('Откат выполнен');
    }
  }, [builderHistory, setReactProject]);

  const handleRedo = useCallback(() => {
    const next = builderHistory.redo();
    if (next) {
      setReactProject(next);
      toast.success('Возврат выполнен');
    }
  }, [builderHistory, setReactProject]);

  const handlePublish = useCallback(async () => {
    if (!user) {
      toast.error('Войдите для публикации');
      navigate('/auth');
      return;
    }
    if (!project) {
      toast.error('Сначала сохраните проект');
      return;
    }

    const url = await publishProject();
    if (url) {
      await navigator.clipboard.writeText(url);
    }
  }, [navigate, project, publishProject, user]);

  const handleAutoHealingToggle = useCallback(() => {
    setAutoHealingEnabled((prev) => !prev);
    toast.success(autoHealingEnabled ? 'Auto-healing выключен' : 'Auto-healing включен');
  }, [autoHealingEnabled, setAutoHealingEnabled]);

  return {
    handleUndo,
    handleRedo,
    handlePublish,
    handleAutoHealingToggle,
  };
}
