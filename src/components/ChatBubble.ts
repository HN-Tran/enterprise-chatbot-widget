import { Mascot } from './Mascot';
import type { ResolvedConfig } from '../types';

export class ChatBubble {
  private element: HTMLButtonElement;
  private mascot: Mascot;
  private greeting: HTMLDivElement | null = null;
  private greetingTimeout: number | null = null;
  private onClick: () => void;

  constructor(config: ResolvedConfig, onClick: () => void) {
    this.onClick = onClick;
    this.mascot = new Mascot();

    this.element = document.createElement('button');
    this.element.className = 'ec-bubble';
    this.element.setAttribute('aria-label', config.labels.title);
    this.element.appendChild(this.mascot.getElement());

    this.element.addEventListener('click', () => {
      this.hideGreeting();
      this.onClick();
    });

    // Show greeting after a short delay
    setTimeout(() => this.showGreeting(), 2000);
  }

  getElement(): HTMLButtonElement {
    return this.element;
  }

  getMascot(): Mascot {
    return this.mascot;
  }

  show(): void {
    this.element.classList.remove('ec-hidden');
  }

  hide(): void {
    this.element.classList.add('ec-hidden');
    this.hideGreeting();
  }

  triggerGreeting(): void {
    // Trigger the greeting animation (after a short delay)
    setTimeout(() => this.showGreeting(), 500);
  }

  private showGreeting(): void {
    if (this.greeting || this.element.classList.contains('ec-hidden')) return;

    this.mascot.setState('greeting');

    this.greeting = document.createElement('div');
    this.greeting.className = 'ec-greeting';
    this.greeting.textContent = 'Hallo! Kann ich Ihnen helfen?';
    this.element.parentElement?.appendChild(this.greeting);

    // Hide after 5 seconds
    this.greetingTimeout = window.setTimeout(() => {
      this.hideGreeting();
    }, 5000);
  }

  private hideGreeting(): void {
    if (this.greetingTimeout) {
      clearTimeout(this.greetingTimeout);
      this.greetingTimeout = null;
    }

    if (this.greeting) {
      this.greeting.remove();
      this.greeting = null;
    }

    if (this.mascot.getState() === 'greeting') {
      this.mascot.setState('idle');
    }
  }
}
