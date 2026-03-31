import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import { User as UserModel } from '../types/models';
import { PaginatedResponse } from '../types/api';

type IdType = string | number;

const withPresign = async <T>(promise: Promise<T>): Promise<T> => {
  const data = await promise;
  return presignInObject(data);
};

const userService = {
  getAllUsers: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<UserModel>> => {
    const url = 'auth/users/';
    return withPresign(httpRequest.get(url, { params }) as Promise<PaginatedResponse<UserModel>>);
  },
  updateUser: (id: IdType, data: Partial<UserModel>): Promise<UserModel> => {
    const url = `auth/users/${id}/`;
    return withPresign(httpRequest.patch(url, data) as Promise<UserModel>);
  },
  toggleUserStatus: (id: IdType): Promise<UserModel> => {
    const url = `auth/users/${id}/toggle-active/`;
    return httpRequest.post(url) as Promise<UserModel>;
  },
  deleteUser: (id: IdType): Promise<void> => {
    const url = `auth/users/${id}/`;
    return httpRequest.delete(url);
  },
};

export default userService;
