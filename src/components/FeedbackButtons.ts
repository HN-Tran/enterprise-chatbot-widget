import type { ResolvedConfig } from '../types';

export class FeedbackButtons {
  private element: HTMLDivElement;
  private thumbUp: HTMLButtonElement;
  private thumbDown: HTMLButtonElement;
  private config: ResolvedConfig;
  private messageId: string;
  private onFeedback: (messageId: string, feedback: 'up' | 'down', comment?: string) => void;
  private dialog: HTMLDivElement | null = null;
  private submitted = false;

  constructor(
    messageId: string,
    config: ResolvedConfig,
    onFeedback: (messageId: string, feedback: 'up' | 'down', comment?: string) => void
  ) {
    this.messageId = messageId;
    this.config = config;
    this.onFeedback = onFeedback;

    this.element = document.createElement('div');
    this.element.className = 'ec-feedback';

    const prompt = document.createElement('span');
    prompt.className = 'ec-feedback-prompt';
    prompt.textContent = config.labels.feedbackPrompt;

    this.thumbUp = this.createButton('up', () => this.showDialog('up'));
    this.thumbDown = this.createButton('down', () => this.showDialog('down'));

    this.element.appendChild(prompt);
    this.element.appendChild(this.thumbUp);
    this.element.appendChild(this.thumbDown);
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  setFeedback(feedback: 'up' | 'down' | null): void {
    this.submitted = feedback !== null;
    this.thumbUp.classList.toggle('ec-active', feedback === 'up');
    this.thumbDown.classList.toggle('ec-active', feedback === 'down');

    // Lock buttons if feedback was given
    if (this.submitted) {
      this.lockButtons();
    }
  }

  private lockButtons(): void {
    this.thumbUp.disabled = true;
    this.thumbDown.disabled = true;
    this.thumbUp.classList.add('ec-locked');
    this.thumbDown.classList.add('ec-locked');
  }

  private showDialog(feedback: 'up' | 'down'): void {
    // If already submitted, do nothing - feedback is locked
    if (this.submitted) {
      return;
    }

    // Remove existing dialog if any
    this.hideDialog();

    this.thumbUp.classList.toggle('ec-active', feedback === 'up');
    this.thumbDown.classList.toggle('ec-active', feedback === 'down');

    this.dialog = document.createElement('div');
    this.dialog.className = 'ec-feedback-dialog';

    // Nudge message
    const nudge = document.createElement('div');
    nudge.className = 'ec-feedback-nudge';
    nudge.textContent = this.config.labels.feedbackNudge;
    this.dialog.appendChild(nudge);

    // Comment textarea
    const textarea = document.createElement('textarea');
    textarea.className = 'ec-feedback-textarea';
    textarea.placeholder = this.config.labels.feedbackCommentPlaceholder;
    textarea.rows = 3;
    textarea.maxLength = 2000;
    this.dialog.appendChild(textarea);

    // Button row
    const buttonRow = document.createElement('div');
    buttonRow.className = 'ec-feedback-buttons';

    // Skip button (submit without comment)
    const skipBtn = document.createElement('button');
    skipBtn.className = 'ec-feedback-skip';
    skipBtn.textContent = 'Überspringen';
    skipBtn.addEventListener('click', () => {
      this.submitFeedback(feedback, '');
    });
    buttonRow.appendChild(skipBtn);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'ec-feedback-submit';
    submitBtn.textContent = this.config.labels.feedbackSubmit;
    submitBtn.addEventListener('click', () => {
      this.submitFeedback(feedback, textarea.value);
    });
    buttonRow.appendChild(submitBtn);

    this.dialog.appendChild(buttonRow);
    this.element.appendChild(this.dialog);

    // Focus textarea
    setTimeout(() => textarea.focus(), 0);
  }

  private hideDialog(): void {
    if (this.dialog) {
      this.dialog.remove();
      this.dialog = null;
    }
  }

  private submitFeedback(feedback: 'up' | 'down', comment: string): void {
    this.submitted = true;
    this.hideDialog();
    this.lockButtons();

    // Show thank you message briefly
    const thankYou = document.createElement('div');
    thankYou.className = 'ec-feedback-thankyou';
    thankYou.textContent = this.config.labels.feedbackThankYou;
    this.element.appendChild(thankYou);

    setTimeout(() => {
      thankYou.remove();
    }, 2000);

    this.onFeedback(this.messageId, feedback, comment || undefined);
  }

  private createButton(type: 'up' | 'down', onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'ec-action-btn';
    button.innerHTML = type === 'up' ? this.getThumbUpSvg() : this.getThumbDownSvg();
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
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
