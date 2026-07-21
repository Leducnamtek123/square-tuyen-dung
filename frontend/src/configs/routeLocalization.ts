/**
 * Route Localization — Powered by routeConfig.ts (single source of truth)
 *
 * Provides helpers to translate route paths between Vietnamese and English.
 */

import { VI_TO_EN_MAP, EN_TO_VI_MAP, generateRewrites } from './routeConfig';

type LanguageCode = 'en' | 'vi';
type RewriteRule = ReturnType<typeof generateRewrites>[number];
type RoutePatternMatch = {
  params: Record<string, string>;
  rule: RewriteRule;
  index: number;
};

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

const splitRouteSegments = (path: string): string[] =>
  path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

const dynamicSegmentPattern = /^:([a-zA-Z][a-zA-Z0-9_]*)(\*)?$/;

const isCatchAllPattern = (pattern: string): boolean =>
  splitRouteSegments(pattern).some((segment) => dynamicSegmentPattern.test(segment) && segment.endsWith('*'));

const countRouteParams = (pattern: string): number =>
  splitRouteSegments(pattern).filter((segment) => dynamicSegmentPattern.test(segment)).length;

const matchRoutePattern = (pattern: string, pathname: string): Record<string, string> | null => {
  const patternSegments = splitRouteSegments(pattern);
  const pathSegments = splitRouteSegments(pathname);

  if (patternSegments.length !== pathSegments.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let index = 0; index < patternSegments.length; index += 1) {
    const patternSegment = patternSegments[index];
    const pathSegment = pathSegments[index];
    const dynamicMatch = patternSegment.match(dynamicSegmentPattern);

    if (dynamicMatch) {
      if (dynamicMatch[2]) return null;
      params[dynamicMatch[1]] = pathSegment;
      continue;
    }

    if (patternSegment !== pathSegment) {
      return null;
    }
  }

  return params;
};

const buildPathFromPattern = (pattern: string, params: Record<string, string>): string => {
  const hasLeadingSlash = pattern.startsWith('/');
  const builtSegments = splitRouteSegments(pattern).map((segment) => {
    const dynamicMatch = segment.match(dynamicSegmentPattern);
    return dynamicMatch ? params[dynamicMatch[1]] || segment : segment;
  });

  if (builtSegments.length === 0) {
    return hasLeadingSlash ? '/' : '';
  }

  return `${hasLeadingSlash ? '/' : ''}${builtSegments.join('/')}`;
};

let contextualRewriteRules: RewriteRule[] | null = null;

const getContextualRewriteRules = (): RewriteRule[] => {
  if (!contextualRewriteRules) {
    contextualRewriteRules = generateRewrites().filter(
      (rule) => !isCatchAllPattern(rule.source) && !isCatchAllPattern(rule.destination)
    );
  }

  return contextualRewriteRules;
};

const scoreMatch = (
  matchPattern: string,
  targetPattern: string,
  pathname: string,
  index: number
): [number, number, number, number] => {
  const targetSegmentDiff = Math.abs(
    splitRouteSegments(targetPattern).length - splitRouteSegments(pathname).length
  );
  const targetStaticSegments =
    splitRouteSegments(targetPattern).length - countRouteParams(targetPattern);

  return [
    countRouteParams(matchPattern),
    targetSegmentDiff,
    -targetStaticSegments,
    index,
  ];
};

const compareScore = (a: [number, number, number, number], b: [number, number, number, number]) => {
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
};

const localizePathByRewrite = (pathname: string, language?: string | null): string | null => {
  const normalizedLanguage = normalizeLanguage(language);
  const hasLeadingSlash = pathname.startsWith('/');
  const pathForMatch = hasLeadingSlash ? pathname : `/${pathname}`;
  const pathSegments = splitRouteSegments(pathForMatch);

  if (normalizedLanguage === 'en' && pathSegments.length === 1 && VI_TO_EN_MAP[pathSegments[0]]) {
    return null;
  }

  const fromKey = normalizedLanguage === 'vi' ? 'destination' : 'source';
  const toKey = normalizedLanguage === 'vi' ? 'source' : 'destination';
  const matches: RoutePatternMatch[] = [];

  getContextualRewriteRules().forEach((rule, index) => {
    const params = matchRoutePattern(rule[fromKey], pathForMatch);
    if (params) matches.push({ params, rule, index });
  });

  if (!matches.length) {
    return null;
  }

  matches.sort((a, b) =>
    compareScore(
      scoreMatch(a.rule[fromKey], a.rule[toKey], pathForMatch, a.index),
      scoreMatch(b.rule[fromKey], b.rule[toKey], pathForMatch, b.index)
    )
  );

  const localizedPath = buildPathFromPattern(matches[0].rule[toKey], matches[0].params);
  return hasLeadingSlash ? localizedPath : localizedPath.replace(/^\//, '');
};

export const localizeRoutePath = (path: string, language: string): string => {
  if (typeof path !== 'string' || !path.length) {
    return path;
  }

  const { pathname, suffix } = splitPathAndSuffix(path);
  const contextualPathname = localizePathByRewrite(pathname, language);

  if (contextualPathname) {
    return `${contextualPathname}${suffix}`;
  }

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
