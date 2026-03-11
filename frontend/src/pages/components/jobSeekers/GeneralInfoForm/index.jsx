/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Grid from "@mui/material/Grid2";

import { useTranslation } from 'react-i18next';

import TextFieldCustom from '../../../../components/controls/TextFieldCustom';
import MultilineTextFieldCustom from '../../../../components/controls/MultilineTextFieldCustom';
import SingleSelectCustom from '../../../../components/controls/SingleSelectCustom';

const GeneralInfoForm = ({ handleUpdate, editData }) => {
  const { t } = useTranslation(['jobSeeker']);
  const { allConfig } = useSelector((state) => state.config);
  const schema = yup.object().shape({
    title: yup
      .string()
      .required('Desired position is required.')
      .max(200, 'Desired position exceeds allowed length.'),
    position: yup
      .number()
      .required('Desired level is required.')
      .typeError('Desired level is required.'),
    academicLevel: yup
      .number()
      .required('Academic level is required.')
      .typeError('Academic level is required.'),
    experience: yup
      .number()
      .required('Work experience is required.')
      .typeError('Work experience is required.'),
    career: yup
      .number()
      .required('Career is required.')
      .typeError('Career is required.'),
    city: yup
      .number()
      .required('City/Province is required.')
      .typeError('City/Province is required.'),
    salaryMin: yup
      .number()
      .required('Minimum desired salary is required.')
      .typeError('Invalid minimum salary.')
      .min(0, 'Invalid minimum salary.')
      .test(
        'minimum-wage-comparison',
        'Minimum salary must be less than maximum salary.',
        function (value) {
          return !(value >= this.parent.salaryMax);
        }
      ),
    salaryMax: yup
      .number()
      .required('Maximum desired salary is required.')
      .typeError('Invalid maximum salary.')
      .min(0, 'Invalid maximum salary.')
      .test(
        'maximum-wage-comparison',
        'Maximum salary must be greater than minimum salary.',
        function (value) {
          return !(value <= this.parent.salaryMin);
        }
      ),
    expectedSalary: yup.number().nullable().min(0, 'Expected salary must be a positive number.'),
    typeOfWorkplace: yup
      .number()
      .required('Workplace type is required.')
      .typeError('Workplace type is required.'),
    jobType: yup
      .number()
      .required('Job type is required.')
      .typeError('Job type is required.'),
    description: yup
      .string()
      .required('Career objective is required.')
      .max(800, 'Career objective exceeds allowed length.'),
    skillsSummary: yup
      .string()
      .max(2000, 'Skills summary exceeds allowed length.'),
  });

  const { control, reset, handleSubmit } = useForm({
    resolver: yupResolver(schema),
  });

  React.useEffect(() => {
    reset((formValues) => ({
      ...formValues,
      title: editData.title || '',
      position: editData?.position || '',
      academicLevel: editData?.academicLevel || '',
      experience: editData?.experience || '',
      career: editData?.career || '',
      city: editData?.city || '',
      salaryMin: editData?.salaryMin || '',
      salaryMax: editData?.salaryMax || '',
      expectedSalary: editData?.expectedSalary || '',
      typeOfWorkplace: editData?.typeOfWorkplace || '',
      jobType: editData?.jobType || '',
      description: editData?.description || '',
      skillsSummary: editData?.skillsSummary || '',
    }));
  }, [editData, reset]);

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleUpdate)}>
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextFieldCustom
            name="title"
            showRequired={true}
            title="Desired Position"
            placeholder="E.g.: Backend Developer"
            control={control}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <SingleSelectCustom
            name="position"
            control={control}
            options={allConfig?.positionOptions || []}
            title="Desired Level"
            showRequired={true}
            placeholder="Select level"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <SingleSelectCustom
            name="academicLevel"
            control={control}
            options={allConfig?.academicLevelOptions || []}
            title="Academic Level"
            showRequired={true}
            placeholder="Select academic level"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <SingleSelectCustom
            name="experience"
            control={control}
            options={allConfig?.experienceOptions || []}
            title="Work Experience"
            showRequired={true}
            placeholder="Select work experience"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <SingleSelectCustom
            name="career"
            control={control}
            options={allConfig?.careerOptions || []}
            title="Career"
            showRequired={true}
            placeholder="Select career"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <SingleSelectCustom
            name="city"
            control={control}
            options={allConfig?.cityOptions || []}
            title="City/Province"
            showRequired={true}
            placeholder="Select city/province"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextFieldCustom
            name="salaryMin"
            title="Minimum Desired Salary"
            showRequired={true}
            placeholder="Enter minimum desired salary"
            control={control}
            icon={'VND'}
            type="number"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextFieldCustom
            name="salaryMax"
            title="Maximum Desired Salary"
            showRequired={true}
            placeholder="Enter maximum desired salary"
            control={control}
            icon={'VND'}
            type="number"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextFieldCustom
            name="expectedSalary"
            title={t('jobSeeker:profile.fields.expectedSalary')}
            placeholder={t('jobSeeker:profile.placeholders.expectedSalary')}
            control={control}
            icon={'VND'}
            type="number"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <SingleSelectCustom
            name="typeOfWorkplace"
            control={control}
            options={allConfig?.typeOfWorkplaceOptions || []}
            title="Workplace Type"
            showRequired={true}
            placeholder="Select workplace type"
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <SingleSelectCustom
            name="jobType"
            control={control}
            options={allConfig?.jobTypeOptions || []}
            title="Job Type"
            showRequired={true}
            placeholder="Select job type"
          />
        </Grid>
        <Grid size={12}>
          <MultilineTextFieldCustom
            name="description"
            title="Career Objective"
            showRequired={true}
            placeholder="Enter content here"
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <MultilineTextFieldCustom
            name="skillsSummary"
            title={t('jobSeeker:profile.fields.skillsSummary')}
            placeholder={t('jobSeeker:profile.placeholders.skillsSummary')}
            control={control}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default GeneralInfoForm;
