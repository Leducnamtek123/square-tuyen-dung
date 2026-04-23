import React from 'react';
import { Grid2 as Grid } from '@mui/material';
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import DatePickerCustom from '../../../../components/Common/Controls/DatePickerCustom';
import { DATE_OPTIONS } from '../../../../configs/constants';
import type { Control } from 'react-hook-form';
import type { SelectOption, SystemConfig } from '@/types/models';
import type { PersonalProfileFormValues } from './types';

type Props = {
  control: Control<PersonalProfileFormValues>;
  allConfig: SystemConfig | null;
  districtOptions: SelectOption[];
  t: (key: string, options?: Record<string, unknown>) => string;
};

const PersonalProfileFormFields = ({ control, allConfig, districtOptions, t }: Props) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextFieldCustom name="user.fullName" title={t('jobSeeker:profile.fields.fullName')} showRequired placeholder={t('jobSeeker:profile.placeholders.fullName')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextFieldCustom name="phone" title="Phone Number" showRequired placeholder="Enter phone number" control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DatePickerCustom name="birthday" control={control} title="Date of Birth" showRequired maxDate={DATE_OPTIONS.yesterday()} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelectCustom name="gender" control={control} options={allConfig?.genderOptions || []} title="Gender" showRequired placeholder="Select gender" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelectCustom name="maritalStatus" control={control} options={allConfig?.maritalStatusOptions || []} title="Marital Status" showRequired placeholder="Select marital status" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelectCustom name="location.city" control={control} options={allConfig?.cityOptions || []} title="City/Province" showRequired placeholder="Select city/province" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SingleSelectCustom name="location.district" control={control} options={districtOptions || []} title="District" showRequired placeholder="Select district" />
      </Grid>
      <Grid size={12}>
        <TextFieldCustom name="location.address" title="Address" showRequired placeholder="Enter address" control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextFieldCustom name="idCardNumber" title={t('jobSeeker:profile.fields.idCardNumber')} placeholder={t('jobSeeker:profile.placeholders.idCardNumber')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DatePickerCustom name="idCardIssueDate" control={control} title={t('jobSeeker:profile.fields.idCardIssueDate')} maxDate={DATE_OPTIONS.today()} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextFieldCustom name="idCardIssuePlace" title={t('jobSeeker:profile.fields.idCardIssuePlace')} placeholder={t('jobSeeker:profile.placeholders.idCardIssuePlace')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextFieldCustom name="taxCode" title={t('jobSeeker:profile.fields.taxCode')} placeholder={t('jobSeeker:profile.placeholders.taxCode')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextFieldCustom name="socialInsuranceNo" title={t('jobSeeker:profile.fields.socialInsuranceNo')} placeholder={t('jobSeeker:profile.placeholders.socialInsuranceNo')} control={control} />
      </Grid>
      <Grid size={12}>
        <TextFieldCustom name="permanentAddress" title={t('jobSeeker:profile.fields.permanentAddress')} placeholder={t('jobSeeker:profile.placeholders.permanentAddress')} control={control} />
      </Grid>
      <Grid size={12}>
        <TextFieldCustom name="contactAddress" title={t('jobSeeker:profile.fields.contactAddress')} placeholder={t('jobSeeker:profile.placeholders.contactAddress')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextFieldCustom name="emergencyContactName" title={t('jobSeeker:profile.fields.emergencyContactName')} placeholder={t('jobSeeker:profile.placeholders.emergencyContactName')} control={control} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextFieldCustom name="emergencyContactPhone" title={t('jobSeeker:profile.fields.emergencyContactPhone')} placeholder={t('jobSeeker:profile.placeholders.emergencyContactPhone')} control={control} />
      </Grid>
    </Grid>
  );
};

export default PersonalProfileFormFields;
