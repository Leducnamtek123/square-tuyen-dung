import React, { useState, useEffect } from 'react';
import { Button, Tooltip, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import { AxiosError } from 'axios';
import { ApiError } from '../../../../types/api';

import { convertEditorStateToHTMLString } from '../../../../utils/editorUtils';
import SendMailCard, { SendMailData, SendMailFormData } from '../SendMailCard';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import jobPostActivityService from '../../../../services/jobPostActivityService';
import toastMessages from '../../../../utils/toastMessages';
import errorHandling from '../../../../utils/errorHandling';

export interface SendEmailComponentProps {
  jobPostActivityId: string;
  isSentEmail: boolean;
  email: string;
  fullName: string;
}

const SendEmailComponent: React.FC<SendEmailComponentProps> = ({
  jobPostActivityId,
  isSentEmail,
  email,
  fullName,
}) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);
  const [openSendMailPopup, setOpenSendMailPopup] = useState(false);
  const [sendMailData, setSendMailData] = useState<SendMailData | null>(null);
  const [sentEmail, setSentEmail] = useState(isSentEmail);

  useEffect(() => {
    setSentEmail(isSentEmail);
  }, [isSentEmail]);

  const handleOpenSendMail = (email: string, fullName: string) => {
    setSendMailData({
      fullName: fullName,
      email: email,
    });
    setOpenSendMailPopup(true);
  };

  const handleSendEmail = async (data: SendMailFormData) => {
    setIsFullScreenLoading(true);
    try {
      const newData = {
        ...data,
        content: convertEditorStateToHTMLString(data.content),
      };
      await jobPostActivityService.sendEmail(jobPostActivityId, newData);
      setSentEmail(true);
      setOpenSendMailPopup(false);
      toastMessages.success(t('appliedResume.email.sentSuccess'));
    } catch (error: unknown) {
      errorHandling(error);
    } finally {
      setIsFullScreenLoading(false);
    }
  };

  return (
    <>
      <Tooltip title={sentEmail ? t('appliedResume.email.resendTooltip', 'Resend email to candidate') : t('appliedResume.email.sendTooltip', 'Send email to candidate')} arrow>
        <Button
          variant="contained"
          size="small"
          onClick={() => handleOpenSendMail(email, fullName)}
          sx={{ 
            textTransform: 'none', 
            minWidth: 100,
            borderRadius: 1.5,
            fontWeight: 900,
            boxShadow: 'none',
            fontSize: '0.7rem',
            py: 0.6,
            bgcolor: sentEmail ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.secondary.main, 0.1),
            color: sentEmail ? 'success.main' : 'secondary.main',
            border: '1px solid',
            borderColor: sentEmail ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.secondary.main, 0.1),
            '&:hover': {
                bgcolor: sentEmail ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.secondary.main, 0.15),
                borderColor: sentEmail ? 'success.main' : 'secondary.main',
                boxShadow: 'none'
            },
            '& .MuiButton-startIcon': { mr: 0.5 }
          }}
          startIcon={
            sentEmail ? <MarkEmailReadRoundedIcon sx={{ fontSize: 16 }} /> : <ForwardToInboxIcon sx={{ fontSize: 16 }} />
          }
        >
          {sentEmail ? t('appliedResume.email.resend').toUpperCase() : t('appliedResume.email.send').toUpperCase()}
        </Button>
      </Tooltip>
      
      <SendMailCard
        openPopup={openSendMailPopup}
        setOpenPopup={setOpenSendMailPopup}
        sendMailData={sendMailData}
        handleSendEmail={handleSendEmail}
      />
      
      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default SendEmailComponent;
