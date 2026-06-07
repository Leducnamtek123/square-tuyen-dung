'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { typedYupResolver } from '../../../../utils/formHelpers';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@/hooks/useConfig';
import type { TFunction } from 'i18next';
import ProfileUploadFormFields from './ProfileUploadFormFields';
import { BACKEND_CHOICE_VALUES } from '@/utils/backendChoiceValues';

const MAX_CV_FILE_SIZE = 10 * 1024 * 1024;
const MAX_RESUME_SALARY = 999_999_999_999;
const PDF_CONTENT_TYPES = new Set(['application/pdf', 'application/x-pdf']);

export interface FormValues {
  file: File | File[] | null;
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

type CvFileValue = File | File[] | null | undefined;

const getFirstCvFile = (value: CvFileValue) => (
  Array.isArray(value) ? value[0] : value
);

const hasCvFile = (value: CvFileValue) => Boolean(getFirstCvFile(value));

const isPdfCvFile = (value: CvFileValue) => {
  const file = getFirstCvFile(value);
  if (!file) return true;

  const fileName = (file.name || '').toLowerCase();
  const contentType = (file.type || '').toLowerCase();

  return fileName.endsWith('.pdf') && (!contentType || PDF_CONTENT_TYPES.has(contentType));
};

const isAllowedCvFileSize = (value: CvFileValue) => {
  const file = getFirstCvFile(value);
  return !file || (file.size || 0) <= MAX_CV_FILE_SIZE;
};

export const createProfileUploadSchema = (t: TFunction) => yup.object().shape({

    file: yup
      .mixed<File | File[]>()
      .nullable()
      .test(
        'files empty',
        t('jobSeeker:profile.validation.fileRequired'),
        hasCvFile
      )
      .test('file-is-pdf', t('jobSeeker:profile.validation.filePdfOnly'), isPdfCvFile)
      .test('file-max-size', t('jobSeeker:profile.validation.fileTooLarge'), isAllowedCvFileSize),

    title: yup

      .string()

      .required(t('jobSeeker:profile.validation.desiredPositionRequired'))

      .max(200, t('jobSeeker:profile.validation.desiredPositionMax')),

    position: yup

      .number()

      .required(t('jobSeeker:profile.validation.desiredLevelRequired'))
      .oneOf(BACKEND_CHOICE_VALUES.position, t('jobSeeker:profile.validation.choiceInvalid'))

      .typeError(t('jobSeeker:profile.validation.desiredLevelRequired')),

    academicLevel: yup

      .number()

      .required(t('jobSeeker:profile.validation.academicLevelRequired'))
      .oneOf(BACKEND_CHOICE_VALUES.academicLevel, t('jobSeeker:profile.validation.choiceInvalid'))

      .typeError(t('jobSeeker:profile.validation.academicLevelRequired')),

    experience: yup

      .number()

      .required(t('jobSeeker:profile.validation.experienceRequired'))
      .oneOf(BACKEND_CHOICE_VALUES.experience, t('jobSeeker:profile.validation.choiceInvalid'))

      .typeError(t('jobSeeker:profile.validation.experienceRequired')),

    career: yup

      .number()

      .required(t('jobSeeker:profile.validation.careerRequired'))
      .integer(t('jobSeeker:profile.validation.careerRequired'))
      .moreThan(0, t('jobSeeker:profile.validation.careerRequired'))

      .typeError(t('jobSeeker:profile.validation.careerRequired')),

    city: yup

      .number()

      .required(t('jobSeeker:profile.validation.cityRequired'))
      .integer(t('jobSeeker:profile.validation.cityRequired'))
      .moreThan(0, t('jobSeeker:profile.validation.cityRequired'))

      .typeError(t('jobSeeker:profile.validation.cityRequired')),

    salaryMin: yup

      .number()

      .required(t('jobSeeker:profile.validation.salaryMinRequired'))

      .typeError(t('jobSeeker:profile.validation.salaryMinInvalid'))
      .integer(t('jobSeeker:profile.validation.salaryMinInvalid'))

      .min(0, t('jobSeeker:profile.validation.salaryMinInvalid'))
      .max(MAX_RESUME_SALARY, t('jobSeeker:profile.validation.salaryTooLarge'))

      .test(

        'minimum-wage-comparison',

        t('jobSeeker:profile.validation.salaryMinComparison'),

        function (value) {
          const { salaryMax } = this.parent;
          return !(salaryMax !== undefined && value !== undefined && value > salaryMax);

        }

      ),

    salaryMax: yup

      .number()

      .required(t('jobSeeker:profile.validation.salaryMaxRequired'))

      .typeError(t('jobSeeker:profile.validation.salaryMaxInvalid'))
      .integer(t('jobSeeker:profile.validation.salaryMaxInvalid'))

      .min(0, t('jobSeeker:profile.validation.salaryMaxInvalid'))
      .max(MAX_RESUME_SALARY, t('jobSeeker:profile.validation.salaryTooLarge'))

      .test(

        'maximum-wage-comparison',

        t('jobSeeker:profile.validation.salaryMaxComparison'),

        function (value) {
          const { salaryMin } = this.parent;
          return !(salaryMin !== undefined && value !== undefined && value < salaryMin);

        }

      ),

    expectedSalary: yup
      .number()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : value))
      .integer(t('jobSeeker:profile.validation.expectedSalaryInvalid'))
      .min(0, t('jobSeeker:profile.validation.expectedSalaryInvalid'))
      .max(MAX_RESUME_SALARY, t('jobSeeker:profile.validation.salaryTooLarge')),

    typeOfWorkplace: yup

      .number()

      .required(t('jobSeeker:profile.validation.workplaceTypeRequired'))
      .oneOf(BACKEND_CHOICE_VALUES.typeOfWorkplace, t('jobSeeker:profile.validation.choiceInvalid'))

      .typeError(t('jobSeeker:profile.validation.workplaceTypeRequired')),

    jobType: yup

      .number()

      .required(t('jobSeeker:profile.validation.jobTypeRequired'))
      .oneOf(BACKEND_CHOICE_VALUES.jobType, t('jobSeeker:profile.validation.choiceInvalid'))

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
