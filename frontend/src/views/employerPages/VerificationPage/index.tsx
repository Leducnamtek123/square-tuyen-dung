'use client';
import React, { useMemo, useState } from 'react';
import { Box, Snackbar, Alert, Typography } from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import { REGEX_VALIDATE } from '@/configs/constants';
import { TabTitle } from '../../../utils/generalFunction';
import companyVerificationService, { type CompanyVerificationPayload } from '../../../services/companyVerificationService';
import VerificationIntroCard from './components/VerificationIntroCard';
import VerificationLegalProfileForm, { type VerificationLegalProfile } from './components/VerificationLegalProfileForm';
import VerificationInterviewRequestForm, { type VerificationInterviewRequest } from './components/VerificationInterviewRequestForm';
import type { AlertColor, ChipProps } from '@mui/material';

export type LegalErrors = Partial<Record<keyof VerificationLegalProfile, string>>;
export type InterviewErrors = Partial<Record<keyof VerificationInterviewRequest, string>>;

const REQUIRED_LEGAL_FIELDS: Array<keyof VerificationLegalProfile> = [
  'companyName',
  'taxCode',
  'businessLicense',
  'representative',
  'phone',
  'email',
];

const LEGAL_PROFILE_MAX_LENGTHS: Partial<Record<keyof VerificationLegalProfile, number>> = {
  companyName: 255,
  taxCode: 30,
  businessLicense: 255,
  representative: 100,
  phone: 30,
  email: 100,
  website: 300,
};

const INTERVIEW_REQUEST_MAX_LENGTHS: Partial<Record<keyof VerificationInterviewRequest, number>> = {
  contactName: 100,
  contactPhone: 30,
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

const getStatusColor = (status?: string): ChipProps['color'] => {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'error';
  if (status === 'reviewing') return 'warning';
  return 'info';
};

export const validateVerificationLegalProfile = (
  legalProfile: VerificationLegalProfile,
  t: TFunction,
): LegalErrors => {
  const errors: LegalErrors = {};
  const requiredMessage = t('verification.validation.required');

  REQUIRED_LEGAL_FIELDS.forEach((field) => {
    if (!String(legalProfile[field] || '').trim()) {
      errors[field] = requiredMessage;
    }
  });

  Object.entries(LEGAL_PROFILE_MAX_LENGTHS).forEach(([field, maxLength]) => {
    const profileField = field as keyof VerificationLegalProfile;
    if (String(legalProfile[profileField] || '').length > maxLength) {
      errors[profileField] = t('verification.validation.maxLength', { max: maxLength });
    }
  });

  if (legalProfile.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(legalProfile.email.trim())) {
    errors.email = t('verification.validation.email');
  }

  if (legalProfile.phone.trim() && !REGEX_VALIDATE.phoneRegExp.test(legalProfile.phone.trim())) {
    errors.phone = t('verification.validation.phone');
  }

  if (legalProfile.website.trim() && !REGEX_VALIDATE.urlRegExp.test(legalProfile.website.trim())) {
    errors.website = t('verification.validation.website');
  }

  return errors;
};

export const validateVerificationInterviewRequest = (
  interviewRequest: VerificationInterviewRequest,
  t: TFunction,
): InterviewErrors => {
  const errors: InterviewErrors = {};
  const requiredMessage = t('verification.validation.required');

  if (!interviewRequest.scheduledAt) {
    errors.scheduledAt = requiredMessage;
  } else if (interviewRequest.scheduledAt.isBefore(dayjs())) {
    errors.scheduledAt = t('verification.validation.futureDate');
  }
  if (!interviewRequest.contactName.trim()) errors.contactName = requiredMessage;
  if (!interviewRequest.contactPhone.trim()) errors.contactPhone = requiredMessage;
  Object.entries(INTERVIEW_REQUEST_MAX_LENGTHS).forEach(([field, maxLength]) => {
    const requestField = field as keyof VerificationInterviewRequest;
    if (String(interviewRequest[requestField] || '').length > maxLength) {
      errors[requestField] = t('verification.validation.maxLength', { max: maxLength });
    }
  });
  if (interviewRequest.contactPhone.trim() && !REGEX_VALIDATE.phoneRegExp.test(interviewRequest.contactPhone.trim())) {
    errors.contactPhone = t('verification.validation.phone');
  }

  return errors;
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

  const validateLegalProfile = () => {
    const nextErrors = validateVerificationLegalProfile(legalProfile, t);
    setLegalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateInterviewRequest = () => {
    const nextErrors = validateVerificationInterviewRequest(interviewRequest, t);
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
      showSnackbar(t('verification.messages.fixRequiredFields'), 'error');
      return;
    }

    try {
      await updateMutation.mutateAsync(legalProfile);
      showSnackbar(t('verification.messages.profileSaved'));
    } catch {
      showSnackbar(t('verification.messages.saveFailed'), 'error');
    }
  };

  const handleRequestInterview = async (event: React.FormEvent) => {
    event.preventDefault();
    const legalValid = validateLegalProfile();
    const interviewValid = validateInterviewRequest();
    if (!legalValid || !interviewValid || !interviewRequest.scheduledAt) {
      showSnackbar(t('verification.messages.fixRequiredFields'), 'error');
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
      showSnackbar(t('verification.messages.requestFailed'), 'error');
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
