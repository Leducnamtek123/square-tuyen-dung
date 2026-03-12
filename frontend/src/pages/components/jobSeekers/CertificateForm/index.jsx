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
import { useTranslation } from 'react-i18next';
import Grid from "@mui/material/Grid2";

import { DATE_OPTIONS } from '../../../../configs/constants';
import TextFieldCustom from '../../../../components/controls/TextFieldCustom';
import DatePickerCustom from '../../../../components/controls/DatePickerCustom';

const CertificateForm = ({
  handleAddOrUpdate,
  editData,
  serverErrors = null,
}) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const schema = yup.object().shape({
    name: yup
      .string()
      .required(t('jobSeeker:profile.validation.certificateNameRequired'))
      .max(200, t('jobSeeker:profile.validation.certificateNameMax')),
    trainingPlace: yup
      .string()
      .required(t('jobSeeker:profile.validation.trainingPlaceRequired'))
      .max(255, t('jobSeeker:profile.validation.trainingPlaceMax')),
    startDate: yup
      .date()
      .required(t('jobSeeker:profile.validation.startDateRequired'))
      .typeError(t('jobSeeker:profile.validation.startDateRequired')),
    expirationDate: yup.date().nullable(),
  });

  const { control, reset, setError, handleSubmit } = useForm({
    defaultValues: {
      name: '',
    },
    resolver: yupResolver(schema),
  });

  React.useEffect(() => {
    if (editData) {
      reset((formValues) => ({
        ...formValues,
        ...editData,
      }));
    } else {
      reset();
    }
  }, [editData, reset]);

  // show server errors
  React.useEffect(() => {
    if (serverErrors !== null)
      for (let err in serverErrors) {
        setError(err, {
          type: 400,
          message: serverErrors[err]?.join(' '),
        });
      }
    else {
      setError();
    }
  }, [serverErrors, setError]);

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextFieldCustom
            name="name"
            title={t('jobSeeker:profile.fields.certificateName')}
            showRequired={true}
            placeholder={t('jobSeeker:profile.placeholders.certificateName')}
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="trainingPlace"
            title={t('jobSeeker:profile.fields.trainingPlace')}
            showRequired={true}
            placeholder={t('jobSeeker:profile.placeholders.trainingPlace')}
            control={control}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <DatePickerCustom
            name="startDate"
            control={control}
            title={t('jobSeeker:profile.fields.startDate')}
            showRequired={true}
            maxDate={DATE_OPTIONS.yesterday}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <DatePickerCustom
            name="expirationDate"
            control={control}
            title={t('jobSeeker:profile.fields.expirationDate')}
            maxDate={DATE_OPTIONS.today}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default CertificateForm;
