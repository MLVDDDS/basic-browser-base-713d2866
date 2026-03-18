import type { ProjectFile } from '@/types/project';

export type ProjectFileMappingVariant = 'full' | 'autofix';

export function normalizeProjectPath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function inferLanguage(path: string): ProjectFile['language'] {
  if (path.endsWith('.tsx')) return 'tsx';
  if (path.endsWith('.ts')) return 'ts';
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.html')) return 'html';
  return 'tsx';
}

function inferType(path: string, variant: ProjectFileMappingVariant): ProjectFile['type'] {
  if (variant === 'autofix') {
    return path.endsWith('.css') ? 'style' : 'component';
  }

  if (path.includes('/components/')) return 'component';
  if (path.includes('/hooks/')) return 'hook';
  if (path.includes('/pages/')) return 'page';
  if (path.includes('/assets/')) return 'asset';
  if (path.includes('/utils/') || path.includes('/lib/')) return 'util';
  if (path.endsWith('.css')) return 'style';
  if (path.endsWith('.json') || path.includes('config')) return 'config';
  return 'util';
}

function isEntryPoint(path: string): boolean {
  return (
    path === '/src/main.tsx' ||
    path === '/src/App.tsx' ||
    path === '/App.tsx' ||
    path === '/main.tsx'
  );
}

export function mapRecordToProjectFiles(
  filesRecord: Record<string, string>,
  options: {
    variant?: ProjectFileMappingVariant;
    includeEntryPoint?: boolean;
  } = {}
): ProjectFile[] {
  const variant = options.variant || 'full';
  const includeEntryPoint = options.includeEntryPoint ?? false;

  return Object.entries(filesRecord)
    .filter(([, content]) => typeof content === 'string')
    .map(([path, content]) => {
      const normalizedPath = normalizeProjectPath(path);
      const file: ProjectFile = {
        path: normalizedPath,
        content: String(content),
        type: inferType(normalizedPath, variant),
        language: inferLanguage(normalizedPath),
      };
      if (includeEntryPoint) {
        file.isEntryPoint = isEntryPoint(normalizedPath);
      }
      return file;
    });
}
