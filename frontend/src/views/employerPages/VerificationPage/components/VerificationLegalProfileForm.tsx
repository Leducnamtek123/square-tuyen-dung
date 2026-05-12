import React from 'react';
import { Box, Button, Card, Chip, Grid2 as Grid, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
  legalProfile: {
    companyName: string;
    taxCode: string;
    businessLicense: string;
    representative: string;
    phone: string;
    email: string;
    website: string;
  };
  onChange: (field: keyof Props['legalProfile']) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  statusLabel: string;
  loading?: boolean;
}

const VerificationLegalProfileForm = ({ legalProfile, onChange, onSubmit, statusLabel, loading }: Props) => {
  const { t } = useTranslation('employer');

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {t('verification.step2.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
        {t('verification.step2.description')}
      </Typography>
      <Box component="form" onSubmit={onSubmit}>
        <Grid container spacing={2}>
          {([
            ['companyName', 'verification.step2.enterpriseName'],
            ['taxCode', 'verification.step2.taxCode'],
            ['businessLicense', 'verification.step2.licenseNumber'],
            ['representative', 'verification.step2.representative'],
            ['phone', 'verification.step2.phone'],
            ['email', 'verification.step2.email'],
            ['website', 'verification.step2.website'],
          ] as const).map(([field, label]) => (
            <Grid key={field} size={{ xs: 12, md: 6 }}>
              <TextField label={t(label)} value={legalProfile[field]} onChange={onChange(field)} fullWidth />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button type="submit" variant="contained" disabled={loading}>{t('verification.step2.saveBtn')}</Button>
          <Chip label={statusLabel} color="info" />
        </Box>
      </Box>
    </Card>
  );
};

export default VerificationLegalProfileForm;
