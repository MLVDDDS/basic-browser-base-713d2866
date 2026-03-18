import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { apiRequest, isApiConfigured, type ApiError } from '@/lib/api-client';

export interface ProjectSection {
  id: string;
  type: string;
  name: string;
  visible: boolean;
  effects: string[];
  layout: {
    width: 'full' | 'wide' | 'medium' | 'narrow';
    padding: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    columns: number;
  };
  content?: Record<string, unknown>;
  generatedHtml?: string;
}

export interface ReactProjectFile {
  path: string;
  content: string;
  type: 'component' | 'hook' | 'util' | 'style' | 'config' | 'page' | 'asset';
  language: 'tsx' | 'ts' | 'css' | 'json' | 'html';
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  type: 'website' | 'tma' | 'landing'; // 'website' and 'tma' are primary, 'landing' for legacy
  status: 'draft' | 'building' | 'published' | 'error';
  config: Record<string, unknown>;
  sections: ProjectSection[];
  react_files: ReactProjectFile[] | null;
  dependencies: Record<string, string>;
  published_url: string | null;
  preview_html: string | null;
  created_at: string;
  updated_at: string;
}

export function useProject(projectId?: string) {
  const { user } = useAuth();
  const apiEnabled = isApiConfigured();
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Prevent parallel save requests
  const saveAbortControllerRef = useRef<AbortController | null>(null);
  const savePendingRef = useRef<boolean>(false);

  // Fetch single project
  const fetchProject = useCallback(async (id: string) => {
    if (!user) return null;
    if (!apiEnabled) {
      toast.error('API не настроен');
      return null;
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest<{ project: Project }>(`/projects/${id}`);
      const data = response.project;

      if (!data) {
        throw new Error('Проект не найден');
      }

      const projectData: Project = {
        ...data,
        type: data.type as Project['type'],
        status: data.status as Project['status'],
        sections: (data.sections as unknown as ProjectSection[]) || [],
        config: (data.config as Record<string, unknown>) || {},
        react_files: (data.react_files as unknown as ReactProjectFile[]) || null,
        dependencies: (data.dependencies as Record<string, string>) || {},
      };
      
      setProject(projectData);
      
      return projectData;
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Не удалось загрузить проект');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, apiEnabled]);

  // Fetch all user projects
  const fetchProjects = useCallback(async () => {
    if (!user) return [];
    if (!apiEnabled) {
      toast.error('API не настроен');
      return [];
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest<{ projects: Project[] }>('/projects');
      const data: Project[] = response.projects || [];
      
      const projectsData: Project[] = (data || []).map(p => ({
        ...p,
        type: p.type as Project['type'],
        status: p.status as Project['status'],
        sections: (p.sections as unknown as ProjectSection[]) || [],
        config: (p.config as Record<string, unknown>) || {},
        react_files: (p.react_files as unknown as ReactProjectFile[]) || null,
        dependencies: (p.dependencies as Record<string, string>) || {},
      }));
      
      setProjects(projectsData);
      return projectsData;
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Не удалось загрузить проекты');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, apiEnabled]);

  // Create new project
  const createProject = useCallback(async (data: {
    name: string;
    type: Project['type'];
    slug?: string;
  }) => {
    if (!user) {
      toast.error('Необходима авторизация');
      return null;
    }
    if (!apiEnabled) {
      toast.error('API не настроен');
      return null;
    }

    const baseSlug = (data.slug || data.name)
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

    // If slug becomes empty (e.g. name only emojis/symbols), fallback
    const safeBaseSlug = baseSlug || `project-${Date.now().toString(36)}`;

    setIsSaving(true);
    try {
      // Retry once with a suffix if slug is already taken
      const tryInsert = async (slug: string) => {
        try {
          const response = await apiRequest<{ project: Project }>('/projects', {
            method: 'POST',
            body: JSON.stringify({
              name: data.name,
              slug,
              type: data.type,
            }),
          });
          return { project: response.project, error: null };
        } catch (err) {
          return { project: null, error: err as ApiError };
        }
      };

      let slug = safeBaseSlug;
      let { project: newProject, error } = await tryInsert(slug);

      // Handle unique violation (slug conflict)
      if (error && ((error as ApiError).code === 'slug_taken' || (error as ApiError).code === '23505')) {
        slug = `${safeBaseSlug}-${Math.random().toString(36).slice(2, 6)}`.substring(0, 50);
        ({ project: newProject, error } = await tryInsert(slug));
      }

      if (error) {
        console.error('Error creating project (details):', error);
        throw error;
      }

      if (!newProject) {
        // This can happen if the backend didn't return the inserted row
        toast.error('Не удалось создать проект', {
          description: 'Проект создан, но данные не вернулись. Обнови страницу.'
        });
        return null;
      }

      const projectData: Project = {
        ...newProject,
        type: newProject.type as Project['type'],
        status: newProject.status as Project['status'],
        sections: (newProject.sections as unknown as ProjectSection[]) || [],
        config: (newProject.config as Record<string, unknown>) || {},
        react_files: (newProject.react_files as unknown as ReactProjectFile[]) || null,
        dependencies: (newProject.dependencies as Record<string, string>) || {},
      };

      setProject(projectData);
      toast.success('Проект создан');
      return projectData;
    } catch (error) {
      console.error('Error creating project:', error);
      const message = error instanceof Error ? error.message : 'Не удалось создать проект';
      toast.error('Не удалось создать проект', { description: message });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user, apiEnabled]);

  // Save project - silent option for auto-saves (no toast)
  // Protected against parallel requests
  const saveProject = useCallback(async (updates: Partial<Project>, options?: { silent?: boolean }) => {
    if (!project || !user) return false;
    
    // Prevent parallel saves - abort previous if still pending
    if (savePendingRef.current) {
      console.log('[saveProject] Skipping - save already in progress');
      return false;
    }
    
    const silent = options?.silent ?? false;
    
    savePendingRef.current = true;
    setIsSaving(true);
    
    try {
      // Prepare update object with proper type casting
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.slug !== undefined) updateData.slug = updates.slug;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.published_url !== undefined) updateData.published_url = updates.published_url;
      if (updates.preview_html !== undefined) updateData.preview_html = updates.preview_html;
      if (updates.sections !== undefined) updateData.sections = JSON.parse(JSON.stringify(updates.sections));
      if (updates.config !== undefined) updateData.config = JSON.parse(JSON.stringify(updates.config));
      if (updates.react_files !== undefined) updateData.react_files = JSON.parse(JSON.stringify(updates.react_files));
      if (updates.dependencies !== undefined) updateData.dependencies = JSON.parse(JSON.stringify(updates.dependencies));
      if (!apiEnabled) throw new Error('API не настроен');

      await apiRequest(`/projects/${project.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      
      setProject(prev => prev ? { ...prev, ...updates } : null);
      
      // Only show toast if not silent
      if (!silent) {
        toast.success('Проект сохранён');
      }
      return true;
    } catch (error) {
      // Ignore AbortError silently
      if (error instanceof Error && error.name === 'AbortError') {
        return false;
      }
      console.error('Error saving project:', error);
      // Show error toast even in silent mode - errors are important (but not for AbortError)
      if (!silent) {
        toast.error('Не удалось сохранить проект');
      }
      return false;
    } finally {
      savePendingRef.current = false;
      setIsSaving(false);
    }
  }, [project, user, apiEnabled]);

  // Publish project
  const publishProject = useCallback(async () => {
    if (!project || !user) return null;
    if (!apiEnabled) {
      toast.error('API не настроен');
      return null;
    }
    
    setIsPublishing(true);
    try {
      const response = await apiRequest<{ jobId: string }>('/publish', {
        method: 'POST',
        body: JSON.stringify({ projectId: project.id, userId: user.id }),
      });

      setProject(prev => prev ? { ...prev, status: 'building' } : prev);

      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const maxAttempts = 80;
      let publishedUrl: string | null = null;
      let publishedStatus: Project['status'] | null = null;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        await wait(3000);
        const status = await apiRequest<{
          job: { status: string; error?: string | null };
          project?: { status?: string; publishedUrl?: string | null };
        }>(`/publish/status?jobId=${response.jobId}`);

        if (status.job?.status === 'failed') {
          throw new Error(status.job.error || 'Публикация завершилась ошибкой');
        }

        if (status.project?.publishedUrl) {
          publishedUrl = status.project.publishedUrl;
          publishedStatus = (status.project.status as Project['status']) || 'published';
          break;
        }
      }

      if (!publishedUrl) {
        throw new Error('Публикация заняла слишком много времени. Попробуй позже.');
      }

      setProject(prev => prev ? {
        ...prev,
        status: publishedStatus || 'published',
        published_url: publishedUrl,
      } : null);

      toast.success('Сайт опубликован!', {
        description: 'Ссылка скопирована в буфер обмена',
        action: {
          label: 'Открыть',
          onClick: () => window.open(publishedUrl as string, '_blank'),
        },
      });

      navigator.clipboard.writeText(publishedUrl as string);
      return publishedUrl;
    } catch (error) {
      console.error('Error publishing project:', error);
      toast.error('Не удалось опубликовать проект');
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, [project, user, apiEnabled]);

  // Delete project
  const deleteProject = useCallback(async (id: string) => {
    if (!user) return false;
    if (!apiEnabled) {
      toast.error('API не настроен');
      return false;
    }
    
    try {
      await apiRequest(`/projects/${id}`, { method: 'DELETE' });
      
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Проект удалён');
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Не удалось удалить проект');
      return false;
    }
  }, [user, apiEnabled]);

  // Load project on mount if projectId provided
  useEffect(() => {
    if (projectId && user) {
      fetchProject(projectId);
    }
  }, [projectId, user, fetchProject]);

  return {
    project,
    projects,
    isLoading,
    isSaving,
    isPublishing,
    fetchProject,
    fetchProjects,
    createProject,
    saveProject,
    publishProject,
    deleteProject,
    setProject,
  };
}
