import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useForm } from 'react-hook-form';
import { typedYupResolver } from '../../../../utils/formHelpers';
import * as yup from 'yup';
import { Grid2 as Grid, Box, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FormPopup from '../../../../components/Common/Controls/FormPopup';
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import RichTextEditorCustom from '../../../../components/Common/Controls/RichTextEditorCustom';
import CheckboxCustom from '../../../../components/Common/Controls/CheckboxCustom';
import { createEditorStateFromHTMLString } from '@/utils/editorUtils';
import pc from '@/utils/muiColors';

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

export const createSendMailSchema = (t: TFunction) => yup.object().shape({
  email: yup
    .string()
    .required(t('sendMailCard.validation.emailRequired'))
    .email(t('sendMailCard.validation.emailInvalid'))
    .max(100, t('sendMailCard.validation.emailMax')),
  fullName: yup
    .string()
    .required(t('sendMailCard.validation.recipientNameRequired'))
    .max(100, t('sendMailCard.validation.recipientNameMax')),
  title: yup
    .string()
    .required(t('sendMailCard.validation.subjectRequired'))
    .max(200, t('sendMailCard.validation.subjectMax')),
  content: yup.mixed<ReturnType<typeof createEditorStateFromHTMLString>>().test('content', t('sendMailCard.validation.contentRequired'), (value) => {
    if (!value) return false;
    return value.getCurrentContent().hasText();
  }),
  isSendMe: yup.boolean().default(false),
});

const SendMailCardContent = ({
  openPopup,
  setOpenPopup,
  sendMailData,
  handleSendEmail,
}: SendMailCardProps) => {
  const { t } = useTranslation('employer');
  const schema = React.useMemo(() => createSendMailSchema(t), [t]);

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
      backgroundColor: pc.actionDisabled( 0.03),
      '&:hover': { bgcolor: pc.actionDisabled( 0.06) },
      '& fieldset': { borderColor: pc.divider( 0.8) },
    },
  };

  return (
    <FormPopup
      title={t('sendMailCard.title.sendmail')}
      openPopup={openPopup}
      setOpenPopup={setOpenPopup}
      buttonText={t('sendMailCard.actions.send')}
      buttonIcon={<SendIcon />}
    >
      <form id="modal-form" onSubmit={handleSubmit(handleSendEmail)}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <TextFieldCustom
              name="fullName"
              title={t('sendMailCard.title.recipientname')}
              showRequired={true}
              placeholder={t('sendMailCard.placeholder.enterrecipientname')}
              control={control}
              disabled={true}
              sx={inputSx}
            />
          </Grid>
          <Grid size={12}>
            <TextFieldCustom
              name="email"
              title={t('sendMailCard.title.recipientemail')}
              showRequired={true}
              placeholder={t('sendMailCard.placeholder.enterrecipientemail')}
              control={control}
              disabled={true}
              sx={inputSx}
            />
          </Grid>
          <Grid size={12}>
            <TextFieldCustom
              name="title"
              title={t('sendMailCard.title.subject')}
              showRequired={true}
              placeholder={t('sendMailCard.placeholder.enteremailsubject')}
              control={control}
              sx={inputSx}
            />
          </Grid>
          <Grid size={12}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.neutral' }}>
              <RichTextEditorCustom name="content" control={control} title={t('sendMailCard.title.emailcontent')} showRequired={true} />
            </Paper>
          </Grid>
          <Grid size={12}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: pc.primary( 0.05),
                border: '1px solid',
                borderColor: pc.primary( 0.1),
              }}
            >
              <CheckboxCustom
                name="isSendMe"
                control={control}
                title={t('sendMailCard.title.sendacopytomyemployeremailaddress')}
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
