import axios from 'axios';
import queryString from 'query-string';
import tokenService from '../services/tokenService';
import { AUTH_CONFIG } from '../configs/constants';
import type { RetryAxiosRequestConfig } from '../types/api';
import type { TokenPair } from '../types/auth';

// API endpoints that do not require authentication
const notAuthenticationURL = [
  'auth/token/',
  'auth/convert-token/',
  'auth/job-seeker/register/',
  'auth/employer/register/',
  'auth/check-creds/',
  'auth/email-exists/',
  'auth/forgot-password/',
  'auth/reset-password/',
  'auth/send-verify-email/',
];
const publicEndpointPrefixes = ['interview/web/sessions/invite/'];
// Prefix for API endpoints
const prefix = 'api'

// Use relative path to work with nginx proxy, allow override via env if needed

const baseURL = import.meta.env.VITE_API_BASE || `/${prefix}/`;

const httpRequest = axios.create({
  baseURL,
  headers: {

    'Content-Type': 'application/json',

  },

  paramsSerializer: {

    serialize: (params) => {

      return queryString.stringify(params, { arrayFormat: 'bracket' });

    },

  },

  withCredentials: true,

  timeout: 30000,
});

const refreshClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

const isPublicEndpoint = (url: string | undefined): boolean => {
  const safeUrl = String(url || '');
  if (!safeUrl) return false;
  if (notAuthenticationURL.includes(safeUrl)) return true;
  return publicEndpointPrefixes.some((prefix) => safeUrl.startsWith(prefix));
};

const isAuthTokenEndpoint = (url: string | undefined): boolean => {
  const safeUrl = String(url || '');
  return safeUrl === 'auth/token/' || safeUrl === '/auth/token/';
};

const unwrapResponse = (response: { data?: { data?: unknown } }) =>
  response?.data?.data ?? response?.data;

let refreshPromise: Promise<unknown> | null = null;

httpRequest.interceptors.request.use(
  (config) => {
    const accessToken = tokenService.getAccessTokenFromCookie();

    if (accessToken && !isPublicEndpoint(config.url)) {
      const headers = (config.headers ?? {}) as any;
      headers.Authorization = `Bearer ${accessToken}`;
      config.headers = headers;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);

  }

);

httpRequest.interceptors.response.use(

  (response) => {

    // Backend wraps payload in { data, errors } via MyJSONRenderer.

    // Return payload directly; fall back to raw response for legacy endpoints.

    const payload = response.data?.data ?? response.data;

    if (payload && typeof payload === 'object' && !('data' in payload)) {

      try {

        Object.defineProperty(payload, 'data', {

          value: payload,

          enumerable: false,

        });

      } catch {

        // ignore if payload is non-extensible

      }

    }

    return payload;

  },

  async (error) => {
    const originalConfig = error.config as RetryAxiosRequestConfig;
    const status = error.response?.status;

    if (status !== 401 || !originalConfig) {
      return Promise.reject(error);
    }

    if (isPublicEndpoint(originalConfig.url)) {
      return Promise.reject(error);
    }

    if (originalConfig._retry || isAuthTokenEndpoint(originalConfig.url)) {
      tokenService.removeAccessTokenAndRefreshTokenFromCookie();
      return Promise.reject(error);
    }

    const refreshToken = tokenService.getRefreshTokenFromCookie();
    if (!refreshToken) {
      tokenService.removeAccessTokenAndRefreshTokenFromCookie();
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
        refreshResponse as { data?: { data?: unknown } }
      ) as Partial<TokenPair> & { accessToken?: string; refreshToken?: string };
      const accessToken = refreshData.access_token || refreshData.accessToken || null;
      const newRefreshToken =
        refreshData.refresh_token || refreshData.refreshToken || refreshToken;

      if (!accessToken) {
        tokenService.removeAccessTokenAndRefreshTokenFromCookie();
        return Promise.reject(error);
      }

      tokenService.saveAccessTokenAndRefreshTokenToCookie(
        accessToken,
        newRefreshToken,
        tokenService.getProviderFromCookie()
      );

      originalConfig._retry = true;
      originalConfig.headers = originalConfig.headers || {};
      originalConfig.headers['Authorization'] = `Bearer ${accessToken}`;
      return httpRequest(originalConfig);
    } catch (refreshError) {
      refreshPromise = null;
      tokenService.removeAccessTokenAndRefreshTokenFromCookie();
      return Promise.reject(refreshError);
    }
  }
);

export default httpRequest;
