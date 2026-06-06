import { ROLES_NAME, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import type { AppNotification } from '@/hooks/useNotifications';

export const isExternalNotificationTarget = (target: string) => /^https?:\/\//i.test(target);

const normalizePath = (path?: string | null) => {
  if (!path) return null;
  if (isExternalNotificationTarget(path)) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

const localizeNotificationPath = (path: string | null, language?: string | null) => {
  if (!path || isExternalNotificationTarget(path)) return path;
  return localizeRoutePath(path, language || 'vi');
};

const routePath = (route: string, language?: string | null) =>
  localizeNotificationPath(`/${route}`, language);

const buildRoute = (route: string, value: string, paramKey = ':slug') =>
  route.replace(new RegExp(`${paramKey}`, 'g'), value);

export const getNotificationTargetPath = (
  notification: AppNotification,
  roleName?: string,
  language?: string | null
): string | null => {
  const explicitPath = normalizePath(notification.link || notification.url);
  if (explicitPath) return localizeNotificationPath(explicitPath, language);

  switch (notification.type) {
    case 'SYSTEM':
      if (roleName === ROLES_NAME.ADMIN) return routePath(ROUTES.ADMIN.DASHBOARD, language);
      if (roleName === ROLES_NAME.EMPLOYER) return routePath(ROUTES.EMPLOYER.DASHBOARD, language);
      return '/';
    case 'EMPLOYER_VIEWED_RESUME':
    case 'EMPLOYER_SAVED_RESUME':
      return routePath(ROUTES.JOB_SEEKER.MY_COMPANY, language);
    case 'APPLY_STATUS':
      return routePath(ROUTES.JOB_SEEKER.MY_JOB, language);
    case 'COMPANY_FOLLOWED':
      return routePath(ROUTES.EMPLOYER.PROFILE, language);
    case 'POST_VERIFY_RESULT':
      return routePath(ROUTES.EMPLOYER.JOB_POST, language);
    case 'POST_VERIFY_REQUIRED':
      return routePath(ROUTES.ADMIN.JOBS, language);
    case 'APPLY_JOB': {
      const resumeSlug = notification.APPLY_JOB?.resume_slug;
      if (!resumeSlug) return routePath(ROUTES.EMPLOYER.APPLIED_PROFILE, language);
      return routePath(buildRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, resumeSlug), language);
    }
    case 'NEW_MESSAGE':
      if (roleName === ROLES_NAME.EMPLOYER) return routePath(ROUTES.EMPLOYER.CHAT, language);
      if (roleName === ROLES_NAME.ADMIN) return routePath(ROUTES.ADMIN.CHAT, language);
      return routePath(ROUTES.JOB_SEEKER.CHAT, language);
    default:
      return null;
  }
};
