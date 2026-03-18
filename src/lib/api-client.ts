import {
  apiRefresh,
  clearApiTokens,
  ensureFreshApiAccessToken,
  getApiAuthHeaders,
  getApiBaseUrl,
} from "@/lib/api-auth";

export type ApiError = Error & { status?: number; code?: string };

export function isUnauthorizedApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    Number((error as { status?: number }).status || 0) === 401
  );
}

const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isTransientFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    error.name === "TypeError" ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("connection closed")
  );
}

export function isApiConfigured(): boolean {
  return Boolean(getApiBaseUrl());
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    const err = new Error("API is not configured") as ApiError;
    err.status = 0;
    throw err;
  }

  const method = String(options.method || "GET").toUpperCase();
  const canRetryIdempotent = IDEMPOTENT_METHODS.has(method);

  const sendRequest = async (): Promise<Response> => {
    await ensureFreshApiAccessToken();
    const freshHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...getApiAuthHeaders(),
      ...(options.headers ? Object.fromEntries(new Headers(options.headers)) : {}),
    };
    return fetch(`${baseUrl}${path}`, {
      ...options,
      cache: "no-store",
      headers: freshHeaders,
    });
  };

  const sendWithTransientRetry = async (): Promise<Response> => {
    try {
      return await sendRequest();
    } catch (err) {
      if (!canRetryIdempotent || !isTransientFetchError(err)) {
        throw err;
      }
      await delay(250);
      return sendRequest();
    }
  };

  let response = await sendWithTransientRetry();

  if (canRetryIdempotent && response.status >= 500) {
    await delay(200);
    response = await sendWithTransientRetry();
  }

  // Retry once after token refresh on 401.
  if (response.status === 401) {
    const refreshResult = await apiRefresh();
    if (refreshResult.error) {
      clearApiTokens();
    } else {
      const refreshedHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...getApiAuthHeaders(),
        ...(options.headers ? Object.fromEntries(new Headers(options.headers)) : {}),
      };
      try {
        response = await fetch(`${baseUrl}${path}`, {
          ...options,
          cache: "no-store",
          headers: refreshedHeaders,
        });
      } catch (err) {
        if (!canRetryIdempotent || !isTransientFetchError(err)) throw err;
        await delay(250);
        response = await fetch(`${baseUrl}${path}`, {
          ...options,
          cache: "no-store",
          headers: refreshedHeaders,
        });
      }
    }
  }

  const data =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      clearApiTokens();
    }
    const message =
      typeof data?.error === "string" ? data.error : `HTTP ${response.status}`;
    const err = new Error(message) as ApiError;
    err.status = response.status;
    err.code = typeof data?.error === "string" ? data.error : undefined;
    throw err;
  }

  return data as T;
}

export async function apiStreamRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    const err = new Error("API is not configured") as ApiError;
    err.status = 0;
    throw err;
  }

  const sendRequest = async (): Promise<Response> => {
    await ensureFreshApiAccessToken();
    const freshHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...getApiAuthHeaders(),
      ...(options.headers ? Object.fromEntries(new Headers(options.headers)) : {}),
    };
    return fetch(`${baseUrl}${path}`, {
      ...options,
      cache: "no-store",
      headers: freshHeaders,
    });
  };

  let response = await sendRequest();
  if (response.status === 401) {
    const refreshResult = await apiRefresh();
    if (refreshResult.error) {
      clearApiTokens();
      return response;
    }
    response = await sendRequest();
  }

  return response;
}
