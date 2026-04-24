import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { typedYupResolver } from '../../../../utils/formHelpers';
import * as yup from 'yup';
import { Grid2 as Grid, Box, Paper, alpha, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import RichTextEditorCustom from '../../../../components/Common/Controls/RichTextEditorCustom';
import CheckboxCustom from '../../../../components/Common/Controls/CheckboxCustom';
import { createEditorStateFromHTMLString } from '@/utils/editorUtils';

export interface SendMailData {
  fullName?: string;
  email?: string;
}

export interface SendMailFormData {
  fullName: string;
  email: string;
  title: string;
  content: ReturnType<typeof createEditorStateFromHTMLString>;
  isSendMe: boolean;
}

interface SendMailCardProps {
  openPopup: boolean;
  setOpenPopup: (open: boolean) => void;
  sendMailData: SendMailData | null;
  handleSendEmail: (data: SendMailFormData) => void;
}

const EMPTY_VALUES: SendMailFormData = {
  fullName: '',
  email: '',
  title: '',
  content: createEditorStateFromHTMLString(''),
  isSendMe: false,
};

const SendMailCardContent = ({
  openPopup,
  setOpenPopup,
  sendMailData,
  handleSendEmail,
}: SendMailCardProps) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();

  const schema = yup.object().shape({
    email: yup.string().required('Recipient email is required.').email('Invalid recipient email.').max(100, 'Recipient email length exceeded.'),
    fullName: yup.string().required('Recipient name is required.').max(100, 'Recipient name length exceeded.'),
    title: yup.string().required('Email subject is required.').max(200, 'Email subject length exceeded.'),
    content: yup.mixed<ReturnType<typeof createEditorStateFromHTMLString>>().test('content', 'Email content is required.', (value) => {
      if (!value) return false;
      return value.getCurrentContent().hasText();
    }),
    isSendMe: yup.boolean().default(false),
  });

  const initialValues = React.useMemo(
    () => ({
      ...EMPTY_VALUES,
      ...sendMailData,
    }),
    [sendMailData]
  );

  const { control, handleSubmit } = useForm<SendMailFormData>({
    resolver: typedYupResolver(schema),
    defaultValues: initialValues,
  });

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      backgroundColor: alpha(theme.palette.action.disabled, 0.03),
      '&:hover': { bgcolor: alpha(theme.palette.action.disabled, 0.06) },
      '& fieldset': { borderColor: alpha(theme.palette.divider, 0.8) },
    },
  };

  return (
    <FormPopup
      title={t('sendMailCard.title.sendmail', 'Send Email to Candidate')}
      openPopup={openPopup}
      setOpenPopup={setOpenPopup}
      buttonText="Send Email"
      buttonIcon={<SendIcon />}
    >
      <form id="modal-form" onSubmit={handleSubmit(handleSendEmail)}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <TextFieldCustom
              name="fullName"
              title={t('sendMailCard.title.recipientname', 'Recipient Name')}
              showRequired={true}
              placeholder={t('sendMailCard.placeholder.enterrecipientname', 'Enter recipient name')}
              control={control}
              disabled={true}
              sx={inputSx}
            />
          </Grid>
          <Grid size={12}>
            <TextFieldCustom
              name="email"
              title={t('sendMailCard.title.recipientemail', 'Recipient Email')}
              showRequired={true}
              placeholder={t('sendMailCard.placeholder.enterrecipientemail', 'Enter recipient email')}
              control={control}
              disabled={true}
              sx={inputSx}
            />
          </Grid>
          <Grid size={12}>
            <TextFieldCustom
              name="title"
              title={t('sendMailCard.title.subject', 'Email Subject')}
              showRequired={true}
              placeholder={t('sendMailCard.placeholder.enteremailsubject', 'Enter email subject')}
              control={control}
              sx={inputSx}
            />
          </Grid>
          <Grid size={12}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.neutral' }}>
              <RichTextEditorCustom name="content" control={control} title={t('sendMailCard.title.emailcontent', 'Email Content')} showRequired={true} />
            </Paper>
          </Grid>
          <Grid size={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <CheckboxCustom
                name="isSendMe"
                control={control}
                title={t('sendMailCard.title.sendacopytomyemployeremailaddress', 'Send a copy to my employer email address.')}
              />
            </Box>
          </Grid>
        </Grid>
      </form>
    </FormPopup>
  );
};

const SendMailCard = ({ openPopup, setOpenPopup, sendMailData, handleSendEmail }: SendMailCardProps) => {
  const formKey = React.useMemo(() => JSON.stringify({ openPopup, sendMailData }), [openPopup, sendMailData]);

  return <SendMailCardContent key={formKey} openPopup={openPopup} setOpenPopup={setOpenPopup} sendMailData={sendMailData} handleSendEmail={handleSendEmail} />;
};

export default SendMailCard;
