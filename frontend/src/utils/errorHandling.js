import toastMessages from './toastMessages';

const errorHandling = (error, setError = null) => {

    const res = error?.response;

  // network error or other non-response case

  if (!res) {

    toastMessages.error('Unable to connect to server, please check your network.');

    setError && setError({ detail: 'Network error' });

    return;

  }

  switch (res.status) {

    case 400:

      const errors = res.data?.errors;

      if (errors && 'errorMessage' in errors) {

        toastMessages.error(errors.errorMessage.join(' '));

      } else {

        setError && setError(errors);

      }

      break;

    case 403:

      toastMessages.error('You do not have permission, please go back!');

      break;

    default:

      toastMessages.error('An error occurred, please try again!');

  }

};

export default errorHandling;
