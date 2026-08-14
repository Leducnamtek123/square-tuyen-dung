'use client';

import React from 'react';
import { Box, Paper, Stack, Typography, Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import WcOutlinedIcon from '@mui/icons-material/WcOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import dayjs from '@/configs/dayjs-config';

import { useConfig } from '@/hooks/useConfig';
import { tConfig } from '@/utils/tConfig';
import type { ResumeDetailResponse } from '@/types/models';

interface PersonalInformationProps {
  profileDetail: ResumeDetailResponse;
}

interface GridFieldProps {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
}

const GridField: React.FC<GridFieldProps> = ({ label, value, icon: Icon }) => (
  <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '8px',
        bgcolor: '#F1F5F9',
        color: '#2563EB',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        mt: 0.25,
      }}
    >
      <Icon sx={{ fontSize: 17 }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          color: '#64748B',
          fontWeight: 600,
          display: 'block',
          fontSize: '0.75rem',
          lineHeight: 1.2,
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: value ? '#0F172A' : '#94A3B8',
          fontWeight: 600,
          fontSize: '0.875rem',
          lineHeight: 1.4,
          overflowWrap: 'anywhere',
        }}
      >
        {value || 'Chưa cập nhật'}
      </Typography>
    </Box>
  </Stack>
);

export const PersonalInformation: React.FC<PersonalInformationProps> = ({ profileDetail }) => {
  const { t } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();

  const user = profileDetail.user || (profileDetail as any).userDict || {};
  const seeker = profileDetail.jobSeekerProfile || (profileDetail as any).jobSeekerProfileDict || {};

  const email = user.email || seeker.userDict?.email || '';
  const phone = seeker.phone || user.phone || '';
  const gender = tConfig(allConfig?.genderDict?.[String(seeker.gender || (profileDetail as any).gender || '')]);
  
  const rawBirthday = seeker.birthday || (profileDetail as any).birthday;
  let birthdayFormatted = '';
  if (rawBirthday) {
    const bDate = dayjs(rawBirthday);
    if (bDate.isValid()) {
      const age = dayjs().diff(bDate, 'year');
      birthdayFormatted = `${bDate.format('DD/MM/YYYY')} (${age} tuổi)`;
    }
  }

  const maritalStatus = tConfig(allConfig?.maritalStatusDict?.[String(seeker.maritalStatus || (profileDetail as any).maritalStatus || '')]);
  const experienceText = tConfig(allConfig?.experienceDict?.[String(profileDetail.experience ?? '')]) || 'Chưa có kinh nghiệm';

  const city = tConfig(allConfig?.cityDict?.[String(seeker.location?.city || profileDetail.city || '')]);
  const district = seeker.location?.districtDict?.name || '';
  const originLocation = district && city ? `${district}, ${city}` : city || district || '';
  const fullAddress = seeker.contactAddress || seeker.location?.address || (profileDetail as any).address || '';

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      {/* Section Title */}
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.5 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            bgcolor: '#EFF6FF',
            color: '#2563EB',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <PersonOutlineIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
          Thông tin cá nhân
        </Typography>
      </Stack>

      {/* 3 Columns Information Grid */}
      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Email" value={email} icon={EmailOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Số điện thoại" value={phone} icon={PhoneOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Giới tính" value={gender} icon={WcOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Ngày sinh" value={birthdayFormatted} icon={CakeOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Tình trạng hôn nhân" value={maritalStatus} icon={PeopleAltOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Tình trạng" value={experienceText} icon={WorkOutlineOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Quê quán / Huyện" value={originLocation} icon={LocationCityOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
          <GridField label="Địa chỉ" value={fullAddress} icon={PlaceOutlinedIcon} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PersonalInformation;
