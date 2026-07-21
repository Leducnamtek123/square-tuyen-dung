import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

type BannerDeleteDialogProps = {
  open: boolean;
  bannerId: string | number | undefined;
  isMutating: boolean;
  onClose: () => void;
  onDelete: () => void;
  t: (key: string, params?: Record<string, unknown>) => string;
};

const BannerDeleteDialog = ({ open, bannerId, isMutating, onClose, onDelete, t }: BannerDeleteDialogProps) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{t('pages.banners.deleteTitle')}</DialogTitle>
    <DialogContent>
      <Typography>{t('pages.banners.deleteConfirm', { id: bannerId })}</Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} color="inherit">{t('pages.banners.cancel')}</Button>
      <Button onClick={onDelete} color="error" variant="contained" disabled={isMutating}>
        {isMutating ? t('pages.banners.deleting') : t('pages.banners.delete')}
      </Button>
    </DialogActions>
  </Dialog>
);

export default BannerDeleteDialog;
