import type { Source } from '../types';

export class SourceCard {
  private element: HTMLDivElement;

  constructor(source: Source) {
    this.element = document.createElement('div');
    this.element.className = 'ec-source';

    // File type badge from source_type (set during ingestion)
    const typeLabel = this.getTypeLabel(source.source_type);
    const typeBadge = typeLabel ? ` <span class="ec-source-type">[${typeLabel}]</span>` : '';

    this.element.innerHTML = `
      <div class="ec-source-title">[${source.index}]${typeBadge} ${this.escapeHtml(source.title)}</div>
      <div class="ec-source-location">${this.escapeHtml(source.location)}</div>
    `;

    // If download_url exists, make clickable
    if (source.download_url) {
      this.element.classList.add('ec-source--clickable');
      this.element.title = 'Dokument öffnen';
      this.element.addEventListener('click', () => {
        window.open(source.download_url!, '_blank');
      });
    }
  }

  getElement(): HTMLDivElement {
    return this.element;
  }

  private getTypeLabel(sourceType?: string): string | null {
    if (!sourceType) return null;
    const labelMap: Record<string, string> = {
      'pdf': 'PDF',
      'docx': 'WORD',
      'doc': 'WORD',
      'xlsx': 'EXCEL',
      'xls': 'EXCEL',
      'pptx': 'PPT',
      'ppt': 'PPT',
      'html': 'WEB',
      'htm': 'WEB',
      'txt': 'TXT',
      'csv': 'CSV',
    };
    return labelMap[sourceType.toLowerCase()] || sourceType.toUpperCase();
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
