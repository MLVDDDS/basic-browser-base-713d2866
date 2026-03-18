// localStorage caching for generated projects
import { useState, useCallback, useEffect } from 'react';
import { ProjectStructure } from '@/types/project';
import { toast } from 'sonner';

const CACHE_KEY = 'project_cache';
const CACHE_VERSION = 1;
const MAX_CACHED_PROJECTS = 10;

export interface CachedProject {
  id: string;
  name: string;
  structure: ProjectStructure;
  prompt?: string;
  createdAt: number;
  updatedAt: number;
}

interface ProjectCache {
  version: number;
  projects: CachedProject[];
}

function loadCache(): ProjectCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      const legacy = findLegacyCache();
      if (legacy) {
        saveCache(legacy);
        return legacy;
      }
      return { version: CACHE_VERSION, projects: [] };
    }
    
    const parsed = JSON.parse(raw) as ProjectCache;
    if (parsed.version !== CACHE_VERSION) {
      // Migration or reset for version mismatch
      return { version: CACHE_VERSION, projects: [] };
    }
    return parsed;
  } catch {
    return { version: CACHE_VERSION, projects: [] };
  }
}

function isValidProjectStructure(value: unknown): value is ProjectStructure {
  if (!value || typeof value !== 'object') return false;
  const structure = value as ProjectStructure;
  return Array.isArray(structure.files) &&
    typeof structure.entryPoint === 'string' &&
    typeof structure.dependencies === 'object' &&
    structure.dependencies !== null;
}

function isValidCachedProject(value: unknown): value is CachedProject {
  if (!value || typeof value !== 'object') return false;
  const project = value as CachedProject;
  return typeof project.id === 'string' &&
    typeof project.name === 'string' &&
    typeof project.createdAt === 'number' &&
    typeof project.updatedAt === 'number' &&
    isValidProjectStructure(project.structure);
}

function isValidProjectCache(value: unknown): value is ProjectCache {
  if (!value || typeof value !== 'object') return false;
  const cache = value as ProjectCache;
  return cache.version === CACHE_VERSION &&
    Array.isArray(cache.projects) &&
    cache.projects.every(isValidCachedProject);
}

function findLegacyCache(): ProjectCache | null {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || key === CACHE_KEY) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (isValidProjectCache(parsed)) {
        localStorage.removeItem(key);
        return parsed;
      }
    } catch {
      continue;
    }
  }
  return null;
}

function saveCache(cache: ProjectCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    // localStorage might be full
    console.warn('Failed to save project cache:', e);
  }
}

export function useProjectCache() {
  const [cachedProjects, setCachedProjects] = useState<CachedProject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cache on mount
  useEffect(() => {
    const cache = loadCache();
    setCachedProjects(cache.projects);
    setIsLoaded(true);
  }, []);

  // Save project to cache
  const cacheProject = useCallback((
    project: ProjectStructure,
    options?: { id?: string; name?: string; prompt?: string }
  ) => {
    const now = Date.now();
    const id = options?.id || `project_${now}`;
    const name = options?.name || project.name || `Проект ${new Date().toLocaleDateString('ru-RU')}`;

    setCachedProjects(prev => {
      // Check if project already exists
      const existingIndex = prev.findIndex(p => p.id === id);
      
      let updated: CachedProject[];
      
      if (existingIndex >= 0) {
        // Update existing
        updated = prev.map((p, i) => 
          i === existingIndex 
            ? { ...p, structure: project, updatedAt: now, prompt: options?.prompt || p.prompt }
            : p
        );
      } else {
        // Add new, remove oldest if over limit
        const newProject: CachedProject = {
          id,
          name,
          structure: project,
          prompt: options?.prompt,
          createdAt: now,
          updatedAt: now,
        };
        
        updated = [newProject, ...prev];
        
        if (updated.length > MAX_CACHED_PROJECTS) {
          updated = updated.slice(0, MAX_CACHED_PROJECTS);
        }
      }
      
      // Persist to localStorage
      saveCache({ version: CACHE_VERSION, projects: updated });
      
      return updated;
    });
    
    return id;
  }, []);

  // Get cached project by ID
  const getCachedProject = useCallback((id: string): CachedProject | null => {
    return cachedProjects.find(p => p.id === id) || null;
  }, [cachedProjects]);

  // Get most recent cached project
  const getLatestProject = useCallback((): CachedProject | null => {
    if (cachedProjects.length === 0) return null;
    return cachedProjects.reduce((latest, p) => 
      p.updatedAt > latest.updatedAt ? p : latest
    );
  }, [cachedProjects]);

  // Delete cached project
  const deleteCachedProject = useCallback((id: string) => {
    setCachedProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveCache({ version: CACHE_VERSION, projects: updated });
      return updated;
    });
    toast.success('Проект удалён из кэша');
  }, []);

  // Clear all cache
  const clearCache = useCallback(() => {
    setCachedProjects([]);
    saveCache({ version: CACHE_VERSION, projects: [] });
    toast.success('Кэш очищен');
  }, []);

  // Get cache size in bytes
  const getCacheSize = useCallback((): number => {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? new Blob([raw]).size : 0;
  }, []);

  // Check if has cached projects
  const hasCachedProjects = cachedProjects.length > 0;

  return {
    cachedProjects,
    isLoaded,
    hasCachedProjects,
    cacheProject,
    getCachedProject,
    getLatestProject,
    deleteCachedProject,
    clearCache,
    getCacheSize,
  };
}
