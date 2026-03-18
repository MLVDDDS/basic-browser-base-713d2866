/**
 * 🎨 TMA Theme Bridge Component
 * 
 * Provides CSS variables mapping from Telegram WebApp theme to our design system.
 * Should be placed near the root of the app when running in TMA mode.
 */

import { useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface TMAThemeBridgeProps {
  children: React.ReactNode;
}

/**
 * Hex to HSL conversion helper
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  if (hex.length !== 6) return null;
  
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert hex color to HSL CSS variable format (without hsl())
 */
function hexToHSLVar(hex: string | undefined): string | null {
  if (!hex) return null;
  const hsl = hexToHSL(hex);
  if (!hsl) return null;
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

export function TMAThemeBridge({ children }: TMAThemeBridgeProps) {
  const {
    isTMA,
    colorScheme,
    themeParams,
    isExpanded,
    viewportHeight,
    viewportStableHeight,
  } = useTelegramWebApp();

  useEffect(() => {
    if (!isTMA) return;

    const root = document.documentElement;
    
    // Add TMA-specific classes
    root.classList.add('tma-mode');
    root.setAttribute('data-tma', 'true');
    root.setAttribute('data-tma-scheme', colorScheme);

    // Apply color scheme
    if (colorScheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Map Telegram theme params to our design tokens
    const mappings: Record<string, string | undefined> = {
      '--tg-theme-bg-color': themeParams.bg_color,
      '--tg-theme-text-color': themeParams.text_color,
      '--tg-theme-hint-color': themeParams.hint_color,
      '--tg-theme-link-color': themeParams.link_color,
      '--tg-theme-button-color': themeParams.button_color,
      '--tg-theme-button-text-color': themeParams.button_text_color,
      '--tg-theme-secondary-bg-color': themeParams.secondary_bg_color,
      '--tma-header-bg': themeParams.header_bg_color,
      '--tma-accent': themeParams.accent_text_color,
      '--tma-section-bg': themeParams.section_bg_color,
      '--tma-destructive': themeParams.destructive_text_color,
    };

    // Apply raw hex values
    Object.entries(mappings).forEach(([prop, value]) => {
      if (value) {
        root.style.setProperty(prop, value);
      }
    });

    // Also apply as HSL for Tailwind compatibility
    const hslMappings: Record<string, string | undefined> = {
      '--background': hexToHSLVar(themeParams.bg_color) || undefined,
      '--foreground': hexToHSLVar(themeParams.text_color) || undefined,
      '--card': hexToHSLVar(themeParams.secondary_bg_color) || undefined,
      '--card-foreground': hexToHSLVar(themeParams.text_color) || undefined,
      '--primary': hexToHSLVar(themeParams.button_color || themeParams.link_color) || undefined,
      '--primary-foreground': hexToHSLVar(themeParams.button_text_color) || undefined,
      '--muted': hexToHSLVar(themeParams.hint_color) || undefined,
      '--muted-foreground': hexToHSLVar(themeParams.hint_color) || undefined,
      '--border': hexToHSLVar(themeParams.hint_color) || undefined,
    };

    Object.entries(hslMappings).forEach(([prop, value]) => {
      if (value) {
        root.style.setProperty(`${prop}-tma`, value);
      }
    });

    // Set viewport height CSS variable for safe area handling
    root.style.setProperty('--tg-viewport-height', `${viewportHeight}px`);
    if (viewportStableHeight) {
      root.style.setProperty('--tg-viewport-stable-height', `${viewportStableHeight}px`);
    }
    root.style.setProperty('--tma-expanded', isExpanded ? '1' : '0');

    // Cleanup
    return () => {
      root.classList.remove('tma-mode');
      root.removeAttribute('data-tma');
      root.removeAttribute('data-tma-scheme');
    };
  }, [isTMA, colorScheme, themeParams, isExpanded, viewportHeight, viewportStableHeight]);

  return <>{children}</>;
}

export default TMAThemeBridge;
