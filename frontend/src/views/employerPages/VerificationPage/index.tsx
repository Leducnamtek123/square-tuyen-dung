'use client';
import React, { useMemo, useState } from 'react';
import { Box, Snackbar, Alert, Typography } from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TabTitle } from '../../../utils/generalFunction';
import companyVerificationService, { type CompanyVerificationPayload } from '../../../services/companyVerificationService';
import VerificationIntroCard from './components/VerificationIntroCard';
import VerificationLegalProfileForm, { type VerificationLegalProfile } from './components/VerificationLegalProfileForm';
import VerificationInterviewRequestForm, { type VerificationInterviewRequest } from './components/VerificationInterviewRequestForm';
import type { AlertColor, ChipProps } from '@mui/material';

type LegalErrors = Partial<Record<keyof VerificationLegalProfile, string>>;
type InterviewErrors = Partial<Record<keyof VerificationInterviewRequest, string>>;

const REQUIRED_LEGAL_FIELDS: Array<keyof VerificationLegalProfile> = [
  'companyName',
  'taxCode',
  'businessLicense',
  'representative',
  'phone',
  'email',
];

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

const getStatusColor = (status?: string): ChipProps['color'] => {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'error';
  if (status === 'reviewing') return 'warning';
  return 'info';
};

const VerificationPage = () => {
  const { t } = useTranslation('employer');
  const queryClient = useQueryClient();
  TabTitle(t('verification.title'));

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');
  const [legalErrors, setLegalErrors] = useState<LegalErrors>({});
  const [interviewErrors, setInterviewErrors] = useState<InterviewErrors>({});
  const [legalProfile, setLegalProfile] = useState<VerificationLegalProfile>({
    companyName: '',
    taxCode: '',
    businessLicense: '',
    representative: '',
    phone: '',
    email: '',
    website: '',
  });
  const [interviewRequest, setInterviewRequest] = useState<VerificationInterviewRequest>({
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

  const statusColor = useMemo(() => getStatusColor(verification?.status), [verification?.status]);

  const missingLegalFields = useMemo(
    () => REQUIRED_LEGAL_FIELDS.filter((field) => !String(legalProfile[field] || '').trim()),
    [legalProfile],
  );

  const legalCompletion = useMemo(() => {
    return Math.round(((REQUIRED_LEGAL_FIELDS.length - missingLegalFields.length) / REQUIRED_LEGAL_FIELDS.length) * 100);
  }, [missingLegalFields.length]);

  const legalReady = missingLegalFields.length === 0;
  const scheduleReady = Boolean(verification?.scheduledAt);
  const canPost = verification?.status === 'approved' || Boolean(verification?.companyDict?.isVerified);

  const interviewStatus = useMemo(() => {
    if (!verification?.scheduledAt) return t('verification.messages.noScheduleYet');
    return t('verification.messages.waitingConfirmation');
  }, [verification?.scheduledAt, t]);

  const showSnackbar = (message: string, severity: AlertColor = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const requiredMessage = t('verification.validation.required', { defaultValue: 'Trường này là bắt buộc.' });

  const validateLegalProfile = () => {
    const nextErrors: LegalErrors = {};
    REQUIRED_LEGAL_FIELDS.forEach((field) => {
      if (!String(legalProfile[field] || '').trim()) {
        nextErrors[field] = requiredMessage;
      }
    });

    if (legalProfile.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(legalProfile.email.trim())) {
      nextErrors.email = t('verification.validation.email', { defaultValue: 'Email không hợp lệ.' });
    }

    setLegalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateInterviewRequest = () => {
    const nextErrors: InterviewErrors = {};
    if (!interviewRequest.scheduledAt) {
      nextErrors.scheduledAt = requiredMessage;
    } else if (interviewRequest.scheduledAt.isBefore(dayjs())) {
      nextErrors.scheduledAt = t('verification.validation.futureDate', { defaultValue: 'Thời gian phải ở hiện tại hoặc tương lai.' });
    }
    if (!interviewRequest.contactName.trim()) nextErrors.contactName = requiredMessage;
    if (!interviewRequest.contactPhone.trim()) nextErrors.contactPhone = requiredMessage;

    setInterviewErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLegalProfileChange =
    (field: keyof VerificationLegalProfile) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setLegalProfile((prev) => ({ ...prev, [field]: event.target.value }));
      setLegalErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleInterviewChange =
    (field: keyof Omit<VerificationInterviewRequest, 'scheduledAt'>) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setInterviewRequest((prev) => ({ ...prev, [field]: event.target.value }));
      setInterviewErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSaveLegalProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateLegalProfile()) {
      showSnackbar(t('verification.messages.fixRequiredFields', { defaultValue: 'Vui lòng bổ sung các thông tin bắt buộc.' }), 'error');
      return;
    }

    try {
      await updateMutation.mutateAsync(legalProfile);
      showSnackbar(t('verification.messages.profileSaved'));
    } catch {
      showSnackbar(t('verification.messages.saveFailed', { defaultValue: 'Không thể lưu hồ sơ xác thực. Vui lòng thử lại.' }), 'error');
    }
  };

  const handleRequestInterview = async (event: React.FormEvent) => {
    event.preventDefault();
    const legalValid = validateLegalProfile();
    const interviewValid = validateInterviewRequest();
    if (!legalValid || !interviewValid || !interviewRequest.scheduledAt) {
      showSnackbar(t('verification.messages.fixRequiredFields', { defaultValue: 'Vui lòng bổ sung các thông tin bắt buộc.' }), 'error');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        ...legalProfile,
        scheduledAt: interviewRequest.scheduledAt.toISOString(),
        contactName: interviewRequest.contactName,
        contactPhone: interviewRequest.contactPhone,
        notes: interviewRequest.notes,
      });
      showSnackbar(t('verification.messages.requestSubmitted'));
    } catch {
      showSnackbar(t('verification.messages.requestFailed', { defaultValue: 'Không thể gửi yêu cầu xác minh. Vui lòng thử lại.' }), 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {t('verification.title')}
      </Typography>
      <VerificationIntroCard
        statusLabel={statusLabel}
        statusColor={statusColor}
        completion={legalCompletion}
        missingCount={missingLegalFields.length}
        canPost={canPost}
        legalReady={legalReady}
        scheduleReady={scheduleReady}
      />
      <VerificationLegalProfileForm
        legalProfile={legalProfile}
        onChange={handleLegalProfileChange}
        onSubmit={handleSaveLegalProfile}
        statusLabel={statusLabel}
        statusColor={statusColor}
        errors={legalErrors}
        loading={isLoading || updateMutation.isPending}
      />
      <VerificationInterviewRequestForm
        interviewRequest={interviewRequest}
        onTextChange={handleInterviewChange}
        onDateChange={(value: Dayjs | null) => {
          setInterviewRequest((prev) => ({ ...prev, scheduledAt: value }));
          setInterviewErrors((prev) => ({ ...prev, scheduledAt: undefined }));
        }}
        onSubmit={handleRequestInterview}
        statusText={interviewStatus}
        errors={interviewErrors}
        loading={isLoading || updateMutation.isPending}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerificationPage;
