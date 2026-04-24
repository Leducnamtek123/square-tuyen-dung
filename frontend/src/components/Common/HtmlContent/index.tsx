'use client';

import React, { useMemo } from 'react';

type Props = {
  html: string;
  className?: string;
  emptyFallback?: React.ReactNode;
};

const stripTags = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|ul|ol)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/\s{2,}/g, ' ')
    .trim();

const renderNode = (node: Node, key: string): React.ReactNode => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as HTMLElement;
  const children = Array.from(element.childNodes).map((child, index) =>
    renderNode(child, `${key}-${index}`)
  );

  switch (element.tagName.toLowerCase()) {
    case 'br':
      return <br key={key} />;
    case 'p':
      return (
        <p key={key} className="mb-4 last:mb-0">
          {children}
        </p>
      );
    case 'strong':
      return <strong key={key}>{children}</strong>;
    case 'em':
      return <em key={key}>{children}</em>;
    case 'a':
      return (
        <a
          key={key}
          href={element.getAttribute('href') || '#'}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    case 'ul':
      return (
        <ul key={key} className="mb-4 list-disc pl-5">
          {children}
        </ul>
      );
    case 'ol':
      return (
        <ol key={key} className="mb-4 list-decimal pl-5">
          {children}
        </ol>
      );
    case 'li':
      return <li key={key}>{children}</li>;
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
      return React.createElement(
        element.tagName.toLowerCase(),
        { key, className: 'mb-3 font-semibold' },
        children
      );
    case 'span':
    case 'div':
      return <React.Fragment key={key}>{children}</React.Fragment>;
    default:
      return <React.Fragment key={key}>{children}</React.Fragment>;
  }
};

const HtmlContent = ({ html, className, emptyFallback = null }: Props) => {
  const parserReady = typeof DOMParser !== 'undefined';
  const content = useMemo(() => {
    if (!html) return emptyFallback;
    if (!parserReady) return stripTags(html);

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return Array.from(doc.body.childNodes).map((node, index) => renderNode(node, `node-${index}`));
  }, [emptyFallback, html, parserReady]);

  if (!html) return <>{emptyFallback}</>;

  return (
    <div className={className} suppressHydrationWarning>
      {content}
    </div>
  );
};

export default HtmlContent;
