import { ROLES_NAME } from '@/configs/constants';
import type { User } from '@/types/models';

export const canAccessJobSeekerPortal = (user?: User | null): boolean => {
  return user?.roleName === ROLES_NAME.JOB_SEEKER;
};
