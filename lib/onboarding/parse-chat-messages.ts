import type { UIMessage } from "ai";

export function parseChatMessages(raw: unknown): UIMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw as UIMessage[];
}
