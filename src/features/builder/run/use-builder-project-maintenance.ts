import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';
import { buildProjectStructure } from '@/lib/code-generator';
import { mapRecordToProjectFiles } from '@/features/builder/utils/project-files';
import type { ProjectStructure } from '@/types/project';
import type { ProjectVersion } from '@/hooks/useProjectVersions';

interface UseBuilderProjectMaintenanceParams {
  projectId?: string;
  projectName?: string;
  userId?: string;
  reactProject: ProjectStructure | null;
  setReactProject: Dispatch<SetStateAction<ProjectStructure | null>>;
  setHasContent: (value: boolean) => void;
  addMessage: (
    message: {
      role: 'assistant' | 'system' | 'user';
      content: string;
      metadata?: Record<string, unknown>;
    },
    pid?: string
  ) => Promise<unknown>;
  restoreProjectVersion: (versionId: string) => Promise<ProjectVersion | null>;
  autofix: {
    run: (
      errorMessage: string,
      files: Record<string, string>,
      options?: {
        projectId?: string;
        userId?: string;
        packages?: Record<string, string>;
        mode?: 'auto' | 'smart' | 'quick';
        maxAttempts?: number;
        enableSnapshot?: boolean;
        enableMetrics?: boolean;
      }
    ) => Promise<{ success: boolean; files: Record<string, string>; summary: string }>;
  };
}

export function useBuilderProjectMaintenance({
  projectId,
  projectName,
  userId,
  reactProject,
  setReactProject,
  setHasContent,
  addMessage,
  restoreProjectVersion,
  autofix,
}: UseBuilderProjectMaintenanceParams) {
  const [isFixingError, setIsFixingError] = useState(false);

  const handleShowLogs = useCallback(() => {
    toast.info('Логи доступны в консоли браузера (F12)');
  }, []);

  const handleRestoreVersion = useCallback(async (versionId: string) => {
    if (!projectId) return;

    try {
      const restored = await restoreProjectVersion(versionId);
      if (!restored?.files || typeof restored.files !== 'object') {
        toast.error('Не удалось восстановить версию');
        return;
      }

      const restoredFiles = mapRecordToProjectFiles(restored.files as Record<string, string>, {
        variant: 'full',
        includeEntryPoint: true,
      });

      const restoredStructure = buildProjectStructure(restoredFiles, projectName || 'generated-app');
      setReactProject(restoredStructure);
      setHasContent(true);

      await addMessage(
        {
          role: 'system',
          content: `Восстановлена версия v${restored.version_number}.`,
          metadata: {
            type: 'system',
            systemType: 'info',
            title: 'Версия восстановлена',
          },
        },
        projectId
      );

      toast.success(`Восстановлена версия v${restored.version_number}`);
    } catch (error) {
      console.error('[Builder] Restore version failed:', error);
      toast.error('Ошибка восстановления версии');
    }
  }, [addMessage, projectId, projectName, restoreProjectVersion, setHasContent, setReactProject]);

  const handleTryFix = useCallback(async (errorMessage?: string) => {
    if (!projectId || !userId) return;

    setIsFixingError(true);

    try {
      const initialFiles: Record<string, string> = {};
      reactProject?.files.forEach((file) => {
        initialFiles[file.path] = file.content;
      });

      await addMessage(
        {
          role: 'user',
          content: `🔧 Autofix: ${errorMessage?.slice(0, 100) || 'ошибка в превью'}`,
        },
        projectId
      );

      const result = await autofix.run(errorMessage || 'Preview error - check and fix', initialFiles, {
        projectId,
        userId,
        packages: {},
        mode: 'smart',
        maxAttempts: 3,
        enableSnapshot: true,
        enableMetrics: true,
      });

      if (result.success && result.files && Object.keys(result.files).length > 0) {
        const newFiles = mapRecordToProjectFiles(result.files, { variant: 'autofix' });
        setReactProject((prev) => (prev ? { ...prev, files: newFiles } : null));
        await addMessage({ role: 'assistant', content: `✅ ${result.summary}` }, projectId);
        toast.success('Ошибка исправлена!');
      } else if (!result.success) {
        await addMessage({ role: 'assistant', content: `❌ ${result.summary}` }, projectId);
        toast.error('Не удалось исправить ошибку');
      }
    } catch (error) {
      console.error('Autofix error:', error);
      toast.error('Не удалось исправить ошибку');
    } finally {
      setIsFixingError(false);
    }
  }, [addMessage, autofix, projectId, reactProject?.files, setReactProject, userId]);

  return {
    isFixingError,
    handleShowLogs,
    handleRestoreVersion,
    handleTryFix,
  };
}
