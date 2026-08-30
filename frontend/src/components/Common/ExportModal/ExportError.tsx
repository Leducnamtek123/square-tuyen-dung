import React from 'react';
import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

interface ExportErrorProps {
  errorMessage?: string;
  onRetry: () => void;
  onClose: () => void;
}

export const ExportError: React.FC<ExportErrorProps> = ({
  errorMessage,
  onRetry,
  onClose,
}) => {
  const { t } = useTranslation('common');

  return (
    <Box
      sx={{
        py: 6,
        px: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 340,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 480,
          width: '100%',
          borderRadius: '16px',
          border: '1px solid #FCA5A5',
          backgroundColor: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0px 4px 20px rgba(239, 68, 68, 0.08)',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 36 }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 0.5, fontSize: '1.25rem' }}>
          {t('export.errorTitle', 'Không thể tạo file dữ liệu.')}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mb: 3, fontSize: '0.875rem' }}>
          {errorMessage || t('export.defaultErrorMessage', 'Đã xảy ra lỗi trong quá trình tạo dữ liệu xuất. Vui lòng thử lại.')}
        </Typography>

        <Stack direction="row" spacing={1.5} justifyContent="center">
          <Button
            variant="outlined"
            onClick={onClose}
            startIcon={<CloseIcon />}
            sx={{
              borderRadius: '10px',
              px: 2.5,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              color: '#374151',
              borderColor: '#D1D5DB',
              '&:hover': {
                borderColor: '#9CA3AF',
                backgroundColor: '#F9FAFB',
              },
            }}
          >
            {t('common.actions.close', 'Đóng')}
          </Button>

          <Button
            variant="contained"
            onClick={onRetry}
            startIcon={<RefreshIcon />}
            sx={{
              borderRadius: '10px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#EF4444',
              '&:hover': {
                backgroundColor: '#DC2626',
              },
            }}
          >
            {t('common.actions.retry', 'Thử lại')}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
