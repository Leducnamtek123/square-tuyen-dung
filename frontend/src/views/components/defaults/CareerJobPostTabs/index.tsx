'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import EngineeringIcon from '@mui/icons-material/Engineering';
import WeekendIcon from '@mui/icons-material/Weekend';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import ComputerIcon from '@mui/icons-material/Computer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CampaignIcon from '@mui/icons-material/Campaign';
import GroupsIcon from '@mui/icons-material/Groups';
import ConstructionIcon from '@mui/icons-material/Construction';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { SvgIconComponent } from '@mui/icons-material';
import commonService from '@/services/commonService';
import type { Career } from '@/types/models';
import FilterJobPostCard from '../FilterJobPostCard';

const CAREER_ICON_MAP: Record<string, SvgIconComponent> = {
  apartment: ApartmentIcon,
  'bất động sản': ApartmentIcon,
  engineering: EngineeringIcon,
  'xây dựng': EngineeringIcon,
  weekend: WeekendIcon,
  'nội thất': WeekendIcon,
  architecture: ArchitectureIcon,
  'kiến trúc': ArchitectureIcon,
  construction: ConstructionIcon,
  it: ComputerIcon,
  'it - phần mềm': ComputerIcon,
  software: ComputerIcon,
  finance: TrendingUpIcon,
  'tài chính': TrendingUpIcon,
  'tài chính / ngân hàng': TrendingUpIcon,
  marketing: CampaignIcon,
  'marketing / pr': CampaignIcon,
  hr: GroupsIcon,
  'nhân sự': GroupsIcon,
  'hành chính / nhân sự': GroupsIcon,
  business: BusinessCenterIcon,
  'kinh doanh': BusinessCenterIcon,
  'bán hàng / kinh doanh': BusinessCenterIcon,
  'dịch vụ khách hàng': GroupsIcon,
  'cơ khí / tự động hóa': EngineeringIcon,
  'lao động phổ thông': ConstructionIcon,
};

const getCareerIcon = (careerName?: string, appIconName?: string | null): SvgIconComponent => {
  if (appIconName && CAREER_ICON_MAP[appIconName.toLowerCase()]) {
    return CAREER_ICON_MAP[appIconName.toLowerCase()];
  }
  if (careerName && CAREER_ICON_MAP[careerName.toLowerCase()]) {
    return CAREER_ICON_MAP[careerName.toLowerCase()];
  }
  return WorkOutlineOutlinedIcon;
};

export const CareerJobPostTabs: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation('public');

  const [selectedCareerId, setSelectedCareerId] = useState<number | 'all'>('all');

  const { data: rawCareers = [], isLoading: isLoadingCareers } = useQuery({
    queryKey: ['top-careers'],
    queryFn: async () => {
      const list = await commonService.getTop10Careers();
      return (list || []).filter((c: Career) => c.name && c.name.trim().length > 0);
    },
    staleTime: 10 * 60_000,
  });

  const careers = useMemo(() => {
    return rawCareers.slice(0, 8);
  }, [rawCareers]);

  const selectedCareer = useMemo(() => {
    if (selectedCareerId === 'all') return null;
    return careers.find((c) => c.id === selectedCareerId) || null;
  }, [careers, selectedCareerId]);

  return (
    <Box sx={{ width: '100%', mt: { xs: 4, sm: 6, md: 8 } }}>
      {/* Header Section */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' },
              color: '#0f172a',
              letterSpacing: '-0.02em',
            }}
          >
            {t('home.keyCareersTitle', { defaultValue: 'Việc làm theo ngành nghề nổi bật' })}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              mt: 0.5,
              fontSize: { xs: '0.875rem', sm: '0.95rem' },
            }}
          >
            {t('home.keyCareersSubtitle', {
              defaultValue: 'Khám phá các nhóm nghề đang có nhu cầu tuyển dụng cao nhất.',
            })}
          </Typography>
        </Box>

        <Button
          component={Link}
          href="/viec-lam-theo-nganh-nghe"
          endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: '#2563eb',
            borderRadius: '10px',
            px: 1.5,
            py: 0.75,
            bgcolor: 'rgba(37, 99, 235, 0.06)',
            '&:hover': {
              bgcolor: 'rgba(37, 99, 235, 0.12)',
            },
          }}
        >
          Xem tất cả ngành nghề
        </Button>
      </Stack>

      {/* Career Pills Filter Bar */}
      <Box
        sx={{
          mb: 3.5,
          pb: 1,
          overflowX: 'auto',
          display: 'flex',
          gap: 1.25,
          alignItems: 'center',
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(100, 116, 139, 0.2)',
            borderRadius: 4,
          },
        }}
      >
        {/* 'All' pill */}
        <Chip
          icon={<AutoAwesomeIcon sx={{ fontSize: '15px !important' }} />}
          label="Tất cả ngành nghề"
          clickable
          onClick={() => setSelectedCareerId('all')}
          sx={{
            height: 40,
            borderRadius: '12px',
            px: 1,
            fontWeight: 700,
            fontSize: '0.85rem',
            transition: 'all 0.2s ease',
            ...(selectedCareerId === 'all'
              ? {
                  bgcolor: '#2563eb',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                  '& .MuiChip-icon': { color: '#ffffff' },
                  '&:hover': { bgcolor: '#1d4ed8' },
                }
              : {
                  bgcolor: '#ffffff',
                  color: '#334155',
                  border: '1px solid #e2e8f0',
                  '& .MuiChip-icon': { color: '#64748b' },
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    borderColor: '#cbd5e1',
                  },
                }),
          }}
        />

        {/* Dynamic career pills */}
        {isLoadingCareers
          ? Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton
                key={idx}
                variant="rounded"
                width={130}
                height={40}
                sx={{ borderRadius: '12px', flexShrink: 0 }}
              />
            ))
          : careers.map((career) => {
              const isSelected = selectedCareerId === career.id;
              const IconComp = getCareerIcon(career.name, career.appIconName);
              const jobCount = Number(career.jobPostTotal ?? career.job_post_total ?? 0);

              return (
                <Chip
                  key={career.id}
                  icon={<IconComp sx={{ fontSize: '16px !important' }} />}
                  label={
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <span>{career.name}</span>
                      {jobCount > 0 && (
                        <Box
                          component="span"
                          sx={{
                            px: 0.75,
                            py: 0.15,
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'rgba(37, 99, 235, 0.08)',
                            color: isSelected ? '#ffffff' : '#2563eb',
                          }}
                        >
                          {jobCount}
                        </Box>
                      )}
                    </Stack>
                  }
                  clickable
                  onClick={() => setSelectedCareerId(career.id)}
                  sx={{
                    height: 40,
                    borderRadius: '12px',
                    px: 1,
                    fontWeight: isSelected ? 750 : 600,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    ...(isSelected
                      ? {
                          bgcolor: '#2563eb',
                          color: '#ffffff',
                          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                          '& .MuiChip-icon': { color: '#ffffff' },
                          '&:hover': { bgcolor: '#1d4ed8' },
                        }
                      : {
                          bgcolor: '#ffffff',
                          color: '#334155',
                          border: '1px solid #e2e8f0',
                          '& .MuiChip-icon': { color: '#64748b' },
                          '&:hover': {
                            bgcolor: '#f8fafc',
                            borderColor: '#cbd5e1',
                          },
                        }),
                  }}
                />
              );
            })}
      </Box>

      {/* Job Post Content Grid */}
      <FilterJobPostCard
        key={selectedCareerId}
        params={selectedCareerId === 'all' ? undefined : { careerId: selectedCareerId }}
        hideHeader
        hideFilterBar={selectedCareerId !== 'all'}
        fallbackToAllIfEmpty
      />
    </Box>
  );
};

export default React.memo(CareerJobPostTabs);
