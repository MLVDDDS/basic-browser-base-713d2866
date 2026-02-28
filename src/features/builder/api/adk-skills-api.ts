import { apiRequest } from "@/lib/api-client";

export interface AdkSkillReadiness {
  pass: boolean;
  status: "ready" | "degraded" | "blocked" | "disabled" | string;
  reasons: Array<Record<string, unknown>>;
}

export interface AdkSkillDefinition {
  id: string;
  version: string;
  title: string;
  description: string;
  capabilityId: string;
  tags: string[];
  deterministicActions: Array<Record<string, unknown>>;
  readiness: AdkSkillReadiness;
}

export interface AdkSkillsSnapshot {
  ok: boolean;
  tenantId: string;
  mode: string;
  featureSet: Record<string, unknown>;
  summary: Record<string, unknown>;
  skills: AdkSkillDefinition[];
}

export interface AdkSkillsListOptions {
  mode?: string;
  projectId?: string;
  tenantId?: string;
  status?: string;
}

export interface AdkSkillExecutePayload {
  actionId: string;
  payload?: Record<string, unknown>;
  dryRun?: boolean;
  mode?: string;
  projectId?: string;
  tenantId?: string;
}

export async function fetchAdkSkills(options?: AdkSkillsListOptions) {
  const query = new URLSearchParams();
  if (options?.mode) query.set("mode", options.mode);
  if (options?.projectId) query.set("projectId", options.projectId);
  if (options?.tenantId) query.set("tenantId", options.tenantId);
  if (options?.status) query.set("status", options.status);

  return apiRequest<AdkSkillsSnapshot>(`/adk/skills?${query.toString()}`, {
    method: "GET",
    headers: options?.tenantId ? { "X-Tenant-Id": options.tenantId } : undefined,
  });
}

export async function executeAdkSkillAction(skillId: string, payload: AdkSkillExecutePayload) {
  const normalizedSkillId = String(skillId || "").trim();
  if (!normalizedSkillId) throw new Error("skillId is required");
  if (!payload?.actionId) throw new Error("actionId is required");

  const query = new URLSearchParams();
  if (payload.mode) query.set("mode", payload.mode);
  if (payload.projectId) query.set("projectId", payload.projectId);
  if (payload.tenantId) query.set("tenantId", payload.tenantId);

  return apiRequest<Record<string, unknown>>(
    `/adk/skills/${encodeURIComponent(normalizedSkillId)}/execute?${query.toString()}`,
    {
      method: "POST",
      headers: payload.tenantId ? { "X-Tenant-Id": payload.tenantId } : undefined,
      body: JSON.stringify({
        actionId: payload.actionId,
        payload: payload.payload || {},
        dryRun: payload.dryRun !== false,
        mode: payload.mode,
        projectId: payload.projectId,
        tenantId: payload.tenantId,
      }),
    }
  );
}
