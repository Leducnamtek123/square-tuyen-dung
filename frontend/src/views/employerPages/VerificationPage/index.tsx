import React, { useMemo, useState } from 'react';
import { Box, Snackbar, Alert, Typography } from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import VerificationIntroCard from './components/VerificationIntroCard';
import VerificationLegalProfileForm from './components/VerificationLegalProfileForm';
import VerificationInterviewRequestForm from './components/VerificationInterviewRequestForm';

type LegalProfile = {
  companyName: string;
  taxCode: string;
  businessLicense: string;
  representative: string;
  phone: string;
  email: string;
  website: string;
};

type InterviewRequest = {
  scheduledAt: Dayjs | null;
  contactName: string;
  contactPhone: string;
  notes: string;
};

type RequestedInterview = InterviewRequest & { id: string };

const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const VerificationPage = () => {
  const { t } = useTranslation('employer');
  TabTitle(t('verification.title'));

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [legalProfile, setLegalProfile] = useState<LegalProfile>({
    companyName: '',
    taxCode: '',
    businessLicense: '',
    representative: '',
    phone: '',
    email: '',
    website: '',
  });
  const [interviewRequest, setInterviewRequest] = useState<InterviewRequest>({
    scheduledAt: dayjs().add(2, 'day'),
    contactName: '',
    contactPhone: '',
    notes: '',
  });
  const [requestedInterviews, setRequestedInterviews] = useState<RequestedInterview[]>([]);

  const interviewStatus = useMemo(() => {
    if (requestedInterviews.length === 0) return t('verification.messages.noScheduleYet');
    return t('verification.messages.waitingConfirmation');
  }, [requestedInterviews.length, t]);

  const handleLegalProfileChange =
    (field: keyof LegalProfile) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setLegalProfile((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleInterviewChange =
    (field: keyof Omit<InterviewRequest, 'scheduledAt'>) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setInterviewRequest((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSaveLegalProfile = (event: React.FormEvent) => {
    event.preventDefault();
    setSnackbarOpen(true);
  };

  const handleRequestInterview = (event: React.FormEvent) => {
    event.preventDefault();
    if (!interviewRequest.scheduledAt || !interviewRequest.contactName) return;
    setRequestedInterviews((prev) => [
      {
        id: makeId(),
        scheduledAt: interviewRequest.scheduledAt,
        contactName: interviewRequest.contactName,
        contactPhone: interviewRequest.contactPhone,
        notes: interviewRequest.notes,
      },
      ...prev,
    ]);
    setInterviewRequest((prev) => ({ ...prev, contactName: '', contactPhone: '', notes: '' }));
    setSnackbarOpen(true);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {t('verification.title')}
      </Typography>
      <VerificationIntroCard t={t} />
      <VerificationLegalProfileForm
        t={t}
        legalProfile={legalProfile}
        onChange={handleLegalProfileChange}
        onSubmit={handleSaveLegalProfile}
      />
      <VerificationInterviewRequestForm
        t={t}
        interviewRequest={interviewRequest}
        onTextChange={handleInterviewChange}
        onDateChange={(value) => setInterviewRequest((prev) => ({ ...prev, scheduledAt: value }))}
        onSubmit={handleRequestInterview}
        statusText={interviewStatus}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {requestedInterviews.length > 0 ? t('verification.messages.requestSubmitted') : t('verification.messages.profileSaved')}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerificationPage;
