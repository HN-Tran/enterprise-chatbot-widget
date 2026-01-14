import type { ResolvedConfig } from '../types';

export class CopyButton {
  private element: HTMLButtonElement;
  private config: ResolvedConfig;
  private onShowToast: (message: string) => void;

  constructor(
    text: string,
    config: ResolvedConfig,
    onShowToast: (message: string) => void
  ) {
    this.config = config;
    this.onShowToast = onShowToast;

    this.element = document.createElement('button');
    this.element.className = 'ec-action-btn';
    this.element.title = config.labels.copyTooltip;
    this.element.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
      </svg>
      <span>${config.labels.copyTooltip}</span>
    `;

    this.element.addEventListener('click', () => this.copyText(text));
  }

  getElement(): HTMLButtonElement {
    return this.element;
  }

  private async copyText(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.onShowToast(this.config.labels.copiedToast);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.onShowToast(this.config.labels.copiedToast);
    }
  }
}
