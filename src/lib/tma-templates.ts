/**
 * 📱 TMA Project Templates
 * 
 * Шаблоны файлов для генерации Telegram Mini App проектов.
 * Эти файлы используются при создании TMA проекта.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TMA INDEX CSS - обязательные стили для TMA
// ═══════════════════════════════════════════════════════════════════════════

export const TMA_INDEX_CSS = `@import "tailwindcss";
@import "tw-animate-css";

/* TMA Design Tokens */
:root {
  /* Official Telegram theme vars (fallbacks for non-TMA) */
  --tg-theme-bg-color: #ffffff;
  --tg-theme-text-color: #000000;
  --tg-theme-hint-color: #999999;
  --tg-theme-link-color: #2481cc;
  --tg-theme-button-color: #2481cc;
  --tg-theme-button-text-color: #ffffff;
  --tg-theme-secondary-bg-color: #f1f1f1;

  /* Official Telegram layout vars (fallbacks) */
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

  /* TMA aliases (source of truth = --tg-*) */
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
  --tma-accent: var(--tg-theme-link-color);
  
  /* Safe area defaults */
  --safe-area-top: var(--tg-safe-area-inset-top);
  --safe-area-bottom: var(--tg-safe-area-inset-bottom);
  --safe-area-left: var(--tg-safe-area-inset-left);
  --safe-area-right: var(--tg-safe-area-inset-right);
  
  /* Telegram viewport */
  --tma-viewport-height: var(--tg-viewport-height);
  --tma-viewport-stable-height: var(--tg-viewport-stable-height);
}

/* Dark theme */
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

/* TMA Base Styles */
@layer base {
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  /* Hide scrollbar globally but allow scrolling */
  *,
  *::before,
  *::after {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  
  *::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    background: transparent !important;
  }
  
  html, body, #root {
    height: 100%;
    width: 100%;
    overflow: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  html::-webkit-scrollbar,
  body::-webkit-scrollbar,
  #root::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background-color: var(--tma-bg);
    color: var(--tma-text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    
    /* Prevent overscroll */
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Disable tap highlight */
  button, a, [role="button"] {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
}

/* TMA Color Utilities */
@layer utilities {
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
  .text-tma-accent { color: var(--tma-accent); }
  
  .border-tma-border { border-color: var(--tma-border); }
  
  /* Safe area utilities */
  .pt-safe-top { padding-top: var(--safe-area-top); }
  .pb-safe-bottom { padding-bottom: var(--safe-area-bottom); }
  .pl-safe-left { padding-left: var(--safe-area-left); }
  .pr-safe-right { padding-right: var(--safe-area-right); }
  
  /* TMA layout height */
  .h-tma-viewport { height: var(--tma-viewport-height, 100vh); }
  .min-h-tma-viewport { min-height: var(--tma-viewport-height, 100vh); }
}

/* TMA Card */
.tma-card {
  background-color: var(--tma-secondary-bg);
  border-radius: 12px;
  padding: 16px;
}

/* TMA Section */
.tma-section {
  background-color: var(--tma-section-bg);
  border-radius: 12px;
  overflow: hidden;
}

/* TMA Button */
.tma-button {
  display: inline-flex;
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

.tma-button:active {
  opacity: 0.8;
  transform: scale(0.97);
}

.tma-button:disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* TMA List Item */
.tma-list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--tma-section-bg);
  border-bottom: 0.5px solid var(--tma-border);
}

.tma-list-item:last-child {
  border-bottom: none;
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// TMA APP TSX - базовый шаблон App.tsx
// ═══════════════════════════════════════════════════════════════════════════

export const TMA_APP_TSX_TEMPLATE = `import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export default function App() {
  const { isTMA, colorScheme, mainButton } = useTelegramWebApp();

  const handleContinue = () => {
    if (mainButton) {
      mainButton.setText('Готово');
      mainButton.show();
    }
  };

  return (
    <div className="min-h-tma-viewport bg-tma-bg text-tma-text flex flex-col">
      <header className="pt-safe-top bg-tma-header px-4 py-3 border-b border-tma-border">
        <h1 className="text-xl font-semibold">Mini App</h1>
        <p className="text-xs text-tma-hint mt-1">
          {isTMA ? 'Telegram runtime' : 'Browser fallback'} · theme: {colorScheme}
        </p>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
        <div className="tma-card">
          <h2 className="text-lg font-medium mb-2">Добро пожаловать!</h2>
          <p className="text-tma-hint text-sm">
            Шаблон использует единый typed Telegram SDK слой через useTelegramWebApp.
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

      <div className="pb-safe-bottom bg-tma-bg border-t border-tma-border p-4">
        <button className="tma-button w-full" onClick={handleContinue}>
          Продолжить
        </button>
      </div>
    </div>
  );
}
`;

// ═══════════════════════════════════════════════════════════════════════════
// TMA INDEX HTML - с telegram-web-app.js
// ═══════════════════════════════════════════════════════════════════════════

export const TMA_INDEX_HTML = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="color-scheme" content="light dark" />
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#18222d" media="(prefers-color-scheme: dark)" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <title>Telegram Mini App</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
      /* Force hide all scrollbars in TMA */
      *, *::before, *::after {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      html, body {
        overflow: hidden;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      html::-webkit-scrollbar, body::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

// ═══════════════════════════════════════════════════════════════════════════
// Helper function to get TMA template files
// ═══════════════════════════════════════════════════════════════════════════

export interface TMATemplateFiles {
  '/index.html': string;
  '/src/index.css': string;
  '/src/App.tsx': string;
}

export function getTMATemplateFiles(): TMATemplateFiles {
  return {
    '/index.html': TMA_INDEX_HTML,
    '/src/index.css': TMA_INDEX_CSS,
    '/src/App.tsx': TMA_APP_TSX_TEMPLATE,
  };
}

/**
 * Check if project type is TMA
 */
export function isTMAProject(projectType: string): boolean {
  return projectType === 'tma';
}
