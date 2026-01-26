import type { WidgetConfig, ResolvedConfig, Message, Source } from './types';

// Build-time constant (injected by Vite)
declare const __API_URL__: string;
import { StorageService } from './services/storage';
import { ApiClient } from './services/api';
import { ChatBubble } from './components/ChatBubble';
import { ChatWindow } from './components/ChatWindow';
import { injectStyles } from './styles/styles';

export class ChatWidget {
  private config: ResolvedConfig;
  private storage: StorageService;
  private api: ApiClient;
  private host: HTMLElement;
  private shadow: ShadowRoot;
  private container: HTMLDivElement;
  private bubble: ChatBubble;
  private window: ChatWindow;
  private isLoading = false;

  constructor(userConfig: WidgetConfig) {
    this.storage = new StorageService(userConfig.sessionTimeout ?? 30);
    this.config = this.resolveConfig(userConfig);
    this.api = new ApiClient(this.config.apiUrl);

    // Create Shadow DOM host for CSS isolation
    this.host = document.createElement('div');
    this.host.id = 'enterprise-chat-host';
    this.shadow = this.host.attachShadow({ mode: 'open' });

    // Inject styles into shadow root
    injectStyles(this.config, this.shadow);

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'ec-widget';

    // Create components
    this.bubble = new ChatBubble(this.config, () => this.open());
    this.window = new ChatWindow(
      this.config,
      () => this.close(),
      (query) => this.handleQuery(query),
      (messageId, feedback, comment) => this.handleFeedback(messageId, feedback, comment),
      () => this.handleNewChat(),
      (settings) => this.handleSettingsChange(settings),
      (category) => this.handleCategoryChange(category),
      (model) => this.handleEmbeddingModelChange(model)
    );

    this.container.appendChild(this.bubble.getElement());
    this.container.appendChild(this.window.getElement());

    // Mount inside shadow root
    this.shadow.appendChild(this.container);

    // Mount host to DOM
    document.body.appendChild(this.host);

    // Restore session
    this.restoreSession();
  }

  open(): void {
    this.bubble.hide();
    this.window.show();
    this.storage.setOpenState(true);
  }

  close(): void {
    this.window.hide();
    this.bubble.show();
    this.storage.setOpenState(false);
  }

  destroy(): void {
    this.api.abort();
    this.host.remove();
  }

  private resolveConfig(userConfig: WidgetConfig): ResolvedConfig {
    return {
      apiUrl: userConfig.apiUrl ?? __API_URL__,
      position: userConfig.position ?? 'bottom-right',
      theme: {
        primaryColor: userConfig.theme?.primaryColor ?? '#1a73e8',
        fontFamily: userConfig.theme?.fontFamily ?? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      labels: {
        placeholder: userConfig.labels?.placeholder ?? 'Stellen Sie eine Frage...',
        title: userConfig.labels?.title ?? 'Dokument-Assistent',
        sendButton: userConfig.labels?.sendButton ?? 'Senden',
        copyTooltip: 'Kopieren',
        copiedToast: 'Kopiert!',
        sourcesHeader: 'Quellen',
        loading: 'Suche läuft...',
        error: 'Ein Fehler ist aufgetreten',
        feedbackPrompt: 'Hilfreich?',
        feedbackCommentPlaceholder: 'Möchten Sie uns mehr mitteilen? (optional)',
        feedbackSubmit: 'Absenden',
        feedbackNudge: 'Ihr Kommentar hilft uns, besser zu werden!',
        feedbackThankYou: 'Danke für Ihr Feedback!',
        newChat: 'Neuer Chat',
        welcomeMessage: 'Hallo! Wie kann ich Ihnen helfen?',
        settings: 'Einstellungen',
        chatHistoryLabel: 'Chat-Verlauf nutzen',
        includeArchivedLabel: 'Archivierte Dokumente einbeziehen',
        expand: 'Vergrößern',
        collapse: 'Verkleinern',
        allCategories: 'Alle Kategorien',
        categoryLabel: 'Kategorie',
        embeddingModelLabel: 'Suchmodus',
        embeddingFast: 'Schnell',
        embeddingPrecise: 'Präzise',
      },
      sessionTimeout: userConfig.sessionTimeout ?? 30,
      features: {
        copyButton: userConfig.features?.copyButton ?? true,
        feedbackButtons: userConfig.features?.feedbackButtons ?? true,
        chatHistory: this.storage.getSetting('chatHistory', userConfig.features?.chatHistory ?? true),
        includeArchived: this.storage.getSetting('includeArchived', userConfig.features?.includeArchived ?? false),
      },
      // Default categories - replace this array to customize
      categories: userConfig.categories ?? [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' },
        { value: 'E', label: 'E' },
      ],
      selectedCategory: this.storage.getSetting('selectedCategory', null),
      selectedEmbeddingModel: this.storage.getSetting('selectedEmbeddingModel', 'qwen'),
    };
  }

  private restoreSession(): void {
    const messages = this.storage.getMessages();
    if (messages.length > 0) {
      this.window.loadMessages(messages);
    }

    // Restore open state
    if (this.storage.getOpenState()) {
      this.open();
    }
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async handleQuery(query: string): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.window.setLoading(true);

    // Build chat history (last 10 messages) before adding new message
    let history: { role: 'user' | 'assistant'; content: string }[] | undefined;
    if (this.config.features.chatHistory) {
      const messages = this.storage.getMessages();
      history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));
    }

    // Add user message
    const userMessage: Message = {
      id: this.generateId(),
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    this.window.addUserMessage(userMessage);
    this.storage.addMessage(userMessage);

    // Show thinking animation
    this.window.showThinking();
    this.bubble.getMascot().setState('thinking');

    // Prepare assistant message
    const assistantMessageId = this.generateId();
    let assistantContent = '';
    let sources: Source[] = [];
    let streamingStarted = false;

    try {
      await this.api.streamSearch(query, 8, {
        onMeta: () => {
          // Meta received, switch to responding state
          this.bubble.getMascot().setState('responding');
        },
        onSources: (receivedSources) => {
          // Just store sources, don't start streaming yet (wait for first chunk)
          sources = receivedSources;
        },
        onChunk: (chunk) => {
          // Start streaming on first chunk (keeps thinking dots until text arrives)
          if (!streamingStarted) {
            this.window.startStreaming(assistantMessageId);
            streamingStarted = true;
          }
          assistantContent += chunk;
          this.window.appendChunk(chunk);
        },
        onDone: () => {
          // Create final message
          const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: assistantContent,
            sources: sources,
            timestamp: Date.now(),
          };

          this.window.finishStreaming(assistantMessage);
          this.storage.addMessage(assistantMessage);
          this.bubble.getMascot().setState('success');

          // Reset to idle after a moment
          setTimeout(() => {
            this.bubble.getMascot().setState('idle');
          }, 1500);
        },
        onError: (error) => {
          this.window.hideThinking();
          this.window.showError(error);
          this.bubble.getMascot().setState('error');

          setTimeout(() => {
            this.bubble.getMascot().setState('idle');
          }, 2000);
        },
      }, history, this.config.features.includeArchived, this.config.selectedCategory, this.config.selectedEmbeddingModel);
    } catch (error) {
      this.window.hideThinking();
      this.window.showError(error instanceof Error ? error.message : 'Unknown error');
      this.bubble.getMascot().setState('error');

      setTimeout(() => {
        this.bubble.getMascot().setState('idle');
      }, 2000);
    } finally {
      this.isLoading = false;
      this.window.setLoading(false);
    }
  }

  private handleNewChat(): void {
    // Clear storage
    this.storage.clearMessages();
    // Clear UI
    this.window.clearMessages();
    // Reset mascot state
    this.bubble.getMascot().setState('idle');
  }

  private handleSettingsChange(settings: { chatHistory: boolean; includeArchived: boolean }): void {
    this.config.features.chatHistory = settings.chatHistory;
    this.storage.setSetting('chatHistory', settings.chatHistory);
    this.config.features.includeArchived = settings.includeArchived;
    this.storage.setSetting('includeArchived', settings.includeArchived);
  }

  private handleCategoryChange(category: string | null): void {
    this.config.selectedCategory = category;
    this.storage.setSetting('selectedCategory', category);
  }

  private handleEmbeddingModelChange(model: 'nomic' | 'qwen'): void {
    this.config.selectedEmbeddingModel = model;
    this.storage.setSetting('selectedEmbeddingModel', model);
  }

  private handleFeedback(messageId: string, feedback: 'up' | 'down', comment?: string): void {
    this.storage.updateMessage(messageId, { feedback });

    // Find the message and preceding user query
    const messages = this.storage.getMessages();
    const msgIndex = messages.findIndex((m) => m.id === messageId);
    if (msgIndex < 0) return;

    const assistantMsg = messages[msgIndex];
    const userMsg = messages
      .slice(0, msgIndex)
      .reverse()
      .find((m) => m.role === 'user');

    if (!userMsg || assistantMsg.role !== 'assistant') return;

    // Build feedback payload
    const payload: Record<string, unknown> = {
      query: userMsg.content,
      answer: assistantMsg.content,
      feedback: feedback,
    };

    // Include comment if provided
    if (comment && comment.trim()) {
      payload.comment = comment.trim();
    }

    // Include full chat history if enabled
    if (this.config.features.chatHistory) {
      payload.history = messages.slice(0, msgIndex + 1).map((m) => ({
        role: m.role,
        content: m.content,
      }));
    }

    // Send to backend
    fetch(`${this.config.apiUrl}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently fail - feedback is best-effort
    });
  }
}
