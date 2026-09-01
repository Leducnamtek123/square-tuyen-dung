import React from 'react';
import { Box, Grid2 as Grid, Paper, Stack, Typography } from "@mui/material";
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { FacebookIcon, LinkedinIcon, YoutubeIcon, WebsiteIcon } from '@/components/Common/SocialIcons';
import TextFieldCustom from '@/components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '@/components/Common/Controls/SingleSelectCustom';
import DatePickerCustom from '@/components/Common/Controls/DatePickerCustom';
import RichTextEditorCustom from '@/components/Common/Controls/RichTextEditorCustom';
import { DATE_OPTIONS } from '@/configs/constants';
import { useWatch, type Control } from "react-hook-form";
import type { TFunction } from "i18next";
import type { SystemConfig, SelectOption } from "@/types/models";

import type { CompanyFormValues } from './types';
import pc from '@/utils/muiColors';

import LocationPicker, { LocationValue } from '@/components/Common/LocationPicker';

interface CompanyFormFieldsProps {
  control: Control<CompanyFormValues>;
  t: TFunction<"employer", undefined>;
  allConfig: SystemConfig | null;
  districtOptions: SelectOption[];
  locationOptions?: SelectOption[];
  handleSelectLocation?: (e: React.SyntheticEvent, value: string | SelectOption | null) => void;
  locationValue?: LocationValue;
  onLocationChange?: (val: LocationValue) => void;
}

const FormSectionCard = ({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <Grid size={12}>
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#ffffff',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02)',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ mb: 2.5, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            bgcolor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              fontSize: '0.9375rem',
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.775rem' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      <Grid
        container
        spacing={{ xs: 2, md: 2.5 }}
        columnSpacing={{ xs: 2, md: 2.5 }}
        sx={{
          '& > .MuiGrid2-root > div > .MuiTypography-root': {
            mb: 0.75,
            color: '#1E293B',
            fontSize: '0.8125rem',
            fontWeight: 700,
            lineHeight: 1.35,
          },
        }}
      >
        {children}
      </Grid>
    </Paper>
  </Grid>
);

const CompanyFormFields: React.FC<CompanyFormFieldsProps> = ({
  control,
  t,
  allConfig,
  districtOptions,
  locationValue,
  onLocationChange,
}) => {
  const cityId = useWatch({ control, name: 'location.city' });
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      minHeight: 42,
      borderRadius: 2,
      backgroundColor: 'background.paper',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
      '& fieldset': { borderColor: pc.divider(0.95) },
      '&:hover': { backgroundColor: pc.bgDefault(0.45) },
      '&:hover fieldset': { borderColor: pc.primary(0.35) },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main',
        borderWidth: 1,
      },
    },
    '& .MuiInputBase-input': {
      fontSize: '0.875rem',
      py: '10px',
    },
    '& .MuiFormHelperText-root': {
      mx: 0,
      mt: 0.75,
    },
  };

  return (
    <Grid container spacing={{ xs: 2.5, md: 3 }}>
      {/* 1. Thông tin doanh nghiệp & Pháp lý */}
      <FormSectionCard
        icon={<BusinessOutlinedIcon sx={{ fontSize: 20 }} />}
        title="Thông tin doanh nghiệp & Pháp lý"
        subtitle="Tên pháp nhân, mã số thuế và quy mô hoạt động"
      >
        <Grid size={12}>
          <TextFieldCustom
            name="companyName"
            title={t('companyForm.title.companyname')}
            showRequired={true}
            placeholder={t('companyForm.placeholder.entercompanyname')}
            control={control}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="taxCode"
            title={t('companyForm.title.taxcode')}
            showRequired={true}
            placeholder={t('companyForm.placeholder.entercompanytaxcode')}
            control={control}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectCustom
            name="employeeSize"
            control={control}
            options={allConfig?.employeeSizeOptions || []}
            title={t('companyForm.title.companysize')}
            showRequired={true}
            placeholder={t('companyForm.placeholder.selectcompanysize')}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="fieldOperation"
            title={t('companyForm.title.fieldofoperation')}
            showRequired={true}
            placeholder={t('companyForm.placeholder.entercompanyfieldofoperation')}
            control={control}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DatePickerCustom
            name="since"
            control={control}
            title={t('companyForm.title.foundeddate')}
            maxDate={DATE_OPTIONS.today()}
            sx={inputSx}
          />
        </Grid>
      </FormSectionCard>

      {/* 2. Kênh liên hệ & Mạng xã hội */}
      <FormSectionCard
        icon={<AlternateEmailOutlinedIcon sx={{ fontSize: 20 }} />}
        title="Kênh liên hệ & Mạng xã hội"
        subtitle="Kênh liên lạc chính thức và hồ sơ truyền thông số"
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="companyEmail"
            title={t('companyForm.title.companyemail')}
            showRequired={true}
            placeholder={t('companyForm.placeholder.entercompanyemail')}
            control={control}
            icon={<EmailOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="companyPhone"
            title={t('companyForm.title.phonenumber')}
            showRequired={true}
            placeholder={t('companyForm.placeholder.entercompanyphonenumber')}
            control={control}
            icon={<PhoneOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="websiteUrl"
            title={t('companyForm.title.websiteurl')}
            placeholder={t('companyForm.placeholder.entercompanywebsiteurl')}
            control={control}
            icon={<WebsiteIcon size={18} />}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="facebookUrl"
            title={t('companyForm.title.facebookurl')}
            placeholder={t('companyForm.placeholder.enterfacebookurl')}
            control={control}
            icon={<FacebookIcon size={18} />}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="youtubeUrl"
            title={t('companyForm.title.youtubeurl')}
            placeholder={t('companyForm.placeholder.enteryoutubeurl')}
            control={control}
            icon={<YoutubeIcon size={18} />}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldCustom
            name="linkedinUrl"
            title={t('companyForm.title.linkedinurl')}
            placeholder={t('companyForm.placeholder.enterlinkedinurl')}
            control={control}
            icon={<LinkedinIcon size={18} />}
            sx={inputSx}
          />
        </Grid>
      </FormSectionCard>

      {/* 3. Trụ sở & Bản đồ vị trí */}
      <FormSectionCard
        icon={<LocationOnOutlinedIcon sx={{ fontSize: 20 }} />}
        title="Trụ sở & Bản đồ vị trí"
        subtitle="Địa chỉ văn phòng chính và định vị vệ tinh"
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectCustom
            name="location.city"
            control={control}
            options={allConfig?.cityOptions || []}
            title={t('companyForm.title.cityprovince')}
            showRequired={true}
            placeholder={t('companyForm.placeholder.selectcityprovince')}
            sx={inputSx}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SingleSelectCustom
            options={districtOptions}
            name="location.district"
            control={control}
            disabled={!cityId}
            disabledPlaceholder={t('companyForm.placeholder.selectCityFirst')}
            title={t('companyForm.title.district')}
            showRequired={true}
            placeholder={t('companyForm.placeholder.selectdistrict')}
            sx={inputSx}
          />
        </Grid>
        <Grid size={12}>
          <TextFieldCustom
            name="location.address"
            title={t('companyForm.title.address')}
            showRequired={true}
            placeholder={t('companyForm.placeholder.enteraddress')}
            control={control}
            sx={inputSx}
          />
        </Grid>
        <Grid size={12}>
          <LocationPicker
            value={locationValue}
            onChange={onLocationChange}
            label="Bản đồ vị trí trụ sở công ty"
            height="350px"
          />
        </Grid>
      </FormSectionCard>

      {/* 4. Giới thiệu chi tiết doanh nghiệp */}
      <FormSectionCard
        icon={<ArticleOutlinedIcon sx={{ fontSize: 20 }} />}
        title="Giới thiệu chi tiết doanh nghiệp"
        subtitle="Câu chuyện thương hiệu, văn hóa và môi trường làm việc"
      >
        <Grid size={12}>
          <Box sx={{ width: '100%' }}>
            <RichTextEditorCustom
              name="description"
              control={control}
              title={t('companyForm.title.additionaldescription')}
            />
          </Box>
        </Grid>
      </FormSectionCard>
    </Grid>
  );
};

export default CompanyFormFields;
