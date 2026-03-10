/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import toastMessages from './toastMessages';

const errorHandling = (error, setError = null) => {
    const res = error?.response;

  // network error or other non-response case
  if (!res) {
    toastMessages.error('Không thể kết nối đến máy chủ, vui lòng kiểm tra mạng.');
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
      toastMessages.error('Bạn không có quyền, vui lòng quay lại!');
      break;
    default:
      toastMessages.error('Đã xảy ra lỗi, vui lòng thử lại!');
  }
};

export default errorHandling;

