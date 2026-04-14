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
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

interface ApplyCardProps {
  title?: string;
  jobPostId: string | number;
  openPopup: boolean;
  setOpenPopup: (open: boolean) => void;
  setIsApplySuccess: (success: boolean) => void;
}

const ApplyCard = ({
  title = '',
  jobPostId,
  openPopup,
  setOpenPopup,
  setIsApplySuccess,
}: ApplyCardProps) => {
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const handleApplyJob = (data: ApplyFormValues) => {
    const applyJob = async (applyData: ApplyFormValues & { job_post?: string | number }) => {
      setIsFullScreenLoading(true);
      try {
        await jobPostActivityService.applyJob(applyData as unknown as Record<string, unknown>);
        toastMessages.success('Applied successfully.');
        setIsApplySuccess(true);
        setOpenPopup(false);
      } catch (error: unknown) {
        errorHandling(error);
      } finally {
        setIsFullScreenLoading(false);
      }
    };

    applyJob({ ...data, job_post: jobPostId });
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
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
      >
        <ApplyForm handleApplyJob={handleApplyJob} />
      </FormPopup>
      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default ApplyCard;
