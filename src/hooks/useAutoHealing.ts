import { useEffect, useCallback, useRef, useState } from "react";
import { useAutoDebug } from "./useAutoDebug";
import { selectModel } from "@/lib/model-router";


interface ErrorEvent {
  message: string;
  stack?: string;
  timestamp: number;
  source?: string;
}

interface HealingLog {
  id: string;
  error: ErrorEvent;
  status: "pending" | "processing" | "success" | "failed";
  result?: {
    fixes?: Array<{ file: string; patch: string }>;
    message?: string;
  };
  processedAt?: number;
}

interface AutoHealingConfig {
  enabled: boolean;
  debounceMs?: number;
  maxErrorsPerMinute?: number;
  severity?: "all" | "critical" | "high";
}

export function useAutoHealing(config: AutoHealingConfig = { enabled: false }) {
  const { autoDebug, isLoading } = useAutoDebug();
  const errorQueue = useRef<ErrorEvent[]>([]);
  const processingRef = useRef(false);
  const [healingLogs, setHealingLogs] = useState<HealingLog[]>([]);
  const [stats, setStats] = useState({ processed: 0, success: 0, failed: 0 });

  const addLog = useCallback((error: ErrorEvent, status: HealingLog["status"], result?: HealingLog["result"]) => {
    const log: HealingLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      error,
      status,
      result,
      processedAt: status !== "pending" ? Date.now() : undefined,
    };
    
    setHealingLogs(prev => [log, ...prev].slice(0, 50)); // Keep last 50 logs
    return log.id;
  }, []);

  const updateLog = useCallback((id: string, updates: Partial<HealingLog>) => {
    setHealingLogs(prev => 
      prev.map(log => log.id === id ? { ...log, ...updates, processedAt: Date.now() } : log)
    );
  }, []);

  const processErrorQueue = useCallback(async () => {
    if (processingRef.current || errorQueue.current.length === 0) return;

    processingRef.current = true;
    const error = errorQueue.current.shift();

    if (error) {
      console.log("🔧 Auto-healing: Processing error", error.message);
      
      const logId = addLog(error, "processing");

      const modelToUse = selectModel(`${error.message}\n${error.stack || ""}`);

      const result = await autoDebug(
        `${error.message}\n\nStack: ${error.stack || "N/A"}`,
        `Source: ${error.source || "Unknown"}\nTimestamp: ${new Date(error.timestamp).toISOString()}`,
        modelToUse
      );


      if (result?.finalStatus === "success") {
        console.log("✅ Auto-healing: Fixed!", result.fixes);
        updateLog(logId, { 
          status: "success", 
          result: { fixes: result.fixes, message: "Successfully fixed" } 
        });
        setStats(prev => ({ ...prev, processed: prev.processed + 1, success: prev.success + 1 }));
      } else {
        console.warn("⚠️ Auto-healing: Could not auto-fix", result);
        updateLog(logId, { 
          status: "failed", 
          result: { message: result?.finalStatus || "Unknown error" } 
        });
        setStats(prev => ({ ...prev, processed: prev.processed + 1, failed: prev.failed + 1 }));
      }
    }

    processingRef.current = false;

    // Process next error if any
    if (errorQueue.current.length > 0) {
      setTimeout(processErrorQueue, config.debounceMs || 1000);
    }
  }, [autoDebug, config.debounceMs, addLog, updateLog]);

  const handleError = useCallback((error: ErrorEvent) => {
    // Rate limiting
    const now = Date.now();
    const recentErrors = errorQueue.current.filter(
      e => now - e.timestamp < 60000
    );

    if (recentErrors.length >= (config.maxErrorsPerMinute || 10)) {
      console.warn("🛑 Auto-healing: Rate limit reached");
      return;
    }

    errorQueue.current.push(error);
    addLog(error, "pending");
    processErrorQueue();
  }, [config.maxErrorsPerMinute, processErrorQueue, addLog]);

  useEffect(() => {
    if (!config.enabled) return;

    // Global error handler
    const errorHandler = (event: globalThis.ErrorEvent) => {
      handleError({
        message: event.message || "Unknown error",
        stack: event.error?.stack,
        timestamp: Date.now(),
        source: event.filename,
      });
    };

    // Unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      handleError({
        message: String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now(),
        source: "Promise rejection",
      });
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);

    console.log("🤖 Auto-healing: Enabled and monitoring");

    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
    };
  }, [config.enabled, handleError]);

  const clearLogs = useCallback(() => {
    setHealingLogs([]);
    setStats({ processed: 0, success: 0, failed: 0 });
  }, []);

  return {
    isProcessing: isLoading,
    queueLength: errorQueue.current.length,
    triggerDebug: handleError,
    healingLogs,
    stats,
    clearLogs,
  };
}
