/**
 * Simple Markdown renderer for chat messages.
 * Handles: bold, italic, code, links, lists, headers, line breaks.
 */
export function renderMarkdown(text: string): string {
  let html = escapeHtml(text);

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="ec-code-block"><code>${code.trim()}</code></pre>`;
  });

  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="ec-code-inline">$1</code>');

  // Headers (# ## ###)
  html = html.replace(/^### (.+)$/gm, '<strong class="ec-h3">$1</strong>');
  html = html.replace(/^## (.+)$/gm, '<strong class="ec-h2">$1</strong>');
  html = html.replace(/^# (.+)$/gm, '<strong class="ec-h1">$1</strong>');

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic (*text* or _text_) - be careful not to match inside words
  html = html.replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '<em>$1</em>');
  html = html.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Citations [1], [2], etc. - style them distinctly
  html = html.replace(/\[(\d+)\]/g, '<span class="ec-citation">[$1]</span>');

  // Unordered lists (- item or * item)
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="ec-list">$&</ul>');

  // Ordered lists (1. item)
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> in <ol> (if not already in <ul>)
  html = html.replace(/(?<!<\/ul>)(<li>.*<\/li>\n?)+(?!<\/ul>)/g, (match) => {
    if (!match.includes('<ul')) {
      return `<ol class="ec-list">${match}</ol>`;
    }
    return match;
  });

  // Line breaks (double newline = paragraph, single = <br>)
  html = html.replace(/\n\n+/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraph
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<(?:ul|ol|pre)[^>]*>)/g, '$1');
  html = html.replace(/(<\/(?:ul|ol|pre)>)<\/p>/g, '$1');

  return html;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
