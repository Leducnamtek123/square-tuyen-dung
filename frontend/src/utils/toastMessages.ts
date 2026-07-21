import { toast } from 'react-toastify';

type ToastKind = 'success' | 'error' | 'warn' | 'info';

const showToast = (kind: ToastKind, message: string) => {
  const toastId = `${kind}:${message}`;
  if (toast.isActive(toastId)) {
    return;
  }

  toast[kind](message, {
    theme: 'colored',
    delay: 0,
    toastId,
  });
};

const toastMessages = {
  success: (message: string) => showToast('success', message),
  error: (message: string) => showToast('error', message),
  warn: (message: string) => showToast('warn', message),
  info: (message: string) => showToast('info', message),
};

export default toastMessages;
