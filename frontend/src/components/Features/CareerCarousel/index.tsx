'use client';

import React from 'react';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Avatar,
  Box,
  Card,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import commonService from '@/services/commonService';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import { buildJobPostFilter, searchJobPost } from '@/redux/filterSlice';
import { IMAGES, ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import type { Career } from '@/types/models';
import type { SvgIconComponent } from '@mui/icons-material';

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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const swiperStyles = {
  '.swiper, & .swiper': {
    padding: '14px 8px 36px 8px !important',
    margin: '-14px -8px 0 -8px !important',
    overflow: 'hidden',
  },
  '.swiper-pagination, & .swiper-pagination': {
    bottom: '4px !important',
  },
  '.swiper-wrapper, & .swiper-wrapper': {
    alignItems: 'stretch',
  },
  '.swiper-slide, & .swiper-slide': {
    height: 'auto',
  },
  '.swiper-pagination-bullet, & .swiper-pagination-bullet': {
    width: 8,
    height: 8,
    opacity: 0.35,
    backgroundColor: '#64748b',
    transition: 'all 0.3s ease',
  },
  '.swiper-pagination-bullet-active, & .swiper-pagination-bullet-active': {
    width: 24,
    height: 8,
    opacity: 1,
    borderRadius: '4px',
    backgroundColor: '#2563eb',
  },
};

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

const CAREER_THEMES = [
  { bg: '#EFF6FF', text: '#2563EB', border: 'rgba(37, 99, 235, 0.18)', hoverBorder: '#2563EB', glow: 'rgba(37, 99, 235, 0.14)' }, // Blue
  { bg: '#F0FDF4', text: '#16A34A', border: 'rgba(22, 163, 74, 0.18)', hoverBorder: '#16A34A', glow: 'rgba(22, 163, 74, 0.14)' }, // Green
  { bg: '#FAF5FF', text: '#9333EA', border: 'rgba(147, 51, 234, 0.18)', hoverBorder: '#9333EA', glow: 'rgba(147, 51, 234, 0.14)' }, // Purple
  { bg: '#FFF7ED', text: '#EA580C', border: 'rgba(234, 88, 12, 0.18)', hoverBorder: '#EA580C', glow: 'rgba(234, 88, 12, 0.14)' }, // Orange
  { bg: '#ECFEFF', text: '#0891B2', border: 'rgba(8, 145, 178, 0.18)', hoverBorder: '#0891B2', glow: 'rgba(8, 145, 178, 0.14)' }, // Cyan
  { bg: '#FFF1F2', text: '#E11D48', border: 'rgba(225, 29, 72, 0.18)', hoverBorder: '#E11D48', glow: 'rgba(225, 29, 72, 0.14)' }, // Rose
];

const LoadingSkeleton = (
  <Card
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 190,
      p: 2.5,
      boxShadow: 0,
      borderRadius: '20px',
      border: '1px solid #E2E8F0',
      backgroundColor: '#ffffff',
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: '14px' }} />
      <Skeleton variant="circular" width={28} height={28} />
    </Stack>
    <Box sx={{ mt: 2.5 }}>
      <Skeleton width="75%" height={26} sx={{ mb: 1 }} />
      <Skeleton width="45%" height={22} sx={{ borderRadius: '12px' }} />
    </Box>
  </Card>
);

const normalizeCareers = (careers: Career[] = []) =>
  careers
    .map((career) => ({
      ...career,
      id: Number(career.id),
      name: String(career.name ?? '').trim(),
      jobPostTotal: Number(career.jobPostTotal ?? career.job_post_total ?? 0),
    }))
    .filter((career) => Number.isFinite(career.id) && career.id > 0 && career.name);

const CareerCarousel: React.FC = () => {
  const { t, i18n } = useTranslation('public');
  const dispatch = useDispatch();
  const [parentWidth, setParentWidth] = React.useState(0);
  const col = parentWidth < 600 ? 1 : parentWidth < 900 ? 2 : parentWidth < 1200 ? 3 : 4;
  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);

  const { data: rawTopCareers = [], isLoading } = useQuery({
    queryKey: ['top-careers'],
    queryFn: async () => {
      const resData = await commonService.getTop10Careers();
      return resData || [];
    },
    staleTime: 5 * 60_000,
  });

  const topCareers = React.useMemo(() => normalizeCareers(rawTopCareers), [rawTopCareers]);

  React.useEffect(() => {
    const handleResize = () => {
      const element = document.getElementById('career-carousel');
      if (element) {
        setParentWidth(element.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFilter = (id: string | number) => {
    dispatch(searchJobPost(buildJobPostFilter({ careerId: String(id) })));
  };

  return (
    <Box id="career-carousel" sx={{ width: '100%' }}>
      {/* ── Section Header Row ───────────────────────────────────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <BusinessCenterIcon sx={{ color: '#2563eb', fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
            {t('home.keyCareersTitle') || 'Top ngành nghề nổi bật'}
          </Typography>
        </Stack>

        <Link href={jobsHref} style={{ textDecoration: 'none' }}>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#2563eb', cursor: 'pointer', '&:hover': { opacity: 0.85 } }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.925rem' }}>Xem tất cả</Typography>
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </Stack>
        </Link>
      </Stack>

      <Box sx={swiperStyles}>
        <Swiper
          slidesPerView={col}
          spaceBetween={16}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          modules={[Pagination, Autoplay]}
        >
          {isLoading
            ? Array.from(Array(8).keys()).map((val) => (
                <SwiperSlide key={val}>{LoadingSkeleton}</SwiperSlide>
              ))
            : topCareers.map((value: Career & { jobPostTotal?: number }, index: number) => {
                const theme = CAREER_THEMES[index % CAREER_THEMES.length];
                const IconComponent =
                  (value.appIconName && CAREER_ICON_MAP[value.appIconName.toLowerCase()]) ||
                  CAREER_ICON_MAP[value.name.toLowerCase()] ||
                  BusinessCenterIcon;

                const jobCount = value.jobPostTotal || 0;
                const countBadgeText =
                  jobCount > 0
                    ? t('home.jobsCount', { count: jobCount })
                    : t('home.startExploring');

                return (
                  <SwiperSlide key={value.id}>
                    <Card
                      component={Link}
                      href={jobsHref}
                      prefetch
                      onClick={() => handleFilter(value.id)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: 185,
                        p: 2.5,
                        bgcolor: '#ffffff',
                        border: '1px solid rgba(226, 232, 240, 0.9)',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        color: 'inherit',
                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          borderColor: theme.hoverBorder,
                          boxShadow: `0 18px 32px -8px rgba(15, 23, 42, 0.08), 0 4px 12px ${theme.glow}`,
                          '& .career-arrow-icon': {
                            transform: 'translateX(4px)',
                            color: theme.text,
                          },
                          '& .career-title-text': {
                            color: theme.text,
                          },
                        },
                      }}
                    >
                      {/* Top Row: Icon Container + Direction Arrow */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '15px',
                            bgcolor: theme.bg,
                            color: theme.text,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${theme.border}`,
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          <IconComponent sx={{ fontSize: 28, color: theme.text }} />
                        </Box>

                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          <ArrowForwardIcon
                            className="career-arrow-icon"
                            sx={{
                              fontSize: 16,
                              color: '#94a3b8',
                              transition: 'all 0.25s ease',
                            }}
                          />
                        </Box>
                      </Stack>

                      {/* Middle & Bottom Rows: Title & Count Badge */}
                      <Box sx={{ mt: 'auto' }}>
                        <Typography
                          className="career-title-text"
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            fontSize: '1.02rem',
                            color: '#0f172a',
                            lineHeight: 1.35,
                            mb: 1,
                            transition: 'color 0.25s ease',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {value.name}
                        </Typography>

                        <Chip
                          label={countBadgeText}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.775rem',
                            height: 26,
                            color: jobCount > 0 ? theme.text : '#64748b',
                            bgcolor: jobCount > 0 ? theme.bg : '#f1f5f9',
                            border: `1px solid ${jobCount > 0 ? theme.border : '#e2e8f0'}`,
                            borderRadius: '8px',
                          }}
                        />
                      </Box>
                    </Card>
                  </SwiperSlide>
                );
              })}
        </Swiper>
      </Box>
    </Box>
  );
};

export default CareerCarousel;
