/**
 * Centralized API endpoint auth configuration.
 *
 * DEFAULT POLICY: all endpoints REQUIRE authentication.
 * Only endpoints explicitly listed here are treated as public.
 *
 * Why centralize?
 * - Avoids prefix-based guessing (e.g. "common/" is public but "common/admin/" is not)
 * - Single source of truth — easy to audit when adding new endpoints
 * - Eliminates an entire class of auth bypass bugs
 */

/** Exact URLs that never need a token (login, register, etc.) */
export const PUBLIC_EXACT_URLS: ReadonlySet<string> = new Set([
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
  'common/configs/',
  'common/top-careers/',
  'common/all-careers/',
  'common/health/',
]);

/**
 * URL prefixes for public endpoints (no token needed).
 *
 * IMPORTANT: keep these as SPECIFIC as possible.
 * Never add a broad prefix like 'common/' — always use the full
 * public sub-path (e.g. 'common/careers/' not 'common/').
 */
export const PUBLIC_PREFIX_URLS: readonly string[] = [
  // Public catalog data (read-only, no admin)
  'common/careers/',
  'common/cities/',
  'common/districts/',
  'common/wards/',

  // Public job listings & search
  'job/web/job-posts/',
  'job/web/search/',

  // Public company info
  'info/web/companies/',

  // Public content
  'content/web/banner',
  'content/web/feedbacks/',

  // Interview invite (public token-based access)
  'interview/web/sessions/invite/',
];

/**
 * Check if a URL is a public endpoint (no auth token needed).
 *
 * Logic:
 * 1. Any URL containing '/admin/' is ALWAYS private (even under public prefixes)
 * 2. Exact match against PUBLIC_EXACT_URLS
 * 3. Prefix match against PUBLIC_PREFIX_URLS
 */
export const isPublicEndpoint = (url: string | undefined): boolean => {
  const safeUrl = String(url || '');
  if (!safeUrl) return false;

  // Admin paths are NEVER public — short-circuit before other checks
  if (/(?:^|\/)admin\//.test(safeUrl)) return false;

  if (PUBLIC_EXACT_URLS.has(safeUrl)) return true;

  return PUBLIC_PREFIX_URLS.some((pfx) => safeUrl.startsWith(pfx));
};

/** Check if URL is the auth token endpoint (used for refresh logic). */
export const isAuthTokenEndpoint = (url: string | undefined): boolean => {
  const safeUrl = String(url || '');
  return safeUrl === 'auth/token/' || safeUrl === '/auth/token/';
};
