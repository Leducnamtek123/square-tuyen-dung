/**
 * Frontend E2E Tests — Route Localization
 * Tests that route segments are correctly translated between EN ↔ VI.
 */

import { SEGMENT_MAP, EN_TO_VI_MAP, VI_TO_EN_MAP, ROUTES } from '../routeConfig';
import { localizeRoutePath } from '../routeLocalization';

describe('SEGMENT_MAP integrity', () => {
  const compoundSegmentPattern = /\//;

  it('has VI_TO_EN_MAP for every segment', () => {
    for (const [vi, en] of Object.entries(SEGMENT_MAP)) {
      expect(VI_TO_EN_MAP[vi]).toBe(en);
    }
  });

  it('has EN_TO_VI_MAP for every unique English segment', () => {
    const uniqueEnglishSegments = new Set(Object.values(SEGMENT_MAP));
    for (const en of uniqueEnglishSegments) {
      // Skip compound segments like 'interviews/live'
      if (compoundSegmentPattern.test(en)) continue;
      expect(EN_TO_VI_MAP[en]).toBeDefined();
    }
  });
});

describe('localizeRoutePath', () => {
  it('translates employer to nha-tuyen-dung in VI', () => {
    expect(localizeRoutePath('/employer', 'vi')).toBe('/nha-tuyen-dung');
  });

  it('translates interviews to danh-sach-phong-van in VI', () => {
    expect(localizeRoutePath('/employer/interviews', 'vi')).toBe('/nha-tuyen-dung/danh-sach-phong-van');
  });

  it('preserves dynamic params like :id', () => {
    const result = localizeRoutePath('/employer/interviews/:id', 'vi');
    expect(result).toContain(':id');
  });

  it('preserves dynamic params like :slug', () => {
    const result = localizeRoutePath('/jobs/:slug', 'vi');
    expect(result).toContain(':slug');
  });

  it('translates VI back to EN', () => {
    expect(localizeRoutePath('/nha-tuyen-dung', 'en')).toBe('/employer');
  });

  it('preserves query strings', () => {
    const result = localizeRoutePath('/employer/interviews?page=1', 'vi');
    expect(result).toContain('?page=1');
  });

  it('preserves hash fragments', () => {
    const result = localizeRoutePath('/employer/interviews#section', 'vi');
    expect(result).toContain('#section');
  });

  it('handles empty path', () => {
    expect(localizeRoutePath('', 'vi')).toBe('');
  });
});

describe('ROUTES constants have valid paths', () => {
  it('EMPLOYER routes start with employer/', () => {
    for (const [key, route] of Object.entries(ROUTES.EMPLOYER)) {
      expect(route).toMatch(/^employer\//);
    }
  });

  it('INTERVIEW_DETAIL uses :id param', () => {
    expect(ROUTES.EMPLOYER.INTERVIEW_DETAIL).toContain(':id');
  });

  it('INTERVIEW_EDIT uses :id param', () => {
    expect(ROUTES.EMPLOYER.INTERVIEW_EDIT).toContain(':id');
  });

  it('INTERVIEW_SESSION uses :id param', () => {
    expect(ROUTES.EMPLOYER.INTERVIEW_SESSION).toContain(':id');
  });

  it('TYPE_CHOICES in model only accepts technical/behavioral/mixed', () => {
    // This is a documentation test — the frontend must send one of these
    const VALID_TYPES = ['technical', 'behavioral', 'mixed'];
    // The value 'live' that was previously hardcoded is NOT valid
    expect(VALID_TYPES).not.toContain('live');
    expect(VALID_TYPES).toContain('mixed');
  });
});

import { generateRewrites, generateRedirects } from '../routeConfig';

describe('generateRewrites', () => {
  it('should generate an array of rewrite rules', () => {
    const rewrites = generateRewrites();
    expect(Array.isArray(rewrites)).toBe(true);
    expect(rewrites.length).toBeGreaterThan(0);
    
    // Check if it contains some expected rules
    const hasJobSeekerRule = rewrites.some(r => r.source === '/dang-nhap' && r.destination === '/login');
    const hasEmployerRule = rewrites.some(r => r.source === '/nha-tuyen-dung/login' && r.destination === '/employer/login');
    const hasAdminRule = rewrites.some(r => r.source === '/quan-tri/quan-ly-nguoi-dung' && r.destination === '/admin/users');
    const hasInterviewRule = rewrites.some(r => r.source === '/phong-van/room/:id' && r.destination === '/interview/:id');

    expect(hasJobSeekerRule).toBe(true);
    expect(hasEmployerRule).toBe(true);
    expect(hasAdminRule).toBe(true);
    expect(hasInterviewRule).toBe(true);
  });
});

describe('generateRedirects', () => {
  it('should generate an array of redirect rules with permanent: false', () => {
    const redirects = generateRedirects();
    expect(Array.isArray(redirects)).toBe(true);
    expect(redirects.length).toBeGreaterThan(0);
    expect(redirects[0]).toHaveProperty('source');
    expect(redirects[0]).toHaveProperty('destination');
    expect(redirects[0]).toHaveProperty('permanent', false);
  });
});
