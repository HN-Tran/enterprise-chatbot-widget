import type { Message, ResolvedConfig, Source } from '../types';
import { SourceCard } from './SourceCard';
import { CopyButton } from './CopyButton';
import { FeedbackButtons } from './FeedbackButtons';
import { renderMarkdown } from '../utils/markdown';

export class MessageList {
  private element: HTMLDivElement;
  private config: ResolvedConfig;
  private onShowToast: (message: string) => void;
  private onFeedback: (messageId: string, feedback: 'up' | 'down', comment?: string) => void;
  private thinkingElement: HTMLDivElement | null = null;
  private streamingElement: HTMLDivElement | null = null;
  private streamingMessageId: string | null = null;
  private welcomeElement: HTMLDivElement | null = null;

  constructor(
    config: ResolvedConfig,
    onShowToast: (message: string) => void,
    onFeedback: (messageId: string, feedback: 'up' | 'down', comment?: string) => void
  ) {
    this.config = config;
    this.onShowToast = onShowToast;
    this.onFeedback = onFeedback;

    this.element = document.createElement('div');
    this.element.className = 'ec-messages';

    // Show welcome message initially
    this.showWelcome();
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  addUserMessage(message: Message): void {
    this.hideWelcome();
    const msgEl = this.createMessageElement(message);
    this.element.appendChild(msgEl);
    this.scrollToBottom();
  }

  showThinking(): void {
    if (this.thinkingElement) return;

    this.thinkingElement = document.createElement('div');
    this.thinkingElement.className = 'ec-message ec-message--assistant';
    this.thinkingElement.innerHTML = `
      <div class="ec-thinking">
        <div class="ec-thinking-dot"></div>
        <div class="ec-thinking-dot"></div>
        <div class="ec-thinking-dot"></div>
      </div>
    `;
    this.element.appendChild(this.thinkingElement);
    this.scrollToBottom();
  }

  hideThinking(): void {
    if (this.thinkingElement) {
      this.thinkingElement.remove();
      this.thinkingElement = null;
    }
  }

  startStreaming(messageId: string): void {
    this.hideThinking();
    this.streamingMessageId = messageId;

    this.streamingElement = document.createElement('div');
    this.streamingElement.className = 'ec-message ec-message--assistant';
    this.streamingElement.innerHTML = `
      <div class="ec-message-content"></div>
    `;
    this.element.appendChild(this.streamingElement);
    this.scrollToBottom();
  }

  appendChunk(chunk: string): void {
    if (!this.streamingElement) return;

    const content = this.streamingElement.querySelector('.ec-message-content');
    if (content) {
      content.textContent += chunk;
      this.scrollToBottom();
    }
  }

  finishStreaming(message: Message): void {
    if (!this.streamingElement || !this.streamingMessageId) return;

    // Replace the streaming element with the full message
    const fullMessage = this.createMessageElement(message);
    this.streamingElement.replaceWith(fullMessage);

    this.streamingElement = null;
    this.streamingMessageId = null;
    this.scrollToBottom();
  }

  showSources(_sources: Source[]): void {
    // Sources are now shown after the answer is complete, not during streaming
    // This method is kept for API compatibility but does nothing
  }

  loadMessages(messages: Message[]): void {
    this.element.innerHTML = '';
    this.welcomeElement = null;

    if (messages.length === 0) {
      this.showWelcome();
    } else {
      messages.forEach((msg) => {
        const msgEl = this.createMessageElement(msg);
        this.element.appendChild(msgEl);
      });
      this.scrollToBottom();
    }
  }

  clearMessages(): void {
    this.element.innerHTML = '';
    this.thinkingElement = null;
    this.streamingElement = null;
    this.streamingMessageId = null;
    this.welcomeElement = null;
    this.showWelcome();
  }

  showError(error: string): void {
    this.hideThinking();

    const errorEl = document.createElement('div');
    errorEl.className = 'ec-message ec-message--assistant';
    errorEl.innerHTML = `
      <div class="ec-message-content" style="color: #d32f2f;">
        ${this.config.labels.error}: ${this.escapeHtml(error)}
      </div>
    `;
    this.element.appendChild(errorEl);
    this.scrollToBottom();
  }

  private createMessageElement(message: Message): HTMLDivElement {
    const msgEl = document.createElement('div');
    msgEl.className = `ec-message ec-message--${message.role}`;
    msgEl.dataset.id = message.id;

    // Content
    const content = document.createElement('div');
    content.className = 'ec-message-content';
    if (message.role === 'assistant') {
      // Render markdown for assistant messages
      content.innerHTML = renderMarkdown(message.content);
    } else {
      // Plain text for user messages
      content.textContent = message.content;
    }
    msgEl.appendChild(content);

    // Sources AFTER content (for assistant messages) - only show cited sources
    if (message.role === 'assistant' && message.sources && message.sources.length > 0) {
      const citedSources = this.filterCitedSources(message.content, message.sources);

      if (citedSources.length > 0) {
        const sourcesContainer = document.createElement('div');
        sourcesContainer.className = 'ec-sources';

        const header = document.createElement('div');
        header.className = 'ec-sources-header';
        header.textContent = this.config.labels.sourcesHeader;
        sourcesContainer.appendChild(header);

        citedSources.forEach((source) => {
          const card = new SourceCard(source);
          sourcesContainer.appendChild(card.getElement());
        });

        // Append sources AFTER content
        msgEl.appendChild(sourcesContainer);
      }
    }

    // Actions (for assistant messages)
    if (message.role === 'assistant') {
      const actions = document.createElement('div');
      actions.className = 'ec-message-actions';

      // Copy button
      if (this.config.features.copyButton) {
        const copyBtn = new CopyButton(message.content, this.config, this.onShowToast);
        actions.appendChild(copyBtn.getElement());
      }

      // Feedback buttons
      if (this.config.features.feedbackButtons) {
        const feedbackBtns = new FeedbackButtons(message.id, this.config, this.onFeedback);
        if (message.feedback) {
          feedbackBtns.setFeedback(message.feedback);
        }
        actions.appendChild(feedbackBtns.getElement());
      }

      msgEl.appendChild(actions);
    }

    return msgEl;
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      this.element.scrollTop = this.element.scrollHeight;
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private filterCitedSources(content: string, sources: Source[]): Source[] {
    // Find all [N] citations in the answer
    const citationMatches = content.match(/\[(\d+)\]/g) || [];
    const citedIndices = new Set(
      citationMatches.map((match) => parseInt(match.slice(1, -1), 10))
    );

    // Filter to only cited sources
    const cited = sources.filter((source) => citedIndices.has(source.index));

    // Fallback: if no citations found in text, show all sources (LLM didn't include refs)
    if (cited.length === 0 && sources.length > 0) {
      return sources.slice(0, 4); // Limit to 4 sources
    }

    return cited;
  }

  private showWelcome(): void {
    if (this.welcomeElement) return;

    this.welcomeElement = document.createElement('div');
    this.welcomeElement.className = 'ec-welcome';
    this.welcomeElement.innerHTML = `
      <div class="ec-welcome-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="ec-welcome-text">${this.config.labels.welcomeMessage}</div>
    `;
    this.element.appendChild(this.welcomeElement);
  }

  private hideWelcome(): void {
    if (this.welcomeElement) {
      this.welcomeElement.remove();
      this.welcomeElement = null;
    }
  }
}
