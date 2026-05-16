import { isPublicEndpoint, isAuthTokenEndpoint } from '../../configs/apiEndpoints';

describe('apiEndpoints', () => {
  describe('isPublicEndpoint', () => {
    it('returns false for empty/undefined URL', () => {
      expect(isPublicEndpoint(undefined)).toBe(false);
      expect(isPublicEndpoint('')).toBe(false);
    });

    // Exact match public URLs
    it.each([
      'auth/token/',
      'auth/convert-token/',
      'auth/job-seeker/register/',
      'auth/employer/register/',
      'auth/check-creds/',
      'auth/email-exists/',
      'auth/forgot-password/',
      'auth/reset-password/',
      'auth/send-verify-email/',
      'auth/firebase-login/',
    ])('returns true for exact public URL: %s', (url) => {
      expect(isPublicEndpoint(url)).toBe(true);
    });

    // Prefix-based public URLs
    it.each([
      'common/careers/',
      'common/careers/?page=1',
      'common/cities/',
      'common/cities/?pageSize=100',
      'common/districts/',
      'common/wards/',
      'job/web/job-posts/',
      'job/web/job-posts/123/',
      'job/web/job-posts/senior-react-dev/',
      'job/web/search/',
      'info/web/companies/',
      'info/web/companies/5/',
      'content/web/banner',
      'content/web/feedbacks/',
      'interview/web/sessions/invite/',
    ])('returns true for public prefix URL: %s', (url) => {
      expect(isPublicEndpoint(url)).toBe(true);
    });

    // Admin endpoints — MUST be private even under public prefixes
    it.each([
      'common/admin/careers/',
      'common/admin/careers/?page=1&pageSize=10',
      'common/admin/cities/',
      'common/admin/cities/?pageSize=100',
      'common/admin/districts/',
      'common/admin/districts/5/',
      'common/admin/wards/',
      'job/web/admin/job-posts-activity/',
      'job/web/admin/job-post-notifications/',
      'info/web/admin/companies/',
      'info/web/admin/job-seeker-profiles/',
      'info/web/admin/resumes/',
      'content/web/admin/banners/',
      'content/web/admin/feedbacks/',
    ])('returns false for admin URL: %s', (url) => {
      expect(isPublicEndpoint(url)).toBe(false);
    });

    // Other private URLs
    it.each([
      'info/web/job-seeker-profiles/',
      'job/web/employer/job-posts/',
      'job/web/job-posts/job-posts-saved/',
      'job/web/job-posts/job-posts-saved/?page=1&pageSize=10',
      'job/web/job-posts/123/save/',
      'info/web/companies/square-e2e/followed/',
      'some/random/private/endpoint/',
    ])('returns false for non-public URL: %s', (url) => {
      expect(isPublicEndpoint(url)).toBe(false);
    });
  });

  describe('isAuthTokenEndpoint', () => {
    it('returns true for auth/token/ (with and without leading slash)', () => {
      expect(isAuthTokenEndpoint('auth/token/')).toBe(true);
      expect(isAuthTokenEndpoint('/auth/token/')).toBe(true);
    });

    it('returns false for other URLs', () => {
      expect(isAuthTokenEndpoint('auth/convert-token/')).toBe(false);
      expect(isAuthTokenEndpoint(undefined)).toBe(false);
      expect(isAuthTokenEndpoint('')).toBe(false);
    });
  });
});
