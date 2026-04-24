'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { typedYupResolver } from '../../../../utils/formHelpers';
import { useConfig } from '@/hooks/useConfig';
import GeneralInfoFormFields from './GeneralInfoFormFields';
import type { TFunction } from 'i18next';
import type { GeneralInfoFormValues } from './types';

export type { GeneralInfoFormValues as FormValues };

interface GeneralInfoFormProps {
  handleUpdate: (data: GeneralInfoFormValues) => void;
  editData: Partial<GeneralInfoFormValues> | null;
}

const createGeneralInfoSchema = (t: TFunction<'jobSeeker', undefined>) => yup.object().shape({
  title: yup.string().required(t('jobSeeker:profile.validation.desiredPositionRequired')).max(200, t('jobSeeker:profile.validation.desiredPositionMax')),
  position: yup.number().required(t('jobSeeker:profile.validation.desiredLevelRequired')).typeError(t('jobSeeker:profile.validation.desiredLevelRequired')),
  academicLevel: yup.number().required(t('jobSeeker:profile.validation.academicLevelRequired')).typeError(t('jobSeeker:profile.validation.academicLevelRequired')),
  experience: yup.number().required(t('jobSeeker:profile.validation.experienceRequired')).typeError(t('jobSeeker:profile.validation.experienceRequired')),
  career: yup.number().required(t('jobSeeker:profile.validation.careerRequired')).typeError(t('jobSeeker:profile.validation.careerRequired')),
  city: yup.number().required(t('jobSeeker:profile.validation.cityRequired')).typeError(t('jobSeeker:profile.validation.cityRequired')),
  salaryMin: yup.number().required(t('jobSeeker:profile.validation.salaryMinRequired')).typeError(t('jobSeeker:profile.validation.salaryMinInvalid')).min(0, t('jobSeeker:profile.validation.salaryMinInvalid')),
  salaryMax: yup.number().required(t('jobSeeker:profile.validation.salaryMaxRequired')).typeError(t('jobSeeker:profile.validation.salaryMaxInvalid')).min(0, t('jobSeeker:profile.validation.salaryMaxInvalid')),
  expectedSalary: yup.number().nullable().min(0, t('jobSeeker:profile.validation.expectedSalaryInvalid')),
  typeOfWorkplace: yup.number().required(t('jobSeeker:profile.validation.workplaceTypeRequired')).typeError(t('jobSeeker:profile.validation.workplaceTypeRequired')),
  jobType: yup.number().required(t('jobSeeker:profile.validation.jobTypeRequired')).typeError(t('jobSeeker:profile.validation.jobTypeRequired')),
  description: yup.string().required(t('jobSeeker:profile.validation.objectiveRequired')).max(800, t('jobSeeker:profile.validation.objectiveMax')),
  skillsSummary: yup.string().max(2000, t('jobSeeker:profile.validation.skillsSummaryMax')),
});

const GeneralInfoForm = ({ handleUpdate, editData }: GeneralInfoFormProps) => {
  const { t } = useTranslation(['jobSeeker']);
  const { allConfig } = useConfig();
  const schema = React.useMemo(() => createGeneralInfoSchema(t), [t]);

  const { control, handleSubmit } = useForm<GeneralInfoFormValues>({
    resolver: typedYupResolver<GeneralInfoFormValues>(schema),
    defaultValues: {
      title: '',
      position: '',
      academicLevel: '',
      experience: '',
      career: '',
      city: '',
      salaryMin: '',
      salaryMax: '',
      expectedSalary: '',
      typeOfWorkplace: '',
      jobType: '',
      description: '',
      skillsSummary: '',
      ...(editData || {}),
    },
  });

  const formKey = React.useMemo(() => JSON.stringify(editData || {}), [editData]);

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleUpdate)}>
      <GeneralInfoFormFields key={formKey} control={control} t={t} allConfig={allConfig} />
    </form>
  );
};

export default GeneralInfoForm;
