import { useState, useCallback, useRef } from "react";
import { isApiConfigured } from "@/lib/api-client";
import { runSitePipelineStream } from "@/features/builder/api/site-pipeline-api";

export type PipelineStage = 
  | "idle"
  | "analyzing" 
  | "generating" 
  | "validating" 
  | "fixing" 
  | "complete" 
  | "failed";

export interface PipelineProgress {
  stage: PipelineStage;
  message: string;
  attempt?: number;
  model?: string;
  qualityScore?: number;
  issues?: string[];
  files?: string[];
  thinkingTime?: number;
}

export interface PipelineResult {
  success: boolean;
  html: string;
  qualityScore: number;
  issues: string[];
  model: string;
  attempts: number;
  usage: { input_tokens: number; output_tokens: number };
}

interface AnalysisEvent {
  type: "analysis";
  complexity: string;
  model: string;
  sections: number;
}

interface StageEvent {
  type: "stage";
  stage: PipelineStage;
  message: string;
  attempt?: number;
  model?: string;
}

interface QualityEvent {
  type: "quality";
  score: number;
  passed: boolean;
  issues: string[];
  afterFix?: boolean;
}

interface CompleteEvent {
  type: "complete";
  success: boolean;
  html: string;
  qualityScore: number;
  issues: string[];
  model: string;
  attempts: number;
  usage: { input_tokens: number; output_tokens: number };
}

interface ErrorEvent {
  type: "error";
  message: string;
}

type PipelineEvent = AnalysisEvent | StageEvent | QualityEvent | CompleteEvent | ErrorEvent;

export function useSitePipeline() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<PipelineProgress>({
    stage: "idle",
    message: "",
  });
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  const generate = useCallback(async (
    prompt: string,
    context?: string
  ): Promise<PipelineResult | null> => {
    setIsRunning(true);
    setError(null);
    setResult(null);
    setFiles([]);
    startTimeRef.current = Date.now();
    setProgress({ stage: "analyzing", message: "Запускаю pipeline...", thinkingTime: 0 });

    abortRef.current = new AbortController();

    try {
      if (!isApiConfigured()) {
        throw new Error("API не настроен");
      }
      let finalResult: PipelineResult | null = null;

      await runSitePipelineStream(
        { prompt, context, stream: true },
        (event) => {
          const parsed = event as unknown as PipelineEvent;

          switch (parsed.type) {
            case "stage":
              setProgress((prev) => ({
                ...prev,
                stage: parsed.stage,
                message: parsed.message,
                attempt: parsed.attempt,
                model: parsed.model,
                thinkingTime: Date.now() - startTimeRef.current,
              }));
              if (parsed.stage === "generating") {
                setFiles((prev) => [...prev, "index.html"]);
              } else if (parsed.stage === "validating") {
                setFiles((prev) => [...prev, "styles.css"]);
              } else if (parsed.stage === "fixing") {
                setFiles((prev) => [...prev, "fixes.patch"]);
              }
              break;

            case "analysis":
              setProgress((prev) => ({
                ...prev,
                model: parsed.model,
                message: `Анализ: ${parsed.complexity}, ${parsed.sections} секций`,
              }));
              break;

            case "quality":
              setProgress((prev) => ({
                ...prev,
                qualityScore: parsed.score,
                issues: parsed.issues,
                message: parsed.passed
                  ? `Качество: ${parsed.score}% ✓`
                  : `Качество: ${parsed.score}% — исправляю...`,
              }));
              break;

            case "complete":
              finalResult = {
                success: parsed.success,
                html: parsed.html,
                qualityScore: parsed.qualityScore,
                issues: parsed.issues,
                model: parsed.model,
                attempts: parsed.attempts,
                usage: parsed.usage,
              };
              setResult(finalResult);
              setProgress({
                stage: parsed.success ? "complete" : "failed",
                message: parsed.success
                  ? `Готово! Качество: ${parsed.qualityScore}%`
                  : `Не удалось достичь качества 80%`,
                qualityScore: parsed.qualityScore,
                model: parsed.model,
              });
              break;

            case "error":
              setError(parsed.message);
              setProgress({ stage: "failed", message: parsed.message });
              break;
            default:
              break;
          }
        },
        abortRef.current.signal
      );

      setIsRunning(false);
      return finalResult;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setProgress({ stage: "idle", message: "Отменено" });
        setIsRunning(false);
        return null;
      }

      const message = err instanceof Error ? err.message : "Pipeline error";
      setError(message);
      setProgress({ stage: "failed", message });
      setIsRunning(false);
      return null;
    }
  }, []);

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setIsRunning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setProgress({ stage: "idle", message: "" });
    setResult(null);
    setError(null);
    setFiles([]);
  }, []);

  return {
    generate,
    stop,
    reset,
    isRunning,
    progress,
    result,
    error,
    files,
  };
}
