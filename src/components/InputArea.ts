import type { ResolvedConfig } from '../types';

export class InputArea {
  private element: HTMLDivElement;
  private input: HTMLInputElement;
  private sendButton: HTMLButtonElement;
  private onSend: (query: string) => void;
  private isLoading = false;

  constructor(config: ResolvedConfig, onSend: (query: string) => void) {
    this.onSend = onSend;

    this.element = document.createElement('div');
    this.element.className = 'ec-input-area';

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'ec-input';
    this.input.placeholder = config.labels.placeholder;

    this.sendButton = document.createElement('button');
    this.sendButton.className = 'ec-send-btn';
    this.sendButton.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
      </svg>
    `;

    this.element.appendChild(this.input);
    this.element.appendChild(this.sendButton);

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.isLoading) {
        this.handleSend();
      }
    });

    this.sendButton.addEventListener('click', () => {
      if (!this.isLoading) {
        this.handleSend();
      }
    });
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.sendButton.disabled = loading;
    this.input.disabled = loading;
  }

  focus(): void {
    this.input.focus();
  }

  clear(): void {
    this.input.value = '';
  }

  private handleSend(): void {
    const query = this.input.value.trim();
    if (query) {
      this.onSend(query);
      this.clear();
    }
  }
}
