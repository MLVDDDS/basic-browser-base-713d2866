import { useState, useEffect, useCallback } from 'react';

export interface PendingProjectData {
  prompt: string;
  projectType: 'website' | 'tma';
  libraries: string[];
  template: string | null;
  style: string | null;
  createdAt: number;
}

const STORAGE_KEY = 'pending_project';
const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export function usePendingProject() {
  const [pendingProject, setPendingProjectState] = useState<PendingProjectData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as PendingProjectData;
        // Check if not expired
        if (Date.now() - data.createdAt < EXPIRY_MS) {
          setPendingProjectState(data);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to load pending project:', e);
    }
    setIsLoaded(true);
  }, []);

  const savePendingProject = useCallback((data: Omit<PendingProjectData, 'createdAt'>) => {
    const fullData: PendingProjectData = {
      ...data,
      createdAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullData));
    setPendingProjectState(fullData);
  }, []);

  const clearPendingProject = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPendingProjectState(null);
  }, []);

  const hasPendingProject = pendingProject !== null;

  return {
    pendingProject,
    hasPendingProject,
    isLoaded,
    savePendingProject,
    clearPendingProject,
  };
}
