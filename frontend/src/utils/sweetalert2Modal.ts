import Swal from 'sweetalert2';

// Modern icon definitions using Material Symbols (filled, rounded)
// Colors aligned with MUI theme
const ICON_CONFIG: Record<string, { svg: string; color: string }> = {
  question: {
    color: '#1976d2',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#1976d2">
      <path d="M479-240q21 0 35.5-14.5T529-290q0-21-14.5-35.5T479-340q-21 0-35.5 14.5T429-290q0 21 14.5 35.5T479-240Zm-36-154h74q0-36 8-56t49-61q20-21 32-42t12-49q0-58-38.5-88.5T484-720q-54 0-90 28.5T347-615l67 27q7-27 28-43.5t47-16.5q28 0 45 15t17 38q0 20-10 36.5T514-524q-49 43-60 70.5T443-394ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
    </svg>`,
  },
  warning: {
    color: '#ed6c02',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#ed6c02">
      <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
    </svg>`,
  },
  success: {
    color: '#2e7d32',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#2e7d32">
      <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
    </svg>`,
  },
  error: {
    color: '#d32f2f',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#d32f2f">
      <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
    </svg>`,
  },
  info: {
    color: '#0288d1',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#0288d1">
      <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
    </svg>`,
  },
};

const getIconHtml = (icon: string) => {
  const cfg = ICON_CONFIG[icon] || ICON_CONFIG['info'];
  return `<div style="
    display:flex;
    align-items:center;
    justify-content:center;
    width:72px;
    height:72px;
    border-radius:50%;
    background:${cfg.color}18;
    margin:0 auto;
  ">${cfg.svg.replace('viewBox=', 'width="40" height="40" viewBox=')}</div>`;
};

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
    iconHtml: getIconHtml(icon),
    customClass: {
      icon: 'swal2-no-border',
    },
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
    iconHtml: getIconHtml('error'),
    customClass: {
      icon: 'swal2-no-border',
    },
    title: title,
    html: text,
    confirmButtonColor: '#d32f2f',
  });
};

export { confirmModal, errorModal };
