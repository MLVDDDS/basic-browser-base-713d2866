import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest, isApiConfigured } from "@/lib/api-client";

interface PreviewSession {
  id: string;
  status: "queued" | "running" | "ready" | "failed" | "stopped" | "expired" | string;
  runtime_state?: "building" | "ready" | "failed" | "stale" | "recovering" | string;
  runtime_state_reason?: string | null;
  preview_url?: string | null;
  canvas_url?: string | null;
  runner_endpoint?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  started_at?: string | null;
  ready_at?: string | null;
  expires_at?: string | null;
}

interface UsePreviewSessionArgs {
  projectId?: string;
  versionId?: string | null;
  enabled?: boolean;
}

interface SessionDiagnostics {
  elapsedMs: number;
  runningWithoutUrlMs: number;
}

const READY_TIMEOUT_MS = Math.max(
  10_000,
  Number(import.meta.env.VITE_PREVIEW_READY_TIMEOUT_MS || 90_000)
);
const RUNNING_WITHOUT_URL_TIMEOUT_MS = Math.max(
  5_000,
  Number(import.meta.env.VITE_PREVIEW_RUNNING_WITHOUT_URL_TIMEOUT_MS || 15_000)
);
const SESSION_REUSE_MAX_AGE_MS = Math.max(
  20_000,
  Number(import.meta.env.VITE_PREVIEW_SESSION_REUSE_MAX_AGE_MS || 60_000)
);
const AUTO_RESTART_FAILURE_CODES = new Set([
  "PREVIEW_SESSION_STALE",
  "PREVIEW_PLACEHOLDER_CONTENT",
  "PREVIEW_PROJECT_FILES_MISSING",
]);
const AUTO_RESTART_MAX_ATTEMPTS = 2;

function parseTimestamp(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed;
}

function getSessionDiagnostics(session: PreviewSession): SessionDiagnostics {
  const now = Date.now();
  const createdAt = parseTimestamp(session.created_at);
  const startedAt = parseTimestamp(session.started_at);
  const reference = Math.max(createdAt, startedAt);
  const elapsedMs = reference > 0 ? Math.max(0, now - reference) : 0;
  const runningWithoutUrlMs =
    session.status === "running" &&
    Boolean(session.runner_endpoint) &&
    !session.preview_url &&
    startedAt > 0
      ? Math.max(0, now - startedAt)
      : 0;

  return { elapsedMs, runningWithoutUrlMs };
}

function toDisplayError(session: PreviewSession): string | null {
  if (session.error_message) return session.error_message;
  if (session.error_code) return session.error_code;
  return null;
}

function autoRestartMessageForCode(code: string): string {
  if (code === "PREVIEW_PLACEHOLDER_CONTENT") {
    return "Preview вернул scaffold-заглушку, перезапускаю...";
  }
  if (code === "PREVIEW_PROJECT_FILES_MISSING") {
    return "Preview потерял обязательные файлы, перезапускаю...";
  }
  return "Preview session устарела, перезапускаю...";
}

function shouldRestartStaleActiveSession(session: PreviewSession): boolean {
  if (session.status !== "running" && session.status !== "ready") return false;
  const createdAt = parseTimestamp(session.created_at);
  const updatedAt = parseTimestamp(session.updated_at);
  const reference = Math.max(createdAt, updatedAt);
  if (reference <= 0) return false;
  return Date.now() - reference > SESSION_REUSE_MAX_AGE_MS;
}

export function usePreviewSession({
  projectId,
  versionId,
  enabled = true,
}: UsePreviewSessionArgs) {
  const apiEnabled = isApiConfigured();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [runtimeState, setRuntimeState] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const startInFlightRef = useRef(false);
  const startAttemptKeyRef = useRef<string | null>(null);
  const autoRestartFailureKeyRef = useRef<string | null>(null);
  const autoRestartAttemptsRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const stopSession = useCallback(
    async (targetSessionId?: string | null) => {
      const activeSessionId = targetSessionId || sessionIdRef.current;
      if (!apiEnabled || !activeSessionId) return;
      try {
        await apiRequest(`/preview/sessions/${activeSessionId}`, { method: "DELETE" });
      } catch (err) {
        console.warn("[preview] stop failed:", err);
      } finally {
        setSessionId(null);
        setStatus(null);
        setRuntimeState(null);
        setPreviewUrl(null);
        setCanvasUrl(null);
      }
    },
    [apiEnabled]
  );

  const startSession = useCallback(async () => {
    if (!apiEnabled || !projectId || !enabled) return;
    if (startInFlightRef.current) return;

    startInFlightRef.current = true;
    setIsStarting(true);
    setError(null);
    autoRestartAttemptsRef.current = 0;
    autoRestartFailureKeyRef.current = null;

    try {
      const response = await apiRequest<{ session: PreviewSession }>("/preview/sessions", {
        method: "POST",
        body: JSON.stringify({ projectId, versionId }),
      });
      let session = response.session;
      if (shouldRestartStaleActiveSession(session)) {
        try {
          const restarted = await apiRequest<{ session: PreviewSession }>(
            `/preview/sessions/${session.id}/restart`,
            { method: "POST" }
          );
          session = restarted.session;
        } catch (restartErr) {
          console.warn("[preview] stale session restart failed:", restartErr);
        }
      }

      setSessionId(session.id);
      setStatus(session.status);
      setRuntimeState(session.runtime_state || null);
      setPreviewUrl(session.preview_url || null);
      setCanvasUrl(session.canvas_url || null);

      const displayError = toDisplayError(session);
      if (session.status === "failed" && displayError) {
        setError(displayError);
      }
    } catch (err) {
      console.error("[preview] start failed:", err);
      const message = err instanceof Error ? err.message : "preview_start_failed";
      if (message === "preview_session_limit") {
        setError("Слишком много активных preview-сессий. Остановите старые и попробуйте снова.");
      } else {
        setError(message);
      }
    } finally {
      setIsStarting(false);
      startInFlightRef.current = false;
    }
  }, [apiEnabled, enabled, projectId, versionId]);

  const restartSession = useCallback(async () => {
    if (!apiEnabled) return;
    const activeSessionId = sessionIdRef.current;

    setError(null);
    if (activeSessionId) {
      try {
        const response = await apiRequest<{ session: PreviewSession }>(
          `/preview/sessions/${activeSessionId}/restart`,
          { method: "POST" }
        );
        setSessionId(response.session.id);
        setStatus(response.session.status);
        setRuntimeState(response.session.runtime_state || null);
        setPreviewUrl(response.session.preview_url || null);
        setCanvasUrl(response.session.canvas_url || null);
        return;
      } catch (err) {
        console.warn("[preview] restart endpoint failed, fallback to stop/start:", err);
      }
    }

    await stopSession(activeSessionId);
    startAttemptKeyRef.current = null;
    await startSession();
  }, [apiEnabled, startSession, stopSession]);

  const refreshStatus = useCallback(async () => {
    const activeSessionId = sessionIdRef.current;
    if (!apiEnabled || !activeSessionId) return;

    try {
      const response = await apiRequest<{ session: PreviewSession }>(
        `/preview/sessions/${activeSessionId}/status`
      );
      const session = response.session;
      setStatus(session.status);
      setRuntimeState(session.runtime_state || null);
      setPreviewUrl(session.preview_url || null);
      setCanvasUrl(session.canvas_url || null);

      const diagnostics = getSessionDiagnostics(session);
      const displayError = toDisplayError(session);
      const errorCode = String(session.error_code || "").toUpperCase();

      if (
        session.status === "failed" &&
        AUTO_RESTART_FAILURE_CODES.has(errorCode)
      ) {
        const failureKey = `${session.id}:${errorCode}`;
        if (autoRestartFailureKeyRef.current !== failureKey) {
          autoRestartFailureKeyRef.current = failureKey;
          if (autoRestartAttemptsRef.current < AUTO_RESTART_MAX_ATTEMPTS) {
            autoRestartAttemptsRef.current += 1;
            setError(autoRestartMessageForCode(errorCode));
            void restartSession();
            return;
          }
          setError(
            "Preview не смог восстановиться автоматически. Нажмите «Перезапустить preview»."
          );
          return;
        }
      }

      if (session.status === "ready" && session.preview_url) {
        autoRestartAttemptsRef.current = 0;
        autoRestartFailureKeyRef.current = null;
      }

      if (
        session.status === "failed" &&
        AUTO_RESTART_FAILURE_CODES.has(errorCode) &&
        autoRestartFailureKeyRef.current === `${session.id}:${errorCode}`
      ) {
        return;
      }

      if (displayError) {
        setError(displayError);
        return;
      }

      if (session.status === "failed") {
        setError("Preview failed to start. Нажмите «Перезапустить preview».");
        return;
      }

      if (
        (session.status === "queued" || session.status === "running") &&
        diagnostics.elapsedMs > READY_TIMEOUT_MS
      ) {
        setError("Preview startup timed out. Нажмите «Перезапустить preview».");
        return;
      }

      if (
        session.status === "running" &&
        !session.preview_url &&
        diagnostics.runningWithoutUrlMs > RUNNING_WITHOUT_URL_TIMEOUT_MS
      ) {
        setError(
          "Runner запущен, но URL preview не выдан. Проверь PREVIEW_ROUTER_PUBLIC_URL и перезапусти preview."
        );
        return;
      }

      setError(null);
    } catch (err) {
      const statusCode =
        typeof err === "object" && err && "status" in err
          ? Number((err as { status?: number }).status || 0)
          : 0;
      if (statusCode === 404) {
        console.warn("[preview] session not found, restarting preview session");
        setSessionId(null);
        setStatus(null);
        setRuntimeState(null);
        setPreviewUrl(null);
        setCanvasUrl(null);
        startAttemptKeyRef.current = null;
        void startSession();
        return;
      }
      console.warn("[preview] status failed:", err);
    }
  }, [apiEnabled, restartSession, startSession]);

  const pushFiles = useCallback(
    async (files: Record<string, string | null>) => {
      const activeSessionId = sessionIdRef.current;
      if (!apiEnabled || !activeSessionId) return;
      if (status !== "running" && status !== "ready") return;

      try {
        await apiRequest(`/preview/sessions/${activeSessionId}/files`, {
          method: "POST",
          body: JSON.stringify({ files }),
        });
      } catch (err) {
        console.warn("[preview] sync failed:", err);
        const statusCode =
          typeof err === "object" && err && "status" in err
            ? Number((err as { status?: number }).status || 0)
            : 0;
        const code =
          typeof err === "object" && err && "code" in err
            ? String((err as { code?: string }).code || "")
            : "";
        if (statusCode === 409 && code === "dependency_not_allowed") {
          setError("Preview: используется неразрешенная зависимость. Проверь импорт в последних файлах.");
        }
      }
    },
    [apiEnabled, status]
  );

  useEffect(() => {
    if (!enabled || !apiEnabled || !projectId) return;
    const attemptKey = `${projectId}:${versionId || ""}`;
    if (startAttemptKeyRef.current === attemptKey) return;
    startAttemptKeyRef.current = attemptKey;
    void startSession();

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
      void stopSession(sessionIdRef.current);
    };
  }, [apiEnabled, enabled, projectId, versionId, startSession, stopSession]);

  useEffect(() => {
    if (enabled && projectId) return;
    startAttemptKeyRef.current = null;
    void stopSession();
  }, [enabled, projectId, stopSession]);

  useEffect(() => {
    if (!sessionId || !apiEnabled) return;
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
    }
    void refreshStatus();
    pollRef.current = window.setInterval(() => {
      void refreshStatus();
    }, 3000);
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [apiEnabled, refreshStatus, sessionId]);

  return useMemo(
    () => ({
      sessionId,
      status,
      runtimeState,
      previewUrl,
      canvasUrl,
      error,
      isStarting,
      canRestart: Boolean(apiEnabled && enabled && projectId),
      startSession,
      stopSession,
      restartSession,
      pushFiles,
    }),
    [
      apiEnabled,
      enabled,
      error,
      isStarting,
      previewUrl,
      canvasUrl,
      projectId,
      pushFiles,
      restartSession,
      sessionId,
      startSession,
      status,
      stopSession,
    ]
  );
}
