'use client';

import { useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Admin Subsystem Error:', error);
  }, [error]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'error.light',
          bgcolor: 'background.paper',
          maxWidth: 520,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom color="text.primary">
          Đã xảy ra sự cố trong trang Quản trị
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 420 }}>
          {error?.message || 'Hệ thống gặp sự cố không mong muốn khi tải dữ liệu trang quản trị. Bạn có thể thử tải lại hoặc quay về trang trước.'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={reset}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
          >
            Thử tải lại
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
