const ACCESS_TOKEN_KEY = "lyubakod_api_access_token";
const REFRESH_TOKEN_KEY = "lyubakod_api_refresh_token";

export interface ApiAuthUser {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  provider?: string | null;
  is_admin?: boolean;
}

type ApiAuthResult = {
  error: Error | null;
  user: ApiAuthUser | null;
};

export type ApiAuthErrorMeta = {
  status: number;
  code: string;
  policy: string;
  details: unknown;
};

export class ApiAuthError extends Error {
  readonly status: number;
  readonly code: string;
  readonly policy: string;
  readonly details: unknown;

  constructor(message: string, meta: ApiAuthErrorMeta) {
    super(message);
    this.name = "ApiAuthError";
    this.status = meta.status;
    this.code = meta.code;
    this.policy = meta.policy;
    this.details = meta.details;
    Object.setPrototypeOf(this, ApiAuthError.prototype);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function buildApiAuthError(payload: unknown, status: number): ApiAuthError {
  const source = asRecord(payload);
  const code = toText(source.error) || "auth_request_failed";
  const policy = toText(source.policy);
  const message = toText(source.message) || code || `HTTP ${status}`;
  const details = Object.prototype.hasOwnProperty.call(source, "details")
    ? source.details
    : null;
  return new ApiAuthError(message, { status, code, policy, details });
}

export function getApiAuthErrorMeta(error: unknown): ApiAuthErrorMeta | null {
  if (!(error instanceof ApiAuthError)) return null;
  return {
    status: error.status,
    code: error.code,
    policy: error.policy,
    details: error.details,
  };
}

let refreshInFlight: Promise<ApiAuthResult> | null = null;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const normalized = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4;
    const padded =
      padding === 0 ? normalized : normalized + "=".repeat(4 - padding);
    const raw = atob(padded);
    const payload = JSON.parse(raw);
    if (!payload || typeof payload !== "object") return null;
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getAccessTokenExpiresAtMs(accessToken: string): number {
  const payload = decodeJwtPayload(accessToken);
  const exp = Number(payload?.exp || 0);
  if (!Number.isFinite(exp) || exp <= 0) return 0;
  return exp * 1000;
}

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL || "";
  return raw.replace(/\/+$/, "");
}

export function isApiAuthEnabled(): boolean {
  return Boolean(getApiBaseUrl());
}

export function getApiAccessToken(): string {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

export function getApiRefreshToken(): string {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(REFRESH_TOKEN_KEY) || "";
}

export function setApiTokens(tokens: {
  accessToken: string;
  refreshToken?: string | null;
}) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearApiTokens() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getApiAuthHeaders(): Record<string, string> {
  const token = getApiAccessToken();
  return token ? { "X-Access-Token": token } : {};
}

function normalizeApiUser(raw: unknown): ApiAuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const id = String(source.id || source.userId || source.sub || "").trim();
  if (!id) return null;
  return {
    id,
    email:
      typeof source.email === "string"
        ? source.email
        : typeof source.user_email === "string"
          ? source.user_email
          : null,
    full_name:
      typeof source.full_name === "string"
        ? source.full_name
        : typeof source.fullName === "string"
          ? source.fullName
          : null,
    avatar_url:
      typeof source.avatar_url === "string"
        ? source.avatar_url
        : typeof source.avatarUrl === "string"
          ? source.avatarUrl
          : null,
    provider:
      typeof source.provider === "string" ? source.provider : null,
    is_admin: Boolean(source.is_admin),
  };
}

async function requestApiAuth(
  path: string,
  payload: Record<string, unknown>
): Promise<ApiAuthResult> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { error: new Error("API auth is not configured"), user: null };
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: buildApiAuthError(data, response.status), user: null };
  }

  if (!data?.access_token) {
    return { error: new Error("Missing access token in API response"), user: null };
  }

  setApiTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
  });

  return { error: null, user: normalizeApiUser(data.user) };
}

export async function apiLogin(email: string, password: string) {
  return requestApiAuth("/auth/login", { email, password });
}

export async function apiSignup(
  email: string,
  password: string,
  fullName: string
) {
  return requestApiAuth("/auth/signup", {
    email,
    password,
    full_name: fullName,
  });
}

export async function apiGoogleLogin(idToken: string) {
  return requestApiAuth("/auth/google", {
    id_token: idToken,
  });
}

async function performApiRefresh(): Promise<ApiAuthResult> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { error: new Error("API auth is not configured"), user: null };
  }
  const refreshToken = getApiRefreshToken();
  if (!refreshToken) {
    return { error: new Error("Missing refresh token"), user: null };
  }

  const response = await fetch(`${baseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: buildApiAuthError(data, response.status), user: null };
  }

  if (!data?.access_token) {
    return { error: new Error("Missing access token in refresh response"), user: null };
  }

  setApiTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
  });

  return { error: null, user: normalizeApiUser(data.user) };
}

export async function apiRefresh(): Promise<ApiAuthResult> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = performApiRefresh()
    .catch((error) => ({
      error: error instanceof Error ? error : new Error(String(error)),
      user: null,
    }))
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

export async function ensureFreshApiAccessToken(
  skewMs: number = 60_000
): Promise<void> {
  const token = getApiAccessToken();
  if (!token) return;
  const expiresAt = getAccessTokenExpiresAtMs(token);
  if (!expiresAt) return;
  if (Date.now() + Math.max(5_000, skewMs) < expiresAt) return;

  const refreshed = await apiRefresh();
  if (refreshed.error) {
    clearApiTokens();
  }
}

export async function apiValidate(): Promise<ApiAuthResult> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { error: new Error("API auth is not configured"), user: null };
  }
  const accessToken = getApiAccessToken();
  if (!accessToken) {
    return { error: new Error("Missing access token"), user: null };
  }

  const response = await fetch(`${baseUrl}/auth/validate`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Access-Token": accessToken,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: buildApiAuthError(data, response.status), user: null };
  }

  return { error: null, user: normalizeApiUser(data.user) };
}

export async function restoreApiSession(): Promise<ApiAuthResult> {
  const accessToken = getApiAccessToken();
  if (!accessToken) {
    return { error: null, user: null };
  }

  const validateResult = await apiValidate();
  if (!validateResult.error && validateResult.user) {
    return validateResult;
  }

  const refreshResult = await apiRefresh();
  if (refreshResult.error) {
    clearApiTokens();
    return refreshResult;
  }

  return refreshResult;
}
