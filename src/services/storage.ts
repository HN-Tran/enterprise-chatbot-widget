import type { ChatSession, Message } from '../types';

const STORAGE_KEY = 'enterprise-chat-session';

export class StorageService {
  private timeoutMinutes: number;

  constructor(timeoutMinutes: number = 30) {
    this.timeoutMinutes = timeoutMinutes;
  }

  getSession(): ChatSession | null {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (!data) return null;

      const session: ChatSession = JSON.parse(data);

      // Check if session expired
      const now = Date.now();
      const elapsed = (now - session.lastActivity) / 1000 / 60;

      if (elapsed > this.timeoutMinutes) {
        this.clearSession();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  saveSession(session: ChatSession): void {
    try {
      session.lastActivity = Date.now();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage full or unavailable, silently fail
    }
  }

  getMessages(): Message[] {
    const session = this.getSession();
    return session?.messages ?? [];
  }

  addMessage(message: Message): void {
    const session = this.getSession() ?? {
      messages: [],
      lastActivity: Date.now(),
      isOpen: true,
    };
    session.messages.push(message);
    this.saveSession(session);
  }

  updateMessage(id: string, updates: Partial<Message>): void {
    const session = this.getSession();
    if (!session) return;

    const index = session.messages.findIndex((m) => m.id === id);
    if (index !== -1) {
      session.messages[index] = { ...session.messages[index], ...updates };
      this.saveSession(session);
    }
  }

  setOpenState(isOpen: boolean): void {
    const session = this.getSession() ?? {
      messages: [],
      lastActivity: Date.now(),
      isOpen: false,
    };
    session.isOpen = isOpen;
    this.saveSession(session);
  }

  getOpenState(): boolean {
    const session = this.getSession();
    return session?.isOpen ?? false;
  }

  clearSession(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  clearMessages(): void {
    const session = this.getSession();
    if (session) {
      session.messages = [];
      this.saveSession(session);
    }
  }

  setSetting(key: string, value: unknown): void {
    try {
      const settings = this.getSettings();
      settings[key] = value;
      sessionStorage.setItem(STORAGE_KEY + '-settings', JSON.stringify(settings));
    } catch {
      // Storage unavailable
    }
  }

  getSetting<T>(key: string, defaultValue: T): T {
    try {
      const settings = this.getSettings();
      return key in settings ? settings[key] as T : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private getSettings(): Record<string, unknown> {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY + '-settings');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }
}
