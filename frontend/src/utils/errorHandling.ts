import type { AxiosError } from 'axios';
import type { ApiError } from '../types/api';
import toastMessages from './toastMessages';
import i18n from '../i18n';

type SetError = ((errors: Record<string, unknown>) => void) | null;

/**
 * Centralized error handler for API errors.
 * Uses i18n for user-facing messages instead of hardcoded strings.
 */
const errorHandling = (
  error: AxiosError<{ errors?: ApiError }>,
  setError: SetError = null,
): void => {
  const res = error?.response;

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
        toastMessages.error(errors.errorMessage!.join(' '));
      } else {
        setError && setError(errors as Record<string, unknown>);
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
