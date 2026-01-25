import type { ResolvedConfig } from '../types';

export function injectStyles(config: ResolvedConfig): void {
  const styleId = 'enterprise-chat-styles';

  // Don't inject twice
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = getStyles(config);
  document.head.appendChild(style);
}

function getStyles(config: ResolvedConfig): string {
  const { primaryColor, fontFamily } = config.theme;
  const isLeft = config.position === 'bottom-left';

  return `
    /* ===== Animations ===== */
    @keyframes ec-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    @keyframes ec-bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    @keyframes ec-wave {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(20deg); }
      75% { transform: rotate(-15deg); }
    }

    @keyframes ec-blink {
      0%, 45%, 55%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(0.1); }
    }

    @keyframes ec-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    @keyframes ec-thinking-dot {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    @keyframes ec-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes ec-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes ec-typing {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    /* ===== Base Container ===== */
    .ec-widget {
      font-family: ${fontFamily};
      font-size: 14px;
      line-height: 1.5;
      position: fixed;
      bottom: 20px;
      ${isLeft ? 'left: 20px;' : 'right: 20px;'}
      z-index: 999999;
      box-sizing: border-box;
    }

    .ec-widget *, .ec-widget *::before, .ec-widget *::after {
      box-sizing: border-box;
    }

    /* ===== Chat Bubble Button ===== */
    .ec-bubble {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${primaryColor};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ec-bubble:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }

    .ec-bubble:active {
      transform: scale(0.95);
    }

    .ec-bubble.ec-hidden {
      display: none;
    }

    /* ===== Mascot ===== */
    .ec-mascot {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ec-mascot svg {
      width: 100%;
      height: 100%;
    }

    .ec-mascot--idle svg {
      animation: ec-float 3s ease-in-out infinite;
    }

    .ec-mascot--greeting .ec-mascot-arm {
      animation: ec-wave 0.6s ease-in-out 3;
      transform-origin: bottom center;
    }

    .ec-mascot--thinking svg {
      animation: ec-pulse 1s ease-in-out infinite;
    }

    .ec-mascot--responding svg {
      animation: ec-bounce 0.5s ease-in-out infinite;
    }

    .ec-mascot--error svg {
      filter: hue-rotate(320deg);
    }

    .ec-mascot-eyes {
      animation: ec-blink 4s ease-in-out infinite;
      transform-origin: center;
    }

    /* ===== Greeting Tooltip ===== */
    .ec-greeting {
      position: absolute;
      bottom: 70px;
      ${isLeft ? 'left: 0;' : 'right: 0;'}
      background: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      white-space: nowrap;
      animation: ec-slide-up 0.3s ease-out;
      font-size: 14px;
      color: #333;
    }

    .ec-greeting::after {
      content: '';
      position: absolute;
      bottom: -8px;
      ${isLeft ? 'left: 24px;' : 'right: 24px;'}
      width: 16px;
      height: 16px;
      background: white;
      transform: rotate(45deg);
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    /* ===== Chat Window ===== */
    .ec-window {
      position: absolute;
      bottom: 70px;
      ${isLeft ? 'left: 0;' : 'right: 0;'}
      width: 380px;
      max-width: calc(100vw - 40px);
      height: 520px;
      max-height: calc(100vh - 100px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: ec-slide-up 0.3s ease-out;
    }

    .ec-window.ec-hidden {
      display: none;
    }

    .ec-window--expanded {
      width: 600px;
      height: 700px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 100px);
    }

    /* ===== Window Header ===== */
    .ec-header {
      background: ${primaryColor};
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .ec-header-mascot {
      width: 36px;
      height: 36px;
      animation: ec-float 3s ease-in-out infinite;
    }

    .ec-header-mascot svg {
      width: 100%;
      height: 100%;
    }

    .ec-header-title {
      flex: 1;
      font-weight: 600;
      font-size: 16px;
    }

    .ec-header-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      opacity: 0.8;
      transition: opacity 0.2s, background 0.2s;
    }

    .ec-header-btn:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }

    .ec-header-btn svg {
      width: 20px;
      height: 20px;
    }

    /* ===== Settings Panel ===== */
    .ec-settings-panel {
      position: absolute;
      top: 56px;
      right: 12px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      padding: 12px 16px;
      z-index: 10;
      min-width: 200px;
      animation: ec-fade-in 0.15s ease-out;
    }

    .ec-settings-row {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      padding: 4px 0;
    }

    .ec-settings-row input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
      accent-color: ${primaryColor};
    }

    .ec-header-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .ec-header-close:hover {
      opacity: 1;
    }

    .ec-header-close svg {
      width: 20px;
      height: 20px;
    }

    /* ===== Messages Area ===== */
    .ec-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* ===== Welcome Message ===== */
    .ec-welcome {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
      color: #666;
      animation: ec-fade-in 0.3s ease-out;
    }

    .ec-welcome-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: ${primaryColor};
      opacity: 0.7;
    }

    .ec-welcome-icon svg {
      width: 100%;
      height: 100%;
    }

    .ec-welcome-text {
      font-size: 15px;
      line-height: 1.5;
    }

    /* ===== Message Bubbles ===== */
    .ec-message {
      display: flex;
      flex-direction: column;
      gap: 8px;
      animation: ec-fade-in 0.3s ease-out;
    }

    .ec-message--user {
      align-items: flex-end;
    }

    .ec-message--assistant {
      align-items: flex-start;
    }

    .ec-message-content {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      word-wrap: break-word;
    }

    .ec-message--user .ec-message-content {
      background: ${primaryColor};
      color: white;
      border-bottom-right-radius: 4px;
    }

    .ec-message--assistant .ec-message-content {
      background: #f0f0f0;
      color: #333;
      border-bottom-left-radius: 4px;
    }

    /* ===== Markdown Styles ===== */
    .ec-message-content p {
      margin: 0 0 8px 0;
    }

    .ec-message-content p:last-child {
      margin-bottom: 0;
    }

    .ec-message-content strong {
      font-weight: 600;
    }

    .ec-message-content em {
      font-style: italic;
    }

    .ec-message-content a {
      color: ${primaryColor};
      text-decoration: underline;
    }

    .ec-message-content a:hover {
      text-decoration: none;
    }

    .ec-code-inline {
      background: rgba(0, 0, 0, 0.08);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.9em;
    }

    .ec-code-block {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.85em;
      margin: 8px 0;
    }

    .ec-code-block code {
      background: none;
      padding: 0;
    }

    .ec-list {
      margin: 8px 0;
      padding-left: 20px;
    }

    .ec-list li {
      margin: 4px 0;
    }

    .ec-h1, .ec-h2, .ec-h3 {
      display: block;
      margin: 12px 0 8px 0;
    }

    .ec-h1 { font-size: 1.2em; }
    .ec-h2 { font-size: 1.1em; }
    .ec-h3 { font-size: 1em; }

    .ec-citation {
      color: ${primaryColor};
      font-weight: 600;
      font-size: 0.85em;
      vertical-align: super;
      cursor: default;
    }

    /* ===== Thinking Indicator ===== */
    .ec-thinking {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: #f0f0f0;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
    }

    .ec-thinking-dot {
      width: 8px;
      height: 8px;
      background: #888;
      border-radius: 50%;
      animation: ec-thinking-dot 1.4s ease-in-out infinite;
    }

    .ec-thinking-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .ec-thinking-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    /* ===== Sources ===== */
    .ec-sources {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 85%;
    }

    .ec-sources-header {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .ec-source {
      background: #f8f8f8;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .ec-source:hover {
      background: #f0f0f0;
    }

    .ec-source-title {
      font-weight: 500;
      color: ${primaryColor};
      margin-bottom: 4px;
    }

    .ec-source-location {
      color: #888;
      font-size: 11px;
    }

    .ec-source-snippet {
      color: #666;
      margin-top: 6px;
      display: none;
    }

    .ec-source.ec-expanded .ec-source-snippet {
      display: block;
    }

    /* ===== Message Actions ===== */
    .ec-message-actions {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }

    .ec-action-btn {
      background: none;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 4px 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #666;
      transition: all 0.2s;
    }

    .ec-action-btn:hover {
      background: #f0f0f0;
      border-color: #ccc;
    }

    .ec-action-btn.ec-active {
      background: ${primaryColor}15;
      border-color: ${primaryColor};
      color: ${primaryColor};
    }

    .ec-action-btn.ec-locked {
      cursor: default;
      opacity: 0.6;
    }

    .ec-action-btn.ec-locked:hover {
      background: none;
      border-color: #ddd;
    }

    .ec-action-btn.ec-locked.ec-active {
      opacity: 1;
      background: ${primaryColor}15;
      border-color: ${primaryColor};
    }

    .ec-action-btn.ec-locked.ec-active:hover {
      background: ${primaryColor}15;
      border-color: ${primaryColor};
    }

    .ec-action-btn svg {
      width: 14px;
      height: 14px;
    }

    /* ===== Copy Toast ===== */
    .ec-toast {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      animation: ec-fade-in 0.2s ease-out;
      pointer-events: none;
    }

    /* ===== Input Area ===== */
    .ec-input-area {
      padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .ec-input-wrapper {
      flex: 1;
      position: relative;
    }

    .ec-input {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 24px;
      padding: 10px 16px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }

    .ec-input:focus {
      border-color: ${primaryColor};
    }

    .ec-input::placeholder {
      color: #999;
    }

    .ec-input.ec-at-limit {
      border-color: #e53935;
    }

    .ec-input.ec-at-limit:focus {
      border-color: #e53935;
    }

    .ec-char-counter {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 11px;
      color: #999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .ec-char-counter.ec-visible {
      opacity: 1;
    }

    .ec-char-counter.ec-warning {
      color: #ff9800;
    }

    .ec-char-counter.ec-limit {
      color: #e53935;
      font-weight: 500;
    }

    .ec-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${primaryColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, opacity 0.2s;
    }

    .ec-send-btn:hover:not(:disabled) {
      transform: scale(1.05);
    }

    .ec-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ec-send-btn svg {
      width: 20px;
      height: 20px;
      fill: white;
    }

    /* ===== Category Selector ===== */
    .ec-category-selector {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 12px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .ec-selector-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ec-selector-group:first-child {
      flex: 1;
      min-width: 0;
    }

    .ec-category-label {
      font-size: 11px;
      color: #888;
      font-weight: 500;
      white-space: nowrap;
    }

    .ec-category-select {
      flex: 1;
      min-width: 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px 6px;
      font-size: 12px;
      font-family: inherit;
      background: white;
      color: #333;
      cursor: pointer;
      outline: none;
      transition: border-color 0.2s;
    }

    .ec-category-select:focus {
      border-color: ${primaryColor};
    }

    .ec-category-select:hover {
      border-color: #bbb;
    }

    /* Embedding Toggle */
    .ec-toggle-buttons {
      display: flex;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #ddd;
    }

    .ec-widget .ec-toggle-btn {
      padding: 4px 8px;
      font-size: 11px;
      font-family: inherit;
      background: #fff;
      border: none;
      border-right: 1px solid #ddd;
      cursor: pointer;
      color: #666;
    }

    .ec-widget .ec-toggle-btn:last-child {
      border-right: none;
    }

    .ec-widget .ec-toggle-btn:hover {
      background: #f0f0f0;
    }

    .ec-widget .ec-toggle-btn[data-active="true"] {
      background: ${primaryColor};
      color: #fff;
    }

    .ec-widget .ec-toggle-btn[data-active="true"]:hover {
      background: ${primaryColor};
    }

    /* ===== Feedback Prompt ===== */
    .ec-feedback {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #888;
      position: relative;
    }

    .ec-feedback-prompt {
      margin-right: 4px;
    }

    /* ===== Feedback Dialog ===== */
    .ec-feedback-dialog {
      position: absolute;
      bottom: 100%;
      left: 0;
      margin-bottom: 8px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 16px;
      min-width: 280px;
      z-index: 10;
      animation: ec-slide-up 0.2s ease-out;
    }

    .ec-feedback-nudge {
      font-size: 13px;
      color: #666;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .ec-feedback-nudge::before {
      content: '\\2728';
      font-size: 14px;
    }

    .ec-feedback-textarea {
      width: 100%;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      font-family: inherit;
      resize: vertical;
      min-height: 70px;
      outline: none;
      transition: border-color 0.2s;
    }

    .ec-feedback-textarea:focus {
      border-color: ${primaryColor};
    }

    .ec-feedback-textarea::placeholder {
      color: #999;
    }

    .ec-feedback-buttons {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      justify-content: flex-end;
    }

    .ec-feedback-skip {
      background: none;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 13px;
      color: #666;
      cursor: pointer;
      transition: all 0.2s;
    }

    .ec-feedback-skip:hover {
      background: #f5f5f5;
      border-color: #ccc;
    }

    .ec-feedback-submit {
      background: ${primaryColor};
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 13px;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .ec-feedback-submit:hover {
      opacity: 0.9;
    }

    .ec-feedback-thankyou {
      position: absolute;
      bottom: 100%;
      left: 0;
      margin-bottom: 8px;
      background: #4caf50;
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      animation: ec-fade-in 0.2s ease-out;
      white-space: nowrap;
    }

    /* ===== Scrollbar ===== */
    .ec-messages::-webkit-scrollbar {
      width: 6px;
    }

    .ec-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .ec-messages::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 3px;
    }

    .ec-messages::-webkit-scrollbar-thumb:hover {
      background: #aaa;
    }

    /* ===== Responsive ===== */
    @media (max-width: 480px) {
      .ec-window {
        width: calc(100vw - 20px);
        height: calc(100vh - 80px);
        bottom: 70px;
        ${isLeft ? 'left: 10px;' : 'right: 10px;'}
        border-radius: 12px;
      }

      .ec-widget {
        bottom: 10px;
        ${isLeft ? 'left: 10px;' : 'right: 10px;'}
      }
    }
  `;
}
