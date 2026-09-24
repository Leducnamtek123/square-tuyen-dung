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

export const isEmployerHostname = (hostname?: string): boolean => {
  if (!hostname && typeof window !== 'undefined') {
    hostname = window.location.hostname;
  }
  if (!hostname) return false;
  const h = hostname.toLowerCase().split(':')[0];
  return (
    h.startsWith('employer.') ||
    h.startsWith('ntd.') ||
    h === 'employer.localhost' ||
    h === 'ntd.localhost'
  );
};

export const isAdminHostname = (hostname?: string): boolean => {
  if (!hostname && typeof window !== 'undefined') {
    hostname = window.location.hostname;
  }
  if (!hostname) return false;
  const h = hostname.toLowerCase().split(':')[0];
  return h.startsWith('admin.') || h === 'admin.localhost';
};

export const getPortalPrefix = (portal: PortalType, language?: string | null, hostname?: string): string => {
  if (portal === 'employer' && isEmployerHostname(hostname)) {
    return '';
  }
  if (portal === 'admin' && isAdminHostname(hostname)) {
    return '';
  }
  const normalizedLanguage = normalizeLanguage(language || undefined);
  if (portal === 'admin') {
    return normalizedLanguage === 'en' ? '/admin' : '/quan-tri';
  }
  if (portal === 'employer') {
    return normalizedLanguage === 'en' ? '/employer' : '/nha-tuyen-dung';
  }
  return '';
};

export const detectPortalFromPath = (pathname = '/', hostname?: string): PortalType => {
  if (isEmployerHostname(hostname)) {
    return 'employer';
  }
  if (isAdminHostname(hostname)) {
    return 'admin';
  }
  if (ADMIN_PREFIXES.some((prefix) => isPrefixMatch(pathname, prefix))) {
    return 'admin';
  }
  if (EMPLOYER_PREFIXES.some((prefix) => isPrefixMatch(pathname, prefix))) {
    return 'employer';
  }
  return 'jobseeker';
};

export const isAdminPortalPath = (pathname = '/', hostname?: string): boolean =>
  isAdminHostname(hostname) || detectPortalFromPath(pathname, hostname) === 'admin';

export const isEmployerPortalPath = (pathname = '/', hostname?: string): boolean =>
  isEmployerHostname(hostname) || detectPortalFromPath(pathname, hostname) === 'employer';

export const stripPortalPrefix = (pathname = '/', hostname?: string): string => {
  const portal = detectPortalFromPath(pathname, hostname);
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
  language: string | null | undefined = 'vi',
  hostname?: string
): string => {
  if (portal === 'employer' && isEmployerHostname(hostname)) {
    const normalizedChild = childPath && childPath !== '/' ? `/${childPath.replace(/^\/+/, '')}` : '/';
    return normalizedChild;
  }
  if (portal === 'admin' && isAdminHostname(hostname)) {
    const normalizedChild = childPath && childPath !== '/' ? `/${childPath.replace(/^\/+/, '')}` : '/';
    return normalizedChild;
  }

  const prefix = getPortalPrefix(portal, language, hostname);
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
  language: string | null | undefined = 'vi',
  hostname?: string
): string => {
  const portal = detectPortalFromPath(pathname, hostname);
  if (portal === 'jobseeker') {
    return pathname || '/';
  }
  const childPath = stripPortalPrefix(pathname, hostname);
  return buildPortalPath(portal, childPath, language, hostname);
};
