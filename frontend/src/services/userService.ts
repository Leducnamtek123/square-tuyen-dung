import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

type WithPresignInput = Promise<unknown>;

const withPresign = async (promise: WithPresignInput): Promise<unknown> => {
  const data = await promise;
  return presignInObject(data);
};

const userService = {
  getAllUsers: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'auth/users/';
    return withPresign(httpRequest.get(url, { params }));
  },
  updateUser: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `auth/users/${id}/`;
    return withPresign(httpRequest.patch(url, data));
  },
  toggleUserStatus: (id: IdType): Promise<unknown> => {
    const url = `auth/users/${id}/toggle-active/`;
    return httpRequest.post(url);
  },
  deleteUser: (id: IdType): Promise<unknown> => {
    const url = `auth/users/${id}/`;
    return httpRequest.delete(url);
  },
};

export default userService;
