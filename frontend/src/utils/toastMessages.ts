import { toast } from 'react-toastify';

type ToastKind = 'success' | 'error' | 'warn' | 'info';

const showToast = (kind: ToastKind, message: string) => {
  if (!message) return;
  toast[kind](message, {
    theme: 'light',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

const toastMessages = {
  success: (message: string) => showToast('success', message),
  error: (message: string) => showToast('error', message),
  warn: (message: string) => showToast('warn', message),
  info: (message: string) => showToast('info', message),
};

export default toastMessages;
