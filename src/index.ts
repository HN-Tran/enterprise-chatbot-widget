import { ChatWidget } from './widget';
import type { WidgetConfig } from './types';

// Expose to window for global access
declare global {
  interface Window {
    EnterpriseChat: {
      init: (config: WidgetConfig) => ChatWidget;
      version: string;
    };
  }
}

// Export for module usage
export { ChatWidget };
export type { WidgetConfig };

// Global API
window.EnterpriseChat = {
  init: (config: WidgetConfig) => new ChatWidget(config),
  version: '1.0.0',
};

// Auto-initialize from data attributes
function autoInit(): void {
  // Find the script tag with data-auto-init (currentScript doesn't work in IIFE bundles)
  const scripts = document.querySelectorAll('script[data-auto-init]');
  const script = Array.from(scripts).find(s =>
    s.getAttribute('src')?.includes('chatbot-widget')
  ) as HTMLScriptElement | null;

  if (!script) return;

  const config: WidgetConfig = {
    apiUrl: script.dataset.apiUrl,  // Optional - uses baked-in default if not set
    position: (script.dataset.position as 'bottom-right' | 'bottom-left') || undefined,
    theme: script.dataset.primaryColor
      ? { primaryColor: script.dataset.primaryColor }
      : undefined,
  };

  new ChatWidget(config);
}

// Run auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  autoInit();
}
