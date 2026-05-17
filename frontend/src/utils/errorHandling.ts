import type { AxiosError } from 'axios';
import type { ApiError } from '../types/api';
import toastMessages from './toastMessages';
import i18n from '../i18n';
import { isMaintenanceModeError, notifyMaintenanceMode } from './maintenanceMode';

type SetError = ((errors: ApiError) => void) | null;

const humanizeKey = (key: string): string =>
  key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeErrorsToMessage = (errors: unknown, parentKey = ''): string | null => {
  if (!errors) return null;

  if (typeof errors === 'string' || typeof errors === 'number' || typeof errors === 'boolean') {
    return String(errors);
  }

  if (Array.isArray(errors)) {
    const chunks = errors
      .map((item) => normalizeErrorsToMessage(item, parentKey))
      .filter(Boolean) as string[];
    return chunks.length > 0 ? chunks.join(' ') : null;
  }

  if (typeof errors !== 'object') return null;

  const entries = Object.entries(errors as Record<string, unknown>);
  if (entries.length === 0) return null;

  const chunks: string[] = [];
  for (const [key, value] of entries) {
    const text = normalizeErrorsToMessage(value, key);
    if (!text) continue;

    if (key === 'detail' || key === 'message' || key === 'errorMessage' || key === 'non_field_errors') {
      chunks.push(text);
    } else {
      chunks.push(`${humanizeKey(key)}: ${text}`);
    }
  }

  const prefix = parentKey && chunks.length === 1 && !chunks[0].includes(':')
    ? `${humanizeKey(parentKey)}: `
    : '';
  return chunks.length > 0 ? `${prefix}${chunks.join(' ')}` : null;
};

const extractApiErrorMessage = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') return normalizeErrorsToMessage(data);

  const payload = data as {
    error?: { message?: unknown; details?: unknown };
    errors?: unknown;
    detail?: unknown;
    message?: unknown;
  };

  if (payload.error) {
    return (
      normalizeErrorsToMessage(payload.error.details) ||
      normalizeErrorsToMessage(payload.error.message) ||
      normalizeErrorsToMessage(payload.error)
    );
  }

  return (
    normalizeErrorsToMessage(payload.errors) ||
    normalizeErrorsToMessage(payload.detail) ||
    normalizeErrorsToMessage(payload.message) ||
    normalizeErrorsToMessage(data)
  );
};

/**
 * Type guard: checks if an unknown value is an Axios error with a response.
 */
const isAxiosError = (error: unknown): error is AxiosError<Record<string, unknown>> =>
  typeof error === 'object' &&
  error !== null &&
  'isAxiosError' in error &&
  (error as AxiosError).isAxiosError === true;

/**
 * Centralized error handler for API errors.
 *
 * Accepts `unknown` so callers don't need to cast their caught errors.
 * Internally narrows the type to AxiosError when applicable.
 *
 * Uses i18n for user-facing messages instead of hardcoded strings.
 */
const errorHandling = (
  error: unknown,
  setError: SetError = null,
): void => {
  if (isMaintenanceModeError(error)) {
    notifyMaintenanceMode(error);
    return;
  }

  // If it's not an Axios error, show a generic network/unknown error
  if (!isAxiosError(error)) {
    console.error('[errorHandling] Non-Axios error:', error);
    toastMessages.error(i18n.t('common:errors.networkError', 'Unable to connect to server, please check your network.'));
    setError && setError({ detail: 'Network error' });
    return;
  }

  const res = error.response;

  // Network error or other non-response case
  if (!res) {
    toastMessages.error(i18n.t('common:errors.networkError', 'Unable to connect to server, please check your network.'));
    setError && setError({ detail: 'Network error' });
    return;
  }

  switch (res.status) {
    case 400: {
      const message = extractApiErrorMessage(res.data);
      if (message) {
        toastMessages.error(message);
      } else {
        toastMessages.error(i18n.t('common:errors.generic', 'An error occurred, please try again.'));
      }
      setError && setError((res.data?.errors || res.data?.error || {}) as ApiError);
      break;
    }
    case 401:
      toastMessages.error(i18n.t('common:errors.unauthorized', 'Your session has expired, please log in again.'));
      break;
    case 403:
      toastMessages.error(i18n.t('common:errors.forbidden', 'You do not have permission to perform this action.'));
      break;
    case 404:
      toastMessages.error(i18n.t('common:errors.notFound', 'The requested resource was not found.'));
      break;
    case 413:
      toastMessages.error(i18n.t('common:errors.payloadTooLarge', 'The file is too large. Please use a smaller file.'));
      break;
    case 429:
      toastMessages.error(i18n.t('common:errors.tooManyRequests', 'Too many requests, please try again later.'));
      break;
    default:
      if (res.status >= 500) {
        toastMessages.error(i18n.t('common:errors.serverError', 'Server error, please try again later.'));
      } else {
        toastMessages.error(extractApiErrorMessage(res.data) || i18n.t('common:errors.generic', 'An error occurred, please try again.'));
      }
  }
};

export default errorHandling;

