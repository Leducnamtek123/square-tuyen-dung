'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Stack,
} from '@mui/material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export type DialogVariant = 'danger' | 'warning' | 'info';

export interface AdminConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  loading?: boolean;
  onConfirm: (reason?: string) => void | Promise<void>;
  onClose: () => void;
}

export default function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy bỏ',
  variant = 'danger',
  requireReason = false,
  reasonLabel = 'Lý do thực hiện (Bắt buộc)',
  reasonPlaceholder = 'Nhập lý do chi tiết để ghi vào nhật ký kiểm toán...',
  loading = false,
  onConfirm,
  onClose,
}: AdminConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setReasonError(true);
      return;
    }
    setReasonError(false);
    onConfirm(reason);
  };

  const handleClose = () => {
    if (loading) return;
    setReason('');
    setReasonError(false);
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <ErrorOutlineOutlinedIcon sx={{ fontSize: 28, color: '#DC2626' }} />,
          iconBg: '#FEE2E2',
          btnColor: 'error' as const,
          btnBg: '#DC2626',
        };
      case 'warning':
        return {
          icon: <WarningAmberOutlinedIcon sx={{ fontSize: 28, color: '#D97706' }} />,
          iconBg: '#FEF3C7',
          btnColor: 'warning' as const,
          btnBg: '#D97706',
        };
      case 'info':
      default:
        return {
          icon: <InfoOutlinedIcon sx={{ fontSize: 28, color: '#2563EB' }} />,
          iconBg: '#DBEAFE',
          btnColor: 'primary' as const,
          btnBg: '#2563EB',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: styles.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {styles.icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1.125rem' }}>
            {title}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ color: '#64748B', fontSize: '0.875rem', mb: requireReason ? 2 : 0 }}>
          {typeof message === 'string' ? <Typography variant="body2">{message}</Typography> : message}
        </Box>

        {requireReason && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label={reasonLabel}
            placeholder={reasonPlaceholder}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (reasonError && e.target.value.trim()) setReasonError(false);
            }}
            error={reasonError}
            helperText={reasonError ? 'Vui lòng cung cấp lý do để hoàn tất thao tác này.' : undefined}
            size="small"
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' },
            }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, pt: 1, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          disabled={loading}
          onClick={handleClose}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            borderColor: '#E2E8F0',
            color: '#64748B',
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color={styles.btnColor}
          disabled={loading}
          onClick={handleConfirm}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
