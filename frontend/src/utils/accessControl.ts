import { ROLES_NAME } from '@/configs/constants';
import type { User } from '@/types/models';

export const canAccessJobSeekerPortal = (user?: User | null): boolean => {
  if (!user || typeof user !== 'object') return false;
  const roleName = (user as any).roleName ?? (user as any).role_name ?? (user as any).role;
  const normalizedRole = typeof roleName === 'string' ? roleName.trim().toUpperCase() : '';

  if (normalizedRole === ROLES_NAME.ADMIN || normalizedRole === 'ADMIN') {
    return false;
  }
  if (normalizedRole === ROLES_NAME.EMPLOYER || normalizedRole === 'EMPLOYER') {
    return false;
  }
  if (normalizedRole === ROLES_NAME.JOB_SEEKER || normalizedRole === 'JOB_SEEKER' || normalizedRole === 'CANDIDATE') {
    return true;
  }
  if (Array.isArray(user.workspaces) && user.workspaces.some((w) => w.type === 'job_seeker')) {
    return true;
  }
  if (Boolean(user.jobSeekerProfileId || user.jobSeekerProfile)) {
    return true;
  }
  return false;
};
