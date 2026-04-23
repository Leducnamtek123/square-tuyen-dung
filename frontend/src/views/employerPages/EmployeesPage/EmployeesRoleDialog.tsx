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

type RoleFormState = {
  code: string;
  name: string;
  description: string;
  permissions: string[];
};

type PermissionOption = {
  key: string;
  label: string;
};

type Props = {
  open: boolean;
  form: RoleFormState;
  loading: boolean;
  permissions: PermissionOption[];
  onClose: () => void;
  onChange: (patch: Partial<RoleFormState>) => void;
  onSubmit: () => void;
  t: TFunction<'employer'>;
};

const EmployeesRoleDialog = ({ open, form, loading, permissions, onClose, onChange, onSubmit, t }: Props) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{t('employees.dialog.addRoleTitle')}</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <TextField
          label={t('employees.dialog.roleNameLabel')}
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          fullWidth
        />
        <TextField
          label={t('employees.dialog.codeLabel')}
          value={form.code}
          onChange={(e) => onChange({ code: e.target.value })}
          fullWidth
          helperText={t('employees.dialog.codeHelperText')}
        />
        <TextField
          label={t('employees.dialog.descriptionLabel')}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>{t('employees.dialog.permissionsLabel')}</InputLabel>
          <Select
            multiple
            label={t('employees.dialog.permissionsLabel')}
            value={form.permissions}
            onChange={(e) => onChange({ permissions: e.target.value as string[] })}
            renderValue={(selected) => (selected as string[]).join(', ')}
          >
            {permissions.map((item) => (
              <MenuItem key={item.key} value={item.key}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>{t('employees.dialog.cancel')}</Button>
      <Button variant="contained" disabled={!form.name.trim() || loading} onClick={onSubmit}>
        {t('employees.dialog.createRole')}
      </Button>
    </DialogActions>
  </Dialog>
);

export default EmployeesRoleDialog;
