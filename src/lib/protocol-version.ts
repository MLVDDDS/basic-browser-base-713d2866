export const EXPECTED_SSE_PROTOCOL_VERSION = "sse-v1";

export function warnOnProtocolVersionMismatch(
  endpoint: string,
  response: Response
): string | null {
  const actual = String(response.headers.get("x-protocol-version") || "").trim();
  if (!actual) {
    console.warn(
      `[protocol] ${endpoint}: missing x-protocol-version header (expected ${EXPECTED_SSE_PROTOCOL_VERSION})`
    );
    return null;
  }
  if (actual !== EXPECTED_SSE_PROTOCOL_VERSION) {
    console.warn(
      `[protocol] ${endpoint}: protocol mismatch server=${actual}, client_expected=${EXPECTED_SSE_PROTOCOL_VERSION}`
    );
  }
  return actual;
}

