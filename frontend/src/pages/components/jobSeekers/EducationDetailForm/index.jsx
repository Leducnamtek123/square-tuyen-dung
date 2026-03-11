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

import { useTranslation } from 'react-i18next';

import { DATE_OPTIONS } from '../../../../configs/constants';
import TextFieldCustom from '../../../../components/controls/TextFieldCustom';
import MultilineTextFieldCustom from '../../../../components/controls/MultilineTextFieldCustom';
import DatePickerCustom from '../../../../components/controls/DatePickerCustom';

const EducationDetaiForm = ({ handleAddOrUpdate, editData }) => {
  const { t } = useTranslation(['jobSeeker']);
  const schema = yup.object().shape({
    degreeName: yup
      .string()
      .required('Degree/Certificate name is required.')
      .max(200, 'Degree/Certificate name exceeds allowed length.'),
    major: yup
      .string()
      .required('Major is required.')
      .max(255, 'Major exceeds allowed length.'),
    trainingPlaceName: yup
      .string()
      .required('School/Training center is required.')
      .max(255, 'School/Training center exceeds allowed length.'),
    startDate: yup
      .date()
      .required('Start date is required.')
      .typeError('Start date is required.'),
    completedDate: yup.date().nullable(),
    gradeOrRank: yup.string().max(100, 'Grade/Rank exceeds allowed length.'),
  });

  const { control, reset, handleSubmit } = useForm({
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

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextFieldCustom
            name="degreeName"
            title="Degree/Certificate Name"
            showRequired={true}
            placeholder="E.g.: Bachelor of IT, Industrial Electrical Certificate"
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="major"
            title="Major"
            showRequired={true}
            placeholder="Enter major"
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="trainingPlaceName"
            title="School/Training Center"
            showRequired={true}
            placeholder="Enter school/Training center name"
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
            title="Start Date"
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
            name="completedDate"
            control={control}
            title="Completion Date (Leave blank if currently studying here)"
            maxDate={DATE_OPTIONS.today}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="gradeOrRank"
            title={t('jobSeeker:profile.fields.gradeOrRank')}
            placeholder={t('jobSeeker:profile.placeholders.gradeOrRank')}
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <MultilineTextFieldCustom
            name="description"
            title="Additional Description"
            placeholder="Enter description here"
            control={control}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default EducationDetaiForm;
