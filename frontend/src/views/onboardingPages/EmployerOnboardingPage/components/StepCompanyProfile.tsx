'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Avatar,
  Button,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import commonService from '@/services/commonService';
import { useTranslation } from 'react-i18next';
import type { EmployerStep1Values } from '../schemas/employerOnboardingSchema';
import type { SelectOption } from '@/types/models';

interface StepCompanyProfileProps {
  values: EmployerStep1Values;
  onChange: (field: keyof EmployerStep1Values, value: any) => void;
  errors: Record<string, string>;
  citiesList: SelectOption[];
  employeeSizeOptions?: SelectOption[];
}

export default function StepCompanyProfile({
  values,
  onChange,
  errors,
  citiesList,
  employeeSizeOptions,
}: StepCompanyProfileProps) {
  const { t } = useTranslation('employer');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [districtsList, setDistrictsList] = useState<SelectOption[]>([]);
  const [isDistrictLoading, setIsDistrictLoading] = useState(false);

  // Load districts when cityId changes
  useEffect(() => {
    let isMounted = true;
    if (!values.cityId) {
      setDistrictsList([]);
      setIsDistrictLoading(false);
      return;
    }

    setIsDistrictLoading(true);
    async function loadDistricts() {
      try {
        const res = await commonService.getDistrictsByCityId(Number(values.cityId));
        if (isMounted && res?.data) {
          setDistrictsList(res.data);
        }
      } catch (err) {
        console.error('Failed to load districts:', err);
      } finally {
        if (isMounted) {
          setIsDistrictLoading(false);
        }
      }
    }

    void loadDistricts();

    return () => {
      isMounted = false;
    };
  }, [values.cityId]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploadingLogo(true);
    try {
      const res = await commonService.uploadFile(file, 'IMAGE');
      onChange('logoId', res.id);
      onChange('logoUrl', res.url);
    } catch (err) {
      console.error('Logo upload error:', err);
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const selectedCity = citiesList.find((c) => Number(c.id) === Number(values.cityId)) || null;
  const selectedDistrict = districtsList.find((d) => Number(d.id) === Number(values.districtId)) || null;

  const defaultSizes = [
    { id: 1, name: 'Dưới 10 nhân viên' },
    { id: 2, name: '10 - 24 nhân viên' },
    { id: 3, name: '25 - 99 nhân viên' },
    { id: 4, name: 'Trên 100 nhân viên' },
  ];

  return (
    <Box>
      <input
        type="file"
        ref={logoInputRef}
        accept="image/png,image/jpeg,image/jpg"
        style={{ display: 'none' }}
        onChange={handleLogoUpload}
      />

      {/* Step Header */}
      <Box sx={{ mb: 3.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.75 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BusinessIcon fontSize="small" />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
            {t('employerOnboarding.step1.title', 'Thông tin Thương hiệu Doanh nghiệp')}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: '#64748B', pl: { xs: 0, sm: 6 } }}>
          {t('employerOnboarding.step1.subtitle', 'Hoàn tất thông tin doanh nghiệp để xây dựng thương hiệu uy tín và thu hút ứng viên tài năng')}
        </Typography>
      </Box>

      {/* Logo Picker Row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2.5}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{
          p: 2.5,
          mb: 3.5,
          borderRadius: 3,
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
        }}
      >
        <Avatar
          src={values.logoUrl || ''}
          variant="rounded"
          sx={{
            width: 72,
            height: 72,
            borderRadius: 3,
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #CBD5E1',
            color: '#2563EB',
            fontWeight: 800,
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
          }}
        >
          {values.companyName ? values.companyName.charAt(0).toUpperCase() : <BusinessIcon />}
        </Avatar>

        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.75 }}>
            <Button
              variant="outlined"
              size="small"
              disabled={isUploadingLogo}
              onClick={() => logoInputRef.current?.click()}
              startIcon={isUploadingLogo ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              {values.logoUrl
                ? t('employerOnboarding.step1.logoChange', 'Đổi Logo')
                : t('employerOnboarding.step1.logoUpload', 'Tải Logo Doanh nghiệp')}
            </Button>
          </Stack>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {t('employerOnboarding.step1.logoHint', 'Định dạng PNG, JPG (tối đa 5MB). Khuyên dùng tỉ lệ 1:1.')}
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Field: Company Name */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step1.companyName', 'Tên doanh nghiệp / Công ty đầy đủ')} <Box component="span" sx={{ color: '#EF4444' }}>*</Box>
          </Typography>
          <TextField
            fullWidth
            placeholder={t('employerOnboarding.step1.companyNamePlaceholder', 'VD: Công ty Cổ phần Công nghệ ABC...')}
            value={values.companyName}
            onChange={(e) => onChange('companyName', e.target.value)}
            error={Boolean(errors.companyName)}
            helperText={errors.companyName || t('employerOnboarding.step1.companyNameHelper', 'Nhập chính xác tên doanh nghiệp theo Giấy phép ĐKKD')}
            FormHelperTextProps={{
              sx: { color: errors.companyName ? '#EF4444' : '#64748B', mx: 0, mt: 0.5 },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              },
            }}
          />
        </Grid>

        {/* Field: Tax Code */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step1.taxCode', 'Mã số thuế (MST)')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('employerOnboarding.step1.taxCodePlaceholder', 'VD: 0101234567')}
            value={values.taxCode || ''}
            onChange={(e) => onChange('taxCode', e.target.value)}
            error={Boolean(errors.taxCode)}
            helperText={errors.taxCode || t('employerOnboarding.step1.taxCodeHelper', 'Mã số thuế doanh nghiệp (tuỳ chọn khi khởi tạo)')}
            FormHelperTextProps={{
              sx: { color: errors.taxCode ? '#EF4444' : '#64748B', mx: 0, mt: 0.5 },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              },
            }}
          />
        </Grid>

        {/* Field: Employee Size */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step1.employeeSize', 'Quy mô nhân sự')}
          </Typography>
          <FormControl fullWidth>
            <Select
              value={values.employeeSize || 2}
              onChange={(e) => onChange('employeeSize', Number(e.target.value))}
              sx={{
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              }}
            >
              {(employeeSizeOptions?.length ? employeeSizeOptions : defaultSizes).map((sz) => (
                <MenuItem key={String(sz.id)} value={Number(sz.id)}>
                  {sz.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Field: Field of Operation */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step1.fieldOperation', 'Lĩnh vực hoạt động chính')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('employerOnboarding.step1.fieldOperationPlaceholder', 'VD: Công nghệ thông tin, Xây dựng, Bán lẻ...')}
            value={values.fieldOperation || ''}
            onChange={(e) => onChange('fieldOperation', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              },
            }}
          />
        </Grid>

        {/* Field: Website */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step1.website', 'Website công ty')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('employerOnboarding.step1.websitePlaceholder', 'https://company.vn')}
            value={values.websiteUrl || ''}
            onChange={(e) => onChange('websiteUrl', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              },
            }}
          />
        </Grid>

        {/* Field: Location Section */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step1.city', 'Tỉnh / Thành phố trụ sở')}
          </Typography>
          <Autocomplete
            options={citiesList}
            getOptionLabel={(option) => option.name || ''}
            value={selectedCity}
            onChange={(_, newValue) => {
              onChange('cityId', newValue ? newValue.id : '');
              onChange('districtId', '');
            }}
            isOptionEqualToValue={(option, val) => Number(option.id) === Number(val.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t('employerOnboarding.step1.cityPlaceholder', 'Chọn Tỉnh / Thành phố...')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: '#F8FAFC',
                    '&:hover': { backgroundColor: '#FFFFFF' },
                    '&.Mui-focused': { backgroundColor: '#FFFFFF' },
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: !values.cityId ? '#94A3B8' : '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step1.district', 'Quận / Huyện')}
          </Typography>
          <Autocomplete
            options={districtsList}
            getOptionLabel={(option) => option.name || ''}
            value={selectedDistrict}
            disabled={!values.cityId || isDistrictLoading}
            loading={isDistrictLoading}
            loadingText={t('common:loading', 'Đang tải...')}
            noOptionsText={!values.cityId ? t('employerOnboarding.step1.selectCityFirst', 'Vui lòng chọn Tỉnh / Thành phố trước') : t('common:noOptions', 'Không có dữ liệu')}
            onChange={(_, newValue) => onChange('districtId', newValue ? newValue.id : '')}
            isOptionEqualToValue={(option, val) => Number(option.id) === Number(val.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={
                  !values.cityId
                    ? t('employerOnboarding.step1.selectCityFirst', 'Vui lòng chọn Tỉnh / Thành phố trước')
                    : isDistrictLoading
                      ? t('common:loading', 'Đang tải Quận / Huyện...')
                      : t('employerOnboarding.step1.districtPlaceholder', 'Chọn Quận / Huyện...')
                }
                helperText={!values.cityId ? t('employerOnboarding.step1.cityFirstHelper', 'Chọn Tỉnh / Thành phố để chọn Quận / Huyện') : ''}
                FormHelperTextProps={{ sx: { mx: 0.5, mt: 0.5, color: '#64748B', fontSize: '0.75rem' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    backgroundColor: !values.cityId ? '#F8FAFC' : '#FFFFFF',
                    '&:hover': { backgroundColor: '#FFFFFF' },
                    '&.Mui-focused': { backgroundColor: '#FFFFFF' },
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.75 }}>
            {t('employerOnboarding.step1.address', 'Địa chỉ chi tiết')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('employerOnboarding.step1.addressPlaceholder', 'Số nhà, tên đường, tòa nhà...')}
            value={values.address || ''}
            onChange={(e) => onChange('address', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '&:hover': { backgroundColor: '#FFFFFF' },
                '&.Mui-focused': { backgroundColor: '#FFFFFF' },
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
