import type { AxiosRequestConfig } from 'axios';

/** Standard API response wrapper used by Django's MyJSONRenderer. */
export interface ApiResponse<T = unknown> {
  data: T;
  errors: Record<string, string[]> | null;
}

/** Paginated list response from DRF CustomPagination. */
export interface PaginatedResponse<T = unknown> {
  count: number;
  results: T[];
}

/** Shape of error payloads returned by the backend. */
export interface ApiError {
  errorMessage?: string[];
  [field: string]: string[] | undefined;
}

/** Axios config extended with retry flag (used by httpRequest interceptor). */
export interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _serverRetry?: boolean;
  keepEmptyParams?: boolean;
}
