// Project file system types for multi-file generation

export interface ProjectFile {
  path: string;
  content: string;
  type: 'component' | 'hook' | 'util' | 'style' | 'config' | 'page' | 'asset';
  language: 'tsx' | 'ts' | 'css' | 'json' | 'html';
  isEntryPoint?: boolean;
  dependencies?: string[];
}

export interface ProjectStructure {
  name?: string;
  files: ProjectFile[];
  entryPoint: string;
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface GeneratedProject {
  id: string;
  name: string;
  structure: ProjectStructure;
  createdAt: Date;
  updatedAt: Date;
}

// Default React template structure with Framer Motion for premium animations
export function getDefaultTemplate(): ProjectStructure {
  return {
    entryPoint: '/src/App.tsx',
    dependencies: {
      'react': '^18.3.1',
      'react-dom': '^18.3.1',
    },
    files: [
      {
        path: '/src/App.tsx',
        content: `export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-center bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Your Vision
        </h1>
        
        <p className="mt-8 text-xl md:text-2xl text-gray-400 max-w-2xl text-center leading-relaxed">
          Describe what you want to create and AI will generate a premium website for you
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <button className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors">
            Get Started
          </button>
          <button className="px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}`,
        type: 'page',
        language: 'tsx',
        isEntryPoint: true,
      },
      {
        path: '/src/main.tsx',
        content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
        type: 'config',
        language: 'tsx',
      },
      {
        path: '/src/index.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
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
      },
      {
        path: '/index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Generated App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        type: 'config',
        language: 'html',
      },
    ],
  };
}

// TMA (Telegram Mini App) template structure
export function getDefaultTMATemplate(): ProjectStructure {
  return {
    entryPoint: '/src/App.tsx',
    dependencies: {
      'react': '^18.3.1',
      'react-dom': '^18.3.1',
    },
    files: [
      {
        path: '/src/App.tsx',
        content: `import { useEffect, useState } from 'react';

// TMA Theme Bridge - синхронизирует тему Telegram с CSS
function useTelegramTheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    const root = document.documentElement;

    const applyTheme = () => {
      setColorScheme(tg.colorScheme || 'light');
      if (tg.colorScheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      const params = tg.themeParams || {};
      if (params.bg_color) root.style.setProperty('--tg-theme-bg-color', params.bg_color);
      if (params.text_color) root.style.setProperty('--tg-theme-text-color', params.text_color);
      if (params.hint_color) root.style.setProperty('--tg-theme-hint-color', params.hint_color);
      if (params.link_color) root.style.setProperty('--tg-theme-link-color', params.link_color);
      if (params.button_color) root.style.setProperty('--tg-theme-button-color', params.button_color);
      if (params.button_text_color) root.style.setProperty('--tg-theme-button-text-color', params.button_text_color);
      if (params.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', params.secondary_bg_color);
      if (params.header_bg_color) root.style.setProperty('--tma-header-bg', params.header_bg_color);
      if (params.section_bg_color) root.style.setProperty('--tma-section-bg', params.section_bg_color);
      if (params.accent_text_color) root.style.setProperty('--tma-accent', params.accent_text_color);
      if (params.destructive_text_color) root.style.setProperty('--tma-destructive', params.destructive_text_color);
    };

    const applyViewport = () => {
      if (tg.viewportHeight) {
        root.style.setProperty('--tg-viewport-height', String(tg.viewportHeight) + 'px');
      }
      if (tg.viewportStableHeight) {
        root.style.setProperty('--tg-viewport-stable-height', String(tg.viewportStableHeight) + 'px');
      }
    };

    applyTheme();
    applyViewport();

    const handleThemeChanged = () => applyTheme();
    const handleViewportChanged = () => applyViewport();

    tg.onEvent('themeChanged', handleThemeChanged);
    tg.onEvent('viewportChanged', handleViewportChanged);
    tg.ready();

    return () => {
      tg.offEvent('themeChanged', handleThemeChanged);
      tg.offEvent('viewportChanged', handleViewportChanged);
    };
  }, []);

  return colorScheme;
}

export default function App() {
  useTelegramTheme();

  return (
    <div className="min-h-tma-viewport bg-tma-bg text-tma-text flex flex-col">
      {/* Header */}
      <header className="pt-safe-top bg-tma-header px-4 py-3 border-b border-tma-border">
        <h1 className="text-xl font-semibold">Mini App</h1>
      </header>
      
      {/* Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
        <div className="tma-card">
          <h2 className="text-lg font-medium mb-2">Добро пожаловать!</h2>
          <p className="text-tma-hint text-sm">
            Это Telegram Mini App. Опишите в чате, что хотите создать.
          </p>
        </div>
        
        <div className="tma-section">
          <div className="tma-list-item">
            <span className="flex-1">Пункт меню 1</span>
            <span className="text-tma-hint">→</span>
          </div>
          <div className="tma-list-item">
            <span className="flex-1">Пункт меню 2</span>
            <span className="text-tma-hint">→</span>
          </div>
        </div>
      </main>
      
      {/* Bottom Action */}
      <div className="pb-safe-bottom bg-tma-bg border-t border-tma-border p-4">
        <button className="tma-button w-full">
          Продолжить
        </button>
      </div>
    </div>
  );
}`,
        type: 'page',
        language: 'tsx',
        isEntryPoint: true,
      },
      {
        path: '/src/main.tsx',
        content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);`,
        type: 'config',
        language: 'tsx',
      },
      {
        path: '/src/index.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

/* TMA Design Tokens */
:root {
  --tg-theme-bg-color: #ffffff;
  --tg-theme-text-color: #000000;
  --tg-theme-hint-color: #999999;
  --tg-theme-link-color: #2481cc;
  --tg-theme-button-color: #2481cc;
  --tg-theme-button-text-color: #ffffff;
  --tg-theme-secondary-bg-color: #f1f1f1;

  --tg-viewport-height: 100vh;
  --tg-viewport-stable-height: 100vh;
  --tg-safe-area-inset-top: env(safe-area-inset-top, 0px);
  --tg-safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --tg-safe-area-inset-left: env(safe-area-inset-left, 0px);
  --tg-safe-area-inset-right: env(safe-area-inset-right, 0px);
  --tg-content-safe-area-inset-top: var(--tg-safe-area-inset-top);
  --tg-content-safe-area-inset-bottom: var(--tg-safe-area-inset-bottom);
  --tg-content-safe-area-inset-left: var(--tg-safe-area-inset-left);
  --tg-content-safe-area-inset-right: var(--tg-safe-area-inset-right);

  --tma-bg: var(--tg-theme-bg-color);
  --tma-text: var(--tg-theme-text-color);
  --tma-hint: var(--tg-theme-hint-color);
  --tma-link: var(--tg-theme-link-color);
  --tma-button: var(--tg-theme-button-color);
  --tma-button-text: var(--tg-theme-button-text-color);
  --tma-secondary-bg: var(--tg-theme-secondary-bg-color);
  --tma-header-bg: var(--tg-theme-bg-color);
  --tma-section-bg: var(--tg-theme-secondary-bg-color);
  --tma-border: #e5e5e5;
  --tma-destructive: #ff3b30;

  --safe-area-top: var(--tg-safe-area-inset-top);
  --safe-area-bottom: var(--tg-safe-area-inset-bottom);
  --safe-area-left: var(--tg-safe-area-inset-left);
  --safe-area-right: var(--tg-safe-area-inset-right);
  --tma-viewport-height: var(--tg-viewport-height);
  --tma-viewport-stable-height: var(--tg-viewport-stable-height);
}

.dark {
  --tg-theme-bg-color: #18222d;
  --tg-theme-text-color: #ffffff;
  --tg-theme-hint-color: #708499;
  --tg-theme-link-color: #6ab3f3;
  --tg-theme-button-color: #6ab3f3;
  --tg-theme-button-text-color: #ffffff;
  --tg-theme-secondary-bg-color: #232e3c;
  --tma-border: #2f3b47;
  --tma-destructive: #ff6b6b;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; width: 100%; overflow: hidden; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--tma-bg);
  color: var(--tma-text);
  -webkit-font-smoothing: antialiased;
  overscroll-behavior: none;
}
button, a { -webkit-tap-highlight-color: transparent; }

/* TMA Utilities */
.bg-tma-bg { background-color: var(--tma-bg); }
.bg-tma-card { background-color: var(--tma-secondary-bg); }
.bg-tma-section { background-color: var(--tma-section-bg); }
.bg-tma-header { background-color: var(--tma-header-bg); }
.bg-tma-button { background-color: var(--tma-button); }
.text-tma-text { color: var(--tma-text); }
.text-tma-hint { color: var(--tma-hint); }
.text-tma-link { color: var(--tma-link); }
.text-tma-button-text { color: var(--tma-button-text); }
.text-tma-destructive { color: var(--tma-destructive); }
.border-tma-border { border-color: var(--tma-border); }
.pt-safe-top { padding-top: var(--safe-area-top); }
.pb-safe-bottom { padding-bottom: var(--safe-area-bottom); }
.min-h-tma-viewport { min-height: var(--tma-viewport-height, 100vh); }

.tma-card {
  background-color: var(--tma-secondary-bg);
  border-radius: 12px;
  padding: 16px;
}
.tma-section {
  background-color: var(--tma-section-bg);
  border-radius: 12px;
  overflow: hidden;
}
.tma-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 24px;
  font-size: 15px;
  font-weight: 600;
  background-color: var(--tma-button);
  color: var(--tma-button-text);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
}
.tma-button:active { opacity: 0.8; transform: scale(0.97); }
.tma-list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--tma-section-bg);
  border-bottom: 0.5px solid var(--tma-border);
}
.tma-list-item:last-child { border-bottom: none; }`,
        type: 'style',
        language: 'css',
      },
      {
        path: '/index.html',
        content: `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="color-scheme" content="light dark" />
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#18222d" media="(prefers-color-scheme: dark)" />
    <title>Telegram Mini App</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        type: 'config',
        language: 'html',
      },
    ],
  };
}

// Get template by project type
export function getTemplateByType(projectType: 'website' | 'tma' | 'landing'): ProjectStructure {
  if (projectType === 'tma') {
    return getDefaultTMATemplate();
  }
  return getDefaultTemplate();
}
