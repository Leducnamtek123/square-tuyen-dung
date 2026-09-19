/**
 * Sanitize HTML to prevent XSS attacks.
 * Strips dangerous elements (script, iframe, object, embed, etc.)
 * and removes event handler attributes (onclick, onerror, etc.)
 * and dangerous protocols (javascript:, vbscript:, data:, etc.).
 * Works reliably across both SSR and browser/DOMParser environments.
 */
const sanitizeHtml = (rawHtml: string | undefined | null): string => {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  let html = rawHtml;

  // 1. Strip dangerous elements with content (works across both SSR and client)
  html = html.replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  html = html.replace(/<\s*(script|style|iframe|object|embed|link|meta|base|form)[^>]*\/?>/gi, '');

  // 2. If DOMParser is available (browser or jsdom), parse and deep clean
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      doc.querySelectorAll('script,style,iframe,object,embed,link,meta,base,form').forEach((node) => node.remove());

      doc.querySelectorAll('*').forEach((element) => {
        Array.from(element.attributes).forEach((attr) => {
          const name = attr.name.toLowerCase();
          const value = (attr.value || '').trim().toLowerCase();

          // Remove event handlers (onclick, onerror, onload, etc.)
          if (name.startsWith('on')) {
            element.removeAttribute(attr.name);
          }

          // Remove dangerous protocols in href/src/action
          if (
            (name === 'href' || name === 'src' || name === 'action') &&
            (value.startsWith('javascript:') || value.startsWith('vbscript:') || value.startsWith('data:text/html'))
          ) {
            element.removeAttribute(attr.name);
          }
        });
      });

      return doc.body.innerHTML;
    } catch {
      // fallback below
    }
  }

  // 3. Fallback for pure SSR without DOMParser: strip inline event handlers and javascript:
  html = html.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');
  html = html.replace(/(href|src|action)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '');

  return html;
};

export default sanitizeHtml;
