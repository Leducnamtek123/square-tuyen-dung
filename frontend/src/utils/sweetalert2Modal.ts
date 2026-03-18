import Swal from 'sweetalert2';

const confirmModal = (
  func: () => void,
  title = '',
  text = '',
  icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'success',
  showCancelButton = true,
  confirmButtonText = 'Đồng ý',
  cancelButtonText = 'Hủy'
): Promise<void> => {
  return Swal.fire({
    title: title,
    html: text,
    icon: icon,
    confirmButtonColor: '#1976d2',
    showCancelButton: showCancelButton,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
  }).then((result) => {
    if (result.isConfirmed) {
      func();
    }
  });
};

const errorModal = (title = '', text = ''): Promise<unknown> => {
  return Swal.fire({
    icon: 'error',
    title: title,
    html: text,
    confirmButtonColor: '#1976d2',
  });
};

export { confirmModal, errorModal };
