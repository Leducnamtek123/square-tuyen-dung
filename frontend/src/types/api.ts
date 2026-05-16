import type { AxiosRequestConfig } from 'axios';

/** Paginated list response from DRF CustomPagination. */
export interface PaginatedResponse<T = unknown> {
  count: number;
  results: T[];
}

/** Generic table row for export/download payloads. */
export type ExportTableRow = Record<string, string | number | boolean | null | undefined>;

/** Shape of error payloads returned by the backend. */
export interface ApiError {
  errorMessage?: string[] | string;
  [field: string]: string[] | string | undefined;
}

/** Axios config extended with retry flag (used by httpRequest interceptor). */
export interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryWithoutAuth?: boolean;
  _serverRetry?: boolean;
  keepEmptyParams?: boolean;
}
