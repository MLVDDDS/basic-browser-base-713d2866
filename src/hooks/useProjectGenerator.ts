// Hook for multi-file React project generation
import { useState, useCallback } from 'react';
import { ProjectFile, ProjectStructure } from '@/types/project';
import { buildProjectStructure, validateProject } from '@/lib/code-generator';
import { runUnifiedOrchestratorStream } from '@/features/builder/api/unified-orchestrator-api';

interface GenerationState {
  isGenerating: boolean;
  progress: {
    stage: 'idle' | 'generating' | 'parsing' | 'validating' | 'complete' | 'failed';
    message: string;
  };
  error: string | null;
}

interface GenerationResult {
  success: boolean;
  project: ProjectStructure | null;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    model: string;
  };
  errors?: string[];
}

export function useProjectGenerator() {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: { stage: 'idle', message: '' },
    error: null,
  });
  const [project, setProject] = useState<ProjectStructure | null>(null);

  const generate = useCallback(async (
    prompt: string,
    options?: {
      template?: 'landing' | 'dashboard' | 'ecommerce' | 'portfolio' | 'saas';
      style?: 'minimal' | 'modern' | 'brutalist' | 'glassmorphism';
      projectName?: string;
    }
  ): Promise<GenerationResult> => {
    setState({
      isGenerating: true,
      progress: { stage: 'generating', message: 'Генерирую код...' },
      error: null,
    });

    try {
      let filesMap: Record<string, string> = {};
      let usage: GenerationResult['usage'] | undefined;

      await runUnifiedOrchestratorStream(
        {
          prompt,
          files: {},
          packages: [],
          mode: 'medium',
        },
        (event) => {
          if (
            event.type === 'file_updated' &&
            typeof event.path === 'string' &&
            typeof event.content === 'string'
          ) {
            filesMap[event.path] = event.content;
          }
          if (
            event.type === 'pipeline_complete' &&
            event.files &&
            typeof event.files === 'object'
          ) {
            filesMap = event.files as Record<string, string>;
            usage = event.usage as GenerationResult['usage'];
          }
        }
      );

      // Parse the output into files
      setState(prev => ({
        ...prev,
        progress: { stage: 'parsing', message: 'Парсинг файлов...' },
      }));

      const files: ProjectFile[] = Object.entries(filesMap).map(([path, content]) => {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        const language = normalizedPath.endsWith('.tsx')
          ? 'tsx'
          : normalizedPath.endsWith('.ts')
            ? 'ts'
            : normalizedPath.endsWith('.css')
              ? 'css'
              : normalizedPath.endsWith('.json')
                ? 'json'
                : 'html';
        const type = normalizedPath.includes('/components/')
          ? 'component'
          : normalizedPath.includes('/hooks/')
            ? 'hook'
            : normalizedPath.includes('/pages/')
              ? 'page'
              : normalizedPath.endsWith('.css')
                ? 'style'
                : normalizedPath.endsWith('.json')
                  ? 'config'
                  : 'util';
        return { path: normalizedPath, content, type, language };
      });

      if (files.length === 0) {
        throw new Error('No files generated');
      }

      // Build project structure
      setState(prev => ({
        ...prev,
        progress: { stage: 'validating', message: 'Валидация...' },
      }));

      const projectStructure = buildProjectStructure(files, options?.projectName);
      
      // Validate
      const validation = validateProject(projectStructure);
      
      if (!validation.valid) {
        console.warn('Validation warnings:', validation.errors);
      }

      setProject(projectStructure);
      
      setState({
        isGenerating: false,
        progress: { stage: 'complete', message: 'Готово!' },
        error: null,
      });

      return {
        success: true,
        project: projectStructure,
        usage,
        errors: validation.errors,
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      setState({
        isGenerating: false,
        progress: { stage: 'failed', message },
        error: message,
      });

      return {
        success: false,
        project: null,
        errors: [message],
      };
    }
  }, []);

  const updateFile = useCallback((path: string, content: string) => {
    setProject(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        files: prev.files.map(f => 
          f.path === path ? { ...f, content } : f
        ),
      };
    });
  }, []);

  const addFile = useCallback((file: ProjectStructure['files'][0]) => {
    setProject(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        files: [...prev.files, file],
      };
    });
  }, []);

  const deleteFile = useCallback((path: string) => {
    setProject(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        files: prev.files.filter(f => f.path !== path),
      };
    });
  }, []);

  const reset = useCallback(() => {
    setProject(null);
    setState({
      isGenerating: false,
      progress: { stage: 'idle', message: '' },
      error: null,
    });
  }, []);

  return {
    project,
    isGenerating: state.isGenerating,
    progress: state.progress,
    error: state.error,
    generate,
    updateFile,
    addFile,
    deleteFile,
    reset,
    setProject,
  };
}
