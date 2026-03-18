function compactMessage(value: string): string {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

export interface GenerationErrorContract {
  userMessage: string;
  errorCode: string | null;
  stage: string | null;
  shortReason: string | null;
  displayMessage: string;
}

function normalizeToken(value: unknown): string | null {
  const token = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return token || null;
}

const SAFE_SHORT_REASONS = new Set([
  "quota_or_rate_limit",
  "invalid_model_endpoint",
  "runtime_build_failed",
  "backend_migration_not_ready",
  "backend_provision_not_ready",
  "visual_rubric_failed",
  "acceptance_gate_failed",
  "runtime_budget_exceeded",
  "attempt_duration_exceeded",
  "fallback_blocked",
  "quality_gate_failed",
  "empty_operations",
  "invalid_json",
  "json_output_truncated",
  "malformed_tool_call",
  "model_runtime_tool_call_error",
  "phase_quality_gate_failed",
  "model_not_available",
  "stream_stalled",
  "validation_failed",
  "auto_verify_failed",
  "auto_verify_install_failed",
  "auto_verify_build_failed",
  "auto_verify_preview_port_failed",
  "auto_verify_preview_start_failed",
  "auto_verify_timeout",
  "auto_verify_launch_failed",
  "auto_verify_missing_selectors",
  "auto_verify_page_errors",
  "auto_verify_console_errors",
  "auto_verify_navigation_failed",
  "auto_verify_upstream_5xx",
  "resource_exhausted",
  "retry_exhausted",
  "tool_only_contract_violation",
  "access_denied",
  "timeout",
  "runtime_code_error",
  "visual_responsive_layout",
  "mandatory_polish_pass",
  "internal_error",
  "llm_timeout",
  "llm_call_limit_exceeded",
  "model_schema_constraint_overflow",
]);

function normalizeSafeShortReason(value: unknown): string | null {
  const token = normalizeToken(value);
  if (!token) return null;
  return SAFE_SHORT_REASONS.has(token) ? token : "internal_error";
}

function buildDisplayMessage(contract: GenerationErrorContract): string {
  if (!contract.errorCode) return contract.userMessage;
  const parts = [`Код: ${contract.errorCode}`];
  if (contract.stage) parts.push(`Этап: ${contract.stage}`);
  if (contract.shortReason) parts.push(`Причина: ${contract.shortReason}`);
  return `${contract.userMessage}\n${parts.join(" · ")}`;
}

export function toUserFacingGenerationErrorContract(input: {
  rawMessage?: string;
  errorCode?: unknown;
  stage?: unknown;
  shortReason?: unknown;
}): GenerationErrorContract {
  const rawMessage = compactMessage(input.rawMessage || "");
  const message = rawMessage.toLowerCase();
  const errorCode = normalizeToken(input.errorCode);
  const stage = normalizeToken(input.stage);
  const shortReason = normalizeSafeShortReason(input.shortReason);
  let userMessage = "Не удалось завершить генерацию. Повторите попытку.";

  if (!message && !errorCode) {
    return {
      userMessage,
      errorCode,
      stage,
      shortReason,
      displayMessage: userMessage,
    };
  }

  if (
    errorCode === "runtime_build_gate_failed" ||
    message.includes("runtime build gate failed") ||
    message.includes("build_failed")
  ) {
    userMessage = "Проект не прошел проверку сборки. Запрос принят, но результат требует исправления.";
  } else if (
    errorCode === "runtime_auto_verify_gate_failed" ||
    (stage === "validate" &&
      shortReason?.startsWith("auto_verify_")) ||
    message.includes("runtime auto-verify gate failed")
  ) {
    userMessage =
      "Проект собрался, но не прошел runtime-проверку в браузере. Результат остановлен до публикации.";
  } else if (
    errorCode === "validation_failed" ||
    stage === "validate" ||
    message.includes("validation failed")
  ) {
    userMessage =
      "Генерация дошла до проверки структуры, но код не прошел валидацию. Результат остановлен до публикации.";
  } else if (
    errorCode === "model_endpoint_invalid" ||
    errorCode === "model_not_available" ||
    stage === "model_routing" ||
    message.includes("invalid endpoint name") ||
    message.includes("/publishers/google/models/") ||
    message.includes("model not found") ||
    message.includes("model_not_available")
  ) {
    userMessage = "Сейчас недоступна выбранная AI-модель. Переключитесь на другой профиль модели и повторите запуск.";
  } else if (
    errorCode === "backend_provision_failed" ||
    errorCode === "backend_migration_apply_failed" ||
    errorCode === "backend_required_gate_failed"
  ) {
    userMessage = "Для этого запроса нужен backend, но его не удалось подготовить автоматически.";
  } else if (
    errorCode === "fallback_generation_blocked" ||
    errorCode === "visual_rubric_gate_failed" ||
    errorCode === "quality_gate_failed"
  ) {
    if (shortReason === "empty_operations") {
      userMessage = "Модель вернула пустой план изменений. Повторите запуск, уточнив структуру и секции страницы.";
    } else if (
      shortReason === "visual_responsive_layout" ||
      shortReason === "mandatory_polish_pass"
    ) {
      userMessage =
        "Сайт собрался, но не прошел проверку адаптивного layout. Генерация остановлена до исправления структуры экрана.";
    } else if (
      shortReason === "json_output_truncated" ||
      shortReason === "invalid_json"
    ) {
      userMessage =
        "Модель не уложилась в формат ответа для этого запуска. Повторите генерацию, система попробует более устойчивый маршрут.";
    } else if (
      shortReason === "malformed_tool_call" ||
      shortReason === "model_runtime_tool_call_error" ||
      shortReason === "tool_only_contract_violation"
    ) {
      userMessage = "Генерация сорвалась из-за ошибки инструментов. Повторите запуск, система автоматически попробует другой маршрут.";
    } else if (
      shortReason === "attempt_duration_exceeded" ||
      shortReason === "stream_stalled" ||
      shortReason === "resource_exhausted" ||
      shortReason === "llm_call_limit_exceeded" ||
      shortReason === "retry_exhausted"
    ) {
      userMessage = "Генерация уперлась в лимит времени или перегрузку модели и была остановлена до fallback-сценаpия.";
    } else if (shortReason === "model_schema_constraint_overflow") {
      userMessage =
        "Модель не уложилась в формат ответа для этого запуска. Повторите генерацию, система переключит маршрут.";
    } else if (
      shortReason === "phase_quality_gate_failed" ||
      shortReason === "quality_gate_failed"
    ) {
      userMessage = "Результат не прошел внутренние проверки качества. Перезапустите генерацию с уточненным запросом.";
    } else {
      userMessage = "Генерация остановлена quality-gate. Повторите запуск или уточните требования к дизайну.";
    }
  } else if (
    errorCode === "llm_timeout" ||
    shortReason === "timeout" ||
    message.includes("request_aborted_by_timeout") ||
    message.includes("gemini timeout") ||
    message.includes("operation was aborted")
  ) {
    userMessage = "AI-модель не успела ответить в лимит времени для этого шага. Система остановила генерацию до fallback-сценария.";
  } else if (
    errorCode === "runtime_budget_exceeded" ||
    message.includes("runtime budget exceeded")
  ) {
    userMessage = "Генерация заняла слишком много времени и была остановлена по лимиту.";
  } else if (
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("permission denied")
  ) {
    userMessage = "Недостаточно прав доступа для выполнения операции.";
  } else if (
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("429")
  ) {
    userMessage = "Превышен лимит запросов к AI. Повторите попытку через минуту.";
  }

  const contract: GenerationErrorContract = {
    userMessage,
    errorCode,
    stage,
    shortReason,
    displayMessage: userMessage,
  };
  contract.displayMessage = buildDisplayMessage(contract);
  return contract;
}

export function toUserFacingGenerationError(rawMessage: string): string {
  return toUserFacingGenerationErrorContract({ rawMessage }).userMessage;
}
