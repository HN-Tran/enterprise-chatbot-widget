export interface ThinkSegment {
  type: 'thinking' | 'content';
  text: string;
}

type ParserState = 'before' | 'thinking' | 'after';

const OPEN_TAG = '<think>';
const CLOSE_TAG = '</think>';

export class ThinkBlockParser {
  private state: ParserState = 'before';
  private buffer = '';

  feed(chunk: string): ThinkSegment[] {
    this.buffer += chunk;
    const segments: ThinkSegment[] = [];

    while (this.buffer.length > 0) {
      if (this.state === 'before') {
        const openIdx = this.buffer.indexOf(OPEN_TAG);
        if (openIdx === 0) {
          // Tag found at start — enter thinking state
          this.buffer = this.buffer.slice(OPEN_TAG.length);
          this.state = 'thinking';
          continue;
        } else if (openIdx > 0) {
          // Content before tag
          segments.push({ type: 'content', text: this.buffer.slice(0, openIdx) });
          this.buffer = this.buffer.slice(openIdx + OPEN_TAG.length);
          this.state = 'thinking';
          continue;
        }

        // No full tag found — check if buffer ends with a partial prefix of <think>
        if (this.couldBePartialTag(this.buffer, OPEN_TAG)) {
          // Keep buffered, wait for more data
          break;
        }

        // No tag possible — emit everything as content
        segments.push({ type: 'content', text: this.buffer });
        this.buffer = '';
        this.state = 'after'; // No think block, skip to content mode
        break;
      }

      if (this.state === 'thinking') {
        const closeIdx = this.buffer.indexOf(CLOSE_TAG);
        if (closeIdx >= 0) {
          // Found close tag
          if (closeIdx > 0) {
            segments.push({ type: 'thinking', text: this.buffer.slice(0, closeIdx) });
          }
          this.buffer = this.buffer.slice(closeIdx + CLOSE_TAG.length);
          this.state = 'after';
          continue;
        }

        // Check for partial close tag at end
        if (this.couldBePartialTag(this.buffer, CLOSE_TAG)) {
          // Find where the potential partial starts
          const safeEnd = this.findPartialTagStart(this.buffer, CLOSE_TAG);
          if (safeEnd > 0) {
            segments.push({ type: 'thinking', text: this.buffer.slice(0, safeEnd) });
            this.buffer = this.buffer.slice(safeEnd);
          }
          break;
        }

        // No close tag possible — emit all as thinking
        segments.push({ type: 'thinking', text: this.buffer });
        this.buffer = '';
        break;
      }

      if (this.state === 'after') {
        // Everything after </think> is content
        segments.push({ type: 'content', text: this.buffer });
        this.buffer = '';
        break;
      }
    }

    return segments;
  }

  flush(): ThinkSegment[] {
    if (this.buffer.length === 0) return [];

    const type = this.state === 'thinking' ? 'thinking' : 'content';
    const text = this.buffer;
    this.buffer = '';
    return [{ type, text }];
  }

  /**
   * Check if the end of `text` could be the beginning of `tag`.
   * E.g. text="abc<thi" could be the start of "<think>".
   */
  private couldBePartialTag(text: string, tag: string): boolean {
    const maxCheck = Math.min(text.length, tag.length - 1);
    for (let len = maxCheck; len >= 1; len--) {
      if (text.endsWith(tag.slice(0, len))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Find the index where a potential partial tag starts at the end of the buffer.
   */
  private findPartialTagStart(text: string, tag: string): number {
    const maxCheck = Math.min(text.length, tag.length - 1);
    for (let len = maxCheck; len >= 1; len--) {
      if (text.endsWith(tag.slice(0, len))) {
        return text.length - len;
      }
    }
    return text.length;
  }
}

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
 */
export function parseThinkBlocks(content: string): { thinking: string; response: string } {
  const match = content.match(/^<think>([\s\S]*?)<\/think>\s*([\s\S]*)$/);
  if (match) {
    return { thinking: match[1].trim(), response: match[2] };
  }
  return { thinking: '', response: content };
}
