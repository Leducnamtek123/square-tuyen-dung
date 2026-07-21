import type { AxiosError } from 'axios';

export const MAINTENANCE_MODE_CODE = 'MAINTENANCE_MODE';
export const MAINTENANCE_MODE_EVENT = 'app:maintenance-mode';

export type MaintenanceModeDetail = {
  code: typeof MAINTENANCE_MODE_CODE;
  message?: string;
  status?: number;
  retryAfter?: string | null;
};

type ApiErrorPayload = {
  code?: unknown;
  message?: unknown;
};

type ApiErrorBody = {
  error?: ApiErrorPayload;
  errors?: ApiErrorPayload;
  code?: unknown;
  message?: unknown;
  detail?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asApiErrorBody = (data: unknown): ApiErrorBody | null => {
  if (!isRecord(data)) return null;
  return data as ApiErrorBody;
};

const getAxiosResponse = (
  error: unknown,
): AxiosError<ApiErrorBody>['response'] | undefined => {
  if (!isRecord(error)) return undefined;
  const maybeAxiosError = error as unknown as AxiosError<ApiErrorBody>;
  if (maybeAxiosError.isAxiosError !== true) return undefined;
  return maybeAxiosError.response;
};

const readErrorPayload = (body: ApiErrorBody | null): ApiErrorPayload | null => {
  if (!body) return null;
  if (isRecord(body.error)) return body.error as ApiErrorPayload;
  if (isRecord(body.errors)) return body.errors as ApiErrorPayload;
  return body;
};

const readString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value : undefined;

export const getMaintenanceModeDetail = (
  error: unknown,
): MaintenanceModeDetail | null => {
  const response = getAxiosResponse(error);
  if (response?.status !== 503) return null;

  const body = asApiErrorBody(response.data);
  const payload = readErrorPayload(body);
  const code = readString(payload?.code);

  if (code !== MAINTENANCE_MODE_CODE) return null;

  const retryAfterHeader = response.headers?.['retry-after'];
  const retryAfter = Array.isArray(retryAfterHeader)
    ? retryAfterHeader[0] ?? null
    : retryAfterHeader ?? null;

  return {
    code: MAINTENANCE_MODE_CODE,
    message:
      readString(payload?.message) ||
      readString(body?.message) ||
      readString(body?.detail),
    status: response.status,
    retryAfter: retryAfter ? String(retryAfter) : null,
  };
};

export const isMaintenanceModeError = (error: unknown): boolean =>
  getMaintenanceModeDetail(error) !== null;

export const notifyMaintenanceMode = (error: unknown): void => {
  if (typeof window === 'undefined') return;

  const detail = getMaintenanceModeDetail(error);
  if (!detail) return;

  window.dispatchEvent(
    new CustomEvent<MaintenanceModeDetail>(MAINTENANCE_MODE_EVENT, {
      detail,
    }),
  );
};
