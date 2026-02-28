// Undo/Redo history stack for Builder
import { useState, useCallback, useRef } from 'react';
import type { ProjectStructure } from '@/types/project';

interface HistoryEntry {
  id: string;
  timestamp: number;
  project: ProjectStructure;
  description: string;
}

interface UseBuilderHistoryOptions {
  maxSize?: number;
}

export function useBuilderHistory(options: UseBuilderHistoryOptions = {}) {
  const { maxSize = 50 } = options;
  
  // History stack: past entries
  const [past, setPast] = useState<HistoryEntry[]>([]);
  // Future stack: entries after undo
  const [future, setFuture] = useState<HistoryEntry[]>([]);
  
  // Current project reference (managed externally)
  const currentProjectRef = useRef<ProjectStructure | null>(null);
  
  // Can we undo/redo?
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;
  
  // Record a new state (called after every change)
  const record = useCallback((project: ProjectStructure, description: string = 'Change') => {
    const currentProject = currentProjectRef.current;
    
    // If there's a current project, push it to past
    if (currentProject) {
      const entry: HistoryEntry = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        project: JSON.parse(JSON.stringify(currentProject)), // Deep clone
        description,
      };
      
      setPast(prev => {
        const newPast = [...prev, entry];
        // Limit history size
        return newPast.slice(-maxSize);
      });
      
      // Clear future when new action is taken
      setFuture([]);
    }
    
    // Update current reference
    currentProjectRef.current = project;
  }, [maxSize]);
  
  // Initialize with a project (doesn't add to history)
  const initialize = useCallback((project: ProjectStructure) => {
    currentProjectRef.current = project;
    setPast([]);
    setFuture([]);
  }, []);
  
  // Undo: Go back one step
  const undo = useCallback((): ProjectStructure | null => {
    if (past.length === 0 || !currentProjectRef.current) return null;
    
    const lastEntry = past[past.length - 1];
    const currentProject = currentProjectRef.current;
    
    // Move current to future
    setFuture(prev => [{
      id: `${Date.now()}_redo`,
      timestamp: Date.now(),
      project: JSON.parse(JSON.stringify(currentProject)),
      description: 'Redo point',
    }, ...prev]);
    
    // Remove from past
    setPast(prev => prev.slice(0, -1));
    
    // Update current reference
    currentProjectRef.current = lastEntry.project;
    
    return lastEntry.project;
  }, [past]);
  
  // Redo: Go forward one step
  const redo = useCallback((): ProjectStructure | null => {
    if (future.length === 0 || !currentProjectRef.current) return null;
    
    const nextEntry = future[0];
    const currentProject = currentProjectRef.current;
    
    // Move current to past
    setPast(prev => [...prev, {
      id: `${Date.now()}_undo`,
      timestamp: Date.now(),
      project: JSON.parse(JSON.stringify(currentProject)),
      description: 'Undo point',
    }]);
    
    // Remove from future
    setFuture(prev => prev.slice(1));
    
    // Update current reference
    currentProjectRef.current = nextEntry.project;
    
    return nextEntry.project;
  }, [future]);
  
  // Clear all history
  const clear = useCallback(() => {
    setPast([]);
    setFuture([]);
    currentProjectRef.current = null;
  }, []);
  
  // Get history info for UI
  const getHistoryInfo = useCallback(() => ({
    undoCount: past.length,
    redoCount: future.length,
    lastChange: past.length > 0 ? past[past.length - 1].description : null,
    nextChange: future.length > 0 ? future[0].description : null,
  }), [past, future]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    record,
    initialize,
    clear,
    getHistoryInfo,
    historyLength: past.length,
    futureLength: future.length,
  };
}
