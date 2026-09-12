'use client';

import React from 'react';
import { Stack, Typography } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from "react-i18next";
import toastMessages from '@/utils/toastMessages';
import errorHandling from '@/utils/errorHandling';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import FormPopup from '@/components/Common/Controls/FormPopup';
import ApplyForm from '@/components/Features/ApplyForm';
import jobPostActivityService from '@/services/jobPostActivityService';
import type { ApplyFormValues } from '@/components/Features/ApplyForm';

interface ApplyCardProps {
  title?: string;
  jobPostId: string | number;
  openPopup: boolean;
  setOpenPopup: (open: boolean) => void;
  setIsApplySuccess: (success: boolean) => void;
  onApplySuccess?: () => void;
}

const ApplyCard = ({
  title = '',
  jobPostId,
  openPopup,
  setOpenPopup,
  setIsApplySuccess,
  onApplySuccess,
}: ApplyCardProps) => {
  const { t } = useTranslation("public");
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const submitLockRef = React.useRef(false);
  const formId = `apply-form-${String(jobPostId)}`;

  const handleApplyJob = async (data: ApplyFormValues) => {
    if (isFullScreenLoading || submitLockRef.current) return;

    submitLockRef.current = true;
    setIsFullScreenLoading(true);
    try {
      await jobPostActivityService.applyJob({
        ...data,
        jobPost: Number(jobPostId),
        resume: Number(data.resume),
      });
      toastMessages.success(t("applyCard.success"));
      setIsApplySuccess(true);
      onApplySuccess?.();
      setOpenPopup(false);
    } catch (error: unknown) {
      errorHandling(error);
    } finally {
      submitLockRef.current = false;
      setIsFullScreenLoading(false);
    }
  };

  return (
    <>
      <FormPopup
        maxWidth="sm"
        fullWidthButton={true}
        title={
          <Stack spacing={0.5}>
            <Typography
              variant="caption"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              {t("applyCard.positionCaption")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#0F172A',
                fontWeight: 700,
                fontSize: { xs: '1.05rem', sm: '1.2rem' },
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </Typography>
          </Stack>
        }
        buttonText={t("applyCard.submit")}
        buttonIcon={<SendIcon sx={{ fontSize: 18 }} />}
        isSubmitting={isFullScreenLoading}
        formId={formId}
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
      >
        <ApplyForm handleApplyJob={handleApplyJob} formId={formId} />
      </FormPopup>
      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default ApplyCard;
