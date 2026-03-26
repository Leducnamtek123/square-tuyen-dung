import React from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';

import { convertEditorStateToHTMLString } from '../../../../utils/editorUtils';
import SendMailCard from '../SendMailCard';
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
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const [openSendMailPopup, setOpenSendMailPopup] = React.useState(false);
  const [sendMailData, setSendMailData] = React.useState<any>(null);
  const [sentEmail, setSentEmail] = React.useState(isSentEmail);

  const handleOpenSendMail = (email: string, fullName: string) => {
    setSendMailData({
      fullName: fullName,
      email: email,
    });
    setOpenSendMailPopup(true);
  };

  const handleSendEmail = (data: any) => {
    const sendEmail = async (id: string, data: any) => {
      setIsFullScreenLoading(true);
      try {
        await jobPostActivityService.sendEmail(id, data);
        if (!sentEmail) {
          setSentEmail(true);
        }
        setOpenSendMailPopup(false);
        toastMessages.success(t('appliedResume.email.sentSuccess'));
      } catch (error: any) {
        errorHandling(error);
      } finally {
        setIsFullScreenLoading(false);
      }
    };
    let newData = {
      ...data,
      content: convertEditorStateToHTMLString(data.content),
    };
    sendEmail(jobPostActivityId, newData);
  };

  return (
    <>
      <Button
        variant="contained"
        size="small"
        color="secondary"
        sx={{ textTransform: 'inherit', width: 110 }}
        startIcon={
          sentEmail ? <MarkEmailReadRoundedIcon /> : <ForwardToInboxIcon />
        }
        onClick={() => handleOpenSendMail(email, fullName)}
      >
        {sentEmail ? t('appliedResume.email.resend') : t('appliedResume.email.send')}
      </Button>
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
