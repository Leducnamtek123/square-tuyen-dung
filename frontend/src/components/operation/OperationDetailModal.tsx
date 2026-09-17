import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Chip,
  Box,
  Alert,
  AlertTitle,
  Divider,
  useTheme,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import dayjs from 'dayjs';
import { OperationTimeline } from './OperationTimeline';
import type { OperationPayload, OperationStatus } from './types';

export interface OperationDetailModalProps {
  open: boolean;
  onClose: () => void;
  operation?: OperationPayload | null;
  onRetry?: () => void;
  onCancel?: () => void;
  onRetryStep?: (stepKey: string) => void;
  isCancelling?: boolean;
  className?: string;
}

const STATUS_COLORS: Record<OperationStatus, string> = {
  running: '#2563EB',
  completed: '#10B981',
  failed: '#EF4444',
  queued: '#94A3B8',
  cancelled: '#64748B',
};

const STATUS_LABELS: Record<OperationStatus, string> = {
  running: 'Đang thực hiện',
  completed: 'Hoàn tất',
  failed: 'Thất bại',
  queued: 'Đang chờ',
  cancelled: 'Đã hủy',
};

export const OperationDetailModal: React.FC<OperationDetailModalProps> = ({
  open,
  onClose,
  operation,
  onRetry,
  onCancel,
  onRetryStep,
  isCancelling = false,
  className,
}) => {
  const theme = useTheme();

  const status = operation?.status || 'queued';
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.queued;
  const statusLabel = STATUS_LABELS[status] || status;

  const initiator =
    operation?.metadata?.initiator ||
    operation?.metadata?.userName ||
    operation?.metadata?.user ||
    null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className={className}
      aria-labelledby="operation-detail-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        id="operation-detail-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          pb: 1.5,
          borderBottom: `1px solid ${
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.08)'
          }`,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              {operation?.title || 'Chi tiết tác vụ'}
            </Typography>

            {operation?.type && (
              <Chip
                size="small"
                label={operation.type}
                variant="outlined"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  height: 22,
                }}
              />
            )}

            <Chip
              size="small"
              label={statusLabel}
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                color: statusColor,
                bgcolor: `${statusColor}18`,
                border: `1px solid ${statusColor}33`,
                height: 22,
              }}
            />
          </Box>
        </Box>

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent
        sx={{
          py: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {/* Overview Row */}
        {operation && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 1.5,
              p: 1.75,
              borderRadius: 2,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)'
              }`,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Thời gian tạo
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {operation.createdAt
                  ? dayjs(operation.createdAt).format('DD/MM/YYYY HH:mm:ss')
                  : '—'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Cập nhật lần cuối
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {operation.updatedAt
                  ? dayjs(operation.updatedAt).format('DD/MM/YYYY HH:mm:ss')
                  : operation.finishedAt
                  ? dayjs(operation.finishedAt).format('DD/MM/YYYY HH:mm:ss')
                  : '—'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Thời gian kết thúc
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {operation.finishedAt
                  ? dayjs(operation.finishedAt).format('DD/MM/YYYY HH:mm:ss')
                  : operation.status === 'running'
                  ? 'Đang thực hiện...'
                  : '—'}
              </Typography>
            </Box>

            {initiator && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Người khởi tạo
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {initiator}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Error Alert Box */}
        {operation?.error && (
          <Alert
            severity="error"
            sx={{
              borderRadius: 2,
              '& .MuiAlert-message': { width: '100%' },
            }}
          >
            {operation.error.code && (
              <AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>
                {operation.error.code}
              </AlertTitle>
            )}
            <Typography variant="body2" fontWeight={600}>
              {operation.error.message}
            </Typography>
            {operation.error.detail && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  p: 1,
                  borderRadius: 1,
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(0, 0, 0, 0.4)'
                      : 'rgba(0, 0, 0, 0.05)',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {operation.error.detail}
              </Typography>
            )}
          </Alert>
        )}

        {/* Embedded Operation Timeline */}
        {operation && (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}
            >
              Tiến trình các bước
            </Typography>
            <OperationTimeline
              operation={operation}
              onRetryStep={onRetryStep}
              expandable={false}
              defaultExpanded={true}
            />
          </Box>
        )}

        {/* Result Data Payload */}
        {operation?.result && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)'
              }`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Kết quả tác vụ
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.4)'
                    : 'rgba(0, 0, 0, 0.04)',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                overflowX: 'auto',
                color: 'text.primary',
              }}
            >
              {JSON.stringify(operation.result, null, 2)}
            </Box>
          </Box>
        )}
      </DialogContent>

      <Divider />

      {/* Dialog Actions */}
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Box>
          {/* Cancel button if running or queued */}
          {(operation?.status === 'running' || operation?.status === 'queued') && onCancel && (
            <Button
              variant="outlined"
              color="error"
              onClick={onCancel}
              disabled={isCancelling}
              startIcon={
                isCancelling ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <BlockRoundedIcon fontSize="small" />
                )
              }
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {isCancelling ? 'Đang hủy...' : 'Hủy tác vụ'}
            </Button>
          )}

          {/* Retry button if failed */}
          {operation?.status === 'failed' && onRetry && (
            <Button
              variant="contained"
              color="primary"
              onClick={onRetry}
              startIcon={<ReplayRoundedIcon fontSize="small" />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Thử lại
            </Button>
          )}
        </Box>

        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OperationDetailModal;
