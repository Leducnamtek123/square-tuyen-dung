'use client';

import { useEffect } from 'react';
import i18n from '@/i18n';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="vi">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {i18n.t('errors.system.title', { defaultValue: 'Hệ thống gặp sự cố / System Error' })}
          </h1>
          <p style={{ color: '#666', maxWidth: '480px', marginBottom: '2rem' }}>
            {i18n.t('errors.system.message', { defaultValue: 'Đã xảy ra lỗi nghiêm trọng. Vui lòng thử tải lại trang. / A critical error has occurred. Please try reloading the page.' })}
          </p>
          <button
            onClick={reset}
            style={{
              padding: '12px 32px',
              fontSize: '1rem',
              backgroundColor: '#1a407d',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {i18n.t('common:actions.reload', { defaultValue: 'Tải lại trang / Reload Page' })}
          </button>
        </div>
      </body>
    </html>
  );
}
