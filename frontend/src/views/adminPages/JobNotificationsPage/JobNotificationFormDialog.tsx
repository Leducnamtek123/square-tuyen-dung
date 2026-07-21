import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, TextField, MenuItem } from '@mui/material';
import type { TFunction } from 'i18next';
import {
  getJobNotificationFormValidationErrors,
  JOB_NOTIFICATION_FREQUENCY_OPTIONS,
  type JobNotificationFormValidationErrors,
  type JobNotificationsDialogMode,
  type JobNotificationsFormData,
} from './types';

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
  const validationErrors = React.useMemo(
    () => getJobNotificationFormValidationErrors(formData),
    [formData],
  );
  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const getValidationText = (field: keyof JobNotificationFormValidationErrors) => (
    validationErrors[field]
      ? t(`pages.jobNotifications.validation.${validationErrors[field]}`)
      : undefined
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === 'add' ? t('pages.jobNotifications.addNotification') : t('pages.jobNotifications.editNotification')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label={t('pages.jobNotifications.form.title')}
            fullWidth
            value={formData.jobName}
            onChange={(e) => onChange({ ...formData, jobName: e.target.value })}
            error={Boolean(validationErrors.jobName)}
            helperText={getValidationText('jobName')}
            required
          />
          <TextField
            label={t('pages.jobNotifications.form.salary')}
            fullWidth
            type="number"
            value={formData.salary ?? ''}
            onChange={(e) => onChange({ ...formData, salary: e.target.value ? Number(e.target.value) : null })}
            error={Boolean(validationErrors.salary)}
            helperText={getValidationText('salary')}
          />
          <TextField
            label={t('pages.jobNotifications.form.frequency')}
            fullWidth
            select
            value={formData.frequency}
            onChange={(e) => onChange({ ...formData, frequency: Number(e.target.value) })}
            error={Boolean(validationErrors.frequency)}
            helperText={getValidationText('frequency')}
            required
          >
            {JOB_NOTIFICATION_FREQUENCY_OPTIONS.map((frequency) => (
              <MenuItem key={frequency} value={frequency}>{frequency}</MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('pages.jobNotifications.form.position')}
            fullWidth
            type="number"
            value={formData.position ?? ''}
            onChange={(e) => onChange({ ...formData, position: e.target.value ? Number(e.target.value) : null })}
            error={Boolean(validationErrors.position)}
            helperText={getValidationText('position')}
          />
          <TextField
            label={t('pages.jobNotifications.form.experience')}
            fullWidth
            type="number"
            value={formData.experience ?? ''}
            onChange={(e) => onChange({ ...formData, experience: e.target.value ? Number(e.target.value) : null })}
            error={Boolean(validationErrors.experience)}
            helperText={getValidationText('experience')}
          />
          <TextField
            label={t('pages.jobNotifications.form.careerId')}
            fullWidth
            type="number"
            value={formData.career ?? ''}
            onChange={(e) => onChange({ ...formData, career: e.target.value ? Number(e.target.value) : null })}
            error={Boolean(validationErrors.career)}
            helperText={getValidationText('career')}
          />
          <TextField
            label={t('pages.jobNotifications.form.cityId')}
            fullWidth
            type="number"
            value={formData.city ?? ''}
            onChange={(e) => onChange({ ...formData, city: e.target.value ? Number(e.target.value) : null })}
            error={Boolean(validationErrors.city)}
            helperText={getValidationText('city')}
          />
          <TextField
            label={t('pages.jobNotifications.form.isActive')}
            fullWidth
            select
            value={formData.isActive ? 'true' : 'false'}
            onChange={(e) => onChange({ ...formData, isActive: e.target.value === 'true' })}
          >
            <MenuItem value="true">{t('common.yes')}</MenuItem>
            <MenuItem value="false">{t('common.no')}</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          {t('pages.jobNotifications.cancel')}
        </Button>
        <Button onClick={onSave} variant="contained" disabled={isMutating || hasValidationErrors}>
          {isMutating ? t('common.saving') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobNotificationFormDialog;
