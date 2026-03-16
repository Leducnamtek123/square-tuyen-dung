import React from 'react';

import { Stack, Typography } from "@mui/material";

import SendIcon from '@mui/icons-material/Send';

import toastMessages from '../../utils/toastMessages';

import errorHandling from '../../utils/errorHandling';

import BackdropLoading from '../loading/BackdropLoading';

import FormPopup from '../controls/FormPopup';

import ApplyForm from '../ApplyForm';

import jobPostActivityService from '../../services/jobPostActivityService';

const ApplyCard = ({

  title = '',

  jobPostId,

  openPopup,

  setOpenPopup,

  setIsApplySuccess,

}) => {

  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);

  const handleApplyJob = (data) => {

    const applyJob = async (data) => {

      setIsFullScreenLoading(true);

      try {

        await jobPostActivityService.applyJob(data);

        toastMessages.success('Applied successfully.');

        setIsApplySuccess(true);

        setOpenPopup(false);

      } catch (error) {

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

      {/* Start: full screen loading */}

      {isFullScreenLoading && <BackdropLoading />}

      {/* End: full screen loading */}

    </>

  );

};

export default ApplyCard;
