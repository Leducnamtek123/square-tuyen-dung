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
import {
  buildEmployeeFromApplicationPayload,
  hasEmployeeAccountEmail,
  type EmployeeFromApplicationFormState,
} from './employeeFromApplicationDialogState';

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
  const [form, setForm] = React.useState<EmployeeFromApplicationFormState>({
    fullName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    startDate: today(),
    createHrmAccount: true,
    sendWelcomeEmail: false,
    hrmRoles: 'Employee',
    notes: '',
  });

  React.useEffect(() => {
    if (!activity) return;
    const activityEmail = activity.email || '';
    const canCreateHrmAccount = hasEmployeeAccountEmail(activityEmail);
    setForm({
      fullName: activity.fullName || '',
      email: activityEmail,
      phone: activity.phone || '',
      jobTitle: activity.jobName || activity.jobPost?.jobName || '',
      department: '',
      startDate: today(),
      createHrmAccount: canCreateHrmAccount,
      sendWelcomeEmail: false,
      hrmRoles: 'Employee',
      notes: '',
    });
  }, [activity]);

  if (!activity) return null;
  const hasEmail = hasEmployeeAccountEmail(form.email);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('employer:employees.hrm.convert.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label={t('employer:employees.hrm.fields.fullName')} value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} fullWidth required />
          <TextField
            label={t('employer:employees.hrm.fields.email')}
            value={form.email}
            onChange={(e) => {
              const email = e.target.value;
              setForm((prev) => ({
                ...prev,
                email,
                createHrmAccount: hasEmployeeAccountEmail(email) ? prev.createHrmAccount : false,
                sendWelcomeEmail: hasEmployeeAccountEmail(email) ? prev.sendWelcomeEmail : false,
              }));
            }}
            fullWidth
          />
          <TextField label={t('employer:employees.hrm.fields.phone')} value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} fullWidth />
          <TextField label={t('employer:employees.hrm.fields.jobTitle')} value={form.jobTitle} onChange={(e) => setForm((prev) => ({ ...prev, jobTitle: e.target.value }))} fullWidth required />
          <TextField label={t('employer:employees.hrm.fields.department')} value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} fullWidth />
          <TextField type="date" label={t('employer:employees.hrm.fields.startDate')} value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <Stack>
            <FormControlLabel
              control={<Checkbox checked={form.createHrmAccount} disabled={!hasEmail} onChange={(e) => setForm((prev) => ({ ...prev, createHrmAccount: e.target.checked, sendWelcomeEmail: e.target.checked ? prev.sendWelcomeEmail : false }))} />}
              label={t('employer:employees.hrm.convert.createHrmAccount')}
            />
            <FormControlLabel
              control={<Checkbox checked={form.sendWelcomeEmail} disabled={!form.createHrmAccount} onChange={(e) => setForm((prev) => ({ ...prev, sendWelcomeEmail: e.target.checked }))} />}
              label={t('employer:employees.hrm.convert.sendWelcomeEmail')}
            />
          </Stack>
          <TextField label={t('employer:employees.hrm.fields.notes')} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} fullWidth multiline minRows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('employer:employees.dialog.cancel')}</Button>
        <Button
          variant="contained"
          disabled={loading || !form.fullName.trim() || !form.jobTitle.trim()}
          onClick={() => onSubmit(buildEmployeeFromApplicationPayload(activity.id, form))}
        >
          {t('employer:employees.hrm.convert.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeFromApplicationDialog;
