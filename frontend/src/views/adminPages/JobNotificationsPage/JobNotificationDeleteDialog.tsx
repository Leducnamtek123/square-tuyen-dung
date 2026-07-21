import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import type { TFunction } from 'i18next';
import type { JobPostNotification } from '../../../types/models';

type JobNotificationDeleteDialogProps = {
  open: boolean;
  notification: JobPostNotification | null;
  isMutating?: boolean;
  t: TFunction<'admin'>;
  onClose: () => void;
  onDelete: () => void;
};

const JobNotificationDeleteDialog = ({
  open,
  notification,
  isMutating,
  t,
  onClose,
  onDelete,
}: JobNotificationDeleteDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('pages.jobNotifications.deleteTitle')}</DialogTitle>
      <DialogContent>
        <Typography>{t('pages.jobNotifications.deleteConfirm', { title: notification?.jobName })}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          {t('pages.jobNotifications.cancel')}
        </Button>
        <Button onClick={onDelete} color="error" variant="contained" disabled={isMutating}>
          {isMutating ? t('common.deleting') : t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobNotificationDeleteDialog;

