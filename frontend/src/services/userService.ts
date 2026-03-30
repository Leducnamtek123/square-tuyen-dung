import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import { User as UserModel } from '../types/models';
import { PaginatedResponse } from '../types/api';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const withPresign = async <T>(promise: Promise<T>): Promise<T> => {
  const data = await promise;
  return presignInObject(data) as any as T;
};

const userService = {
  getAllUsers: (params: AnyRecord = {}): Promise<PaginatedResponse<UserModel>> => {
    const url = 'auth/users/';
    return withPresign(httpRequest.get<PaginatedResponse<UserModel>>(url, { params })) as any as Promise<PaginatedResponse<UserModel>>;
  },
  updateUser: (id: IdType, data: AnyRecord): Promise<UserModel> => {
    const url = `auth/users/${id}/`;
    return withPresign(httpRequest.patch<UserModel>(url, data)) as any as Promise<UserModel>;
  },
  toggleUserStatus: (id: IdType): Promise<UserModel> => {
    const url = `auth/users/${id}/toggle-active/`;
    return httpRequest.post<UserModel>(url) as any as Promise<UserModel>;
  },
  deleteUser: (id: IdType): Promise<void> => {
    const url = `auth/users/${id}/`;
    return httpRequest.delete(url);
  },
};

export default userService;
