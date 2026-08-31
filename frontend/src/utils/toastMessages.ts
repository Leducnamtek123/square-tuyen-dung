import { toast } from 'sonner';

type ToastKind = 'success' | 'error' | 'warn' | 'info';

const showToast = (kind: ToastKind, message: string) => {
  if (!message) return;
  switch (kind) {
    case 'success':
      toast.success(message, { duration: 3000 });
      break;
    case 'error':
      toast.error(message, { duration: 3500 });
      break;
    case 'warn':
      toast.warning(message, { duration: 3000 });
      break;
    case 'info':
      toast.info(message, { duration: 3000 });
      break;
  }
};

const toastMessages = {
  success: (message: string) => showToast('success', message),
  error: (message: string) => showToast('error', message),
  warn: (message: string) => showToast('warn', message),
  info: (message: string) => showToast('info', message),
  dismiss: (id?: string | number) => toast.dismiss(id),
};

export { toast };
export default toastMessages;

