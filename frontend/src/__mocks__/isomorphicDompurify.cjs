const DOMPurify = {
  sanitize: (dirty, _options) => {
    if (!dirty || typeof dirty !== 'string') return '';
    return dirty
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/\bon\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '')
      .replace(/\bhref\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href=""');
  },
};

DOMPurify.default = DOMPurify;

module.exports = DOMPurify;
