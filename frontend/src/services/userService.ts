import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import { User as UserModel } from '../types/models';
import { PaginatedResponse } from '../types/api';
import { cleanParams } from '../utils/params';
import { normalizePaginatedResponse, unwrapDataResponse } from '../utils/apiResponse';
import type { AdminListParams } from './adminManagementService';

type IdType = string | number;
export type UserStatusResponse = { isActive: boolean };

const withPresign = async <T>(promise: Promise<T>): Promise<T> => {
  const data = await promise;
  return presignInObject(data);
};

const userService = {
  getAllUsers: async (params: AdminListParams = {}): Promise<PaginatedResponse<UserModel>> => {
    const url = 'auth/users/';
    const data = await withPresign(httpRequest.get(url, { params: cleanParams(params) }));
    return normalizePaginatedResponse<UserModel>(data);
  },
  updateUser: (id: IdType, data: Partial<UserModel>): Promise<UserModel> => {
    const url = `auth/users/${id}/`;
    return withPresign(httpRequest.patch(url, data) as Promise<UserModel>);
  },
  toggleUserStatus: (id: IdType): Promise<UserStatusResponse> => {
    const url = `auth/users/${id}/toggle-active/`;
    return (httpRequest.post(url) as Promise<unknown>).then(unwrapDataResponse<UserStatusResponse>);
  },
  bulkStatus: (ids: IdType[], isActive: boolean): Promise<{ updated: number; isActive: boolean }> => {
    const url = 'auth/users/bulk-status/';
    return (httpRequest.post(url, { ids, isActive }) as Promise<unknown>).then(
      unwrapDataResponse<{ updated: number; isActive: boolean }>,
    );
  },
  deleteUser: (id: IdType): Promise<void> => {
    const url = `auth/users/${id}/`;
    return httpRequest.delete(url);
  },
};

export default userService;
