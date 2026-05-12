'use client';
import React, { useMemo, useState } from 'react';
import { Box, Snackbar, Alert, Typography } from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TabTitle } from '../../../utils/generalFunction';
import companyVerificationService, { type CompanyVerificationPayload } from '../../../services/companyVerificationService';
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

const getStatusLabelKey = (status?: string) => {
  switch (status) {
    case 'reviewing':
      return 'verification.status.reviewing';
    case 'approved':
      return 'verification.status.approved';
    case 'rejected':
      return 'verification.status.rejected';
    case 'pending':
    default:
      return 'verification.status.pending';
  }
};

const VerificationPage = () => {
  const { t } = useTranslation('employer');
  const queryClient = useQueryClient();
  TabTitle(t('verification.title'));

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
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

  const { data: verification, isLoading } = useQuery({
    queryKey: ['company-verification'],
    queryFn: companyVerificationService.getVerification,
  });

  React.useEffect(() => {
    if (!verification) return;
    setLegalProfile({
      companyName: verification.companyName || '',
      taxCode: verification.taxCode || '',
      businessLicense: verification.businessLicense || '',
      representative: verification.representative || '',
      phone: verification.phone || '',
      email: verification.email || '',
      website: verification.website || '',
    });
    setInterviewRequest({
      scheduledAt: verification.scheduledAt ? dayjs(verification.scheduledAt) : dayjs().add(2, 'day'),
      contactName: verification.contactName || '',
      contactPhone: verification.contactPhone || '',
      notes: verification.notes || '',
    });
  }, [verification]);

  const updateMutation = useMutation({
    mutationFn: (payload: CompanyVerificationPayload) => companyVerificationService.updateVerification(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['company-verification'] });
    },
  });

  const statusLabel = useMemo(() => {
    return t(getStatusLabelKey(verification?.status));
  }, [t, verification?.status]);

  const interviewStatus = useMemo(() => {
    if (!verification?.scheduledAt) return t('verification.messages.noScheduleYet');
    return t('verification.messages.waitingConfirmation');
  }, [verification?.scheduledAt, t]);

  const handleLegalProfileChange =
    (field: keyof LegalProfile) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setLegalProfile((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleInterviewChange =
    (field: keyof Omit<InterviewRequest, 'scheduledAt'>) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setInterviewRequest((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSaveLegalProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateMutation.mutateAsync(legalProfile);
    setSnackbarMessage(t('verification.messages.profileSaved'));
    setSnackbarOpen(true);
  };

  const handleRequestInterview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!interviewRequest.scheduledAt || !interviewRequest.contactName) return;
    await updateMutation.mutateAsync({
      ...legalProfile,
      scheduledAt: interviewRequest.scheduledAt.toISOString(),
      contactName: interviewRequest.contactName,
      contactPhone: interviewRequest.contactPhone,
      notes: interviewRequest.notes,
    });
    setSnackbarMessage(t('verification.messages.requestSubmitted'));
    setSnackbarOpen(true);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {t('verification.title')}
      </Typography>
      <VerificationIntroCard />
      <VerificationLegalProfileForm
        legalProfile={legalProfile}
        onChange={handleLegalProfileChange}
        onSubmit={handleSaveLegalProfile}
        statusLabel={statusLabel}
        loading={isLoading || updateMutation.isPending}
      />
      <VerificationInterviewRequestForm
        interviewRequest={interviewRequest}
        onTextChange={handleInterviewChange}
        onDateChange={(value) => setInterviewRequest((prev) => ({ ...prev, scheduledAt: value }))}
        onSubmit={handleRequestInterview}
        statusText={interviewStatus}
        loading={isLoading || updateMutation.isPending}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerificationPage;
