/**
 * Telegram Mini App integration hook.
 * Uses the official Telegram runtime object with a typed wrapper layer.
 */

import { useCallback, useEffect, useState } from "react";
import {
  getTelegramWebApp as readTelegramWebApp,
  isTelegramMiniAppEnvironment,
  type TelegramThemeParams,
  type TelegramWebApp,
} from "@/lib/telegram-sdk";

export interface TMAState {
  isTMA: boolean;
  isReady: boolean;
  colorScheme: "light" | "dark";
  themeParams: TelegramThemeParams;
  platform: string;
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
}

export interface UseTelegramWebAppReturn extends TMAState {
  webApp: TelegramWebApp | null;
  ready: () => void;
  expand: () => void;
  close: () => void;
  haptic: TelegramWebApp["HapticFeedback"] | null;
  mainButton: TelegramWebApp["MainButton"] | null;
  backButton: TelegramWebApp["BackButton"] | null;
}

export function useTelegramWebApp(): UseTelegramWebAppReturn {
  const [state, setState] = useState<TMAState>({
    isTMA: false,
    isReady: false,
    colorScheme: "light",
    themeParams: {},
    platform: "unknown",
    viewportHeight: 0,
    viewportStableHeight: 0,
    isExpanded: false,
  });

  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    if (!isTelegramMiniAppEnvironment()) return;

    const tg = readTelegramWebApp();
    if (!tg) return;

    setWebApp(tg);
    setState({
      isTMA: true,
      isReady: true,
      colorScheme: tg.colorScheme || "light",
      themeParams: tg.themeParams || {},
      platform: tg.platform || "unknown",
      viewportHeight: tg.viewportHeight || window.innerHeight,
      viewportStableHeight: tg.viewportStableHeight || window.innerHeight,
      isExpanded: tg.isExpanded || false,
    });

    applyTMATheme(tg.colorScheme, tg.themeParams);
    applyTMAViewport(tg.viewportHeight, tg.viewportStableHeight);

    const handleThemeChanged = () => {
      const next = readTelegramWebApp();
      if (!next) return;
      setState((prev) => ({
        ...prev,
        colorScheme: next.colorScheme,
        themeParams: next.themeParams,
      }));
      applyTMATheme(next.colorScheme, next.themeParams);
    };

    const handleViewportChanged = () => {
      const next = readTelegramWebApp();
      if (!next) return;
      setState((prev) => ({
        ...prev,
        viewportHeight: next.viewportHeight,
        viewportStableHeight: next.viewportStableHeight,
        isExpanded: next.isExpanded,
      }));
      applyTMAViewport(next.viewportHeight, next.viewportStableHeight);
    };

    tg.onEvent("themeChanged", handleThemeChanged);
    tg.onEvent("viewportChanged", handleViewportChanged);
    tg.ready();

    return () => {
      tg.offEvent("themeChanged", handleThemeChanged);
      tg.offEvent("viewportChanged", handleViewportChanged);
    };
  }, []);

  const ready = useCallback(() => {
    webApp?.ready();
  }, [webApp]);

  const expand = useCallback(() => {
    webApp?.expand();
  }, [webApp]);

  const close = useCallback(() => {
    webApp?.close();
  }, [webApp]);

  return {
    ...state,
    webApp,
    ready,
    expand,
    close,
    haptic: webApp?.HapticFeedback || null,
    mainButton: webApp?.MainButton || null,
    backButton: webApp?.BackButton || null,
  };
}

function applyTMATheme(
  colorScheme: "light" | "dark",
  params: TelegramThemeParams
) {
  const root = document.documentElement;
  root.classList.add("tma-environment");
  if (colorScheme === "dark") {
    root.classList.add("dark");
    root.classList.add("tma-dark");
  } else {
    root.classList.remove("dark");
    root.classList.add("tma-light");
  }

  if (params.bg_color) root.style.setProperty("--tg-theme-bg-color", params.bg_color);
  if (params.text_color) root.style.setProperty("--tg-theme-text-color", params.text_color);
  if (params.hint_color) root.style.setProperty("--tg-theme-hint-color", params.hint_color);
  if (params.link_color) root.style.setProperty("--tg-theme-link-color", params.link_color);
  if (params.button_color) root.style.setProperty("--tg-theme-button-color", params.button_color);
  if (params.button_text_color) root.style.setProperty("--tg-theme-button-text-color", params.button_text_color);
  if (params.secondary_bg_color) root.style.setProperty("--tg-theme-secondary-bg-color", params.secondary_bg_color);
  if (params.header_bg_color) root.style.setProperty("--tma-header-bg", params.header_bg_color);
  if (params.accent_text_color) root.style.setProperty("--tma-accent", params.accent_text_color);
  if (params.section_bg_color) root.style.setProperty("--tma-section-bg", params.section_bg_color);
  if (params.destructive_text_color) root.style.setProperty("--tma-destructive", params.destructive_text_color);
}

function applyTMAViewport(viewportHeight?: number, viewportStableHeight?: number) {
  const root = document.documentElement;
  if (Number.isFinite(viewportHeight) && viewportHeight) {
    root.style.setProperty("--tg-viewport-height", `${viewportHeight}px`);
  }
  if (Number.isFinite(viewportStableHeight) && viewportStableHeight) {
    root.style.setProperty("--tg-viewport-stable-height", `${viewportStableHeight}px`);
  }
}

export function isTelegramWebApp(): boolean {
  return isTelegramMiniAppEnvironment() && !!readTelegramWebApp();
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return readTelegramWebApp();
}

