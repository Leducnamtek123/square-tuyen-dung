import httpRequest from '../utils/httpRequest';
import { AUTH_CONFIG } from '../configs/constants';
import { unwrapDataResponse } from '../utils/apiResponse';
import { ensurePresignedUrl } from '../utils/presignUrl';
import type { AuthProvider, RoleName, TokenPair, CheckCredsResponse, EmailExistsResponse } from '../types/auth';
import type { User } from '../types/models';
import type { ResetPasswordData } from '../types/auth';
import type { ChangePasswordData } from '../types/auth';
import type { UserSettingsData } from '../types/auth';
import type { EmployerRegisterData } from '../types/auth';
import type { JobSeekerRegisterData } from '../types/auth';

type UserResponse = User;
type TokenResponse = TokenPair;
interface ConvertTokenPayload {
  grant_type: string;
  client_id: string;
  backend: AuthProvider;
  token: string;
  redirect_uri?: string;
  role_name?: RoleName;
}
interface ActionResponse {
  success?: boolean;
  message?: string;
  successMessage?: string;
  redirectLoginUrl?: string;
  emailVerified?: boolean;
}
let userInfoInFlight: Promise<UserResponse> | null = null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeActionResponse = (raw: unknown): ActionResponse => {
  const value = unwrapDataResponse<unknown>(raw);

  if (!isRecord(value)) {
    return { success: true };
  }

  return { success: true, ...value };
};

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
      username: email,
      password,
      role_name: roleName,
    };
    return Promise.resolve(httpRequest.post(url, data)).then(unwrapDataResponse<TokenResponse>);
  },

  convertToken: (
    clientId: string,
    provider: AuthProvider,
    token: string,
    redirectUri?: string,
    roleName?: RoleName,
  ): Promise<TokenResponse> => {
    const url = 'auth/convert-token/';
    const data: ConvertTokenPayload = {
      grant_type: AUTH_CONFIG.CONVERT_TOKEN_KEY,
      client_id: clientId,
      backend: provider,
      token,
    };
    if (redirectUri) {
      data.redirect_uri = redirectUri;
    }
    if (roleName) {
      data.role_name = roleName;
    }
    return Promise.resolve(httpRequest.post(url, data)).then(unwrapDataResponse<TokenResponse>);
  },

  firebaseLogin: (idToken: string, roleName: RoleName): Promise<TokenResponse> => {
    const url = 'auth/firebase-login/';
    const data = {
      grant_type: 'convert_token',
      client_id: AUTH_CONFIG.CLIENT_ID,
      token: idToken,
      role_name: roleName,
    };
    return Promise.resolve(httpRequest.post(url, data)).then(unwrapDataResponse<TokenResponse>);
  },

  revokeToken: (accessToken: string, backend?: AuthProvider): Promise<ActionResponse> => {
    const url = 'auth/revoke-token/';
    const data = {
      client_id: AUTH_CONFIG.CLIENT_ID,
      token: accessToken,
      backend,
    };
    return Promise.resolve(httpRequest.post(url, data)).then(normalizeActionResponse);
  },

  checkCreds: (email: string, roleName: RoleName): Promise<CheckCredsResponse> => {
    const url = 'auth/check-creds/';
    return Promise.resolve(httpRequest.post(url, { email, roleName })).then(
      unwrapDataResponse<CheckCredsResponse>,
    );
  },

  emailExists: (email: string): Promise<EmailExistsResponse> => {
    const url = 'auth/email-exists/';
    return Promise.resolve(httpRequest.post(url, { email })).then(
      unwrapDataResponse<EmailExistsResponse>,
    );
  },

  jobSeekerRegister: (data: JobSeekerRegisterData): Promise<ActionResponse> => {
    const url = 'auth/job-seeker/register/';
    return Promise.resolve(httpRequest.post(url, data)).then(normalizeActionResponse);
  },

  employerRegister: (data: EmployerRegisterData): Promise<ActionResponse> => {
    const url = 'auth/employer/register/';
    return Promise.resolve(httpRequest.post(url, data)).then(normalizeActionResponse);
  },

  sendVerifyEmail: (email: string, platform = 'WEB'): Promise<ActionResponse> => {
    const url = 'auth/send-verify-email/';
    return Promise.resolve(httpRequest.post(url, { email, platform })).then(normalizeActionResponse);
  },

  getUserInfo: async (): Promise<UserResponse> => {
    if (userInfoInFlight) {
      return userInfoInFlight;
    }

    userInfoInFlight = (async () => {
      const url = 'auth/user-info-basic/';
      const data = unwrapDataResponse<UserResponse>(await httpRequest.get(url));
      if (data?.avatarUrl) {
        data.avatarUrl = await ensurePresignedUrl(data.avatarUrl);
      }
      return data;
    })();

    try {
      return await userInfoInFlight;
    } finally {
      userInfoInFlight = null;
    }
  },

  getUserWorkspaces: async (): Promise<UserResponse> => {
    const url = 'auth/user-workspaces/';
    return unwrapDataResponse<UserResponse>(await httpRequest.get(url));
  },

  updateUser: async (data: Partial<User>): Promise<UserResponse> => {
    const url = 'auth/update-user/';
    const resData = unwrapDataResponse<UserResponse>(await httpRequest.patch(url, data));
    if (resData?.avatarUrl) {
      resData.avatarUrl = await ensurePresignedUrl(resData.avatarUrl);
    }
    return resData;
  },

  updateAvatar: async (data: FormData): Promise<UserResponse> => {
    const url = 'auth/avatar/';
    const resData = unwrapDataResponse<UserResponse>(await httpRequest.put(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }));
    if (resData?.avatarUrl) {
      resData.avatarUrl = await ensurePresignedUrl(resData.avatarUrl);
    }
    return resData;
  },

  deleteAvatar: async (): Promise<UserResponse> => {
    const url = 'auth/avatar/';
    const resData = unwrapDataResponse<UserResponse>(await httpRequest.delete(url));
    if (resData?.avatarUrl) {
      resData.avatarUrl = await ensurePresignedUrl(resData.avatarUrl);
    }
    return resData;
  },

  changePassword: (data: ChangePasswordData): Promise<ActionResponse> => {
    const url = 'auth/change-password/';
    return Promise.resolve(httpRequest.put(url, data)).then(normalizeActionResponse);
  },

  forgotPassword: (data: { email: string; platform?: string }): Promise<ActionResponse> => {
    const url = 'auth/forgot-password/';
    return Promise.resolve(httpRequest.post(url, { ...data, platform: data.platform || 'WEB' })).then(normalizeActionResponse);
  },

  resetPassword: (data: ResetPasswordData): Promise<ActionResponse> => {
    const url = 'auth/reset-password/';
    return Promise.resolve(httpRequest.post(url, data)).then(normalizeActionResponse);
  },

  getUserSettings: (): Promise<UserSettingsData> => {
    const url = 'auth/settings/';
    return Promise.resolve(httpRequest.get(url)).then(unwrapDataResponse<UserSettingsData>);
  },

  updateUserSettings: (data: UserSettingsData): Promise<UserSettingsData> => {
    const url = 'auth/settings/';
    return Promise.resolve(httpRequest.put(url, data)).then(unwrapDataResponse<UserSettingsData>);
  },
};

export default authService;

