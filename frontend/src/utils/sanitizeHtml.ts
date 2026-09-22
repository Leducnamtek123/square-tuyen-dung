import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML to prevent XSS attacks using industry-standard isomorphic-dompurify.
 * Works reliably across both SSR and browser environments.
 * Strips dangerous tags (script, style, iframe, object, embed, form) and malicious attributes.
 */
const sanitizeHtml = (rawHtml: string | undefined | null): string => {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  });
};

export default sanitizeHtml;
