import Swal from 'sweetalert2';
import type { SweetAlertResult } from 'sweetalert2';

export type ModalIconType = 'success' | 'error' | 'warning' | 'info' | 'question' | 'logout';

const ICON_CONFIG: Record<ModalIconType, { bg: string; color: string; svg: string }> = {
  logout: {
    bg: '#EFF6FF',
    color: '#2563EB',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>`,
  },
  question: {
    bg: '#EFF6FF',
    color: '#2563EB',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,
  },
  warning: {
    bg: '#FEF3C7',
    color: '#D97706',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,
  },
  success: {
    bg: '#D1FAE5',
    color: '#059669',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>`,
  },
  error: {
    bg: '#FEE2E2',
    color: '#DC2626',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>`,
  },
  info: {
    bg: '#E0F2FE',
    color: '#0284C7',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>`,
  },
};

const getIconHtml = (icon: string) => {
  const cfg = ICON_CONFIG[icon as ModalIconType] || ICON_CONFIG['info'];
  return `<div style="
    display:flex;
    align-items:center;
    justify-content:center;
    width:64px;
    height:64px;
    border-radius:50%;
    background:${cfg.bg};
    margin:0 auto 12px auto;
    box-shadow: 0 4px 12px ${cfg.color}15;
  ">${cfg.svg}</div>`;
};

const confirmModal = (
  func: () => void,
  title = '',
  text = '',
  icon: ModalIconType = 'success',
  showCancelButton = true,
  confirmButtonText = 'Đồng ý',
  cancelButtonText = 'Hủy'
): Promise<void> => {
  const isDanger = icon === 'error' || icon === 'warning';

  return Swal.fire({
    title: title,
    html: text,
    iconHtml: getIconHtml(icon),
    buttonsStyling: false,
    reverseButtons: true,
    showClass: {
      popup: 'saas-swal-show',
      backdrop: 'saas-swal-backdrop-show',
    },
    hideClass: {
      popup: 'saas-swal-hide',
      backdrop: 'saas-swal-backdrop-hide',
    },
    customClass: {
      popup: 'saas-swal-popup',
      title: 'saas-swal-title',
      htmlContainer: 'saas-swal-html',
      actions: 'saas-swal-actions',
      confirmButton: isDanger ? 'saas-swal-confirm-btn saas-swal-confirm-btn-danger' : 'saas-swal-confirm-btn',
      cancelButton: 'saas-swal-cancel-btn',
      icon: 'swal2-no-border',
    },
    showCancelButton: showCancelButton,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
  }).then((result) => {
    if (result.isConfirmed) {
      func();
    }
  });
};

const errorModal = (title = '', text = ''): Promise<SweetAlertResult> => {
  return Swal.fire({
    iconHtml: getIconHtml('error'),
    buttonsStyling: false,
    showClass: {
      popup: 'saas-swal-show',
      backdrop: 'saas-swal-backdrop-show',
    },
    hideClass: {
      popup: 'saas-swal-hide',
      backdrop: 'saas-swal-backdrop-hide',
    },
    customClass: {
      popup: 'saas-swal-popup',
      title: 'saas-swal-title',
      htmlContainer: 'saas-swal-html',
      actions: 'saas-swal-actions',
      confirmButton: 'saas-swal-confirm-btn saas-swal-confirm-btn-danger',
      icon: 'swal2-no-border',
    },
    title: title,
    html: text,
    confirmButtonText: 'Đóng',
  });
};

export { confirmModal, errorModal };

