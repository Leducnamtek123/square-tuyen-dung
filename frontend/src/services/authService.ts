import httpRequest from '../utils/httpRequest';
import { AUTH_CONFIG } from '../configs/constants';
import { ensurePresignedUrl } from '../utils/presignUrl';
import type { AuthProvider, RoleName, TokenPair } from '../types/auth';
import type { User } from '../types/models';

type AnyRecord = Record<string, unknown>;

type TokenResponse = TokenPair & AnyRecord;

type UserResponse = User & AnyRecord;

const authService = {
  getToken: (
    email: string,
    password: string,
    role_name: RoleName
  ): Promise<TokenResponse> => {
    const url = 'auth/token/';
    const data = {
      grant_type: AUTH_CONFIG.PASSWORD_KEY,
      client_id: AUTH_CONFIG.CLIENT_ID,
      client_secret: AUTH_CONFIG.CLIENT_SECRET,
      username: email,
      password: password,
      role_name: role_name,
    };
    return httpRequest.post(url, data);
  },

  convertToken: (
    clientId: string,
    clientSecrect: string,
    provider: AuthProvider,
    token: string
  ): Promise<TokenResponse> => {
    const url = 'auth/convert-token/';
    const data = {
      grant_type: AUTH_CONFIG.CONVERT_TOKEN_KEY,
      client_id: clientId,
      client_secret: clientSecrect,
      backend: provider,
      token: token,
    };
    return httpRequest.post(url, data);
  },

  firebaseLogin: (idToken: string, roleName: RoleName): Promise<TokenResponse> => {
    const url = 'auth/firebase-login/';
    const data = {
      grant_type: 'convert_token',
      client_id: AUTH_CONFIG.CLIENT_ID,
      client_secret: AUTH_CONFIG.CLIENT_SECRET,
      token: idToken,
      role_name: roleName,
    };
    return httpRequest.post(url, data);
  },

  revokToken: (accessToken: string, backend?: AuthProvider): Promise<unknown> => {
    const url = 'auth/revoke-token/';
    const data = {
      client_id: AUTH_CONFIG.CLIENT_ID,
      client_secret: AUTH_CONFIG.CLIENT_SECRET,
      token: accessToken,
      backend: backend,
    };
    return httpRequest.post(url, data);
  },

  checkCreds: (email: string, roleName: RoleName): Promise<unknown> => {
    const url = 'auth/check-creds/';
    const data = {
      email: email,
      roleName: roleName,
    };
    return httpRequest.post(url, data);
  },

  jobSeekerRegister: (data: AnyRecord): Promise<unknown> => {
    const url = 'auth/job-seeker/register/';
    return httpRequest.post(url, data);
  },

  employerRegister: (data: AnyRecord): Promise<unknown> => {
    const url = 'auth/employer/register/';
    return httpRequest.post(url, data);
  },

  sendVerifyEmail: (email: string, platform = 'WEB'): Promise<unknown> => {
    const url = 'auth/send-verify-email/';
    const data = {
      email: email,
      platform: platform,
    };
    return httpRequest.post(url, data);
  },

  getUserInfo: async (): Promise<UserResponse> => {
    const url = 'auth/user-info/';
    const data = (await httpRequest.get(url)) as UserResponse;
    if (data?.avatarUrl) {
      data.avatarUrl = await ensurePresignedUrl(data.avatarUrl);
    }
    return data;
  },

  updateUser: async (data: AnyRecord): Promise<UserResponse> => {
    const url = 'auth/update-user/';
    const resData = (await httpRequest.patch(url, data)) as UserResponse;
    if (resData?.avatarUrl) {
      resData.avatarUrl = await ensurePresignedUrl(resData.avatarUrl);
    }
    return resData;
  },

  updateAvatar: async (data: FormData): Promise<UserResponse> => {
    const url = 'auth/avatar/';
    const resData = (await httpRequest.put(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })) as UserResponse;
    if (resData?.avatarUrl) {
      resData.avatarUrl = await ensurePresignedUrl(resData.avatarUrl);
    }
    return resData;
  },

  deleteAvatar: async (): Promise<UserResponse> => {
    const url = 'auth/avatar/';
    const resData = (await httpRequest.delete(url)) as UserResponse;
    if (resData?.avatarUrl) {
      resData.avatarUrl = await ensurePresignedUrl(resData.avatarUrl);
    }
    return resData;
  },

  changePassword: (data: AnyRecord): Promise<unknown> => {
    const url = 'auth/change-password/';
    return httpRequest.put(url, data);
  },

  forgotPassword: (data: AnyRecord): Promise<unknown> => {
    const url = 'auth/forgot-password/';
    return httpRequest.post(url, data);
  },

  resetPassword: (data: AnyRecord): Promise<unknown> => {
    const url = 'auth/reset-password/';
    return httpRequest.post(url, data);
  },

  getUserSettings: (): Promise<unknown> => {
    const url = 'auth/settings/';
    return httpRequest.get(url);
  },

  updateUserSettings: (data: AnyRecord): Promise<unknown> => {
    const url = 'auth/settings/';
    return httpRequest.put(url, data);
  },
};

export default authService;
