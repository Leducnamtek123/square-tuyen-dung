import type { AxiosError } from 'axios';
import type { ApiError } from '../types/api';
import toastMessages from './toastMessages';
import i18n from '../i18n';

type SetError = ((errors: Record<string, unknown>) => void) | null;

const normalizeErrorsToMessage = (errors: unknown): string | null => {
  if (!errors || typeof errors !== 'object') return null;

  const entries = Object.entries(errors as Record<string, unknown>);
  if (entries.length === 0) return null;

  const chunks: string[] = [];
  for (const [, value] of entries) {
    if (Array.isArray(value)) {
      const text = value.map((v) => String(v)).join(' ');
      if (text) chunks.push(text);
      continue;
    }
    if (value !== null && value !== undefined && String(value).trim()) {
      chunks.push(String(value));
    }
  }

  return chunks.length > 0 ? chunks.join(' ') : null;
};

/**
 * Type guard: checks if an unknown value is an Axios error with a response.
 */
const isAxiosError = (error: unknown): error is AxiosError<{ errors?: ApiError }> =>
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
      const errors = res.data?.errors;
      if (errors && 'errorMessage' in errors) {
        const msg = errors.errorMessage;
        toastMessages.error(Array.isArray(msg) ? msg.join(' ') : String(msg));
      } else {
        const normalizedMessage = normalizeErrorsToMessage(errors);
        if (normalizedMessage) {
          toastMessages.error(normalizedMessage);
        } else {
          toastMessages.error(i18n.t('common:errors.generic', 'An error occurred, please try again.'));
        }
        setError && setError((errors || {}) as Record<string, unknown>);
      }
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
        toastMessages.error(i18n.t('common:errors.generic', 'An error occurred, please try again.'));
      }
  }
};

export default errorHandling;
