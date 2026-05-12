import { existsSync } from 'fs';
import { resolve } from 'path';
import { ROUTES } from '../routeConfig';

const appDir = resolve(__dirname, '../../../src/app');

const flattenRoutes = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return Object.values(value as Record<string, unknown>).flatMap(flattenRoutes);
};

const routeToPagePath = (route: string): string => {
  return route
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/:([a-zA-Z][a-zA-Z0-9_]*)/g, '[$1]');
};

const pageExists = (route: string): boolean => {
  const pagePath = routeToPagePath(route);
  const candidates = [
    resolve(appDir, pagePath, 'page.tsx'),
    resolve(appDir, pagePath, 'page.ts'),
    resolve(appDir, pagePath, 'page.jsx'),
    resolve(appDir, pagePath, 'page.js'),
  ];
  return candidates.some(existsSync);
};

describe('route config page existence', () => {
  const routes = Array.from(new Set(flattenRoutes(ROUTES)))
    .filter((route) => route && route !== '*');

  it.each(routes)('%s points to a real app page', (route) => {
    expect(pageExists(route)).toBe(true);
  });
});
