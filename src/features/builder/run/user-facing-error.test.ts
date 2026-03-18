import { describe, expect, it } from "vitest";
import { toUserFacingGenerationErrorContract } from "./user-facing-error";

describe("toUserFacingGenerationErrorContract", () => {
  it("maps model endpoint errors to safe user copy", () => {
    const result = toUserFacingGenerationErrorContract({
      rawMessage:
        "ADK agent error (executor): Invalid Endpoint name: projects/x/locations/europe-west3/publishers/google/models/gemini-2.5-flash-lite,gemini-2.5-flash",
      errorCode: "model_endpoint_invalid",
      stage: "model_routing",
      shortReason: "projects_x_publishers_google_models_gemini_1_5_flash_002",
    });
    expect(result.userMessage).toContain("недоступна выбранная AI-модель");
    expect(result.shortReason).toBe("internal_error");
    expect(result.displayMessage).toContain("Код: model_endpoint_invalid");
    expect(result.displayMessage).not.toContain("projects_x_publishers_google_models");
  });

  it("uses backend-required message for backend gate failures", () => {
    const result = toUserFacingGenerationErrorContract({
      errorCode: "backend_required_gate_failed",
      stage: "backend_migration",
      shortReason: "backend_migration_not_ready",
    });
    expect(result.userMessage).toContain("нужен backend");
    expect(result.displayMessage).toContain("Код: backend_required_gate_failed");
  });

  it("keeps known short reasons and blocks unknown payload fragments", () => {
    const known = toUserFacingGenerationErrorContract({
      errorCode: "quality_gate_failed",
      shortReason: "quality_gate_failed",
    });
    expect(known.shortReason).toBe("quality_gate_failed");

    const unknown = toUserFacingGenerationErrorContract({
      errorCode: "pipeline_error",
      shortReason: "x_api_key_leaked_12345",
    });
    expect(unknown.shortReason).toBe("internal_error");
    expect(unknown.displayMessage).not.toContain("x_api_key_leaked_12345");
  });

  it("maps empty-operations fallback to explicit safe reason", () => {
    const result = toUserFacingGenerationErrorContract({
      rawMessage: "fallback_generation_blocked:empty_operations",
      errorCode: "fallback_generation_blocked",
      stage: "quality_gate",
      shortReason: "empty_operations",
    });
    expect(result.shortReason).toBe("empty_operations");
    expect(result.userMessage).toContain("пустой план изменений");
    expect(result.displayMessage).toContain("Причина: empty_operations");
  });

  it("preserves attempt-duration failures instead of collapsing them to internal_error", () => {
    const result = toUserFacingGenerationErrorContract({
      rawMessage: "fallback_generation_blocked:attempt_duration_exceeded",
      errorCode: "fallback_generation_blocked",
      stage: "execute",
      shortReason: "attempt_duration_exceeded",
    });
    expect(result.shortReason).toBe("attempt_duration_exceeded");
    expect(result.userMessage).toContain("лимит времени");
    expect(result.displayMessage).toContain("Причина: attempt_duration_exceeded");
  });
});
