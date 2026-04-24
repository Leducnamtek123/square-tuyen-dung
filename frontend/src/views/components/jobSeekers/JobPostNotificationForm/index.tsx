'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { typedYupResolver } from '../../../../utils/formHelpers';
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import RadioCustom from '../../../../components/Common/Controls/RadioCustom';
import { useConfig } from '@/hooks/useConfig';
import type { SelectOption } from '@/types/models';

export interface JobPostNotificationFormValues {
  frequency: number | null;
  jobName: string;
  career: number;
  city: number;
  position: number | null;
  experience: number | null;
  salary: number | null;
}

interface JobPostNotificationFormProps {
  handleAddOrUpdate: (data: JobPostNotificationFormValues) => void;
  editData: Partial<JobPostNotificationFormValues> | null;
}

const getDefaultFrequency = (options?: SelectOption[]) => {
  if (!options || options.length === 0) return null;
  return (options[0]?.id as number | null) ?? null;
};

const JobPostNotificationForm = ({ handleAddOrUpdate, editData }: JobPostNotificationFormProps) => {
  const { t } = useTranslation(['jobSeeker', 'common']);
  const { allConfig } = useConfig();

  const schema = React.useMemo(
    () =>
      yup.object().shape({
        jobName: yup
          .string()
          .required(t('jobSeeker:jobManagement.notifications.form.validation.keywordRequired'))
          .max(200, t('jobSeeker:jobManagement.notifications.form.validation.keywordMax')),
        career: yup
          .number()
          .required(t('jobSeeker:jobManagement.notifications.form.validation.careerRequired'))
          .typeError(t('jobSeeker:jobManagement.notifications.form.validation.careerRequired')),
        city: yup
          .number()
          .required(t('jobSeeker:jobManagement.notifications.form.validation.cityRequired'))
          .typeError(t('jobSeeker:jobManagement.notifications.form.validation.cityRequired')),
        position: yup.number().notRequired().nullable(),
        experience: yup.number().notRequired().nullable(),
        salary: yup
          .number()
          .nullable()
          .typeError(t('jobSeeker:jobManagement.notifications.form.validation.salaryInvalid'))
          .transform((value, originalValue) => (originalValue === '' ? null : value)),
      }),
    [t],
  );

  const defaultValues = React.useMemo<JobPostNotificationFormValues>(
    () => ({
      frequency: editData?.frequency ?? getDefaultFrequency(allConfig?.frequencyNotificationOptions),
      jobName: editData?.jobName ?? '',
      career: editData?.career ?? 0,
      city: editData?.city ?? 0,
      position: editData?.position ?? null,
      experience: editData?.experience ?? null,
      salary: editData?.salary ?? null,
    }),
    [editData, allConfig?.frequencyNotificationOptions],
  );

  const { control, handleSubmit } = useForm<JobPostNotificationFormValues>({
    defaultValues,
    resolver: typedYupResolver(schema),
  });

  return (
    <form id="modal-form" onSubmit={handleSubmit(handleAddOrUpdate)}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextFieldCustom
            name="jobName"
            title={t('jobSeeker:jobManagement.notifications.form.keyword')}
            showRequired
            placeholder={t('jobSeeker:jobManagement.notifications.form.keywordPlaceholder')}
            control={control}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <SingleSelectCustom
            name="career"
            control={control}
            options={allConfig?.careerOptions || []}
            title={t('jobSeeker:jobManagement.notifications.form.career')}
            showRequired
            placeholder={t('jobSeeker:jobManagement.notifications.form.careerPlaceholder')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <SingleSelectCustom
            name="city"
            control={control}
            options={allConfig?.cityOptions || []}
            title={t('jobSeeker:jobManagement.notifications.form.city')}
            showRequired
            placeholder={t('jobSeeker:jobManagement.notifications.form.cityPlaceholder')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <SingleSelectCustom
            name="position"
            control={control}
            options={allConfig?.positionOptions || []}
            title={t('jobSeeker:jobManagement.notifications.form.position')}
            placeholder={t('jobSeeker:jobManagement.notifications.form.positionPlaceholder')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <SingleSelectCustom
            name="experience"
            control={control}
            options={allConfig?.experienceOptions || []}
            title={t('jobSeeker:jobManagement.notifications.form.experience')}
            placeholder={t('jobSeeker:jobManagement.notifications.form.experiencePlaceholder')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <TextFieldCustom
            name="salary"
            title={t('jobSeeker:jobManagement.notifications.form.salary')}
            placeholder={t('jobSeeker:jobManagement.notifications.form.salaryPlaceholder')}
            control={control}
            type="number"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <RadioCustom
            name="frequency"
            control={control}
            options={allConfig?.frequencyNotificationOptions || []}
            title={t('jobSeeker:jobManagement.notifications.form.frequency')}
          />
        </Grid>
      </Grid>
    </form>
  );
};

export default JobPostNotificationForm;
