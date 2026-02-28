// AST-based code editing utilities (browser-safe version)
// Note: Full AST editing should be done server-side in edge functions

export interface CodeEdit {
  type: 'insert' | 'replace' | 'delete' | 'wrap';
  target: string; // CSS selector-like path or line number
  content?: string;
  position?: 'before' | 'after' | 'inside';
}

export interface EditResult {
  success: boolean;
  code: string;
  changes: string[];
  errors: string[];
}

// Simple regex-based import extraction (browser-safe)
export function extractImports(code: string): Array<{ from: string; default?: string; named: string[] }> {
  const imports: Array<{ from: string; default?: string; named: string[] }> = [];
  
  // Match import statements
  const importRegex = /import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(code)) !== null) {
    const defaultImport = match[1];
    const namedImports = match[2] ? match[2].split(',').map(s => s.trim().split(' as ')[0].trim()) : [];
    const from = match[3];
    
    imports.push({
      from,
      default: defaultImport,
      named: namedImports,
    });
  }
  
  return imports;
}

// Detect dependencies from import statements (browser-safe)
export function detectDependencies(code: string): string[] {
  const imports = extractImports(code);
  const deps: string[] = [];
  
  for (const imp of imports) {
    if (!imp.from.startsWith('.') && !imp.from.startsWith('@/')) {
      // Extract package name (handle scoped packages)
      const parts = imp.from.split('/');
      const pkgName = imp.from.startsWith('@') 
        ? `${parts[0]}/${parts[1]}`
        : parts[0];
      
      if (!deps.includes(pkgName)) {
        deps.push(pkgName);
      }
    }
  }
  
  return deps;
}

// Line-based code editing (browser-safe)
export function editLines(
  code: string, 
  edits: Array<{ line: number; action: 'replace' | 'insert' | 'delete'; content?: string }>
): string {
  const lines = code.split('\n');
  
  // Sort edits by line number descending to avoid index shifting
  const sortedEdits = [...edits].sort((a, b) => b.line - a.line);
  
  for (const edit of sortedEdits) {
    const idx = edit.line - 1;
    
    switch (edit.action) {
      case 'replace':
        if (idx >= 0 && idx < lines.length && edit.content !== undefined) {
          lines[idx] = edit.content;
        }
        break;
      case 'insert':
        if (idx >= 0 && idx <= lines.length && edit.content !== undefined) {
          lines.splice(idx, 0, edit.content);
        }
        break;
      case 'delete':
        if (idx >= 0 && idx < lines.length) {
          lines.splice(idx, 1);
        }
        break;
    }
  }
  
  return lines.join('\n');
}

// Insert code at position
export function insertCode(code: string, position: number, newCode: string): string {
  return code.slice(0, position) + newCode + code.slice(position);
}

// Replace range of code
export function replaceRange(code: string, start: number, end: number, newCode: string): string {
  return code.slice(0, start) + newCode + code.slice(end);
}

// Simple string-based replacements
export function replaceAll(code: string, search: string, replacement: string): string {
  return code.split(search).join(replacement);
}

// Add import to file (string-based, browser-safe)
export function addImportString(
  code: string, 
  importStatement: string
): string {
  // Find the last import statement
  const lines = code.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, importStatement);
  } else {
    // No imports found, add at the beginning
    lines.unshift(importStatement);
  }
  
  return lines.join('\n');
}

// Apply multiple edits to code
export function applyEdits(code: string, edits: CodeEdit[]): EditResult {
  let result = code;
  const changes: string[] = [];
  const errors: string[] = [];
  
  for (const edit of edits) {
    try {
      switch (edit.type) {
        case 'insert':
          if (edit.content) {
            const lineNum = parseInt(edit.target);
            if (!isNaN(lineNum)) {
              result = editLines(result, [{ 
                line: lineNum, 
                action: 'insert', 
                content: edit.content 
              }]);
              changes.push(`Inserted at line ${lineNum}`);
            }
          }
          break;
          
        case 'replace':
          if (edit.content) {
            const lineNum = parseInt(edit.target);
            if (!isNaN(lineNum)) {
              result = editLines(result, [{ 
                line: lineNum, 
                action: 'replace', 
                content: edit.content 
              }]);
              changes.push(`Replaced line ${lineNum}`);
            } else {
              // String replacement
              result = replaceAll(result, edit.target, edit.content);
              changes.push(`Replaced "${edit.target}"`);
            }
          }
          break;
          
        case 'delete': {
          const lineNum = parseInt(edit.target);
          if (!isNaN(lineNum)) {
            result = editLines(result, [{ line: lineNum, action: 'delete' }]);
            changes.push(`Deleted line ${lineNum}`);
          }
          break;
        }
          
        case 'wrap':
          if (edit.content) {
            const [before, after] = edit.content.split('{{content}}');
            result = result.replace(
              edit.target, 
              `${before}${edit.target}${after || ''}`
            );
            changes.push(`Wrapped "${edit.target}"`);
          }
          break;
      }
    } catch (error) {
      errors.push(`Failed to apply edit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return {
    success: errors.length === 0,
    code: result,
    changes,
    errors,
  };
}
