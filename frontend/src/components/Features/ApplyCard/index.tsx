import React from 'react';
import { Stack, Typography } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
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
      toastMessages.success('Applied successfully.');
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
        title={
          <Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}>
              Ứng tuyển vị trí
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, mt: -0.5 }}>
              {title}
            </Typography>
          </Stack>
        }
        buttonText="Ứng tuyển"
        buttonIcon={<SendIcon />}
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
