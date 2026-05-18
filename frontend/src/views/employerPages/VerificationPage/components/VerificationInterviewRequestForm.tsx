import React from 'react';
import { Box, Button, Card, Chip, Grid2 as Grid, Stack, TextField, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

export interface VerificationInterviewRequest {
  scheduledAt: Dayjs | null;
  contactName: string;
  contactPhone: string;
  notes: string;
}

interface Props {
  interviewRequest: VerificationInterviewRequest;
  onTextChange: (field: keyof Omit<VerificationInterviewRequest, 'scheduledAt'>) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (value: Dayjs | null) => void;
  onSubmit: (event: React.FormEvent) => void;
  statusText: string;
  errors?: Partial<Record<keyof VerificationInterviewRequest, string>>;
  loading?: boolean;
}

const VerificationInterviewRequestForm = ({
  interviewRequest,
  onTextChange,
  onDateChange,
  onSubmit,
  statusText,
  errors,
  loading,
}: Props) => {
  const { t } = useTranslation('employer');

  return (
    <Card elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t('verification.step3.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {t('verification.step3.description')}
          </Typography>
        </Box>
        <Chip label={statusText} color="success" variant="outlined" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} />
      </Stack>
      <Box component="form" onSubmit={onSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label={t('verification.step3.timeLabel')}
                value={interviewRequest.scheduledAt}
                onChange={onDateChange}
                minDateTime={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: Boolean(errors?.scheduledAt),
                    helperText: errors?.scheduledAt,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          {([
            ['contactName', 'verification.step3.contactName', true],
            ['contactPhone', 'verification.step3.contactPhone', true],
            ['notes', 'verification.step3.notes', false],
          ] as const).map(([field, label, required]) => (
            <Grid key={field} size={{ xs: 12, md: 6 }}>
              <TextField
                label={t(label)}
                value={interviewRequest[field]}
                onChange={onTextChange(field)}
                fullWidth
                required={required}
                multiline={field === 'notes'}
                minRows={field === 'notes' ? 3 : undefined}
                error={Boolean(errors?.[field])}
                helperText={errors?.[field]}
              />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button type="submit" variant="contained" disabled={loading}>{t('verification.step3.requestBtn')}</Button>
        </Box>
      </Box>
    </Card>
  );
};

export default VerificationInterviewRequestForm;
