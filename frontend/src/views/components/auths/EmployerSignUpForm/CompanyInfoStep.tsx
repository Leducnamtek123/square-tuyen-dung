import React from 'react';
import { Box } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import DatePickerCustom from '../../../../components/Common/Controls/DatePickerCustom';
import TextFieldAutoCompleteCustom from '../../../../components/Common/Controls/TextFieldAutoCompleteCustom';
import type { Control } from 'react-hook-form';
import type { TFunction } from 'i18next';
import type { EmployerSignUpFormData } from './types';
import type { SelectOption } from '@/types/models';

interface CompanyInfoStepProps {
  control: Control<EmployerSignUpFormData>;
  t: TFunction<string | string[], undefined>;
  show: boolean;
  allConfig: { employeeSizeOptions?: SelectOption[]; cityOptions?: SelectOption[] } | null;
  districtOptions: SelectOption[];
  locationOptions: SelectOption[];
  handleSelectLocation: (e: React.SyntheticEvent, value: string | SelectOption | null) => void;
}

const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({
  control,
  t,
  show,
  allConfig,
  districtOptions,
  locationOptions,
  handleSelectLocation
}) => {
  return (
    <Box sx={{ mb: 2, display: show ? 'block' : 'none' }}>
      <Grid container spacing={2.5}>
        <Grid size={12}>
          <TextFieldCustom
            name="company.companyName"
            control={control}
            title={t('form.companyName')}
            placeholder={t('form.companyNamePlaceholder')}
            showRequired={true}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
          <TextFieldCustom
            name="company.companyEmail"
            control={control}
            title={t('form.companyEmail')}
            placeholder={t('form.companyEmailPlaceholder')}
            showRequired={true}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <TextFieldCustom
            name="company.companyPhone"
            control={control}
            title={t('form.companyPhone')}
            placeholder={t('form.companyPhonePlaceholder')}
            showRequired={true}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <TextFieldCustom
            name="company.taxCode"
            control={control}
            title={t('form.taxCode')}
            placeholder={t('form.taxCodePlaceholder')}
            showRequired={true}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
          <DatePickerCustom
            name="company.since"
            control={control}
            title={t('form.foundedDate')}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
          <TextFieldCustom
            name="company.fieldOperation"
            control={control}
            title={t('form.fieldOperation')}
            placeholder={t('form.fieldOperationPlaceholder')}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
          <SingleSelectCustom
            options={allConfig?.employeeSizeOptions || []}
            name="company.employeeSize"
            control={control}
            title={t('form.employeeSize')}
            placeholder={t('form.employeeSizePlaceholder')}
            showRequired={true}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
          <TextFieldCustom
            name="company.websiteUrl"
            control={control}
            title={t('form.website')}
            placeholder={t('form.websitePlaceholder')}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
          <SingleSelectCustom
            options={allConfig?.cityOptions || []}
            name="company.location.city"
            control={control}
            title={t('form.city')}
            placeholder={t('form.cityPlaceholder')}
            showRequired={true}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
          <SingleSelectCustom
            options={districtOptions}
            name="company.location.district"
            control={control}
            title={t('form.district', 'Ward/Commune')}
            placeholder={t('form.districtPlaceholder', 'Select ward/commune')}
            showRequired={true}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
          <TextFieldAutoCompleteCustom
            name="company.location.address"
            title={t('form.address')}
            showRequired={true}
            placeholder={t('form.addressPlaceholder')}
            control={control}
            options={locationOptions}
            loading={true}
            handleSelect={handleSelectLocation}
            helperText={t('form.addressHelper')}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompanyInfoStep;
