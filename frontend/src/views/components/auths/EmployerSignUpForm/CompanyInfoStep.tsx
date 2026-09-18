import React from 'react';
import { Box, Button, FormHelperText, Typography } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import TextFieldCustom from '@/components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '@/components/Common/Controls/SingleSelectCustom';
import { Controller, useWatch, type Control } from 'react-hook-form';
import type { TFunction } from 'i18next';
import type { EmployerSignUpFormData } from './types';
import type { SelectOption } from '@/types/models';

interface CompanyInfoStepProps {
  control: Control<EmployerSignUpFormData>;
  t: TFunction<string | string[], undefined>;
  show: boolean;
  allConfig: { employeeSizeOptions?: SelectOption[]; cityOptions?: SelectOption[] } | null;
  districtOptions: SelectOption[];
  locationOptions?: SelectOption[];
  handleSelectLocation?: (e: React.SyntheticEvent, value: string | SelectOption | null) => void;
}

const DEFAULT_EMPLOYEE_SIZES: SelectOption[] = [
  { id: 1, name: '< 25 nhân sự' },
  { id: 2, name: '25 - 99 nhân sự' },
  { id: 3, name: '100 - 499 nhân sự' },
  { id: 4, name: '500+ nhân sự' },
];

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    '&:hover': {
      borderColor: '#94A3B8',
      backgroundColor: '#FFFFFF',
    },
    '&.Mui-focused': {
      borderColor: '#2563EB',
      backgroundColor: '#FFFFFF',
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
    },
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
      WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
      WebkitTextFillColor: '#0F172A !important',
      caretColor: '#0F172A',
      transition: 'background-color 5000s ease-in-out 0s',
      borderRadius: 'inherit',
    },
  },
};

const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({
  control,
  t,
  show,
  allConfig,
  districtOptions,
}) => {
  const cityId = useWatch({ control, name: 'company.location.city' });

  const employeeSizes = (allConfig?.employeeSizeOptions && allConfig.employeeSizeOptions.length > 0)
    ? allConfig.employeeSizeOptions
    : DEFAULT_EMPLOYEE_SIZES;

  return (
    <Box sx={{ mb: 2, display: show ? 'block' : 'none' }}>
      <Grid container spacing={2}>
        {/* Tên doanh nghiệp */}
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

        {/* Mã số thuế */}
        <Grid size={12}>
          <TextFieldCustom
            name="company.taxCode"
            control={control}
            title={t('form.taxCode')}
            placeholder={t('form.taxCodePlaceholder')}
            showRequired={true}
            sx={inputStyle}
          />
        </Grid>

        {/* Quy mô nhân sự dạng Chip 1 chạm */}
        <Grid size={12}>
          <Controller
            name="company.employeeSize"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#334155', mb: 1 }}>
                  {t('form.employeeSize')} <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                    gap: 1.25,
                  }}
                >
                  {employeeSizes.map((opt) => {
                    const isSelected = Number(field.value) === Number(opt.id);
                    return (
                      <Button
                        key={String(opt.id)}
                        type="button"
                        onClick={() => field.onChange(Number(opt.id))}
                        variant="outlined"
                        sx={{
                          py: 1.1,
                          px: 1,
                          minHeight: '44px',
                          borderRadius: '12px',
                          border: '1.5px solid',
                          borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                          backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                          color: isSelected ? '#1D4ED8' : '#475569',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: { xs: '12px', sm: '13px' },
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.18)' : 'none',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          '&:hover': {
                            borderColor: isSelected ? '#2563EB' : '#CBD5E1',
                            backgroundColor: isSelected ? '#DBEAFE' : '#F8FAFC',
                          },
                        }}
                      >
                        {opt.name}
                      </Button>
                    );
                  })}
                </Box>
                {error && (
                  <FormHelperText error sx={{ mt: 0.75, ml: 0.5, fontSize: '12px' }}>
                    {error.message}
                  </FormHelperText>
                )}
              </Box>
            )}
          />
        </Grid>

        {/* Tỉnh / Thành phố */}
        <Grid size={{ xs: 12, sm: 6 }}>
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

        {/* Quận / Huyện */}
        <Grid size={{ xs: 12, sm: 6 }}>
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

        {/* Địa chỉ cụ thể */}
        <Grid size={12}>
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
      </Grid>
    </Box>
  );
};

export default CompanyInfoStep;
