import httpRequest from '../utils/httpRequest';
import { AUTH_CONFIG } from '../configs/constants';
import { ensurePresignedUrl } from '../utils/presignUrl';
import type { AuthProvider, RoleName, TokenPair } from '../types/auth';
import type { User } from '../types/models';
import type { ResetPasswordData } from '../types/auth';
import type { ChangePasswordData } from '../types/auth';
import type { UserSettingsData } from '../types/auth';
import type { EmployerRegisterData } from '../types/auth';
import type { JobSeekerRegisterData } from '../types/auth';

type UserResponse = User & Record<string, unknown>;
type TokenResponse = TokenPair & Record<string, unknown>;

const authService = {
  getToken: (
    email: string,
    password: string,
    roleName: RoleName,
  ): Promise<TokenResponse> => {
    const url = 'auth/token/';
    const data = {
      grant_type: AUTH_CONFIG.PASSWORD_KEY,
      client_id: AUTH_CONFIG.CLIENT_ID,
      client_secret: AUTH_CONFIG.CLIENT_SECRET,
      username: email,
      password,
      role_name: roleName,
    };
    return httpRequest.post(url, data);
  },

  convertToken: (
    clientId: string,
    clientSecret: string,
    provider: AuthProvider,
    token: string,
    redirectUri?: string,
  ): Promise<TokenResponse> => {
    const url = 'auth/convert-token/';
    const data: Record<string, unknown> = {
      grant_type: AUTH_CONFIG.CONVERT_TOKEN_KEY,
      client_id: clientId,
      client_secret: clientSecret,
      backend: provider,
      token,
    };
    if (redirectUri) {
      data.redirect_uri = redirectUri;
    }
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

  revokeToken: (accessToken: string, backend?: AuthProvider): Promise<unknown> => {
    const url = 'auth/revoke-token/';
    const data = {
      client_id: AUTH_CONFIG.CLIENT_ID,
      client_secret: AUTH_CONFIG.CLIENT_SECRET,
      token: accessToken,
      backend,
    };
    return httpRequest.post(url, data);
  },

  checkCreds: (email: string, roleName: RoleName): Promise<unknown> => {
    const url = 'auth/check-creds/';
    return httpRequest.post(url, { email, roleName });
  },

  emailExists: (email: string): Promise<unknown> => {
    const url = 'auth/email-exists/';
    return httpRequest.post(url, { email });
  },

  jobSeekerRegister: (data: JobSeekerRegisterData): Promise<unknown> => {
    const url = 'auth/job-seeker/register/';
    return httpRequest.post(url, data);
  },

  employerRegister: (data: EmployerRegisterData): Promise<unknown> => {
    const url = 'auth/employer/register/';
    return httpRequest.post(url, data);
  },

  sendVerifyEmail: (email: string, platform = 'WEB'): Promise<unknown> => {
    const url = 'auth/send-verify-email/';
    return httpRequest.post(url, { email, platform });
  },

  getUserInfo: async (): Promise<UserResponse> => {
    const url = 'auth/user-info-basic/';
    const data = (await httpRequest.get(url)) as UserResponse;
    if (data?.avatarUrl) {
      data.avatarUrl = await ensurePresignedUrl(data.avatarUrl);
    }
    return data;
  },

  getUserWorkspaces: async (): Promise<UserResponse> => {
    const url = 'auth/user-workspaces/';
    return (await httpRequest.get(url)) as UserResponse;
  },

  updateUser: async (data: Partial<User>): Promise<UserResponse> => {
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

  changePassword: (data: ChangePasswordData): Promise<unknown> => {
    const url = 'auth/change-password/';
    return httpRequest.put(url, data);
  },

  forgotPassword: (data: { email: string; platform?: string }): Promise<unknown> => {
    const url = 'auth/forgot-password/';
    return httpRequest.post(url, data);
  },

  resetPassword: (data: ResetPasswordData): Promise<unknown> => {
    const url = 'auth/reset-password/';
    return httpRequest.post(url, data);
  },

  getUserSettings: (): Promise<unknown> => {
    const url = 'auth/settings/';
    return httpRequest.get(url);
  },

  updateUserSettings: (data: UserSettingsData): Promise<unknown> => {
    const url = 'auth/settings/';
    return httpRequest.put(url, data);
  },
};

export default authService;
