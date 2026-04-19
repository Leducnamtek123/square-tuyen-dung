import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import { cleanParams } from '../utils/params';
import type { PaginatedResponse } from '../types/api';
import type { User } from '../types/models';
import type { AdminGeneralStats } from './statisticService';


const withPresign = async <T>(promise: Promise<T>): Promise<T> => {
  const data = await promise;
  return presignInObject(data) as T;
};

export type AdminUserListParams = {
  page?: number;
  pageSize?: number;
  ordering?: string;
  search?: string;
  roleName?: string;
};

const adminService = {
  // user-related admin endpoints
  getUsers: (params: AdminUserListParams = {}): Promise<PaginatedResponse<User>> => {
    // backend does not expose a separate "admin" path for users;
    // the same `auth/users/` viewset is used and guarded by IsAdminUser
    // so we call the regular users endpoint.
    const url = 'auth/users/';
    return withPresign(httpRequest.get<PaginatedResponse<User>>(url, { params: cleanParams(params) }));
  },

  getStats: (): Promise<AdminGeneralStats> => {
    // interview statistics for admin overview
    const url = 'interview/web/statistics/admin-general-statistics/';
    return withPresign(httpRequest.get<AdminGeneralStats>(url));
  },
};

export default adminService;


