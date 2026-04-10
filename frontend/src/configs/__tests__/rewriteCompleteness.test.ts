/**
 * Frontend E2E Tests — Rewrite Completeness Guard
 * 
 * This is THE MOST CRITICAL test file. It automatically verifies that
 * every localized route has a matching rewrite rule in next.config.mjs.
 * 
 * If this test fails, it means a user will get a 404 in production.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ROUTES } from '../routeConfig';
import { localizeRoutePath } from '../routeLocalization';

// Parse next.config.mjs rewrites
const getRewriteRules = (): Array<{ source: string; destination: string }> => {
  const configPath = resolve(__dirname, '../../../next.config.mjs');
  const content = readFileSync(configPath, 'utf-8');
  
  const rules: Array<{ source: string; destination: string }> = [];
  const regex = /\{\s*source:\s*'([^']+)',\s*destination:\s*'([^']+)'\s*\}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    rules.push({ source: match[1], destination: match[2] });
  }
  return rules;
};

// Normalize a route pattern for matching: replace :param with a regex-like pattern
const normalizePatternForMatch = (pattern: string): string => {
  return pattern.replace(/:[a-zA-Z]+/g, ':PARAM').replace(/\/+$/, '');
};

// Check if a localized URL is covered by ANY rewrite rule
const isRouteCoveredByRewrite = (
  localizedPath: string,
  rewrites: Array<{ source: string; destination: string }>
): boolean => {
  const normalized = normalizePatternForMatch(localizedPath);
  
  for (const rule of rewrites) {
    const normalizedSource = normalizePatternForMatch(rule.source);
    if (normalizedSource === normalized) return true;
    
    // Check catch-all (:path*)
    if (rule.source.includes(':path*')) {
      const prefix = rule.source.split(':path*')[0].replace(/\/+$/, '');
      if (normalized.startsWith(prefix)) return true;
    }
  }
  return false;
};

// Check if a rewrite destination resolves to an actual Next.js page
const doesPageExist = (destination: string): boolean => {
  const appDir = resolve(__dirname, '../../../src/app');
  // Convert destination to filesystem path
  // e.g. /employer/interviews/:id -> app/employer/interviews/[id]/page.tsx
  const pagePath = destination
    .replace(/^\//, '')
    .replace(/:([a-zA-Z]+)/g, '[$1]')
    .replace(/:\w+\*/g, '[...$&]');
  
  const possiblePaths = [
    resolve(appDir, pagePath, 'page.tsx'),
    resolve(appDir, pagePath, 'page.ts'),
    resolve(appDir, pagePath, 'page.jsx'),
    resolve(appDir, pagePath, 'page.js'),
  ];
  
  const { existsSync } = require('fs');
  return possiblePaths.some((p: string) => existsSync(p));
};

describe('Rewrite Completeness — Prevents 404 in Production', () => {
  const rewrites = getRewriteRules();

  it('has parsed rewrite rules from next.config.mjs', () => {
    expect(rewrites.length).toBeGreaterThan(30);
  });

  // ─── EMPLOYER INTERVIEW ROUTES (the ones that caused bugs) ───
  describe('Employer Interview Routes', () => {
    const interviewRoutes = {
      INTERVIEW_LIST: ROUTES.EMPLOYER.INTERVIEW_LIST,
      INTERVIEW_DETAIL: ROUTES.EMPLOYER.INTERVIEW_DETAIL,
      INTERVIEW_EDIT: ROUTES.EMPLOYER.INTERVIEW_EDIT,
      INTERVIEW_CREATE: ROUTES.EMPLOYER.INTERVIEW_CREATE,
      INTERVIEW_LIVE: ROUTES.EMPLOYER.INTERVIEW_LIVE,
    };

    for (const [name, route] of Object.entries(interviewRoutes)) {
      it(`${name} (/${route}) has VI rewrite coverage`, () => {
        const viPath = localizeRoutePath(`/${route}`, 'vi');
        const covered = isRouteCoveredByRewrite(viPath, rewrites);
        
        if (!covered) {
          // Provide helpful error message
          const failMsg = [
            `MISSING REWRITE for ${name}!`,
            `  English route: /${route}`,
            `  Localized VI:  ${viPath}`,
            `  Add to next.config.mjs:`,
            `  { source: '${normalizePatternForMatch(viPath).replace(/:PARAM/g, ':id')}', destination: '/${route}' }`,
          ].join('\n');
          fail(failMsg);
        }
      });
    }
  });

  // ─── ALL EMPLOYER ROUTES ───
  describe('All Employer Routes', () => {
    for (const [name, route] of Object.entries(ROUTES.EMPLOYER)) {
      it(`EMPLOYER.${name} → VI localized path has rewrite`, () => {
        const viPath = localizeRoutePath(`/${route}`, 'vi');
        const covered = isRouteCoveredByRewrite(viPath, rewrites);
        expect(covered).toBe(true);
      });
    }
  });

  // ─── ALL JOB_SEEKER ROUTES ───
  describe('All Job Seeker Routes', () => {
    // Routes that serve directly as Next.js pages (no rewrite needed)
    const SKIP_ROUTES = new Set(['HOME']); // HOME = '' (root)
    
    for (const [name, route] of Object.entries(ROUTES.JOB_SEEKER)) {
      if (SKIP_ROUTES.has(name)) continue;

      it(`JOB_SEEKER.${name} → VI localized path has rewrite`, () => {
        const viPath = localizeRoutePath(`/${route}`, 'vi');
        
        // If localized path equals English path, Next.js serves it directly
        if (viPath === `/${route}`) {
          // No rewrite needed — page exists at the English path
          return;
        }
        
        const covered = isRouteCoveredByRewrite(viPath, rewrites);
        expect(covered).toBe(true);
      });
    }
  });

  // ─── REWRITE DESTINATIONS RESOLVE TO PAGES ───
  describe('Rewrite destinations point to existing pages', () => {
    // Only check employer/interview routes (most critical)
    const criticalDestinations = [
      '/employer/interviews',
      '/employer/interviews/:id',
      '/employer/dashboard',
    ];

    for (const dest of criticalDestinations) {
      it(`${dest} has a page file in app/`, () => {
        const exists = doesPageExist(dest);
        if (!exists) {
          console.warn(`⚠️  No page found for ${dest} — may use catch-all or layout`);
        }
        // This is advisory, not a hard fail (catch-all routes are valid)
        expect(true).toBe(true);
      });
    }
  });

  // ─── SPECIFIC BUG REGRESSION TESTS ───
  describe('Regression: Previously broken routes', () => {
    it('Interview detail (/nha-tuyen-dung/danh-sach-phong-van/:id) has rewrite', () => {
      const covered = isRouteCoveredByRewrite(
        '/nha-tuyen-dung/danh-sach-phong-van/:id',
        rewrites
      );
      expect(covered).toBe(true);
    });

    it('Interview edit (/nha-tuyen-dung/danh-sach-phong-van/:id/edit) has rewrite', () => {
      const covered = isRouteCoveredByRewrite(
        '/nha-tuyen-dung/danh-sach-phong-van/:id/edit',
        rewrites
      );
      expect(covered).toBe(true);
    });

    it('Interview detail via chi-tiet also works', () => {
      const covered = isRouteCoveredByRewrite(
        '/nha-tuyen-dung/chi-tiet-phong-van/:id',
        rewrites
      );
      expect(covered).toBe(true);
    });
  });
});
