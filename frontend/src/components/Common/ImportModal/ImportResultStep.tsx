import React from 'react';
import { Box, Typography, Stack, Button, Paper, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import type { ImportJobState } from '@/types/exchange';

interface ImportResultStepProps {
  commitJob: ImportJobState | null;
  commitError: string | null;
  onClose: () => void;
  onDownloadErrorReport?: () => void;
}

export const ImportResultStep: React.FC<ImportResultStepProps> = ({
  commitJob,
  commitError,
  onClose,
  onDownloadErrorReport,
}) => {
  const isFailed = commitJob?.status === 'failed' || !!commitError;
  const hasPartialErrors = !isFailed && (commitJob?.failedRows ?? 0) > 0;
  const isSuccess = !isFailed && !hasPartialErrors;

  return (
    <Box sx={{ py: 3, textAlign: 'center' }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 540,
          mx: 'auto',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        {isSuccess && (
          <Box sx={{ mb: 2.5 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 38, color: '#16A34A' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
              Nhập dữ liệu thành công!
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Tất cả bản ghi hợp lệ đã được lưu trữ an toàn vào cơ sở dữ liệu.
            </Typography>
          </Box>
        )}

        {hasPartialErrors && (
          <Box sx={{ mb: 2.5 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#FEF3C7',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <WarningAmberIcon sx={{ fontSize: 38, color: '#D97706' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
              Nhập hoàn tất với một số dòng bị bỏ qua
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Các dòng dữ liệu hợp lệ đã được lưu. Dòng bị lỗi đã được bỏ qua và ghi vào báo cáo lỗi.
            </Typography>
          </Box>
        )}

        {isFailed && (
          <Box sx={{ mb: 2.5 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 38, color: '#DC2626' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#DC2626', mb: 0.5 }}>
              Quá trình nhập dữ liệu thất bại
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Giao dịch đã được hủy bỏ và hoàn tác toàn bộ để đảm bảo an toàn cơ sở dữ liệu.
            </Typography>
          </Box>
        )}

        {/* Error detail alert if failed */}
        {commitError && (
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left', borderRadius: '8px' }}>
            {commitError}
          </Alert>
        )}

        {/* Metrics Grid */}
        {commitJob && (
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{
              p: 2,
              mb: 3,
              borderRadius: '12px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                Đã tạo mới
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#059669' }}>
                {commitJob.createdRows}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                Đã cập nhật
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2563EB' }}>
                {commitJob.updatedRows}
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                Bị từ chối
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: commitJob.failedRows > 0 ? '#DC2626' : '#64748B',
                }}
              >
                {commitJob.failedRows}
              </Typography>
            </Box>
          </Stack>
        )}

        {/* Actions */}
        <Stack direction="row" spacing={2} justifyContent="center">
          {((commitJob?.failedRows ?? 0) > 0 || commitJob?.errorReportUrl) && onDownloadErrorReport && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={onDownloadErrorReport}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              Tải báo cáo lỗi (.xlsx)
            </Button>
          )}

          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              backgroundColor: isFailed ? '#475569' : '#0284C7',
              '&:hover': { backgroundColor: isFailed ? '#334155' : '#0369A1' },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              px: 4,
            }}
          >
            Đóng
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
export default ImportResultStep;
