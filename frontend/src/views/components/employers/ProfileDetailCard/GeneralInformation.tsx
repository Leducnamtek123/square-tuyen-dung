'use client';

import React from 'react';
import { Box, Paper, Stack, Typography, Grid2 as Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

import { useConfig } from '@/hooks/useConfig';
import { tConfig } from '@/utils/tConfig';
import { formatLocalizedSalaryRange } from '@/utils/customData';
import type { ResumeDetailResponse } from '@/types/models';

interface GeneralInformationProps {
  profileDetail: ResumeDetailResponse;
}

interface GridFieldProps {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  isEmphasized?: boolean;
}

const GridField: React.FC<GridFieldProps> = ({ label, value, icon: Icon, isEmphasized }) => (
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
          color: value ? (isEmphasized ? '#0F172A' : '#1E293B') : '#94A3B8',
          fontWeight: isEmphasized ? 800 : 600,
          fontSize: isEmphasized ? '0.925rem' : '0.875rem',
          lineHeight: 1.4,
          overflowWrap: 'anywhere',
        }}
      >
        {value || 'Chưa cập nhật'}
      </Typography>
    </Box>
  </Stack>
);

export const GeneralInformation: React.FC<GeneralInformationProps> = ({ profileDetail }) => {
  const { t, i18n } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();

  const desiredPosition = profileDetail.title || '';
  const desiredLevel = tConfig(allConfig?.positionDict?.[String(profileDetail.position ?? '')]);
  const educationLevel = tConfig(allConfig?.academicLevelDict?.[String(profileDetail.academicLevel ?? '')]);
  const experience = tConfig(allConfig?.experienceDict?.[String(profileDetail.experience ?? '')]);
  const career = tConfig(
    typeof profileDetail.career === 'object' && profileDetail.career
      ? profileDetail.career.name
      : allConfig?.careerDict?.[String(profileDetail.career ?? '')]
  );
  const workLocation = tConfig(
    typeof profileDetail.city === 'object' && profileDetail.city
      ? profileDetail.city.name
      : allConfig?.cityDict?.[String(profileDetail.city ?? '')]
  );
  const salaryText = formatLocalizedSalaryRange(profileDetail.salaryMin, profileDetail.salaryMax, i18n.language);
  const workplaceType = tConfig(allConfig?.typeOfWorkplaceDict?.[String(profileDetail.typeOfWorkplace ?? '')]);
  const jobType = tConfig(allConfig?.jobTypeDict?.[String(profileDetail.jobType ?? '')]);

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
          <InfoOutlinedIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
          Thông tin chung
        </Typography>
      </Stack>

      {/* 3 Columns Information Grid */}
      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Vị trí mong muốn" value={desiredPosition} icon={WorkOutlineOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Cấp bậc mong muốn" value={desiredLevel} icon={MilitaryTechOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Trình độ học vấn" value={educationLevel} icon={SchoolOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Kinh nghiệm" value={experience} icon={HistoryOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Ngành nghề" value={career} icon={ExploreOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Địa điểm làm việc" value={workLocation} icon={PlaceOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField
            label="Mức lương mong muốn"
            value={salaryText}
            icon={PaymentsOutlinedIcon}
            isEmphasized
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Loại hình làm việc" value={workplaceType} icon={BusinessOutlinedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <GridField label="Hình thức làm việc" value={jobType} icon={AccessTimeOutlinedIcon} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GeneralInformation;
