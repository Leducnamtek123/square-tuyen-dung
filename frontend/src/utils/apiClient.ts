/**
 * Typed API client — wraps httpRequest with proper generics.
 *
 * Usage:
 *   import { api } from '@/utils/apiClient';
 *   const user = await api.get<User>('auth/user-info-basic/');
 *   const jobs = await api.get<PaginatedResponse<JobPost>>('job/web/job-posts/', { params });
 *
 * Because httpRequest's response interceptor already unwraps `response.data.data`,
 * the return value is the actual payload — NOT an AxiosResponse.
 * This wrapper makes that explicit via generics.
 */

import httpRequest from './httpRequest';
import type { AxiosRequestConfig } from 'axios';

export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    httpRequest.get(url, config) as unknown as Promise<T>,

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    httpRequest.post(url, data, config) as unknown as Promise<T>,

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    httpRequest.put(url, data, config) as unknown as Promise<T>,

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    httpRequest.patch(url, data, config) as unknown as Promise<T>,

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    httpRequest.delete(url, config) as unknown as Promise<T>,
};

export default api;
