'use client';

import { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        px: 3,
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Đã có lỗi xảy ra
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
        Hệ thống gặp sự cố không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu lỗi vẫn tiếp tục.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={reset}
        sx={{ textTransform: 'none', borderRadius: 2 }}
      >
        Thử lại
      </Button>
    </Box>
  );
}
