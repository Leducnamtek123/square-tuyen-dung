import React from 'react';
import { Box, Button, Card, Chip, Grid2 as Grid, TextField, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

interface RequestedInterview {
  id: string;
  scheduledAt: Dayjs | null;
  contactName: string;
  contactPhone: string;
  notes: string;
}

interface Props {
  interviewRequest: {
    scheduledAt: Dayjs | null;
    contactName: string;
    contactPhone: string;
    notes: string;
  };
  onTextChange: (field: keyof Omit<Props['interviewRequest'], 'scheduledAt'>) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (value: Dayjs | null) => void;
  onSubmit: (event: React.FormEvent) => void;
  statusText: string;
  loading?: boolean;
}

const VerificationInterviewRequestForm = ({ interviewRequest, onTextChange, onDateChange, onSubmit, statusText, loading }: Props) => {
  const { t } = useTranslation('employer');

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {t('verification.step3.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
        {t('verification.step3.description')}
      </Typography>
      <Box component="form" onSubmit={onSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label={t('verification.step3.timeLabel')}
                value={interviewRequest.scheduledAt}
                onChange={onDateChange}
                minDateTime={dayjs()}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          {([
            ['contactName', 'verification.step3.contactName'],
            ['contactPhone', 'verification.step3.contactPhone'],
            ['notes', 'verification.step3.notes'],
          ] as const).map(([field, label]) => (
            <Grid key={field} size={{ xs: 12, md: 6 }}>
              <TextField label={t(label)} value={interviewRequest[field]} onChange={onTextChange(field)} fullWidth />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button type="submit" variant="contained" disabled={loading}>{t('verification.step3.requestBtn')}</Button>
          <Chip label={statusText} color="success" />
        </Box>
      </Box>
    </Card>
  );
};

export default VerificationInterviewRequestForm;
