import React from 'react';
import { Grid2 as Grid } from "@mui/material";
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import MultilineTextFieldCustom from '../../../../components/Common/Controls/MultilineTextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import FileUploadCustom from '../../../../components/Common/Controls/FileUploadCustom';
import type { Control } from 'react-hook-form';
import type { SystemConfig } from '../../../../types/models';
import type { FormValues } from './types';

interface ProfileUploadFormFieldsProps {
  control: Control<FormValues>;
  t: (key: string, options?: Record<string, unknown>) => string;
  allConfig: SystemConfig | null;
}

const ProfileUploadFormFields = ({ control, t, allConfig }: ProfileUploadFormFieldsProps) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <FileUploadCustom
          control={control}
          name="file"
          title={t('jobSeeker:profile.fields.cvFile')}
          showRequired={true}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextFieldCustom
          name="title"
          showRequired={true}
          title={t('jobSeeker:profile.fields.desiredPosition')}
          placeholder={t('jobSeeker:profile.placeholders.desiredPosition')}
          control={control}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelectCustom
          name="position"
          control={control}
          options={allConfig?.positionOptions || []}
          title={t('jobSeeker:profile.fields.desiredLevel')}
          showRequired={true}
          placeholder={t('jobSeeker:profile.placeholders.selectLevel')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelectCustom
          name="academicLevel"
          control={control}
          options={allConfig?.academicLevelOptions || []}
          title={t('jobSeeker:profile.fields.academicLevel')}
          showRequired={true}
          placeholder={t('jobSeeker:profile.placeholders.selectAcademicLevel')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelectCustom
          name="experience"
          control={control}
          options={allConfig?.experienceOptions || []}
          title={t('jobSeeker:profile.fields.experience')}
          showRequired={true}
          placeholder={t('jobSeeker:profile.placeholders.selectExperience')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelectCustom
          name="career"
          control={control}
          options={allConfig?.careerOptions || []}
          title={t('jobSeeker:profile.fields.career')}
          showRequired={true}
          placeholder={t('jobSeeker:profile.placeholders.selectCareer')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelectCustom
          name="city"
          control={control}
          options={allConfig?.cityOptions || []}
          title={t('jobSeeker:profile.fields.city')}
          showRequired={true}
          placeholder={t('jobSeeker:profile.placeholders.selectCity')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextFieldCustom
          name="salaryMin"
          title={t('jobSeeker:profile.fields.desiredSalary')}
          showRequired={true}
          placeholder={t('jobSeeker:profile.placeholders.salaryMin')}
          control={control}
          icon={'VND'}
          type='number'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextFieldCustom
          name="salaryMax"
          title={t('jobSeeker:profile.fields.desiredSalary')}
          showRequired={true}
          placeholder={t('jobSeeker:profile.placeholders.salaryMax')}
          control={control}
          icon={'VND'}
          type='number'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextFieldCustom
          name="expectedSalary"
          title={t('jobSeeker:profile.fields.expectedSalary')}
          placeholder={t('jobSeeker:profile.placeholders.expectedSalary')}
          control={control}
          icon={'VND'}
          type='number'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelectCustom
          name="typeOfWorkplace"
          control={control}
          options={allConfig?.typeOfWorkplaceOptions || []}
          title={t('jobSeeker:profile.fields.workplaceType')}
          showRequired={true}
          placeholder={t('jobSeeker:profile.placeholders.selectWorkplaceType')}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelectCustom
          name="jobType"
          control={control}
          options={allConfig?.jobTypeOptions || []}
          title={t('jobSeeker:profile.fields.jobType')}
          showRequired={true}
          placeholder={t('jobSeeker:profile.placeholders.selectJobType')}
        />
      </Grid>
      <Grid size={12}>
        <MultilineTextFieldCustom
          name="description"
          title={t('jobSeeker:profile.fields.objective')}
          showRequired={true}
          placeholder={t('jobSeeker:profile.placeholders.objective')}
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
  );
};

export default ProfileUploadFormFields;
