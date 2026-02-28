import { apiRequest } from "@/lib/api-client";

export interface EdgeFunctionItem {
  id: string;
  functionName: string;
  functionSlug: string;
  version: number;
  deployStatus: string;
  deployMessage?: string | null;
  lastDeployJobId?: string | null;
  deployedAt?: string | null;
  updatedAt?: string | null;
  runtimePayload?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export interface EdgeInvocationItem {
  id: string;
  invokeMode: "dry_run" | "user" | "service";
  method: string;
  pathSuffix?: string;
  responseStatus?: number | null;
  responseOk?: boolean | null;
  errorMessage?: string | null;
  durationMs?: number | null;
  createdAt?: string;
}

export interface ProjectBackendInfo {
  projectId: string;
  projectSlug?: string | null;
  tenantId?: string | null;
  supabaseUrl?: string | null;
  keyMode?: string | null;
  publishableKey?: string | null;
  supabaseProjectRef?: string | null;
  provisionState?: string | null;
  provisionError?: string | null;
}

export interface BackendMigrationSummary {
  migrationId: string;
  status: string;
  applyMode?: string | null;
  applyReference?: string | null;
  errorMessage?: string | null;
  compiledAt?: string | null;
  appliedAt?: string | null;
  rolledBackAt?: string | null;
  verify?: Record<string, unknown>;
  statementCounts?: {
    apply?: number;
    rollback?: number;
  };
}

export interface BackendMigrationItem {
  id: string;
  status: string;
  planHash?: string | null;
  applyMode?: string | null;
  errorMessage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  summary?: BackendMigrationSummary;
}

export interface BackendTableRuntime {
  exists?: boolean;
  rlsEnabled?: boolean;
  tenantColumnExists?: boolean;
  policyCount?: number;
  policyNames?: string[];
  columnCount?: number;
  source?: string;
}

export interface BackendTableItem {
  name: string;
  tenantColumn: string;
  policies: string[];
  columns: string[];
  lastMigrationId?: string | null;
  lastMigrationStatus?: string | null;
  runtime?: BackendTableRuntime | null;
}

export interface AutomationJobLogItem {
  id: string;
  level?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
}

export interface AutomationJobStatusItem {
  id: string;
  status?: string | null;
  errorMessage?: string | null;
  lastErrorMessage?: string | null;
  attempts?: number | null;
  maxAttempts?: number | null;
  updatedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export async function fetchProjectEdgeFunctions(projectId: string) {
  return apiRequest<{ functions: EdgeFunctionItem[] }>(`/projects/${projectId}/edge-functions`);
}

export async function createProjectEdgeFunction(projectId: string, payload: { functionName: string }) {
  return apiRequest<{ edgeFunction?: EdgeFunctionItem }>(`/projects/${projectId}/edge-functions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function planProjectEdgeFunction(
  projectId: string,
  payload: { intent: string; functionName?: string; createDraft: true }
) {
  return apiRequest<{ edgeFunction?: EdgeFunctionItem }>(`/projects/${projectId}/edge-functions/plan`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function enqueueEdgeFunctionDeploy(
  projectId: string,
  edgeFunctionId: string,
  payload: { dryRun: boolean; idempotencyKey: string }
) {
  return apiRequest<{ job?: AutomationJobStatusItem }>(
    `/projects/${projectId}/edge-functions/${edgeFunctionId}/deploy`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function rollbackProjectEdgeFunction(projectId: string, edgeFunctionId: string) {
  return apiRequest<{ ok?: boolean }>(`/projects/${projectId}/edge-functions/${edgeFunctionId}/rollback`, {
    method: "POST",
  });
}

export async function invokeProjectEdgeFunction(
  projectId: string,
  edgeFunctionId: string,
  payload: {
    dryRun: boolean;
    method: "POST" | "GET";
    path: string;
    payload: unknown;
    authMode: "service" | "user";
    idempotencyKey: string;
  }
) {
  return apiRequest<{ ok: boolean; status?: number }>(
    `/projects/${projectId}/edge-functions/${edgeFunctionId}/invoke`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function fetchEdgeFunctionInvocations(projectId: string, edgeFunctionId: string) {
  return apiRequest<{ invocations: EdgeInvocationItem[] }>(
    `/projects/${projectId}/edge-functions/${edgeFunctionId}/invocations?limit=25`
  );
}

export async function fetchAutomationJob(jobId: string) {
  return apiRequest<{ job?: AutomationJobStatusItem; logs?: AutomationJobLogItem[] }>(
    `/automation/jobs/${jobId}`
  );
}

export async function fetchProjectBackendStatus(projectId: string) {
  return apiRequest<{ backend?: ProjectBackendInfo | null }>(`/projects/${projectId}/backend/status`);
}

export async function fetchProjectBackendMigrations(projectId: string) {
  return apiRequest<{ migrations: BackendMigrationItem[] }>(`/projects/${projectId}/backend/migrations`);
}

export async function compileProjectBackendMigration(
  projectId: string,
  payload: { schemaPlan: unknown; idempotencyKey: string }
) {
  return apiRequest(`/projects/${projectId}/backend/migrations/compile`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function applyProjectBackendMigration(
  projectId: string,
  migrationId: string,
  payload: { strict: boolean; idempotencyKey: string }
) {
  return apiRequest(`/projects/${projectId}/backend/migrations/${migrationId}/apply`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function rollbackProjectBackendMigration(
  projectId: string,
  migrationId: string,
  payload: { strict: boolean; idempotencyKey: string }
) {
  return apiRequest(`/projects/${projectId}/backend/migrations/${migrationId}/rollback`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchProjectBackendTables(projectId: string) {
  return apiRequest<{
    source?: string;
    introspectionError?: string | null;
    tables?: BackendTableItem[];
  }>(`/projects/${projectId}/backend/tables`);
}
