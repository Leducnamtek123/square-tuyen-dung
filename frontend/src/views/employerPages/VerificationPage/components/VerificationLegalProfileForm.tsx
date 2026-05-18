import React from 'react';
import { Box, Button, Card, Chip, Grid2 as Grid, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ChipProps } from '@mui/material';

export interface VerificationLegalProfile {
  companyName: string;
  taxCode: string;
  businessLicense: string;
  representative: string;
  phone: string;
  email: string;
  website: string;
}

interface Props {
  legalProfile: VerificationLegalProfile;
  onChange: (field: keyof VerificationLegalProfile) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  statusLabel: string;
  statusColor?: ChipProps['color'];
  errors?: Partial<Record<keyof VerificationLegalProfile, string>>;
  loading?: boolean;
}

const VerificationLegalProfileForm = ({
  legalProfile,
  onChange,
  onSubmit,
  statusLabel,
  statusColor = 'info',
  errors,
  loading,
}: Props) => {
  const { t } = useTranslation('employer');
  const fields = [
    ['companyName', 'verification.step2.enterpriseName', true],
    ['taxCode', 'verification.step2.taxCode', true],
    ['businessLicense', 'verification.step2.licenseNumber', true],
    ['representative', 'verification.step2.representative', true],
    ['phone', 'verification.step2.phone', true],
    ['email', 'verification.step2.email', true],
    ['website', 'verification.step2.website', false],
  ] as const;

  return (
    <Card elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t('verification.step2.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {t('verification.step2.description')}
          </Typography>
        </Box>
        <Chip label={statusLabel} color={statusColor} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} />
      </Stack>
      <Box component="form" onSubmit={onSubmit}>
        <Grid container spacing={2}>
          {fields.map(([field, label, required]) => (
            <Grid key={field} size={{ xs: 12, md: 6 }}>
              <TextField
                label={t(label)}
                value={legalProfile[field]}
                onChange={onChange(field)}
                fullWidth
                required={required}
                type={field === 'email' ? 'email' : 'text'}
                error={Boolean(errors?.[field])}
                helperText={errors?.[field]}
              />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button type="submit" variant="contained" disabled={loading}>{t('verification.step2.saveBtn')}</Button>
        </Box>
      </Box>
    </Card>
  );
};

export default VerificationLegalProfileForm;
