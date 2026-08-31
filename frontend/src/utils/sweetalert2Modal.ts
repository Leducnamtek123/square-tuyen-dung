import { confirmDialogStore, type ModalIconType } from '@/components/Common/ConfirmDialog';

export type { ModalIconType };

export interface SweetAlertResult {
  isConfirmed: boolean;
  isDenied?: boolean;
  isDismissed?: boolean;
  value?: unknown;
}

const confirmModal = (
  func: () => void,
  title = '',
  text = '',
  icon: ModalIconType = 'success',
  showCancelButton = true,
  confirmButtonText = 'Đồng ý',
  cancelButtonText = 'Hủy'
): Promise<void> => {
  return new Promise((resolve) => {
    confirmDialogStore.show({
      title,
      text,
      icon,
      showCancelButton,
      confirmButtonText,
      cancelButtonText,
      onConfirm: () => {
        try {
          func();
        } finally {
          resolve();
        }
      },
      onCancel: () => {
        resolve();
      },
    });
  });
};

const errorModal = (title = '', text = ''): Promise<SweetAlertResult> => {
  return new Promise((resolve) => {
    confirmDialogStore.show({
      title,
      text,
      icon: 'error',
      showCancelButton: false,
      confirmButtonText: 'Đóng',
      onConfirm: () => {
        resolve({ isConfirmed: true, isDenied: false, isDismissed: false });
      },
      onCancel: () => {
        resolve({ isConfirmed: false, isDenied: false, isDismissed: true });
      },
    });
  });
};

export { confirmModal, errorModal };
