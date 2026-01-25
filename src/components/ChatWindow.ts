import type { Message, ResolvedConfig, Source } from '../types';
import { MascotSmall } from './Mascot';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';

export class ChatWindow {
  private element: HTMLDivElement;
  private config: ResolvedConfig;
  private messageList: MessageList;
  private inputArea: InputArea;
  private toastElement: HTMLDivElement | null = null;
  private toastTimeout: number | null = null;
  private settingsPanel: HTMLDivElement | null = null;
  private expandBtn: HTMLButtonElement | null = null;
  private isExpanded = false;
  private onClose: () => void;
  private onSend: (query: string) => void;
  private onFeedback: (messageId: string, feedback: 'up' | 'down', comment?: string) => void;
  private onNewChat: () => void;
  private onSettingsChange: (settings: { chatHistory: boolean; includeArchived: boolean }) => void;
  private onCategoryChange: (category: string | null) => void;
  private onEmbeddingModelChange: (model: 'nomic' | 'qwen') => void;

  constructor(
    config: ResolvedConfig,
    onClose: () => void,
    onSend: (query: string) => void,
    onFeedback: (messageId: string, feedback: 'up' | 'down', comment?: string) => void,
    onNewChat: () => void,
    onSettingsChange: (settings: { chatHistory: boolean; includeArchived: boolean }) => void,
    onCategoryChange: (category: string | null) => void,
    onEmbeddingModelChange: (model: 'nomic' | 'qwen') => void
  ) {
    this.config = config;
    this.onClose = onClose;
    this.onSend = onSend;
    this.onFeedback = onFeedback;
    this.onNewChat = onNewChat;
    this.onSettingsChange = onSettingsChange;
    this.onCategoryChange = onCategoryChange;
    this.onEmbeddingModelChange = onEmbeddingModelChange;

    this.element = document.createElement('div');
    this.element.className = 'ec-window ec-hidden';

    // Header
    const header = this.createHeader();
    this.element.appendChild(header);

    // Message list
    this.messageList = new MessageList(
      config,
      (msg) => this.showToast(msg),
      this.onFeedback
    );
    this.element.appendChild(this.messageList.getElement());

    // Category selector (above input)
    const categorySelector = this.createCategorySelector();
    this.element.appendChild(categorySelector);

    // Input area
    this.inputArea = new InputArea(config, this.onSend);
    this.element.appendChild(this.inputArea.getElement());
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  show(): void {
    this.element.classList.remove('ec-hidden');
    setTimeout(() => this.inputArea.focus(), 100);
  }

  hide(): void {
    this.element.classList.add('ec-hidden');
  }

  isVisible(): boolean {
    return !this.element.classList.contains('ec-hidden');
  }

  addUserMessage(message: Message): void {
    this.messageList.addUserMessage(message);
  }

  showThinking(): void {
    this.messageList.showThinking();
  }

  hideThinking(): void {
    this.messageList.hideThinking();
  }

  startStreaming(messageId: string): void {
    this.messageList.startStreaming(messageId);
  }

  appendChunk(chunk: string): void {
    this.messageList.appendChunk(chunk);
  }

  finishStreaming(message: Message): void {
    this.messageList.finishStreaming(message);
  }

  showSources(sources: Source[]): void {
    this.messageList.showSources(sources);
  }

  showError(error: string): void {
    this.messageList.showError(error);
  }

  loadMessages(messages: Message[]): void {
    this.messageList.loadMessages(messages);
  }

  setLoading(loading: boolean): void {
    this.inputArea.setLoading(loading);
  }

  clearMessages(): void {
    this.messageList.clearMessages();
  }

  private createHeader(): HTMLDivElement {
    const header = document.createElement('div');
    header.className = 'ec-header';

    // Mascot
    const mascot = new MascotSmall();
    header.appendChild(mascot.getElement());

    // Title
    const title = document.createElement('div');
    title.className = 'ec-header-title';
    title.textContent = this.config.labels.title;
    header.appendChild(title);

    // New Chat button
    const newChatBtn = document.createElement('button');
    newChatBtn.className = 'ec-header-btn';
    newChatBtn.setAttribute('aria-label', this.config.labels.newChat);
    newChatBtn.setAttribute('title', this.config.labels.newChat);
    newChatBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    `;
    newChatBtn.addEventListener('click', this.onNewChat);
    header.appendChild(newChatBtn);

    // Expand button
    this.expandBtn = document.createElement('button');
    this.expandBtn.className = 'ec-header-btn';
    this.expandBtn.setAttribute('aria-label', this.config.labels.expand);
    this.expandBtn.setAttribute('title', this.config.labels.expand);
    this.expandBtn.innerHTML = this.getExpandIcon();
    this.expandBtn.addEventListener('click', () => this.toggleExpand());
    header.appendChild(this.expandBtn);

    // Settings button
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'ec-header-btn';
    settingsBtn.setAttribute('aria-label', this.config.labels.settings);
    settingsBtn.setAttribute('title', this.config.labels.settings);
    settingsBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    `;
    settingsBtn.addEventListener('click', () => this.toggleSettings());
    header.appendChild(settingsBtn);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ec-header-btn';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;
    closeBtn.addEventListener('click', this.onClose);
    header.appendChild(closeBtn);

    return header;
  }

  private getExpandIcon(): string {
    if (this.isExpanded) {
      // Collapse icon (arrows pointing inward)
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>
        </svg>
      `;
    }
    // Expand icon (arrows pointing outward)
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
    `;
  }

  private toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
    this.element.classList.toggle('ec-window--expanded', this.isExpanded);

    if (this.expandBtn) {
      this.expandBtn.innerHTML = this.getExpandIcon();
      this.expandBtn.setAttribute(
        'title',
        this.isExpanded ? this.config.labels.collapse : this.config.labels.expand
      );
      this.expandBtn.setAttribute(
        'aria-label',
        this.isExpanded ? this.config.labels.collapse : this.config.labels.expand
      );
    }
  }

  private toggleSettings(): void {
    if (this.settingsPanel) {
      this.hideSettings();
    } else {
      this.showSettings();
    }
  }

  private showSettings(): void {
    if (this.settingsPanel) return;

    this.settingsPanel = document.createElement('div');
    this.settingsPanel.className = 'ec-settings-panel';

    // Chat history toggle
    const historyRow = document.createElement('label');
    historyRow.className = 'ec-settings-row';

    const historyCheckbox = document.createElement('input');
    historyCheckbox.type = 'checkbox';
    historyCheckbox.checked = this.config.features.chatHistory;
    historyCheckbox.addEventListener('change', () => {
      this.config.features.chatHistory = historyCheckbox.checked;
      this.onSettingsChange({
        chatHistory: historyCheckbox.checked,
        includeArchived: this.config.features.includeArchived,
      });
    });

    const historyLabel = document.createElement('span');
    historyLabel.textContent = this.config.labels.chatHistoryLabel;

    historyRow.appendChild(historyCheckbox);
    historyRow.appendChild(historyLabel);
    this.settingsPanel.appendChild(historyRow);

    // Include archived toggle
    const archivedRow = document.createElement('label');
    archivedRow.className = 'ec-settings-row';

    const archivedCheckbox = document.createElement('input');
    archivedCheckbox.type = 'checkbox';
    archivedCheckbox.checked = this.config.features.includeArchived;
    archivedCheckbox.addEventListener('change', () => {
      this.config.features.includeArchived = archivedCheckbox.checked;
      this.onSettingsChange({
        chatHistory: this.config.features.chatHistory,
        includeArchived: archivedCheckbox.checked,
      });
    });

    const archivedLabel = document.createElement('span');
    archivedLabel.textContent = this.config.labels.includeArchivedLabel;

    archivedRow.appendChild(archivedCheckbox);
    archivedRow.appendChild(archivedLabel);
    this.settingsPanel.appendChild(archivedRow);

    this.element.appendChild(this.settingsPanel);

    // Close on click outside
    setTimeout(() => {
      document.addEventListener('click', this.handleOutsideClick);
    }, 0);
  }

  private hideSettings(): void {
    if (this.settingsPanel) {
      this.settingsPanel.remove();
      this.settingsPanel = null;
      document.removeEventListener('click', this.handleOutsideClick);
    }
  }

  private handleOutsideClick = (e: MouseEvent): void => {
    if (this.settingsPanel && !this.settingsPanel.contains(e.target as Node)) {
      const settingsBtn = this.element.querySelector('[aria-label="' + this.config.labels.settings + '"]');
      if (!settingsBtn?.contains(e.target as Node)) {
        this.hideSettings();
      }
    }
  };

  private createCategorySelector(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'ec-category-selector';

    // Category dropdown
    const catGroup = document.createElement('div');
    catGroup.className = 'ec-selector-group';

    const catLabel = document.createElement('label');
    catLabel.className = 'ec-category-label';
    catLabel.textContent = this.config.labels.categoryLabel;

    const catSelect = document.createElement('select');
    catSelect.className = 'ec-category-select';

    // Add "All categories" option
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = this.config.labels.allCategories;
    catSelect.appendChild(allOption);

    // Add category options
    this.config.categories.forEach((cat) => {
      const option = document.createElement('option');
      option.value = cat.value;
      option.textContent = cat.label;
      catSelect.appendChild(option);
    });

    // Set initial value
    catSelect.value = this.config.selectedCategory ?? '';

    // Handle change
    catSelect.addEventListener('change', () => {
      const value = catSelect.value || null;
      this.config.selectedCategory = value;
      this.onCategoryChange(value);
    });

    catGroup.appendChild(catLabel);
    catGroup.appendChild(catSelect);
    container.appendChild(catGroup);

    // Embedding model toggle
    const embGroup = document.createElement('div');
    embGroup.className = 'ec-selector-group ec-embedding-toggle';

    const embLabel = document.createElement('label');
    embLabel.className = 'ec-category-label';
    embLabel.textContent = this.config.labels.embeddingModelLabel;

    const embToggle = document.createElement('div');
    embToggle.className = 'ec-toggle-buttons';

    const fastBtn = document.createElement('button');
    fastBtn.className = 'ec-toggle-btn';
    fastBtn.dataset.active = String(this.config.selectedEmbeddingModel === 'nomic');
    fastBtn.textContent = this.config.labels.embeddingFast;
    fastBtn.addEventListener('click', () => {
      this.config.selectedEmbeddingModel = 'nomic';
      fastBtn.dataset.active = 'true';
      preciseBtn.dataset.active = 'false';
      this.onEmbeddingModelChange('nomic');
    });

    const preciseBtn = document.createElement('button');
    preciseBtn.className = 'ec-toggle-btn';
    preciseBtn.dataset.active = String(this.config.selectedEmbeddingModel === 'qwen');
    preciseBtn.textContent = this.config.labels.embeddingPrecise;
    preciseBtn.addEventListener('click', () => {
      this.config.selectedEmbeddingModel = 'qwen';
      preciseBtn.dataset.active = 'true';
      fastBtn.dataset.active = 'false';
      this.onEmbeddingModelChange('qwen');
    });

    embToggle.appendChild(fastBtn);
    embToggle.appendChild(preciseBtn);
    embGroup.appendChild(embLabel);
    embGroup.appendChild(embToggle);
    container.appendChild(embGroup);

    return container;
  }

  private showToast(message: string): void {
    // Remove existing toast
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    if (this.toastElement) {
      this.toastElement.remove();
    }

    this.toastElement = document.createElement('div');
    this.toastElement.className = 'ec-toast';
    this.toastElement.textContent = message;
    this.element.appendChild(this.toastElement);

    this.toastTimeout = window.setTimeout(() => {
      this.toastElement?.remove();
      this.toastElement = null;
      this.toastTimeout = null;
    }, 2000);
  }
}
