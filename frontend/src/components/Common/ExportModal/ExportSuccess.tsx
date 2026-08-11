import React from 'react';
import { Box, Typography, Button, Stack, Paper, Chip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

interface ExportSuccessProps {
  fileName: string;
  recordCount: number;
  onDownload: () => void;
  onClose: () => void;
}

export const ExportSuccess: React.FC<ExportSuccessProps> = ({
  fileName,
  recordCount,
  onDownload,
  onClose,
}) => {
  return (
    <Box
      sx={{
        py: 5,
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
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Checkmark Animation Container */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
            animation: 'popIn 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '@keyframes popIn': {
              '0%': { transform: 'scale(0)', opacity: 0 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 0.5, fontSize: '1.25rem' }}>
          Xuất dữ liệu thành công!
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280', mb: 3, fontSize: '0.875rem' }}>
          Tệp dữ liệu đã sẵn sàng. Vui lòng bấm nút <strong>Tải xuống</strong> để tải về thiết bị.
        </Typography>

        {/* File summary card */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3.5,
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
            textAlign: 'left',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <InsertDriveFileOutlinedIcon />
            </Box>
            <Box flex={1} overflow="hidden">
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}
              >
                {fileName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                Tổng số bản ghi: <strong>{recordCount}</strong> dòng
              </Typography>
            </Box>
            <Chip label="Sẵn sàng" size="small" color="success" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }} />
          </Stack>
        </Paper>

        {/* Action Buttons */}
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
            Đóng
          </Button>

          <Button
            variant="contained"
            onClick={onDownload}
            startIcon={<DownloadIcon />}
            sx={{
              borderRadius: '10px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#2563EB',
              boxShadow: '0px 2px 4px rgba(37, 99, 235, 0.2)',
              '&:hover': {
                backgroundColor: '#1D4ED8',
              },
            }}
          >
            Tải xuống
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
