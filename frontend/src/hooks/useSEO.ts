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

const SITE_NAME = 'Square Tuyá»ƒn Dá»¥ng';
const DEFAULT_IMAGE = 'https://sqstudio.vn/square-icons/logo.svg';
const DEFAULT_DESCRIPTION =
  'Square - Ná»n táº£ng tuyá»ƒn dá»¥ng hÃ ng Ä‘áº§u Viá»‡t Nam. TÃ¬m kiáº¿m hÃ ng nghÃ¬n viá»‡c lÃ m phÃ¹ há»£p, káº¿t ná»‘i vá»›i cÃ¡c nhÃ  tuyá»ƒn dá»¥ng uy tÃ­n.';

/** Upsert a <meta> tag by name or property attribute */
const upsertMeta = (attrName: string, attrValue: string, content: string) => {
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
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

/**
 * useSEO â€” Dynamic SEO meta tag manager.
 * Updates title, description, OG, Twitter Card, and canonical link per page.
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
    const resolvedTitle = title ? `${title} | Square` : 'Square | TÃ¬m viá»‡c nhanh, tuyá»ƒn dá»¥ng hiá»‡u quáº£';
    const resolvedDesc = description || DEFAULT_DESCRIPTION;
    const resolvedImage = image || DEFAULT_IMAGE;
    const resolvedUrl = url || window.location.href;

    // --- Document title ---
    document.title = resolvedTitle;

    // --- Base meta ---
    upsertMeta('name', 'description', resolvedDesc);
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    if (keywords) {
      upsertMeta('name', 'keywords', keywords);
    }

    // --- Canonical ---
    upsertLink('canonical', resolvedUrl);

    // --- Open Graph ---
    upsertMeta('property', 'og:title', resolvedTitle);
    upsertMeta('property', 'og:description', resolvedDesc);
    upsertMeta('property', 'og:image', resolvedImage);
    upsertMeta('property', 'og:url', resolvedUrl);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'vi_VN');

    // --- Twitter Card ---
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', resolvedTitle);
    upsertMeta('name', 'twitter:description', resolvedDesc);
    upsertMeta('name', 'twitter:image', resolvedImage);
  }, [title, description, image, url, type, keywords, noIndex]);
};

export default useSEO;
