import type { StreamCallbacks, Source } from '../types';

export class ApiClient {
  private baseUrl: string;
  private abortController: AbortController | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async streamSearch(
    query: string,
    k: number = 8,
    callbacks: StreamCallbacks,
    history?: { role: 'user' | 'assistant'; content: string }[],
    includeArchived?: boolean,
    category?: string | null,
    embeddingModel?: 'nomic' | 'qwen'
  ): Promise<void> {
    // Abort any existing request
    this.abort();
    this.abortController = new AbortController();

    try {
      const body: Record<string, unknown> = { query, k };
      if (history && history.length > 0) {
        body.history = history;
      }
      if (includeArchived) {
        body.include_archived = true;
      }
      if (category) {
        body.categories = [category];
      }
      // Always send embedding_model (defaults to 'nomic' if not specified)
      body.embedding_model = embeddingModel || 'nomic';

      const response = await fetch(`${this.baseUrl}/search/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep last potentially incomplete line in buffer
        buffer = lines[lines.length - 1];

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          if (line.startsWith('event: ')) {
            const eventType = line.substring(7);
            const dataLine = lines[++i]?.trim();

            if (dataLine?.startsWith('data: ')) {
              const dataStr = dataLine.substring(6);
              this.handleEvent(eventType, dataStr, callbacks);
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return; // Request was cancelled, not an error
      }
      callbacks.onError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.abortController = null;
    }
  }

  private handleEvent(eventType: string, dataStr: string, callbacks: StreamCallbacks): void {
    try {
      switch (eventType) {
        case 'meta': {
          const meta = JSON.parse(dataStr);
          callbacks.onMeta?.(meta);
          break;
        }
        case 'sources': {
          const sources: Source[] = JSON.parse(dataStr);
          callbacks.onSources?.(sources);
          break;
        }
        case 'chunk': {
          // Chunk data is a JSON string containing the text
          const chunk = JSON.parse(dataStr);
          callbacks.onChunk?.(chunk);
          break;
        }
        case 'done': {
          callbacks.onDone?.();
          break;
        }
        case 'error': {
          const errorData = JSON.parse(dataStr);
          callbacks.onError?.(errorData.error || 'Unknown error');
          break;
        }
      }
    } catch {
      // JSON parse error, skip this event
    }
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
