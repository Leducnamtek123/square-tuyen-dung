/**
 * Route Localization — Powered by routeConfig.ts (single source of truth)
 *
 * Provides helpers to translate route paths between Vietnamese and English.
 */

import { VI_TO_EN_MAP, EN_TO_VI_MAP } from './routeConfig';

type LanguageCode = 'en' | 'vi';

const normalizeLanguage = (language?: string | null): LanguageCode => {
  const code = (language || 'vi').split('-')[0].split('_')[0].toLowerCase();
  return code === 'en' ? 'en' : 'vi';
};

const localizePathSegment = (segment: string, language?: string | null): string => {
  if (!segment || segment.startsWith(':') || segment === '*') {
    return segment;
  }

  const normalizedLanguage = normalizeLanguage(language);
  if (normalizedLanguage === 'en') {
    return VI_TO_EN_MAP[segment] || segment;
  }

  return EN_TO_VI_MAP[segment] || segment;
};

const splitPathAndSuffix = (path = ''): { pathname: string; suffix: string } => {
  const queryIndex = path.indexOf('?');
  const hashIndex = path.indexOf('#');
  const hasQuery = queryIndex >= 0;
  const hasHash = hashIndex >= 0;

  if (!hasQuery && !hasHash) {
    return { pathname: path, suffix: '' };
  }

  let cutIndex = path.length;
  if (hasQuery) cutIndex = Math.min(cutIndex, queryIndex);
  if (hasHash) cutIndex = Math.min(cutIndex, hashIndex);

  return {
    pathname: path.slice(0, cutIndex),
    suffix: path.slice(cutIndex),
  };
};

export const localizeRoutePath = (path: string, language: string): string => {
  if (typeof path !== 'string' || !path.length) {
    return path;
  }

  const { pathname, suffix } = splitPathAndSuffix(path);
  const hasLeadingSlash = pathname.startsWith('/');

  const localizedPathname = pathname
    .split('/')
    .map((segment) => localizePathSegment(segment, language))
    .join('/');

  return `${hasLeadingSlash ? localizedPathname : localizedPathname.replace(/^\//, '')}${suffix}`;
};

export const getLocalizedRouteVariants = (path: string): string[] => {
  if (typeof path !== 'string' || !path.length || path === '*') {
    return [path];
  }

  const viPath = localizeRoutePath(path, 'vi');
  const enPath = localizeRoutePath(path, 'en');
  return [...new Set([viPath, enPath])];
};
