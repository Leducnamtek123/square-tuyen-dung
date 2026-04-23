import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import type { TFunction } from 'i18next';
import type { CompanyRole } from '../../../types/models';

type MemberFormState = {
  userId: string;
  roleId: string;
  status: string;
  invitedEmail: string;
};

type Props = {
  open: boolean;
  form: MemberFormState;
  loading: boolean;
  roles: CompanyRole[];
  onClose: () => void;
  onChange: (patch: Partial<MemberFormState>) => void;
  onSubmit: () => void;
  t: TFunction<'employer'>;
};

const EmployeesMemberDialog = ({ open, form, loading, roles, onClose, onChange, onSubmit, t }: Props) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{t('employees.dialog.addMemberTitle')}</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <TextField
          type="number"
          label={t('employees.dialog.userIdLabel')}
          value={form.userId}
          onChange={(e) => onChange({ userId: e.target.value })}
          fullWidth
          helperText={t('employees.dialog.userIdHelperText')}
        />
        <FormControl fullWidth>
          <InputLabel>{t('employees.dialog.roleLabel')}</InputLabel>
          <Select
            label={t('employees.dialog.roleLabel')}
            value={form.roleId}
            onChange={(e) => onChange({ roleId: e.target.value })}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id.toString()}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>{t('employees.dialog.statusLabel')}</InputLabel>
          <Select
            label={t('employees.dialog.statusLabel')}
            value={form.status}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <MenuItem value="ACTIVE">{t('employer:auto.index_active_18ff', `ACTIVE`)}</MenuItem>
            <MenuItem value="INVITED">{t('employer:auto.index_invited_3792', `INVITED`)}</MenuItem>
            <MenuItem value="DISABLED">{t('employer:auto.index_disabled_055c', `DISABLED`)}</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label={t('employees.dialog.invitedEmailLabel')}
          value={form.invitedEmail}
          onChange={(e) => onChange({ invitedEmail: e.target.value })}
          fullWidth
        />
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>{t('employees.dialog.cancel')}</Button>
      <Button variant="contained" disabled={!form.userId || !form.roleId || loading} onClick={onSubmit}>
        {t('employees.dialog.createMember')}
      </Button>
    </DialogActions>
  </Dialog>
);

export default EmployeesMemberDialog;
