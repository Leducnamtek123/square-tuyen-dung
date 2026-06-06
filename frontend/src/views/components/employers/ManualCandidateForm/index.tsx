'use client';

import React from 'react';
import { Grid2 as Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import FileUploadCustom from '../../../../components/Common/Controls/FileUploadCustom';
import MultilineTextFieldCustom from '../../../../components/Common/Controls/MultilineTextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import { typedYupResolver } from '../../../../utils/formHelpers';
import { useConfig } from '@/hooks/useConfig';
import { REGEX_VALIDATE } from '@/configs/constants';

const MAX_MANUAL_CANDIDATE_CV_SIZE = 10 * 1024 * 1024;
const MAX_MANUAL_CANDIDATE_SALARY = 999_999_999_999;
const MAX_APPLIED_PROFILE_FULL_NAME_LENGTH = 100;
const MAX_APPLIED_PROFILE_EMAIL_LENGTH = 100;
const MAX_APPLIED_PROFILE_PHONE_LENGTH = 15;
const PDF_CONTENT_TYPES = new Set(['application/pdf', 'application/x-pdf']);

export interface ManualCandidateFormValues {
  jobPost: number | string | null;
  file: File | null;
  fullName: string;
  email: string;
  phone: string;
  title: string;
  position: number | string | null;
  academicLevel: number | string | null;
  experience: number | string | null;
  career: number | string | null;
  city: number | string | null;
  salaryMin: number | string;
  salaryMax: number | string;
  expectedSalary: number | string | null;
  typeOfWorkplace: number | string | null;
  jobType: number | string | null;
  description: string;
  skillsSummary: string;
  note: string;
}

interface ManualCandidateFormProps {
  formId: string;
  onSubmit: (data: ManualCandidateFormValues) => void;
  jobPostOptions?: Array<{ id: number | string; jobName: string }>;
  requireJobPost?: boolean;
}

const emptyToNull = (value: unknown, originalValue: unknown) => (
  originalValue === '' || originalValue == null ? null : value
);

const isPdfFile = (value: File | null | undefined) => {
  if (!value) return true;

  const fileName = (value.name || '').toLowerCase();
  const contentType = (value.type || '').toLowerCase();

  return fileName.endsWith('.pdf') && (!contentType || PDF_CONTENT_TYPES.has(contentType));
};

const isAllowedFileSize = (value: File | null | undefined) => (
  !value || (value.size || 0) <= MAX_MANUAL_CANDIDATE_CV_SIZE
);

export const createManualCandidateSchema = (t: TFunction, requireJobPost = false) => yup.object({
  jobPost: requireJobPost
    ? yup.number().nullable().transform(emptyToNull).required(t('employer:manualCandidate.validation.jobPostRequired'))
    : yup.number().nullable().transform(emptyToNull),
  file: yup
    .mixed<File>()
    .nullable()
    .test('file-is-pdf', t('employer:manualCandidate.validation.filePdfOnly'), isPdfFile)
    .test('file-max-size', t('employer:manualCandidate.validation.fileTooLarge'), isAllowedFileSize),
  fullName: yup
    .string()
    .trim()
    .required(t('employer:manualCandidate.validation.fullNameRequired'))
    .max(MAX_APPLIED_PROFILE_FULL_NAME_LENGTH, t('employer:manualCandidate.validation.fullNameMax')),
  email: yup
    .string()
    .email(t('employer:manualCandidate.validation.emailInvalid'))
    .max(MAX_APPLIED_PROFILE_EMAIL_LENGTH, t('employer:manualCandidate.validation.emailMax'))
    .default(''),
  phone: yup
    .string()
    .matches(REGEX_VALIDATE.phoneRegExp, {
      message: t('employer:manualCandidate.validation.phoneInvalid'),
      excludeEmptyString: true,
    })
    .max(MAX_APPLIED_PROFILE_PHONE_LENGTH, t('employer:manualCandidate.validation.phoneMax'))
    .default(''),
  title: yup
    .string()
    .trim()
    .required(t('employer:manualCandidate.validation.titleRequired'))
    .max(200, t('employer:manualCandidate.validation.titleMax')),
  position: yup.number().nullable().transform(emptyToNull),
  academicLevel: yup.number().nullable().transform(emptyToNull),
  experience: yup.number().nullable().transform(emptyToNull),
  career: yup.number().nullable().transform(emptyToNull),
  city: yup.number().nullable().transform(emptyToNull),
  salaryMin: yup
    .number()
    .nullable()
    .transform(emptyToNull)
    .min(0, t('employer:manualCandidate.validation.salaryInvalid'))
    .max(MAX_MANUAL_CANDIDATE_SALARY, t('employer:manualCandidate.validation.salaryTooLarge')),
  salaryMax: yup
    .number()
    .nullable()
    .transform(emptyToNull)
    .min(0, t('employer:manualCandidate.validation.salaryInvalid'))
    .max(MAX_MANUAL_CANDIDATE_SALARY, t('employer:manualCandidate.validation.salaryTooLarge'))
    .test('salary-max-gte-min', t('employer:manualCandidate.validation.salaryRangeInvalid'), function (value) {
      const salaryMin = this.parent.salaryMin;
      if (value == null || salaryMin == null) return true;
      return Number(value) >= Number(salaryMin);
    }),
  expectedSalary: yup
    .number()
    .nullable()
    .transform(emptyToNull)
    .min(0, t('employer:manualCandidate.validation.salaryInvalid'))
    .max(MAX_MANUAL_CANDIDATE_SALARY, t('employer:manualCandidate.validation.salaryTooLarge')),
  typeOfWorkplace: yup.number().nullable().transform(emptyToNull),
  jobType: yup.number().nullable().transform(emptyToNull),
  description: yup.string().max(800, t('employer:manualCandidate.validation.descriptionMax')).default(''),
  skillsSummary: yup.string().max(2000, t('employer:manualCandidate.validation.skillsSummaryMax')).default(''),
  note: yup.string().max(1000, t('employer:manualCandidate.validation.noteMax')).default(''),
});

const ManualCandidateForm = ({
  formId,
  onSubmit,
  jobPostOptions = [],
  requireJobPost = false,
}: ManualCandidateFormProps) => {
  const { t } = useTranslation(['employer']);
  const { allConfig } = useConfig();
  const schema = React.useMemo(() => createManualCandidateSchema(t, requireJobPost), [t, requireJobPost]);
  const { control, handleSubmit } = useForm<ManualCandidateFormValues>({
    resolver: typedYupResolver(schema),
    defaultValues: {
      jobPost: null,
      file: null,
      fullName: '',
      email: '',
      phone: '',
      title: '',
      position: null,
      academicLevel: null,
      experience: null,
      career: null,
      city: null,
      salaryMin: '',
      salaryMax: '',
      expectedSalary: null,
      typeOfWorkplace: null,
      jobType: null,
      description: '',
      skillsSummary: '',
      note: '',
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        {(requireJobPost || jobPostOptions.length > 0) && (
          <Grid size={12}>
            <SingleSelectCustom
              name="jobPost"
              title={t('manualCandidate.form.jobPost')}
              placeholder={t('manualCandidate.form.selectJobPost')}
              options={jobPostOptions.map((jobPost) => ({
                id: jobPost.id,
                name: jobPost.jobName,
              }))}
              showRequired={requireJobPost}
              control={control}
            />
          </Grid>
        )}
        <Grid size={12}>
          <FileUploadCustom
            control={control}
            name="file"
            title={t('manualCandidate.form.cvFile')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="fullName"
            title={t('manualCandidate.form.fullName')}
            placeholder={t('manualCandidate.form.fullNamePlaceholder')}
            showRequired
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="title"
            title={t('manualCandidate.form.title')}
            placeholder={t('manualCandidate.form.titlePlaceholder')}
            showRequired
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="email"
            title={t('manualCandidate.form.email')}
            placeholder={t('manualCandidate.form.emailPlaceholder')}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="phone"
            title={t('manualCandidate.form.phone')}
            placeholder={t('manualCandidate.form.phonePlaceholder')}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectCustom
            name="career"
            title={t('manualCandidate.form.career')}
            placeholder={t('manualCandidate.form.selectCareer')}
            options={allConfig?.careerOptions || []}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectCustom
            name="city"
            title={t('manualCandidate.form.city')}
            placeholder={t('manualCandidate.form.selectCity')}
            options={allConfig?.cityOptions || []}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectCustom
            name="experience"
            title={t('manualCandidate.form.experience')}
            placeholder={t('manualCandidate.form.selectExperience')}
            options={allConfig?.experienceOptions || []}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectCustom
            name="position"
            title={t('manualCandidate.form.position')}
            placeholder={t('manualCandidate.form.selectPosition')}
            options={allConfig?.positionOptions || []}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectCustom
            name="academicLevel"
            title={t('manualCandidate.form.academicLevel')}
            placeholder={t('manualCandidate.form.selectAcademicLevel')}
            options={allConfig?.academicLevelOptions || []}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectCustom
            name="typeOfWorkplace"
            title={t('manualCandidate.form.typeOfWorkplace')}
            placeholder={t('manualCandidate.form.selectTypeOfWorkplace')}
            options={allConfig?.typeOfWorkplaceOptions || []}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectCustom
            name="jobType"
            title={t('manualCandidate.form.jobType')}
            placeholder={t('manualCandidate.form.selectJobType')}
            options={allConfig?.jobTypeOptions || []}
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="salaryMin"
            title={t('manualCandidate.form.salaryMin')}
            placeholder={t('manualCandidate.form.salaryMinPlaceholder')}
            icon="VND"
            type="number"
            control={control}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="salaryMax"
            title={t('manualCandidate.form.salaryMax')}
            placeholder={t('manualCandidate.form.salaryMaxPlaceholder')}
            icon="VND"
            type="number"
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="expectedSalary"
            title={t('manualCandidate.form.expectedSalary')}
            placeholder={t('manualCandidate.form.expectedSalaryPlaceholder')}
            icon="VND"
            type="number"
            control={control}
          />
        </Grid>
        <Grid size={12}>
          <MultilineTextFieldCustom
            name="description"
            title={t('manualCandidate.form.description')}
            placeholder={t('manualCandidate.form.descriptionPlaceholder')}
            control={control}
            minRows={3}
          />
        </Grid>
        <Grid size={12}>
          <MultilineTextFieldCustom
            name="skillsSummary"
            title={t('manualCandidate.form.skillsSummary')}
            placeholder={t('manualCandidate.form.skillsSummaryPlaceholder')}
            control={control}
            minRows={3}
          />
        </Grid>
        <Grid size={12}>
          <MultilineTextFieldCustom
            name="note"
            title={t('manualCandidate.form.note')}
            placeholder={t('manualCandidate.form.notePlaceholder')}
            control={control}
            minRows={3}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default ManualCandidateForm;
