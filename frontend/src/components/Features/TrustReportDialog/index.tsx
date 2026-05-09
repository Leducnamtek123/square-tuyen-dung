'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';

import FormPopup from '@/components/Common/Controls/FormPopup';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import errorHandling from '@/utils/errorHandling';
import toastMessages from '@/utils/toastMessages';
import trustReportService, { type TrustReportPayload, type TrustReportTargetType } from '@/services/trustReportService';

type TrustReportFormValues = {
  reason: string;
  message: string;
};

type Props = {
  openPopup: boolean;
  setOpenPopup: (open: boolean) => void;
  targetType: TrustReportTargetType;
  jobPostId?: number | null;
  companyId?: number | null;
  targetName?: string;
};

const REPORT_REASONS = [
  { value: 'scam', label: 'jobDetail.reportReasons.scam' },
  { value: 'wrong_info', label: 'jobDetail.reportReasons.wrongInfo' },
  { value: 'spam', label: 'jobDetail.reportReasons.spam' },
  { value: 'duplicate', label: 'jobDetail.reportReasons.duplicate' },
  { value: 'other', label: 'jobDetail.reportReasons.other' },
];

const REPORT_FORM_DEFAULT_VALUES: TrustReportFormValues = {
  reason: 'scam',
  message: '',
};

const TrustReportDialogContent = ({
  openPopup,
  setOpenPopup,
  targetType,
  jobPostId,
  companyId,
  targetName,
}: Props) => {
  const { t } = useTranslation(['public']);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { control, handleSubmit, reset } = useForm<TrustReportFormValues>({
    defaultValues: REPORT_FORM_DEFAULT_VALUES,
  });

  const onSubmit = async (values: TrustReportFormValues) => {
    let shouldClose = false;
    setIsSubmitting(true);
    try {
      const payload: TrustReportPayload = {
        targetType,
        reason: values.reason,
        message: values.message,
        jobPost: jobPostId ?? null,
        company: companyId ?? null,
      };
      await trustReportService.createTrustReport(payload);
      toastMessages.success(t('jobDetail.reportSuccess', 'Report sent successfully.'));
      shouldClose = true;
    } catch (error) {
      errorHandling(error);
    } finally {
      setIsSubmitting(false);
    }

    if (shouldClose) {
      setOpenPopup(false);
    }
  };

  const handleOpenPopupChange = (open: boolean) => {
    if (!open && isSubmitting) return;
    if (open) reset(REPORT_FORM_DEFAULT_VALUES);
    setOpenPopup(open);
  };

  const title = targetType === 'job'
    ? t('jobDetail.reportJobTitle', 'Report job post')
    : t('companyDetail.reportCompanyTitle', 'Report company');

  return (
    <>
      <FormPopup
        title={(
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {t('jobDetail.reportCaption', 'Trust & Safety')}
            </Typography>
            <Typography variant="h6">{title}</Typography>
            {targetName ? (
              <Typography variant="body2" color="text.secondary">
                {targetName}
              </Typography>
            ) : null}
          </Stack>
        ) as React.ReactElement}
        openPopup={openPopup}
        setOpenPopup={handleOpenPopupChange}
        buttonText={t('common:actions.submit', 'Submit')}
        buttonIcon={null}
        isSubmitting={isSubmitting}
      >
        <Box component="form" id="modal-form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Controller
              control={control}
              name="reason"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label={t('jobDetail.reportReasonLabel', 'Reason')}
                >
                  {REPORT_REASONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {t(option.label)}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              control={control}
              name="message"
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={4}
                  label={t('jobDetail.reportMessageLabel', 'Additional details')}
                  placeholder={t('jobDetail.reportMessagePlaceholder', 'Tell us what looks wrong or misleading.')}
                />
              )}
            />
          </Stack>
        </Box>
      </FormPopup>
      {isSubmitting && <BackdropLoading />}
    </>
  );
};

const TrustReportDialog = (props: Props) => {
  if (!props.openPopup) return null;
  return <TrustReportDialogContent {...props} />;
};

export default TrustReportDialog;
