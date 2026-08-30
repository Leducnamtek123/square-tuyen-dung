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
import { useTranslation } from 'react-i18next';

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
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  requireReason = false,
  reasonLabel,
  reasonPlaceholder,
  loading = false,
  onConfirm,
  onClose,
}: AdminConfirmDialogProps) {
  const { t } = useTranslation(['admin', 'common']);
  const resolvedConfirmLabel = confirmLabel || t('common:actions.confirm', 'Xác nhận');
  const resolvedCancelLabel = cancelLabel || t('common:actions.cancel', 'Hủy bỏ');
  const resolvedReasonLabel = reasonLabel || t('admin:confirmDialog.reasonLabel', 'Lý do thực hiện (Bắt buộc)');
  const resolvedReasonPlaceholder = reasonPlaceholder || t('admin:confirmDialog.reasonPlaceholder', 'Nhập lý do chi tiết để ghi vào nhật ký kiểm toán...');

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
      <DialogTitle sx={{ pb: 1, pt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: styles.iconBg,
              flexShrink: 0,
            }}
          >
            {styles.icon}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0F172A' }}>
              {title}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: 1.5 }}>
        <Box sx={{ color: '#475569', fontSize: '0.9rem', mb: requireReason ? 2 : 0 }}>
          {typeof message === 'string' ? <Typography variant="body2">{message}</Typography> : message}
        </Box>

        {requireReason && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label={resolvedReasonLabel}
            placeholder={resolvedReasonPlaceholder}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (reasonError && e.target.value.trim()) setReasonError(false);
            }}
            error={reasonError}
            helperText={reasonError ? t('admin:confirmDialog.reasonRequired', 'Vui lòng cung cấp lý do để hoàn tất thao tác này.') : undefined}
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
          {resolvedCancelLabel}
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
          {resolvedConfirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
