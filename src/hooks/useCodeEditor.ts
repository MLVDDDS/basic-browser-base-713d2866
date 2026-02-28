// Hook for code editing (browser-safe)
import { useState, useCallback } from 'react';
import { applyEdits, CodeEdit, EditResult, extractImports, detectDependencies, addImportString } from '@/lib/ast-editor';
import { ProjectStructure } from '@/types/project';

interface UseCodeEditorResult {
  editFile: (path: string, edits: CodeEdit[]) => EditResult;
  addImportToFile: (path: string, importStatement: string) => boolean;
  getFileDependencies: (path: string) => string[];
  applyBatchEdits: (operations: Array<{ path: string; edits: CodeEdit[] }>) => Map<string, EditResult>;
}

export function useCodeEditor(
  project: ProjectStructure | null,
  onProjectUpdate: (project: ProjectStructure) => void
): UseCodeEditorResult {
  
  const getFileContent = useCallback((path: string): string | null => {
    if (!project) return null;
    const file = project.files.find(f => f.path === path);
    return file?.content || null;
  }, [project]);

  const updateFileContent = useCallback((path: string, newContent: string) => {
    if (!project) return;
    
    const updatedFiles = project.files.map(f => 
      f.path === path ? { ...f, content: newContent } : f
    );
    
    onProjectUpdate({
      ...project,
      files: updatedFiles,
    });
  }, [project, onProjectUpdate]);

  const editFile = useCallback((path: string, edits: CodeEdit[]): EditResult => {
    const content = getFileContent(path);
    if (!content) {
      return { success: false, code: '', changes: [], errors: [`File not found: ${path}`] };
    }
    
    const result = applyEdits(content, edits);
    
    if (result.success) {
      updateFileContent(path, result.code);
    }
    
    return result;
  }, [getFileContent, updateFileContent]);

  const addImportToFile = useCallback((path: string, importStatement: string): boolean => {
    const content = getFileContent(path);
    if (!content) return false;
    
    const newCode = addImportString(content, importStatement);
    updateFileContent(path, newCode);
    
    return true;
  }, [getFileContent, updateFileContent]);

  const getFileDependencies = useCallback((path: string): string[] => {
    const content = getFileContent(path);
    if (!content) return [];
    
    return detectDependencies(content);
  }, [getFileContent]);

  const applyBatchEdits = useCallback((
    operations: Array<{ path: string; edits: CodeEdit[] }>
  ): Map<string, EditResult> => {
    const results = new Map<string, EditResult>();
    
    for (const op of operations) {
      const result = editFile(op.path, op.edits);
      results.set(op.path, result);
    }
    
    return results;
  }, [editFile]);

  return {
    editFile,
    addImportToFile,
    getFileDependencies,
    applyBatchEdits,
  };
}
