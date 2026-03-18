import { apiRequest } from "@/lib/api-client";

export interface AdkContractsSnapshot {
  ok: boolean;
  tenantId: string;
  mode: string;
  featureSet: Record<string, unknown>;
  capabilityEvaluation: Record<string, unknown>;
  contracts: Record<string, unknown>;
}

export interface AdkContractsFetchOptions {
  mode?: string;
  projectId?: string;
  tenantId?: string;
}

export async function fetchAdkContracts(options?: AdkContractsFetchOptions) {
  const query = new URLSearchParams();
  if (options?.mode) query.set("mode", options.mode);
  if (options?.projectId) query.set("projectId", options.projectId);
  if (options?.tenantId) query.set("tenantId", options.tenantId);

  return apiRequest<AdkContractsSnapshot>(`/adk/contracts?${query.toString()}`, {
    method: "GET",
    headers: options?.tenantId ? { "X-Tenant-Id": options.tenantId } : undefined,
  });
}
