'use client';

import { useEffect } from 'react';

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
            Hệ thống gặp sự cố
          </h1>
          <p style={{ color: '#666', maxWidth: '480px', marginBottom: '2rem' }}>
            Đã xảy ra lỗi nghiêm trọng. Vui lòng thử tải lại trang.
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
            Tải lại trang
          </button>
        </div>
      </body>
    </html>
  );
}
