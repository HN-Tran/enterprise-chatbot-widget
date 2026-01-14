import type { ResolvedConfig } from '../types';

export class FeedbackButtons {
  private element: HTMLDivElement;
  private thumbUp: HTMLButtonElement;
  private thumbDown: HTMLButtonElement;

  constructor(
    messageId: string,
    config: ResolvedConfig,
    onFeedback: (messageId: string, feedback: 'up' | 'down') => void
  ) {
    this.element = document.createElement('div');
    this.element.className = 'ec-feedback';

    const prompt = document.createElement('span');
    prompt.className = 'ec-feedback-prompt';
    prompt.textContent = config.labels.feedbackPrompt;

    this.thumbUp = this.createButton('up', () => {
      this.setFeedback('up');
      onFeedback(messageId, 'up');
    });

    this.thumbDown = this.createButton('down', () => {
      this.setFeedback('down');
      onFeedback(messageId, 'down');
    });

    this.element.appendChild(prompt);
    this.element.appendChild(this.thumbUp);
    this.element.appendChild(this.thumbDown);
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  setFeedback(feedback: 'up' | 'down' | null): void {
    this.thumbUp.classList.toggle('ec-active', feedback === 'up');
    this.thumbDown.classList.toggle('ec-active', feedback === 'down');
  }

  private createButton(type: 'up' | 'down', onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'ec-action-btn';
    button.innerHTML = type === 'up' ? this.getThumbUpSvg() : this.getThumbDownSvg();
    button.addEventListener('click', onClick);
    return button;
  }

  private getThumbUpSvg(): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
      </svg>
    `;
  }

  private getThumbDownSvg(): string {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/>
      </svg>
    `;
  }
}
