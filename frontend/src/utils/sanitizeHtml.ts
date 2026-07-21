/**
 * Sanitize HTML to prevent XSS attacks.
 * Strips dangerous elements (script, iframe, object, embed, etc.)
 * and removes event handler attributes (onclick, onerror, etc.)
 * and javascript: protocol URLs.
 */
const sanitizeHtml = (rawHtml: string | undefined | null): string => {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  if (typeof window === 'undefined') return rawHtml;

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  // Remove dangerous elements
  doc.querySelectorAll('script,style,iframe,object,embed,link,meta,base,form').forEach(
    (node) => node.remove()
  );

  // Remove dangerous attributes
  doc.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = (attr.value || '').trim().toLowerCase();

      // Remove event handlers (onclick, onerror, onload, etc.)
      if (name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }

      // Remove javascript: protocol in href/src/action
      if (
        (name === 'href' || name === 'src' || name === 'action') &&
        value.startsWith('javascript:')
      ) {
        element.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
};

export default sanitizeHtml;
