import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
} from '@mui/material';
import type { TFunction } from 'i18next';
import type { JobPostActivity } from '@/types/models';
import type { EmployeeFromApplicationPayload } from '@/services/hrmService';

type Props = {
  open: boolean;
  activity: JobPostActivity | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: EmployeeFromApplicationPayload) => void;
  t: TFunction;
};

const today = () => new Date().toISOString().slice(0, 10);

const EmployeeFromApplicationDialog = ({ open, activity, loading, onClose, onSubmit, t }: Props) => {
  const [form, setForm] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    startDate: today(),
    createFrappeAccount: true,
    sendWelcomeEmail: false,
    frappeRoles: 'Employee',
    notes: '',
  });

  React.useEffect(() => {
    if (!activity) return;
    setForm({
      fullName: activity.fullName || '',
      email: activity.email || '',
      phone: activity.phone || '',
      jobTitle: activity.jobName || activity.jobPost?.jobName || '',
      department: '',
      startDate: today(),
      createFrappeAccount: true,
      sendWelcomeEmail: false,
      frappeRoles: 'Employee',
      notes: '',
    });
  }, [activity]);

  if (!activity) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('employer:employees.hrm.convert.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label={t('employer:employees.hrm.fields.fullName')} value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} fullWidth required />
          <TextField label={t('employer:employees.hrm.fields.email')} value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} fullWidth />
          <TextField label={t('employer:employees.hrm.fields.phone')} value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} fullWidth />
          <TextField label={t('employer:employees.hrm.fields.jobTitle')} value={form.jobTitle} onChange={(e) => setForm((prev) => ({ ...prev, jobTitle: e.target.value }))} fullWidth required />
          <TextField label={t('employer:employees.hrm.fields.department')} value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} fullWidth />
          <TextField type="date" label={t('employer:employees.hrm.fields.startDate')} value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <Stack>
            <FormControlLabel
              control={<Checkbox checked={form.createFrappeAccount} onChange={(e) => setForm((prev) => ({ ...prev, createFrappeAccount: e.target.checked }))} />}
              label={t('employer:employees.hrm.convert.createFrappeAccount', { defaultValue: 'Create Frappe HR account' })}
            />
            <FormControlLabel
              control={<Checkbox checked={form.sendWelcomeEmail} disabled={!form.createFrappeAccount} onChange={(e) => setForm((prev) => ({ ...prev, sendWelcomeEmail: e.target.checked }))} />}
              label={t('employer:employees.hrm.convert.sendWelcomeEmail', { defaultValue: 'Send Frappe welcome email' })}
            />
          </Stack>
          <TextField
            label={t('employer:employees.hrm.convert.roles', { defaultValue: 'Frappe roles' })}
            value={form.frappeRoles}
            onChange={(e) => setForm((prev) => ({ ...prev, frappeRoles: e.target.value }))}
            fullWidth
            disabled={!form.createFrappeAccount}
          />
          <TextField label={t('employer:employees.hrm.fields.notes')} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} fullWidth multiline minRows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('employer:employees.dialog.cancel')}</Button>
        <Button
          variant="contained"
          disabled={loading || !form.fullName.trim() || !form.jobTitle.trim()}
          onClick={() => onSubmit({
            applicationId: activity.id,
            fullName: form.fullName.trim(),
            email: form.email.trim() || undefined,
            phone: form.phone.trim() || undefined,
            jobTitle: form.jobTitle.trim(),
            department: form.department.trim() || undefined,
            startDate: form.startDate || null,
            createFrappeAccount: form.createFrappeAccount,
            sendWelcomeEmail: form.createFrappeAccount && form.sendWelcomeEmail,
            frappeRoles: form.createFrappeAccount ? form.frappeRoles.split(',').map((role) => role.trim()).filter(Boolean) : [],
            notes: form.notes.trim() || undefined,
          })}
        >
          {t('employer:employees.hrm.convert.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeFromApplicationDialog;
