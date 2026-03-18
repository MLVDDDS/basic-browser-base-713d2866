// Multi-file code generator using Gemini-compatible backend responses
import { ProjectFile, ProjectStructure } from '@/types/project';
import { resolveProjectDependencies } from '@/lib/dependency-resolver';

export interface GenerationRequest {
  prompt: string;
  projectName?: string;
  template?: 'landing' | 'dashboard' | 'ecommerce' | 'portfolio' | 'saas';
  includeAuth?: boolean;
  includeDatabase?: boolean;
  style?: 'minimal' | 'modern' | 'brutalist' | 'glassmorphism';
}

export interface GenerationResult {
  success: boolean;
  project: ProjectStructure;
  usage: {
    inputTokens: number;
    outputTokens: number;
    model: string;
  };
  qualityScore: number;
  errors?: string[];
}

// File templates for common patterns
const COMPONENT_TEMPLATE = (name: string, content: string) => `import React from 'react';
import { cn } from '@/lib/utils';

interface ${name}Props {
  className?: string;
}

export function ${name}({ className }: ${name}Props) {
  return (
    ${content}
  );
}

export default ${name};
`;

const HOOK_TEMPLATE = (name: string, logic: string) => `import { useState, useCallback, useEffect } from 'react';

export function ${name}() {
  ${logic}
}
`;

const PAGE_TEMPLATE = (name: string, imports: string[], content: string) => `import React from 'react';
${imports.join('\n')}

export default function ${name}Page() {
  return (
    ${content}
  );
}
`;

// Parse generated code into structured files
export function parseGeneratedFiles(rawOutput: string): ProjectFile[] {
  const files: ProjectFile[] = [];
  
  // Pattern: ```filepath\n...code...\n```
  const filePattern = /```(\S+)\n([\s\S]*?)```/g;
  let match;
  
  while ((match = filePattern.exec(rawOutput)) !== null) {
    const pathOrLang = match[1];
    const content = match[2].trim();
    
    // Determine if it's a file path or just language identifier
    let path: string;
    let language: ProjectFile['language'];
    
    if (pathOrLang.includes('/') || pathOrLang.includes('.')) {
      // It's a file path
      path = pathOrLang.startsWith('/') ? pathOrLang : `/${pathOrLang}`;
      language = detectLanguage(path);
    } else {
      // It's a language identifier, generate path from content
      language = pathOrLang as ProjectFile['language'];
      path = generatePathFromContent(content, language);
    }
    
    const type = detectFileType(path);
    
    files.push({
      path,
      content,
      type,
      language,
      isEntryPoint: path.includes('App.tsx') || path.includes('main.tsx'),
    });
  }
  
  return files;
}

function detectLanguage(path: string): ProjectFile['language'] {
  if (path.endsWith('.tsx')) return 'tsx';
  if (path.endsWith('.ts')) return 'ts';
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.html')) return 'html';
  return 'tsx';
}

function detectFileType(path: string): ProjectFile['type'] {
  if (path.includes('/components/')) return 'component';
  if (path.includes('/hooks/')) return 'hook';
  if (path.includes('/lib/') || path.includes('/utils/')) return 'util';
  if (path.includes('/pages/')) return 'page';
  if (path.endsWith('.css')) return 'style';
  if (path.includes('config') || path.includes('package.json')) return 'config';
  return 'component';
}

function generatePathFromContent(content: string, language: string): string {
  // Try to extract component/function name
  const componentMatch = content.match(/(?:function|const)\s+(\w+)/);
  const name = componentMatch ? componentMatch[1] : 'Component';
  
  const ext = language === 'css' ? 'css' : 'tsx';
  
  if (content.includes('export default function') && content.includes('Page')) {
    return `/src/pages/${name}.${ext}`;
  }
  if (content.includes('use') && content.includes('useState')) {
    return `/src/hooks/${name}.${ext}`;
  }
  return `/src/components/${name}.${ext}`;
}

// Build complete project structure from files
export function buildProjectStructure(
  files: ProjectFile[],
  projectName: string = 'generated-app'
): ProjectStructure {
  const normalizeProjectPath = (inputPath: string): string => {
    const withForwardSlashes = String(inputPath || '').replace(/\\/g, '/').trim();
    if (!withForwardSlashes) return '/unknown.tsx';
    return withForwardSlashes.startsWith('/') ? withForwardSlashes : `/${withForwardSlashes}`;
  };

  const normalizedByKey = new Map<string, ProjectFile>();
  for (const file of files) {
    const normalizedPath = normalizeProjectPath(file.path);
    normalizedByKey.set(normalizedPath.toLowerCase(), {
      ...file,
      path: normalizedPath,
      isEntryPoint:
        normalizedPath.toLowerCase() === '/src/main.tsx' ||
        normalizedPath.toLowerCase() === '/src/app.tsx' ||
        normalizedPath.toLowerCase() === '/main.tsx' ||
        normalizedPath.toLowerCase() === '/app.tsx',
    });
  }
  files = Array.from(normalizedByKey.values());
  const filePathsLower = new Set(files.map((file) => file.path.toLowerCase()));

  // Ensure we have required files
  const hasMain = filePathsLower.has('/src/main.tsx') || filePathsLower.has('/main.tsx');
  const hasApp = filePathsLower.has('/src/app.tsx') || filePathsLower.has('/app.tsx');
  const hasIndex = filePathsLower.has('/index.html');
  const hasCSS = filePathsLower.has('/src/index.css') || filePathsLower.has('/index.css');
  
  // CRITICAL: Add missing App.tsx - the main component that everything imports
  if (!hasApp) {
    console.warn('⚠️ App.tsx missing from generated files, adding fallback');
    files.push({
      path: '/src/App.tsx',
      content: `import React from 'react';

export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight">${projectName}</h1>
        <p className="mt-4 text-muted-foreground">
          Каркас проекта готов. Уточните запрос, чтобы добавить реальные секции, логику и данные.
        </p>
      </section>
    </main>
  );
}`,
      type: 'page',
      language: 'tsx',
    });
  }
  
  // Add missing core files
  if (!hasMain) {
    files.push({
      path: '/src/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      type: 'config',
      language: 'tsx',
    });
  }
  
  if (!hasIndex) {
    files.push({
      path: '/index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
      type: 'config',
      language: 'html',
    });
  }
  
  if (!hasCSS) {
    files.push({
      path: '/src/index.css',
      content: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --primary: 250 100% 70%;
  --primary-foreground: 0 0% 100%;
  --muted: 240 5% 15%;
  --muted-foreground: 240 5% 65%;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: black;
  color: white;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}

::selection {
  background: rgba(120, 119, 198, 0.3);
}`,
      type: 'style',
      language: 'css',
    });
  }
  
  // Add Vite config if missing
  const hasViteConfig = files.some(f => f.path.includes('vite.config'));
  if (!hasViteConfig) {
    files.push({
      path: '/vite.config.ts',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,
      type: 'config',
      language: 'ts',
    });
  }
  
  // Add Tailwind config if missing
  const hasTailwindConfig = files.some(f => f.path.includes('tailwind.config'));
  if (!hasTailwindConfig) {
    files.push({
      path: '/tailwind.config.js',
      content: `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};`,
      type: 'config',
      language: 'ts',
    });
  }
  
  // Add PostCSS config if missing
  const hasPostcssConfig = files.some(f => f.path.includes('postcss.config'));
  if (!hasPostcssConfig) {
    files.push({
      path: '/postcss.config.js',
      content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
      type: 'config',
      language: 'ts',
    });
  }
  
  // Add utils
  const hasUtils = files.some(f => f.path.includes('/lib/utils'));
  if (!hasUtils) {
    files.push({
      path: '/src/lib/utils.ts',
      content: `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
      type: 'util',
      language: 'ts',
    });
  }
  
  // Resolve dependencies
  const deps = resolveProjectDependencies(files.map(f => ({ path: f.path, content: f.content })));
  
  // Ensure base dependencies are always included
  const baseDeps: Record<string, string> = {
    'react': '^18.3.1',
    'react-dom': '^18.3.1',
    'lucide-react': '^0.462.0',
    'tailwind-merge': '^2.6.0',
    'clsx': '^2.1.1',
  };
  
  const baseDevDeps: Record<string, string> = {
    '@types/react': '^18.3.0',
    '@types/react-dom': '^18.3.0',
    'typescript': '^5.0.0',
    'vite': '^5.0.0',
    '@vitejs/plugin-react': '^4.0.0',
    'tailwindcss': '^3.4.0',
    'postcss': '^8.4.0',
    'autoprefixer': '^10.4.0',
  };
  
  // Determine entry point
  const entryPoint = files.find(f => f.isEntryPoint)?.path || 
                     files.find(f => f.path.toLowerCase().endsWith('/app.tsx'))?.path ||
                     '/src/App.tsx';
  
  return {
    files,
    entryPoint,
    dependencies: { ...baseDeps, ...deps.dependencies },
    devDependencies: { ...baseDevDeps, ...deps.devDependencies },
  };
}

// Validate generated project
export function validateProject(structure: ProjectStructure): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const filePathsLower = new Set(structure.files.map((file) => file.path.toLowerCase()));
  
  // Check for entry point
  if (!structure.files.some(f => f.path === structure.entryPoint)) {
    errors.push(`Entry point ${structure.entryPoint} not found`);
  }
  
  // Check for required files
  const requiredPaths = ['/src/main.tsx', '/index.html', '/src/App.tsx'];
  for (const path of requiredPaths) {
    if (!filePathsLower.has(path.toLowerCase())) {
      errors.push(`Missing required file: ${path}`);
    }
  }
  
  // Check for syntax errors (basic)
  for (const file of structure.files) {
    if (file.language === 'tsx' || file.language === 'ts') {
      // Check for unbalanced brackets
      const openBraces = (file.content.match(/\{/g) || []).length;
      const closeBraces = (file.content.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push(`Unbalanced braces in ${file.path}`);
      }
      
      const openParens = (file.content.match(/\(/g) || []).length;
      const closeParens = (file.content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push(`Unbalanced parentheses in ${file.path}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Merge changes into existing project
export function mergeProjectChanges(
  base: ProjectStructure,
  changes: Partial<ProjectStructure>
): ProjectStructure {
  const merged: ProjectStructure = { ...base };
  
  if (changes.files) {
    for (const newFile of changes.files) {
      const existingIndex = merged.files.findIndex(f => f.path === newFile.path);
      if (existingIndex >= 0) {
        // Replace existing file
        merged.files[existingIndex] = newFile;
      } else {
        // Add new file
        merged.files.push(newFile);
      }
    }
  }
  
  if (changes.dependencies) {
    merged.dependencies = { ...merged.dependencies, ...changes.dependencies };
  }
  
  if (changes.devDependencies) {
    merged.devDependencies = { ...merged.devDependencies, ...changes.devDependencies };
  }
  
  return merged;
}
