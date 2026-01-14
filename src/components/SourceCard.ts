import type { Source } from '../types';

export class SourceCard {
  private element: HTMLDivElement;

  constructor(source: Source) {
    this.element = document.createElement('div');
    this.element.className = 'ec-source';
    this.element.innerHTML = `
      <div class="ec-source-title">[${source.index}] ${this.escapeHtml(source.title)}</div>
      <div class="ec-source-location">${this.escapeHtml(source.location)}</div>
    `;

    // If URI exists, clicking opens the file
    if (source.uri) {
      this.element.style.cursor = 'pointer';
      this.element.title = 'Dokument öffnen';
      this.element.addEventListener('click', () => {
        window.open(source.uri!, '_blank');
      });
    }
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
