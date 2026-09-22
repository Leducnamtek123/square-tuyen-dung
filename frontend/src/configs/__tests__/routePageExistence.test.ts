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
  const isHtmlRoute = pagePath.endsWith('.html');
  const htmlParentDir = isHtmlRoute ? pagePath.replace(/[^/]+\.html$/, '') : '';
  const candidates = [
    resolve(appDir, pagePath, 'page.tsx'),
    resolve(appDir, pagePath, 'page.ts'),
    resolve(appDir, pagePath, 'page.jsx'),
    resolve(appDir, pagePath, 'page.js'),
    resolve(appDir, '(candidate)', pagePath, 'page.tsx'),
    resolve(appDir, '(candidate)', pagePath, 'page.ts'),
    resolve(appDir, 'employer', pagePath, 'page.tsx'),
    resolve(appDir, 'admin', pagePath, 'page.tsx'),
    ...(isHtmlRoute
      ? [
          resolve(appDir, htmlParentDir, '[slug].html', 'page.tsx'),
          resolve(appDir, htmlParentDir, '[slug].html', 'page.ts'),
        ]
      : []),
  ];
  return candidates.some(existsSync);
};

describe('route config page existence', () => {
  const deprecatedAdminRoutes = new Set([
    'admin/hrm',
    'admin/hrm/dashboard',
    'admin/hrm/employees',
    'admin/hrm/onboarding',
    'admin/hrm/departments',
    'admin/hrm/contracts',
    'admin/hrm/leaves',
    'admin/hrm/attendances',
    'admin/hrm/payroll',
    'admin/hrm/org-chart',
    'admin/questions',
    'admin/question-groups',
    'admin/job-notifications',
  ]);

  const routes = Array.from(new Set(flattenRoutes(ROUTES)))
    .filter((route) => route && route !== '*' && !deprecatedAdminRoutes.has(route));

  it.each(routes)('%s points to a real app page', (route) => {
    expect(pageExists(route)).toBe(true);
  });
});
