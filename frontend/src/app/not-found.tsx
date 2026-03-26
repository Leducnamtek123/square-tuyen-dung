'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import SearchOffIcon from '@mui/icons-material/SearchOff';

export default function NotFound() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        px: 3,
      }}
    >
      <SearchOffIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
      <Typography variant="h2" fontWeight={700} gutterBottom>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary" gutterBottom>
        Trang bạn tìm kiếm không tồn tại
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
        Đường dẫn có thể đã bị thay đổi hoặc trang đã bị xóa. Vui lòng kiểm tra lại URL hoặc quay về trang chủ.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => router.push('/')}
        sx={{ textTransform: 'none', borderRadius: 2 }}
      >
        Về trang chủ
      </Button>
    </Box>
  );
}
