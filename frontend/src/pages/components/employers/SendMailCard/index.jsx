/*

MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy

Email: khuy220@gmail.com

Copyright (c) 2023 Bui Khanh Huy

License: MIT License

See the LICENSE file in the project root for full license information.

*/

import React from 'react';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import Grid from "@mui/material/Grid2";

import SendIcon from '@mui/icons-material/Send';

import FormPopup from '../../../../components/controls/FormPopup';

import TextFieldCustom from '../../../../components/controls/TextFieldCustom';

import RichTextEditorCustom from '../../../../components/controls/RichTextEditorCustom';

import CheckboxCustom from '../../../../components/controls/CheckboxCustom';

const SendMailCard = ({

  openPopup,

  setOpenPopup,

  sendMailData,

  handleSendEmail,

}) => {

  const schema = yup.object().shape({

    email: yup

      .string()

      .required('Recipient email is required.')

      .email('Invalid recipient email.')

      .max(100, 'Recipient email length exceeded.'),

    fullName: yup

      .string()

      .required('Recipient name.')

      .max(100, 'Recipient name length exceeded.'),

    title: yup

      .string()

      .required('Email subject is required.')

      .max(200, 'Email subject length exceeded.'),

    content: yup

      .mixed()

      .test('content', 'Email content is required.', (value) =>

        value.getCurrentContent().hasText()

      ),

    isSendMe: yup.boolean().default(false),

  });

  const { control, reset, handleSubmit } = useForm({

    resolver: yupResolver(schema),

  });

  React.useEffect(() => {
    if (openPopup) {
      reset();
    }
  }, [openPopup, reset]);

  React.useEffect(() => {

    if (sendMailData) {

      reset((formValues) => ({

        ...formValues,

        ...sendMailData,

      }));

    } else {

      reset();

    }

  }, [sendMailData, reset]);

  return (
    <>
      <FormPopup

        title="Send Mail"

        openPopup={openPopup}

        setOpenPopup={setOpenPopup}

        buttonText="Send"

        buttonIcon={<SendIcon />}

      >

        <form id="modal-form" onSubmit={handleSubmit(handleSendEmail)}>

          <Grid container spacing={2}>

            <Grid size={12}>

              <TextFieldCustom

                name="fullName"

                title="Recipient name"

                showRequired={true}

                placeholder="Enter recipient name"

                control={control}

                disabled={true}

              />

            </Grid>

            <Grid size={12}>

              <TextFieldCustom

                name="email"

                title="Recipient email"

                showRequired={true}

                placeholder="Enter recipient email"

                control={control}

                disabled={true}

              />

            </Grid>

            <Grid size={12}>

              <TextFieldCustom

                name="title"

                title="Subject"

                showRequired={true}

                placeholder="Enter email subject"

                control={control}

              />

            </Grid>

            <Grid size={12}>

              <RichTextEditorCustom

                name="content"

                control={control}

                title="Email content"

                showRequired={true}

              />

            </Grid>

            <Grid size={12}>

              <CheckboxCustom

                name="isSendMe"

                control={control}

                title="Send a copy to my employer email address."

              />

            </Grid>

          </Grid>

        </form>

      </FormPopup>
    </>
  );

};

export default SendMailCard;

