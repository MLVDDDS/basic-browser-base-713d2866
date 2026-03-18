export type SseJsonEventHandler = (event: Record<string, unknown>) => void;

export async function consumeSseJsonStream(
  response: Response,
  onEvent: SseJsonEventHandler
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
      try {
        onEvent(JSON.parse(line.slice(6)) as Record<string, unknown>);
      } catch {
        // Ignore malformed chunks from partial stream frames.
      }
    }
  }
}
