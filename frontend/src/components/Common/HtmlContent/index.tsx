'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';

type Props = {
  html: string;
  className?: string;
  emptyFallback?: React.ReactNode;
};

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SAFE_IMAGE_PROTOCOLS = new Set(['http:', 'https:']);

const getSafeHtmlUrl = (value: string | null, allowedProtocols: Set<string>): string | undefined => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return undefined;

  const compactValue = trimmedValue.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase();
  const protocolMatch = compactValue.match(/^([a-z][a-z0-9+.-]*:)/);
  if (protocolMatch && !allowedProtocols.has(protocolMatch[1])) {
    return undefined;
  }

  return trimmedValue;
};

export const getSafeHtmlHref = (href: string | null): string | undefined =>
  getSafeHtmlUrl(href, SAFE_LINK_PROTOCOLS);

export const getSafeHtmlImageSrc = (src: string | null): string | undefined =>
  getSafeHtmlUrl(src, SAFE_IMAGE_PROTOCOLS);

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
    case 'img': {
      const src = getSafeHtmlImageSrc(element.getAttribute('src'));
      if (!src) return null;

      return (
        <Image
          key={key}
          src={src}
          alt={element.getAttribute('alt') || ''}
          width={Number(element.getAttribute('width')) || 1200}
          height={Number(element.getAttribute('height')) || 675}
          className="my-4 block max-w-full rounded-md"
          sizes="100vw"
          style={{ width: '100%', height: 'auto' }}
          unoptimized
        />
      );
    }
    case 'figure':
      return <figure key={key} className="my-4">
        {children}
      </figure>;
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
      const href = getSafeHtmlHref(element.getAttribute('href'));
      if (!href) {
        return <span key={key}>{children}</span>;
      }

      return (
        <a
          key={key}
          href={href}
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
