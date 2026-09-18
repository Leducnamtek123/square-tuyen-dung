import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';

import { convertEditorStateToHTMLString } from '@/utils/editorUtils';
import SendMailCard, { SendMailData, SendMailFormData } from '../SendMailCard';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import jobPostActivityService from '@/services/jobPostActivityService';
import toastMessages from '@/utils/toastMessages';
import errorHandling from '@/utils/errorHandling';
import pc from '@/utils/muiColors';
import { getAppliedResumeEmailActionState } from './sendEmailAction';

interface SendEmailComponentProps {
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
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);
  const [openSendMailPopup, setOpenSendMailPopup] = useState(false);
  const [sendMailData, setSendMailData] = useState<SendMailData | null>(null);
  const [didSendEmail, setDidSendEmail] = useState(false);
  const sentEmail = isSentEmail || didSendEmail;
  const emailActionState = getAppliedResumeEmailActionState(email);
  const tooltipTitle = emailActionState.canSend
    ? sentEmail
      ? t('appliedResume.email.resendTooltip')
      : t('appliedResume.email.sendTooltip')
    : t(emailActionState.reasonKey || 'appliedResume.email.missingCandidateEmail');

  const handleOpenSendMail = (email: string, fullName: string) => {
    if (!emailActionState.canSend) return;
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
      setDidSendEmail(true);
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
      <Tooltip title={tooltipTitle} arrow>
        <span>
          <IconButton
            aria-label={sentEmail ? t('appliedResume.email.resend') : t('appliedResume.email.send')}
            size="small"
            disabled={!emailActionState.canSend}
            onClick={() => handleOpenSendMail(email, fullName)}
            sx={{
              width: 32,
              height: 32,
              bgcolor: sentEmail ? '#ECFDF5' : '#EFF6FF',
              color: sentEmail ? '#059669' : '#2563EB',
              border: '1px solid',
              borderColor: sentEmail ? '#A7F3D0' : '#BFDBFE',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: sentEmail ? '#D1FAE5' : '#DBEAFE',
                borderColor: sentEmail ? '#059669' : '#2563EB',
                transform: 'translateY(-1px)',
              },
              '&.Mui-disabled': {
                bgcolor: '#F1F5F9',
                borderColor: '#E2E8F0',
                color: '#94A3B8',
              },
            }}
          >
            {sentEmail ? (
              <MarkEmailReadRoundedIcon sx={{ fontSize: 17 }} />
            ) : (
              <ForwardToInboxIcon sx={{ fontSize: 17 }} />
            )}
          </IconButton>
        </span>
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
