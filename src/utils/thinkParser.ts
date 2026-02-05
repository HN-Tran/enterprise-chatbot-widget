/**
 * Strip <think>...</think> blocks from content.
 * Used for chat history sent to backend and feedback payloads.
 */
export function stripThinkBlocks(content: string): string {
  return content.replace(/^<think>[\s\S]*?<\/think>\s*/, '');
}

/**
 * Parse content into thinking and response parts.
 * Returns { thinking, response } where thinking may be empty.
 * Used for session restore (stored content wraps thinking in <think> tags).
 */
export function parseThinkBlocks(content: string): { thinking: string; response: string } {
  const match = content.match(/^<think>([\s\S]*?)<\/think>\s*([\s\S]*)$/);
  if (match) {
    return { thinking: match[1].trim(), response: match[2] };
  }
  return { thinking: '', response: content };
}
