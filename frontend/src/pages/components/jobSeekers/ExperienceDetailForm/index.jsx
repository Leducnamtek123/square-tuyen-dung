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

const ExperienceDetaiForm = ({ handleAddOrUpdate, editData }) => {
  const { t } = useTranslation(['jobSeeker']);
  const schema = yup.object().shape({
    jobName: yup
      .string()
      .required('Job title is required.')
      .max(200, 'Job title exceeds allowed length.'),
    companyName: yup
      .string()
      .required('Company name is required.')
      .max(255, 'Company name exceeds allowed length.'),
    startDate: yup
      .date()
      .required('Start date is required.')
      .typeError('Start date is required.')
      .max(DATE_OPTIONS.yesterday, 'Start date must be before today.')
      .test(
        'start-date-comparison',
        'Start date must be before end date.',
        function (value) {
          return !(value >= this.parent.endDate);
        }
      ),
    endDate: yup
      .date()
      .required('End date is required.')
      .typeError('End date is required.')
      .max(
        DATE_OPTIONS.today,
        'End date must be before or on today.'
      )
      .test(
        'end-date-comparison',
        'End date must be after start date.',
        function (value) {
          return !(value <= this.parent.startDate);
        }
      ),
    lastSalary: yup.number().nullable().min(0, 'Last salary must be a positive number.'),
    leaveReason: yup.string().max(255, 'Reason exceeds allowed length.'),
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
            name="jobName"
            control={control}
            placeholder="E.g.: Software Engineer"
            title="Job Title/Position"
            showRequired={true}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="companyName"
            title="Company Name"
            placeholder="Enter company name"
            control={control}
            showRequired={true}
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
            name="endDate"
            control={control}
            title="End Date"
            showRequired={true}
            maxDate={DATE_OPTIONS.today}
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
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextFieldCustom
            name="lastSalary"
            title={t('jobSeeker:profile.fields.lastSalary')}
            placeholder={t('jobSeeker:profile.placeholders.lastSalary')}
            control={control}
            type="number"
            icon="VND"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextFieldCustom
            name="leaveReason"
            title={t('jobSeeker:profile.fields.leaveReason')}
            placeholder={t('jobSeeker:profile.placeholders.leaveReason')}
            control={control}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ExperienceDetaiForm;
