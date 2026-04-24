/**
 * Centralized API endpoint auth configuration.
 *
 * DEFAULT POLICY: all endpoints REQUIRE authentication.
 * Only endpoints explicitly listed here are treated as public.
 */

/** Exact URLs that never need a token (login, register, etc.) */
const PUBLIC_EXACT_URLS: ReadonlySet<string> = new Set([
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
 * Keep these as specific as possible.
 */
const PUBLIC_PREFIX_URLS: readonly string[] = [
  // Public catalog data (read-only, no admin)
  'common/careers/',
  'common/cities/',
  'common/districts/',
  'common/wards/',

  // Public job search
  'job/web/search/',

  // Public company info
  'info/web/companies/',

  // Public content
  'content/web/banner',
  'content/web/feedbacks/',
  'content/web/articles/',

  // Interview invite (public token-based access)
  'interview/web/sessions/invite/',
];

/** Regex-based public endpoints for dynamic routes that must stay narrow. */
const PUBLIC_REGEX_URLS: readonly RegExp[] = [
  // Public job listing page
  /^job\/web\/job-posts\/(?:\?.*)?$/,
  // Public job detail by slug/id (single segment only)
  /^job\/web\/job-posts\/[^/]+\/(?:\?.*)?$/,
];

/** Prefixes that are always private, even if they overlap public patterns. */
const PRIVATE_PREFIX_OVERRIDES: readonly string[] = [
  'job/web/job-posts/job-posts-saved/',
];

/**
 * Check if a URL is a public endpoint (no auth token needed).
 *
 * Logic:
 * 1. Any URL containing '/admin/' is always private.
 * 2. Private overrides always win.
 * 3. Exact match against PUBLIC_EXACT_URLS.
 * 4. Prefix match against PUBLIC_PREFIX_URLS.
 * 5. Regex match against PUBLIC_REGEX_URLS.
 */
export const isPublicEndpoint = (url: string | undefined): boolean => {
  const safeUrl = String(url || '');
  if (!safeUrl) return false;

  if (/(?:^|\/)admin\//.test(safeUrl)) return false;
  if (PRIVATE_PREFIX_OVERRIDES.some((pfx) => safeUrl.startsWith(pfx))) return false;

  if (PUBLIC_EXACT_URLS.has(safeUrl)) return true;
  if (PUBLIC_PREFIX_URLS.some((pfx) => safeUrl.startsWith(pfx))) return true;

  return PUBLIC_REGEX_URLS.some((pattern) => pattern.test(safeUrl));
};

/** Check if URL is the auth token endpoint (used for refresh logic). */
export const isAuthTokenEndpoint = (url: string | undefined): boolean => {
  const safeUrl = String(url || '');
  return safeUrl === 'auth/token/' || safeUrl === '/auth/token/';
};
