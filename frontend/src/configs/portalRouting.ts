type PortalType = 'admin' | 'employer' | 'jobseeker';

type LanguageCode = 'en' | 'vi';

const normalizeLanguage = (language?: string | null): LanguageCode => {
  const code = (language || 'vi').split('-')[0].split('_')[0].toLowerCase();
  return code === 'en' ? 'en' : 'vi';
};

const isPrefixMatch = (pathname: string, prefix: string): boolean => {
  if (!prefix) return false;
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
};

const stripPrefix = (pathname: string, prefix: string): string => {
  if (!isPrefixMatch(pathname, prefix)) {
    return pathname;
  }

  const stripped = pathname.slice(prefix.length);
  if (!stripped.length) return '/';
  return stripped.startsWith('/') ? stripped : `/${stripped}`;
};

const EMPLOYER_PREFIXES = ['/employer', '/nha-tuyen-dung'] as const;
const ADMIN_PREFIXES = ['/admin', '/quan-tri'] as const;

export const getPreferredLanguage = (): LanguageCode => {
  let i18nLanguage = null;
  if (typeof window !== 'undefined') {
    try {
      i18nLanguage = window.localStorage?.getItem('i18nextLng');
    } catch {
      // Ignore SecurityError if localStorage is blocked
    }
  }
  return normalizeLanguage(i18nLanguage || 'vi');
};

export const getPortalPrefix = (portal: PortalType, language?: string | null): string => {
  const normalizedLanguage = normalizeLanguage(language || undefined);
  if (portal === 'admin') {
    return normalizedLanguage === 'en' ? '/admin' : '/quan-tri';
  }
  if (portal === 'employer') {
    return normalizedLanguage === 'en' ? '/employer' : '/nha-tuyen-dung';
  }
  return '';
};

export const detectPortalFromPath = (pathname = '/'): PortalType => {
  if (ADMIN_PREFIXES.some((prefix) => isPrefixMatch(pathname, prefix))) {
    return 'admin';
  }
  if (EMPLOYER_PREFIXES.some((prefix) => isPrefixMatch(pathname, prefix))) {
    return 'employer';
  }
  return 'jobseeker';
};

export const isAdminPortalPath = (pathname = '/'): boolean =>
  detectPortalFromPath(pathname) === 'admin';

export const isEmployerPortalPath = (pathname = '/'): boolean =>
  detectPortalFromPath(pathname) === 'employer';

export const stripPortalPrefix = (pathname = '/'): string => {
  const portal = detectPortalFromPath(pathname);
  if (portal === 'admin') {
    for (const prefix of ADMIN_PREFIXES) {
      const stripped = stripPrefix(pathname, prefix);
      if (stripped !== pathname) return stripped;
    }
  }
  if (portal === 'employer') {
    for (const prefix of EMPLOYER_PREFIXES) {
      const stripped = stripPrefix(pathname, prefix);
      if (stripped !== pathname) return stripped;
    }
  }
  return pathname || '/';
};

export const buildPortalPath = (
  portal: PortalType,
  childPath = '/',
  language: string | null | undefined = 'vi'
): string => {
  const prefix = getPortalPrefix(portal, language);
  const normalizedChild =
    childPath && childPath !== '/' ? `/${childPath.replace(/^\/+/, '')}` : '/';

  if (!prefix) {
    return normalizedChild;
  }
  if (normalizedChild === '/') {
    return prefix;
  }
  return `${prefix}${normalizedChild}`;
};

export const normalizePortalPath = (
  pathname = '/',
  language: string | null | undefined = 'vi'
): string => {
  const portal = detectPortalFromPath(pathname);
  if (portal === 'jobseeker') {
    return pathname || '/';
  }
  const childPath = stripPortalPrefix(pathname);
  return buildPortalPath(portal, childPath, language);
};
