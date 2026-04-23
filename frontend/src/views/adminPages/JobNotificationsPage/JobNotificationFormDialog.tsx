import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, TextField, MenuItem } from '@mui/material';
import type { TFunction } from 'i18next';
import type { JobNotificationsDialogMode, JobNotificationsFormData } from './types';

type JobNotificationFormDialogProps = {
  open: boolean;
  mode: JobNotificationsDialogMode;
  formData: JobNotificationsFormData;
  isMutating?: boolean;
  t: TFunction<'admin'>;
  onClose: () => void;
  onSave: () => void;
  onChange: (next: JobNotificationsFormData) => void;
};

const JobNotificationFormDialog = ({
  open,
  mode,
  formData,
  isMutating,
  t,
  onClose,
  onSave,
  onChange,
}: JobNotificationFormDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === 'add' ? t('pages.jobNotifications.addNotification') : t('pages.jobNotifications.editNotification')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label={t('pages.jobNotifications.form.title', { defaultValue: 'Job Name' })}
            fullWidth
            value={formData.jobName}
            onChange={(e) => onChange({ ...formData, jobName: e.target.value })}
            required
          />
          <TextField
            label={t('pages.jobNotifications.form.salary', { defaultValue: 'Salary' })}
            fullWidth
            type="number"
            value={formData.salary ?? ''}
            onChange={(e) => onChange({ ...formData, salary: e.target.value ? Number(e.target.value) : null })}
          />
          <TextField
            label={t('pages.jobNotifications.form.frequency', { defaultValue: 'Frequency' })}
            fullWidth
            select
            value={formData.frequency}
            onChange={(e) => onChange({ ...formData, frequency: Number(e.target.value) })}
            required
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={7}>7</MenuItem>
            <MenuItem value={30}>30</MenuItem>
          </TextField>
          <TextField
            label={t('pages.jobNotifications.form.position', { defaultValue: 'Position' })}
            fullWidth
            type="number"
            value={formData.position ?? ''}
            onChange={(e) => onChange({ ...formData, position: e.target.value ? Number(e.target.value) : null })}
          />
          <TextField
            label={t('pages.jobNotifications.form.experience', { defaultValue: 'Experience' })}
            fullWidth
            type="number"
            value={formData.experience ?? ''}
            onChange={(e) => onChange({ ...formData, experience: e.target.value ? Number(e.target.value) : null })}
          />
          <TextField
            label={t('pages.jobNotifications.form.careerId', { defaultValue: 'Career ID' })}
            fullWidth
            type="number"
            value={formData.career ?? ''}
            onChange={(e) => onChange({ ...formData, career: e.target.value ? Number(e.target.value) : null })}
          />
          <TextField
            label={t('pages.jobNotifications.form.cityId', { defaultValue: 'City ID' })}
            fullWidth
            type="number"
            value={formData.city ?? ''}
            onChange={(e) => onChange({ ...formData, city: e.target.value ? Number(e.target.value) : null })}
          />
          <TextField
            label={t('pages.jobNotifications.form.isActive', { defaultValue: 'Active' })}
            fullWidth
            select
            value={formData.isActive ? 'true' : 'false'}
            onChange={(e) => onChange({ ...formData, isActive: e.target.value === 'true' })}
          >
            <MenuItem value="true">{t('common.yes', { defaultValue: 'Yes' })}</MenuItem>
            <MenuItem value="false">{t('common.no', { defaultValue: 'No' })}</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          {t('pages.jobNotifications.cancel')}
        </Button>
        <Button onClick={onSave} variant="contained" disabled={isMutating || !formData.jobName || !formData.frequency}>
          {isMutating ? t('common.saving') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobNotificationFormDialog;

