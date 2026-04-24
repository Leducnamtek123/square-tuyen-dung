import axios from 'axios';
import queryString from 'query-string';
import tokenService from '../services/tokenService';
import { AUTH_CONFIG } from '../configs/constants';
import { isPublicEndpoint, isAuthTokenEndpoint } from '../configs/apiEndpoints';
import type { RetryAxiosRequestConfig } from '../types/api';
import type { TokenPair } from '../types/auth';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ParamsRecord } from './params';

type RefreshTokenPayload = Partial<TokenPair> & {
  access_token?: string;
  refresh_token?: string;
};

interface HttpServiceInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete'> {
  (config: AxiosRequestConfig): Promise<any>;
  (url: string, config?: AxiosRequestConfig): Promise<any>;
  get<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  post<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  put<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  patch<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  delete<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
}
import { cleanParams } from './params';
import { camelizeKeys } from './camelCase';

// Prefix for API endpoints
const prefix = 'api';

// Use relative path to work with nginx proxy, allow override via env if needed
const baseURL = process.env.NEXT_PUBLIC_API_BASE || `/${prefix}/`;

const httpRequest = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    serialize: (params) => {
      return queryString.stringify(params, { arrayFormat: 'none' });
    },
  },
  withCredentials: true,
  timeout: 30000,
}) as HttpServiceInstance;

export const refreshClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

const unwrapResponse = (response: { data?: { data?: unknown } }) =>
  response?.data?.data ?? response?.data;

const dispatchAuthExpired = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }
};

type RefreshTokenResponse = AxiosResponse<{ data?: unknown }>;
let refreshPromise: Promise<RefreshTokenResponse> | null = null;

httpRequest.interceptors.request.use(
  (config) => {
    const retryConfig = config as RetryAxiosRequestConfig;
    if (retryConfig.params && !retryConfig.keepEmptyParams) {
      retryConfig.params = cleanParams(retryConfig.params as ParamsRecord);
    }

    // NOTE: Do NOT auto-convert to snake_case here.
    // The Django backend serializers use camelCase field names with explicit
    // source= mappings (e.g. companyName → source="company_name").
    // Converting to snake_case breaks the API (400 Bad Request).

    const accessToken = tokenService.getAccessTokenFromCookie();

    if (accessToken && !isPublicEndpoint(config.url)) {
      config.headers = config.headers ?? {};
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

httpRequest.interceptors.response.use(
  (response) => {
    // Backend wraps payload in { data, errors } via MyJSONRenderer.
    // Return payload directly; fall back to raw response for legacy endpoints.
    const payload = response.data?.data ?? response.data;

    // Auto-transform snake_case keys → camelCase
    return camelizeKeys(payload);
  },

  async (error) => {
    const originalConfig = error.config as RetryAxiosRequestConfig;
    const status = error.response?.status;
    const method = String(originalConfig?.method || 'get').toLowerCase();

    if (
      originalConfig &&
      method === 'get' &&
      typeof status === 'number' &&
      status >= 500 &&
      status < 600 &&
      !originalConfig._serverRetry
    ) {
      originalConfig._serverRetry = true;
      await new Promise((resolve) => setTimeout(resolve, 300));
      return httpRequest(originalConfig);
    }

    if (status !== 401 || !originalConfig) {
      if (status && status >= 400) {
        console.error(`[API Error] ${method.toUpperCase()} ${originalConfig?.url}`, {
          status,
          params: originalConfig?.params,
          data: error.response?.data,
        });
      }
      return Promise.reject(error);
    }

    if (isPublicEndpoint(originalConfig.url)) {
      return Promise.reject(error);
    }

    if (originalConfig._retry || isAuthTokenEndpoint(originalConfig.url)) {
      tokenService.removeAccessTokenAndRefreshTokenFromCookie();
      dispatchAuthExpired();
      return Promise.reject(error);
    }

    const refreshToken = tokenService.getRefreshTokenFromCookie();
    if (!refreshToken) {
      tokenService.removeAccessTokenAndRefreshTokenFromCookie();
      dispatchAuthExpired();
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      refreshPromise = refreshClient.post('auth/token/', {
        grant_type: AUTH_CONFIG.REFRESH_TOKEN_GRANT,
        client_id: AUTH_CONFIG.CLIENT_ID,
        client_secret: AUTH_CONFIG.CLIENT_SECRET,
        refresh_token: refreshToken,
      });
    }

    try {
      const refreshResponse = await refreshPromise;
      refreshPromise = null;

      const refreshData = unwrapResponse(
        refreshResponse as { data?: { data?: unknown } },
      ) as RefreshTokenPayload;
      const accessToken =
        refreshData.access_token ||
        refreshData.accessToken ||
        null;
      const newRefreshToken =
        refreshData.refresh_token ||
        refreshData.refreshToken ||
        refreshToken;

      if (!accessToken) {
        tokenService.removeAccessTokenAndRefreshTokenFromCookie();
        dispatchAuthExpired();
        return Promise.reject(error);
      }

      tokenService.saveAccessTokenAndRefreshTokenToCookie(
        accessToken,
        newRefreshToken,
        tokenService.getProviderFromCookie(),
      );

      originalConfig._retry = true;
      originalConfig.headers = originalConfig.headers || {};
      originalConfig.headers['Authorization'] = `Bearer ${accessToken}`;
      return httpRequest(originalConfig);
    } catch (refreshError: unknown) {
      const refreshErrorResponse = (refreshError as { response?: { status?: number; data?: unknown } }).response;
      console.error(`[Auth Error] Refresh token failed for ${originalConfig.url}`, {
        status: refreshErrorResponse?.status,
        data: refreshErrorResponse?.data,
      });
      refreshPromise = null;
      tokenService.removeAccessTokenAndRefreshTokenFromCookie();
      dispatchAuthExpired();
      return Promise.reject(refreshError);
    }
  },
);

export default httpRequest;


