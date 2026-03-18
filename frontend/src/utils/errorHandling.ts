import type { AxiosError } from 'axios';
import type { ApiError } from '../types/api';
import toastMessages from './toastMessages';

type SetError = ((errors: Record<string, unknown>) => void) | null;

const errorHandling = (
  error: AxiosError<{ errors?: ApiError }>,
  setError: SetError = null
): void => {
  const res = error?.response;

  // network error or other non-response case
  if (!res) {
    toastMessages.error('Unable to connect to server, please check your network.');
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
    case 403:
      toastMessages.error('You do not have permission, please go back!');
      break;
    default:
      toastMessages.error('An error occurred, please try again!');
  }
};

export default errorHandling;
