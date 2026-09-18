'use client';
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  keywords?: string;
  noIndex?: boolean;
}

const SITE_NAME = 'InfoHR';

/** Upsert a <meta> tag by name or property attribute */
const upsertMeta = (attrName: string, attrValue: string, content: string) => {
  if (typeof document === 'undefined') return;
  let el = document.querySelector<HTMLMetaElement>(
    `meta[${attrName}="${attrValue}"]`
  );
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

/** Upsert a <link> tag by rel attribute */
const upsertLink = (rel: string, href: string) => {
  if (typeof document === 'undefined') return;
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

/**
 * useSEO – Dynamic SEO meta tag manager for client-side navigation.
 * Updates title, description, OG, Twitter Card, and canonical link per page only when explicitly provided,
 * preserving Next.js App Router server-rendered metadata as the primary source of truth.
 */
const useSEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
  noIndex = false,
}: SEOProps = {}) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Only update document title if title is provided and doesn't already end with InfoHR
    if (title) {
      const cleanTitle = title.replace(/\s*\|\s*InfoHR\s*$/i, '').trim();
      const resolvedTitle = `${cleanTitle} | InfoHR`;
      if (document.title !== resolvedTitle) {
        document.title = resolvedTitle;
      }
      upsertMeta('property', 'og:title', resolvedTitle);
      upsertMeta('name', 'twitter:title', resolvedTitle);
    }

    if (description) {
      const trimmedDesc = description.length > 160 ? description.slice(0, 157) + '...' : description;
      upsertMeta('name', 'description', trimmedDesc);
      upsertMeta('property', 'og:description', trimmedDesc);
      upsertMeta('name', 'twitter:description', trimmedDesc);
    }

    if (noIndex) {
      upsertMeta('name', 'robots', 'noindex, nofollow');
    }

    if (keywords) {
      upsertMeta('name', 'keywords', keywords);
    }

    if (url) {
      upsertLink('canonical', url);
      upsertMeta('property', 'og:url', url);
    }

    if (image) {
      upsertMeta('property', 'og:image', image);
      upsertMeta('name', 'twitter:image', image);
    }

    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'vi_VN');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
  }, [title, description, image, url, type, keywords, noIndex]);
};

export default useSEO;
