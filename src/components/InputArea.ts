import type { ResolvedConfig } from '../types';

const INPUT_STORAGE_KEY = 'ec-input-draft';
const MAX_INPUT_LENGTH = 2000;

export class InputArea {
  private element: HTMLDivElement;
  private inputWrapper: HTMLDivElement;
  private input: HTMLInputElement;
  private charCounter: HTMLSpanElement;
  private sendButton: HTMLButtonElement;
  private onSend: (query: string) => void;
  private isLoading = false;

  constructor(config: ResolvedConfig, onSend: (query: string) => void) {
    this.onSend = onSend;

    this.element = document.createElement('div');
    this.element.className = 'ec-input-area';

    // Input wrapper for positioning counter
    this.inputWrapper = document.createElement('div');
    this.inputWrapper.className = 'ec-input-wrapper';

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'ec-input';
    this.input.placeholder = config.labels.placeholder;
    this.input.maxLength = MAX_INPUT_LENGTH;

    // Character counter
    this.charCounter = document.createElement('span');
    this.charCounter.className = 'ec-char-counter';

    // Restore saved draft
    const savedDraft = sessionStorage.getItem(INPUT_STORAGE_KEY);
    if (savedDraft) {
      this.input.value = savedDraft;
    }
    this.updateCharCounter();

    this.sendButton = document.createElement('button');
    this.sendButton.className = 'ec-send-btn';
    this.sendButton.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
      </svg>
    `;

    this.inputWrapper.appendChild(this.input);
    this.inputWrapper.appendChild(this.charCounter);
    this.element.appendChild(this.inputWrapper);
    this.element.appendChild(this.sendButton);

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this.isLoading) {
        this.handleSend();
      }
    });

    // Save draft on input change and update counter
    this.input.addEventListener('input', () => {
      sessionStorage.setItem(INPUT_STORAGE_KEY, this.input.value);
      this.updateCharCounter();
    });

    this.sendButton.addEventListener('click', () => {
      if (!this.isLoading) {
        this.handleSend();
      }
    });
  }

  private updateCharCounter(): void {
    const len = this.input.value.length;
    const remaining = MAX_INPUT_LENGTH - len;

    // Only show counter when getting close to limit (< 200 chars remaining)
    if (remaining <= 200) {
      this.charCounter.textContent = `${len}/${MAX_INPUT_LENGTH}`;
      this.charCounter.classList.add('ec-visible');

      if (remaining <= 0) {
        this.charCounter.classList.add('ec-limit');
        this.input.classList.add('ec-at-limit');
      } else if (remaining <= 50) {
        this.charCounter.classList.add('ec-warning');
        this.charCounter.classList.remove('ec-limit');
        this.input.classList.remove('ec-at-limit');
      } else {
        this.charCounter.classList.remove('ec-warning', 'ec-limit');
        this.input.classList.remove('ec-at-limit');
      }
    } else {
      this.charCounter.classList.remove('ec-visible', 'ec-warning', 'ec-limit');
      this.input.classList.remove('ec-at-limit');
    }
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
    sessionStorage.removeItem(INPUT_STORAGE_KEY);
    this.updateCharCounter();
  }

  private handleSend(): void {
    const query = this.input.value.trim();
    if (query) {
      this.onSend(query);
      this.clear();
    }
  }
}
