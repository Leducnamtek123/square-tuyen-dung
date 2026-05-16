import { ROLES_NAME, ROUTES } from '@/configs/constants';
import type { AppNotification } from '@/hooks/useNotifications';
import { formatRoute } from './funcUtils';

export const isExternalNotificationTarget = (target: string) => /^https?:\/\//i.test(target);

const normalizePath = (path?: string | null) => {
  if (!path) return null;
  if (isExternalNotificationTarget(path)) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

export const getNotificationTargetPath = (
  notification: AppNotification,
  roleName?: string
): string | null => {
  const explicitPath = normalizePath(notification.link || notification.url);
  if (explicitPath) return explicitPath;

  switch (notification.type) {
    case 'SYSTEM':
      if (roleName === ROLES_NAME.ADMIN) return `/${ROUTES.ADMIN.DASHBOARD}`;
      if (roleName === ROLES_NAME.EMPLOYER) return `/${ROUTES.EMPLOYER.DASHBOARD}`;
      return '/';
    case 'EMPLOYER_VIEWED_RESUME':
    case 'EMPLOYER_SAVED_RESUME':
      return `/${ROUTES.JOB_SEEKER.MY_COMPANY}`;
    case 'APPLY_STATUS':
      return `/${ROUTES.JOB_SEEKER.MY_JOB}`;
    case 'COMPANY_FOLLOWED':
      return `/${ROUTES.EMPLOYER.PROFILE}`;
    case 'POST_VERIFY_RESULT':
      return `/${ROUTES.EMPLOYER.JOB_POST}`;
    case 'POST_VERIFY_REQUIRED':
      return `/${ROUTES.ADMIN.JOBS}`;
    case 'APPLY_JOB': {
      const resumeSlug = notification.APPLY_JOB?.resume_slug;
      if (!resumeSlug) return `/${ROUTES.EMPLOYER.APPLIED_PROFILE}`;
      return `/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, resumeSlug)}`;
    }
    case 'NEW_MESSAGE':
      if (roleName === ROLES_NAME.EMPLOYER) return `/${ROUTES.EMPLOYER.CHAT}`;
      if (roleName === ROLES_NAME.ADMIN) return `/${ROUTES.ADMIN.CHAT}`;
      return `/${ROUTES.JOB_SEEKER.CHAT}`;
    default:
      return null;
  }
};
