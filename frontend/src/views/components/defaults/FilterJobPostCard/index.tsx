'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import {
  Box,
  Stack,
  Typography,
  Grid2 as Grid,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import jobService from '../../../../services/jobService';
import type { JobPost as ModelsJobPost } from '../../../../types/models';
import type { GetJobPostsParams } from '../../../../services/jobService';
import MuiImageCustom from '../../../../components/Common/MuiImageCustom';
import NoDataCard from '../../../../components/Common/NoDataCard';
import { IMAGES } from '../../../../configs/constants';

interface FilterJobPostCardProps {
  params?: GetJobPostsParams;
}

const pageSize = 9; // 3x3 grid as shown in screenshot

const CITIES_LIST = [
  { id: 'all', name: 'Tất cả' },
  { id: 1, name: 'TP.HCM' },
  { id: 2, name: 'Hà Nội' },
  { id: 3, name: 'Đà Nẵng' },
  { id: 4, name: 'An Giang' },
  { id: 5, name: 'Bà Rịa - Vũng Tàu' },
  { id: 6, name: 'Bạc Liêu' },
  { id: 7, name: 'Bến Tre' },
  { id: 8, name: 'Bình Dương' },
  { id: 9, name: 'Lâm Đồng' },
];

const FilterJobPostCardContent: React.FC<FilterJobPostCardProps> = ({ params = {} }) => {
  const [page, setPage] = useState(1);
  const [selectedCityId, setSelectedCityId] = useState<string | number>('all');
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  const toggleFavorite = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCitySelect = (cityId: string | number) => {
    setSelectedCityId(cityId);
    setPage(1);
    setAnchorEl(null);
  };

  const resolvedParams = React.useMemo<GetJobPostsParams>(() => {
    const base = { ...params };
    if (selectedCityId !== 'all') {
      base.cityId = selectedCityId;
    }
    return base;
  }, [params, selectedCityId]);

  const { data, isLoading } = useQuery({
    queryKey: ['filtered-job-posts', resolvedParams, page],
    queryFn: async () => {
      const resData = await jobService.getJobPosts({
        ...resolvedParams,
        pageSize,
        page,
      });
      return {
        results: resData?.results || [],
        count: resData?.count || 0,
      };
    },
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  const jobPosts = data?.results || [];
  const totalCount = data?.count || jobPosts.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Thoả thuận';
    if (min && max) {
      const minTr = Math.round(min / 1000000);
      const maxTr = Math.round(max / 1000000);
      return `${minTr} - ${maxTr} triệu`;
    }
    if (min) return `Từ ${Math.round(min / 1000000)} triệu`;
    if (max) return `Đến ${Math.round(max / 1000000)} triệu`;
    return 'Thoả thuận';
  };

  const getDaysLeft = (deadlineStr?: string) => {
    if (!deadlineStr) return 'Còn 30 ngày';
    const diff = dayjs(deadlineStr).diff(dayjs(), 'day');
    return diff > 0 ? `Còn ${diff} ngày` : 'Hết hạn';
  };

  return (
    <Box id="filter-job-post-card" sx={{ width: '100%' }}>
      {/* ── Section Header Row ───────────────────────────────────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <LocalFireDepartmentIcon sx={{ color: '#ea580c', fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#ea580c', letterSpacing: '-0.01em' }}>
            Việc làm tuyển gấp
          </Typography>
        </Stack>

        <Link href="/viec-lam" style={{ textDecoration: 'none' }}>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#e11d48', cursor: 'pointer', '&:hover': { opacity: 0.85 } }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.925rem' }}>Xem thêm</Typography>
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </Stack>
        </Link>
      </Stack>

      {/* ── Filter Bar (Location dropdown + Scrollable City Pills) ───── */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3, width: '100%', overflow: 'hidden' }}>
        {/* Location Dropdown */}
        <Button
          variant="outlined"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          startIcon={<FilterListIcon sx={{ color: '#64748b', fontSize: 18 }} />}
          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#64748b' }} />}
          sx={{
            borderRadius: '24px',
            borderColor: '#e2e8f0',
            color: '#334155',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            px: 2,
            py: 0.8,
            backgroundColor: '#ffffff',
            flexShrink: 0,
            '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
          }}
        >
          Lọc theo: Địa điểm
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: '12px', mt: 1, minWidth: 160 } }}
        >
          {CITIES_LIST.map((city) => (
            <MenuItem
              key={city.id}
              selected={selectedCityId === city.id}
              onClick={() => handleCitySelect(city.id)}
              sx={{ fontSize: '0.875rem', fontWeight: selectedCityId === city.id ? 700 : 400 }}
            >
              {city.name}
            </MenuItem>
          ))}
        </Menu>

        {/* Scroll Left Button */}
        <IconButton
          size="small"
          onClick={handleScrollLeft}
          sx={{
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            width: 32,
            height: 32,
            flexShrink: 0,
            '&:hover': { backgroundColor: '#f1f5f9' },
          }}
        >
          <KeyboardArrowLeftIcon sx={{ fontSize: 18, color: '#64748b' }} />
        </IconButton>

        {/* Scrollable Pills Container */}
        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            py: 0.5,
            flex: 1,
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          {CITIES_LIST.map((city) => {
            const isActive = selectedCityId === city.id;
            return (
              <Box
                key={city.id}
                onClick={() => handleCitySelect(city.id)}
                sx={{
                  px: 2.2,
                  py: 0.75,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : '#475569',
                  backgroundColor: isActive ? '#e11d48' : '#f1f5f9',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                  flexShrink: 0,
                  '&:hover': {
                    backgroundColor: isActive ? '#be123c' : '#e2e8f0',
                  },
                }}
              >
                {city.name}
              </Box>
            );
          })}
        </Box>

        {/* Scroll Right Button */}
        <IconButton
          size="small"
          onClick={handleScrollRight}
          sx={{
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            width: 32,
            height: 32,
            flexShrink: 0,
            '&:hover': { backgroundColor: '#f1f5f9' },
          }}
        >
          <KeyboardArrowRightIcon sx={{ fontSize: 18, color: '#64748b' }} />
        </IconButton>
      </Stack>

      {/* ── Cards Grid (3 Columns x 3 Rows) ─────────────────────────── */}
      {isLoading && !data ? (
        <Grid container spacing={2.5}>
          {Array.from(Array(9).keys()).map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={160} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      ) : jobPosts.length === 0 ? (
        <NoDataCard />
      ) : (
        <>
          <Grid container spacing={2.5}>
            {jobPosts.map((job: ModelsJobPost & { companyDict?: { companyImageUrl?: string | null; companyName?: string | null }; locationDict?: { city?: number | string } }) => {
              const isFav = Boolean(favorites[job.id]);
              const companyNameStr = job.companyDict?.companyName || job.company?.companyName || 'Công ty Tuyển Dụng';
              const companyLogo = job.companyDict?.companyImageUrl || job.company?.logoUrl || IMAGES.companyLogoDefault;
              const locationCity = job.locationDict?.city || (job.location as any)?.city || 'TP.HCM';
              const daysText = getDaysLeft(job.deadline);
              const salaryDisplay = formatSalary(job.salaryMin, job.salaryMax);

              return (
                <Grid key={job.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box
                    component={Link}
                    href={`/viec-lam/${job.slug}`}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      height: '100%',
                      minHeight: 165,
                      p: 2.2,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      textDecoration: 'none',
                      color: 'inherit',
                      position: 'relative',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        borderColor: '#cbd5e1',
                        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                      },
                    }}
                  >
                    {/* Top Row: Title + Heart Icon */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: '#0f172a',
                          lineHeight: 1.35,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          flex: 1,
                        }}
                      >
                        {job.jobName}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => toggleFavorite(e, job.id)}
                        sx={{
                          p: 0.5,
                          color: isFav ? '#ef4444' : '#94a3b8',
                          '&:hover': { backgroundColor: 'transparent', color: '#ef4444' },
                        }}
                      >
                        {isFav ? (
                          <FavoriteIcon sx={{ fontSize: 20, color: '#ef4444' }} />
                        ) : (
                          <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                        )}
                      </IconButton>
                    </Box>

                    {/* Middle Row: Company Logo + Company Name / Salary / City */}
                    <Stack direction="row" spacing={1.75} alignItems="center" sx={{ mb: 1.5 }}>
                      <MuiImageCustom
                        width={52}
                        height={52}
                        src={companyLogo}
                        fallbackSrc={IMAGES.companyLogoDefault}
                        sx={{
                          borderRadius: '10px',
                          border: '1px solid #f1f5f9',
                          objectFit: 'contain',
                          flexShrink: 0,
                          p: 0.5,
                          backgroundColor: '#ffffff',
                        }}
                      />
                      <Stack spacing={0.4} sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 500 }}
                        >
                          {companyNameStr}
                        </Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <AttachMoneyIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563eb' }}>
                            {salaryDisplay}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LocationOnIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }} noWrap>
                            {typeof locationCity === 'string' ? locationCity : 'TP.HCM'}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>

                    {/* Bottom Row: Hot Badge + Days Left */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1, borderTop: '1px dashed #f1f5f9' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {job.isHot && (
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#ef4444' }}>
                            <LocalFireDepartmentIcon sx={{ fontSize: 15 }} />
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>HOT</Typography>
                          </Stack>
                        )}
                      </Box>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#94a3b8' }}>
                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                        <Typography sx={{ fontSize: '0.775rem', fontWeight: 500 }}>{daysText}</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* ── Bottom Circular Pagination ──────────────────────────────────── */}
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
            <IconButton
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              sx={{
                border: '1px solid #e11d48',
                color: '#e11d48',
                width: 36,
                height: 36,
                '&.Mui-disabled': { borderColor: '#e2e8f0', color: '#cbd5e1' },
                '&:hover': { backgroundColor: 'rgba(225, 29, 72, 0.08)' },
              }}
            >
              <KeyboardArrowLeftIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>
              {page} / {totalPages}
            </Typography>

            <IconButton
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              sx={{
                border: '1px solid #e11d48',
                color: '#e11d48',
                width: 36,
                height: 36,
                '&.Mui-disabled': { borderColor: '#e2e8f0', color: '#cbd5e1' },
                '&:hover': { backgroundColor: 'rgba(225, 29, 72, 0.08)' },
              }}
            >
              <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        </>
      )}
    </Box>
  );
};

const FilterJobPostCard: React.FC<FilterJobPostCardProps> = (props) => {
  return <FilterJobPostCardContent {...props} />;
};

export default React.memo(FilterJobPostCard);
