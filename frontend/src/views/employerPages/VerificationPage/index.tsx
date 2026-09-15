'use client';

import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import { REGEX_VALIDATE } from '@/configs/constants';
import { TabTitle } from '@/utils/generalFunction';
import companyVerificationService, { type CompanyVerificationPayload } from '@/services/companyVerificationService';
import VerificationIntroCard from './components/VerificationIntroCard';
import VerificationLegalProfileForm, { type VerificationLegalProfile } from './components/VerificationLegalProfileForm';
import VerificationLegalProfileReviewCard from './components/VerificationLegalProfileReviewCard';
import type { AlertColor, ChipProps } from '@mui/material';
import toastMessages from '@/utils/toastMessages';

export type LegalErrors = Partial<Record<keyof VerificationLegalProfile, string>>;

export const REQUIRED_LEGAL_FIELDS: Array<keyof VerificationLegalProfile> = [
  'companyName',
  'taxCode',
  'businessLicense',
  'representative',
  'phone',
  'email',
];

export const LEGAL_PROFILE_MAX_LENGTHS: Partial<Record<keyof VerificationLegalProfile, number>> = {
  companyName: 255,
  taxCode: 30,
  businessLicense: 255,
  representative: 100,
  phone: 30,
  email: 100,
  website: 300,
};

export const getStatusLabelKey = (status?: string) => {
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

export const getStatusColor = (status?: string): ChipProps['color'] => {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'error';
  if (status === 'reviewing') return 'warning';
  return 'info';
};

export const calculateLegalCompletion = (
  legalProfile: Partial<VerificationLegalProfile>,
): { missingFields: Array<keyof VerificationLegalProfile>; completion: number } => {
  const missingFields = REQUIRED_LEGAL_FIELDS.filter(
    (field) => !String(legalProfile[field] || '').trim(),
  );
  const completion = Math.round(
    ((REQUIRED_LEGAL_FIELDS.length - missingFields.length) / REQUIRED_LEGAL_FIELDS.length) * 100,
  );
  return { missingFields, completion };
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

  if (legalProfile.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(legalProfile.email.trim())) {
    errors.email = t('verification.validation.email');
  }

  if (legalProfile.phone?.trim() && !REGEX_VALIDATE.phoneRegExp.test(legalProfile.phone.trim())) {
    errors.phone = t('verification.validation.phone');
  }

  if (legalProfile.website?.trim() && !REGEX_VALIDATE.urlRegExp.test(legalProfile.website.trim())) {
    errors.website = t('verification.validation.website');
  }

  return errors;
};

const VerificationPage = () => {
  const { t } = useTranslation('employer');
  const queryClient = useQueryClient();
  TabTitle(t('verification.title'));

  const [isEditing, setIsEditing] = useState(false);
  const [legalErrors, setLegalErrors] = useState<LegalErrors>({});
  const [legalProfile, setLegalProfile] = useState<VerificationLegalProfile>({
    companyName: '',
    taxCode: '',
    businessLicense: '',
    representative: '',
    phone: '',
    email: '',
    website: '',
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

  const { missingFields, completion: legalCompletion } = useMemo(
    () => calculateLegalCompletion(legalProfile),
    [legalProfile],
  );

  const legalReady = missingFields.length === 0;
  const isVerified = verification?.status === 'approved' || Boolean(verification?.companyDict?.isVerified);
  const canPost = isVerified;

  const showSnackbar = (message: string, severity: AlertColor = 'success') => {
    if (severity === 'error') {
      toastMessages.error(message);
    } else {
      toastMessages.success(message);
    }
  };

  const validateLegalProfile = () => {
    const nextErrors = validateVerificationLegalProfile(legalProfile, t);
    setLegalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLegalProfileChange =
    (field: keyof VerificationLegalProfile) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setLegalProfile((prev) => ({ ...prev, [field]: event.target.value }));
      setLegalErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleCancelEdit = () => {
    if (verification) {
      setLegalProfile({
        companyName: verification.companyName || '',
        taxCode: verification.taxCode || '',
        businessLicense: verification.businessLicense || '',
        representative: verification.representative || '',
        phone: verification.phone || '',
        email: verification.email || '',
        website: verification.website || '',
      });
    }
    setLegalErrors({});
    setIsEditing(false);
  };

  const handleSaveLegalProfile = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (!validateLegalProfile()) {
      showSnackbar(t('verification.messages.fixRequiredFields'), 'error');
      return;
    }

    try {
      await updateMutation.mutateAsync(legalProfile);
      showSnackbar(t('verification.messages.profileSaved'));
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ['company-verification'] });
    } catch {
      showSnackbar(t('verification.messages.saveFailed'), 'error');
    }
  };

  return (
    <Box>
      <VerificationIntroCard
        statusLabel={statusLabel}
        statusColor={statusColor}
        completion={legalCompletion}
        missingCount={missingFields.length}
        canPost={canPost}
        legalReady={legalReady}
        status={verification?.status}
        adminNote={verification?.adminNote}
        hasLicense={Boolean(legalProfile.businessLicense)}
      />

      {isVerified && !isEditing ? (
        <VerificationLegalProfileReviewCard
          legalProfile={legalProfile}
          verification={verification}
          onStartEditing={() => setIsEditing(true)}
        />
      ) : (
        <VerificationLegalProfileForm
          legalProfile={legalProfile}
          onChange={handleLegalProfileChange}
          onLicenseFileUploaded={(url) => setLegalProfile((prev) => ({ ...prev, businessLicense: url }))}
          onSubmit={handleSaveLegalProfile}
          onCancel={isVerified ? handleCancelEdit : undefined}
          isPreviouslyVerified={isVerified}
          statusLabel={statusLabel}
          statusColor={statusColor}
          errors={legalErrors}
          loading={isLoading || updateMutation.isPending}
        />
      )}
    </Box>
  );
};

export default VerificationPage;
