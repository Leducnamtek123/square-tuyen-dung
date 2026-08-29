import React from 'react';
import { Box } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import TextFieldCustom from '../../../../components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '../../../../components/Common/Controls/SingleSelectCustom';
import DatePickerCustom from '../../../../components/Common/Controls/DatePickerCustom';
import { DATE_OPTIONS } from '../../../../configs/constants';
import { useWatch, type Control } from 'react-hook-form';
import type { TFunction } from 'i18next';
import type { EmployerSignUpFormData } from './types';
import type { SelectOption } from '@/types/models';

import LocationPicker, { LocationValue } from '@/components/Common/LocationPicker';

interface CompanyInfoStepProps {
  control: Control<EmployerSignUpFormData>;
  t: TFunction<string | string[], undefined>;
  show: boolean;
  allConfig: { employeeSizeOptions?: SelectOption[]; cityOptions?: SelectOption[] } | null;
  districtOptions: SelectOption[];
  locationOptions?: SelectOption[];
  handleSelectLocation?: (e: React.SyntheticEvent, value: string | SelectOption | null) => void;
  locationValue?: LocationValue;
  onLocationChange?: (val: LocationValue) => void;
}

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#F1F5F9',
    },
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
    },
  },
};

const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({
  control,
  t,
  show,
  allConfig,
  districtOptions,
  locationValue,
  onLocationChange,
}) => {
  const cityId = useWatch({ control, name: 'company.location.city' });

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
            sx={inputStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
          <TextFieldCustom
            name="company.companyEmail"
            control={control}
            title={t('form.companyEmail')}
            placeholder={t('form.companyEmailPlaceholder')}
            showRequired={true}
            sx={inputStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <TextFieldCustom
            name="company.companyPhone"
            control={control}
            title={t('form.companyPhone')}
            placeholder={t('form.companyPhonePlaceholder')}
            showRequired={true}
            sx={inputStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
          <TextFieldCustom
            name="company.taxCode"
            control={control}
            title={t('form.taxCode')}
            placeholder={t('form.taxCodePlaceholder')}
            showRequired={true}
            sx={inputStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
          <DatePickerCustom
            name="company.since"
            control={control}
            title={t('form.foundedDate')}
            maxDate={DATE_OPTIONS.today()}
            sx={inputStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
          <TextFieldCustom
            name="company.fieldOperation"
            control={control}
            title={t('form.fieldOperation')}
            placeholder={t('form.fieldOperationPlaceholder')}
            sx={inputStyle}
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
            sx={inputStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 8, lg: 8, xl: 8 }}>
          <TextFieldCustom
            name="company.websiteUrl"
            control={control}
            title={t('form.website')}
            placeholder={t('form.websitePlaceholder')}
            sx={inputStyle}
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
            sx={inputStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }}>
          <SingleSelectCustom
            options={districtOptions}
            name="company.location.district"
            control={control}
            disabled={!cityId}
            disabledPlaceholder={t('form.selectCityFirst', { defaultValue: 'Vui lòng chọn Tỉnh / Thành phố trước' })}
            title={t('form.district')}
            placeholder={t('form.districtPlaceholder')}
            showRequired={true}
            sx={inputStyle}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
          <TextFieldCustom
            name="company.location.address"
            title={t('form.address')}
            showRequired={true}
            placeholder={t('form.addressPlaceholder')}
            control={control}
            helperText={t('form.addressHelper')}
            sx={inputStyle}
          />
        </Grid>
        {show && (
          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
            <LocationPicker
              value={locationValue}
              onChange={onLocationChange}
              label="Bản đồ vị trí công ty (OpenStreetMap)"
              height="340px"
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CompanyInfoStep;
