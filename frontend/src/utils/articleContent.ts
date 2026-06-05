export const getArticleTextContent = (html: string) => {
  if (!html) return '';

  if (typeof document !== 'undefined') {
    const container = document.createElement('div');
    container.innerHTML = html;
    return (container.textContent || '').replace(/\u00a0/g, ' ').trim();
  }

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const hasArticleTextContent = (html: string) =>
  getArticleTextContent(html).length > 0;
