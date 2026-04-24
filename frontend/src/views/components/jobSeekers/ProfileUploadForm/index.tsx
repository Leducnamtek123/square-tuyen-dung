'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { typedYupResolver } from '../../../../utils/formHelpers';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@/hooks/useConfig';
import type { TFunction } from 'i18next';
import ProfileUploadFormFields from './ProfileUploadFormFields';

export interface FormValues {
  file: File[] | null;
  title: string;
  position: number | string;
  academicLevel: number | string;
  experience: number | string;
  career: number | string;
  city: number | string;
  salaryMin: number;
  salaryMax: number;
  expectedSalary: number | null;
  typeOfWorkplace: number | string;
  jobType: number | string;
  description: string;
  skillsSummary: string;
}

interface ProfileUploadFormProps {
  handleAdd: (data: FormValues) => void;
}

const createProfileUploadSchema = (t: TFunction) => yup.object().shape({

    file: yup
      .mixed<File[]>()
      .nullable()
      .test(
        'files empty',
        t('jobSeeker:profile.validation.fileRequired'),
        (value) =>
          !(
            value === undefined ||
            value === null ||
            value.length === 0
          )
      ),

    title: yup

      .string()

      .required(t('jobSeeker:profile.validation.desiredPositionRequired'))

      .max(200, t('jobSeeker:profile.validation.desiredPositionMax')),

    position: yup

      .number()

      .required(t('jobSeeker:profile.validation.desiredLevelRequired'))

      .typeError(t('jobSeeker:profile.validation.desiredLevelRequired')),

    academicLevel: yup

      .number()

      .required(t('jobSeeker:profile.validation.academicLevelRequired'))

      .typeError(t('jobSeeker:profile.validation.academicLevelRequired')),

    experience: yup

      .number()

      .required(t('jobSeeker:profile.validation.experienceRequired'))

      .typeError(t('jobSeeker:profile.validation.experienceRequired')),

    career: yup

      .number()

      .required(t('jobSeeker:profile.validation.careerRequired'))

      .typeError(t('jobSeeker:profile.validation.careerRequired')),

    city: yup

      .number()

      .required(t('jobSeeker:profile.validation.cityRequired'))

      .typeError(t('jobSeeker:profile.validation.cityRequired')),

    salaryMin: yup

      .number()

      .required(t('jobSeeker:profile.validation.salaryMinRequired'))

      .typeError(t('jobSeeker:profile.validation.salaryMinInvalid'))

      .min(0, t('jobSeeker:profile.validation.salaryMinInvalid'))

      .test(

        'minimum-wage-comparison',

        t('jobSeeker:profile.validation.salaryMinComparison'),

        function (value) {
          const { salaryMax } = this.parent;
          return !(salaryMax !== undefined && value !== undefined && value >= salaryMax);

        }

      ),

    salaryMax: yup

      .number()

      .required(t('jobSeeker:profile.validation.salaryMaxRequired'))

      .typeError(t('jobSeeker:profile.validation.salaryMaxInvalid'))

      .min(0, t('jobSeeker:profile.validation.salaryMaxInvalid'))

      .test(

        'maximum-wage-comparison',

        t('jobSeeker:profile.validation.salaryMaxComparison'),

        function (value) {
          const { salaryMin } = this.parent;
          return !(salaryMin !== undefined && value !== undefined && value <= salaryMin);

        }

      ),

    expectedSalary: yup.number().nullable().min(0, t('jobSeeker:profile.validation.expectedSalaryInvalid')),

    typeOfWorkplace: yup

      .number()

      .required(t('jobSeeker:profile.validation.workplaceTypeRequired'))

      .typeError(t('jobSeeker:profile.validation.workplaceTypeRequired')),

    jobType: yup

      .number()

      .required(t('jobSeeker:profile.validation.jobTypeRequired'))

      .typeError(t('jobSeeker:profile.validation.jobTypeRequired')),

    description: yup

      .string()

      .required(t('jobSeeker:profile.validation.objectiveRequired'))

      .max(800, t('jobSeeker:profile.validation.objectiveMax')),

    skillsSummary: yup

      .string()

      .max(2000, t('jobSeeker:profile.validation.skillsSummaryMax')),

});

const ProfileUploadForm = ({ handleAdd }: ProfileUploadFormProps) => {
  const { t } = useTranslation(['jobSeeker']);
  const { allConfig } = useConfig();
  const schema = React.useMemo(() => createProfileUploadSchema(t), [t]);
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: typedYupResolver(schema),
  });

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleAdd)}>
      <ProfileUploadFormFields control={control} t={t} allConfig={allConfig} />
    </form>
  );
};

export default ProfileUploadForm;
