import { toast } from 'react-toastify';

const toastMessages = {
  success: (message: string) =>
    toast.success(message, {
      theme: 'colored',
      delay: 0,
    }),
  error: (message: string) =>
    toast.error(message, {
      theme: 'colored',
      delay: 0,
    }),
  warn: (message: string) =>
    toast.warn(message, {
      theme: 'colored',
      delay: 0,
    }),
  info: (message: string) =>
    toast.info(message, {
      theme: 'colored',
      delay: 0,
    }),
};

export default toastMessages;
