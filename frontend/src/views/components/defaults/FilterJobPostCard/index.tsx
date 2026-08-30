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
import Tooltip from '@mui/material/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { faBolt } from '@fortawesome/free-solid-svg-icons';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckIcon from '@mui/icons-material/Check';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useConfig } from '../../../../hooks/useConfig';
import jobService from '../../../../services/jobService';
import type { JobPost as ModelsJobPost } from '../../../../types/models';
import type { GetJobPostsParams } from '../../../../services/jobService';
import MuiImageCustom from '../../../../components/Common/MuiImageCustom';
import NoDataCard from '../../../../components/Common/NoDataCard';
import { IMAGES } from '../../../../configs/constants';
import useRequireAuth from '@/hooks/useRequireAuth';
import toastMessages from '@/utils/toastMessages';
import { JobHoverPreviewCard, useJobHoverPreview } from '@/components/Features/JobHoverPreview';

interface FilterJobPostCardProps {
  params?: GetJobPostsParams;
  compact?: boolean;
  hideHeader?: boolean;
  hideFilterBar?: boolean;
  headerTitle?: string;
  fallbackToAllIfEmpty?: boolean;
  hideIfEmpty?: boolean;
}

type FilterDimension = 'city' | 'salary' | 'experience' | 'career';

const FILTER_DIMENSIONS: { id: FilterDimension; label: string }[] = [
  { id: 'city', label: 'Địa điểm' },
  { id: 'salary', label: 'Mức lương' },
  { id: 'experience', label: 'Kinh nghiệm' },
  { id: 'career', label: 'Ngành nghề' },
];

const SALARY_RANGES = [
  { id: 'all', label: 'Tất cả' },
  { id: '1-3', label: '1 - 3 triệu', min: 1000000, max: 3000000 },
  { id: '3-5', label: '3 - 5 triệu', min: 3000000, max: 5000000 },
  { id: '5-7', label: '5 - 7 triệu', min: 5000000, max: 7000000 },
  { id: '7-10', label: '7 - 10 triệu', min: 7000000, max: 10000000 },
  { id: '10-15', label: '10 - 15 triệu', min: 10000000, max: 15000000 },
  { id: '15-20', label: '15 - 20 triệu', min: 15000000, max: 20000000 },
  { id: '20+', label: 'Trên 20 triệu', min: 20000000, max: undefined },
];

const FilterJobPostCardContent: React.FC<FilterJobPostCardProps> = ({
  params = {},
  compact = false,
  hideHeader = false,
  hideFilterBar = false,
  headerTitle,
  fallbackToAllIfEmpty = false,
  hideIfEmpty = false,
}) => {
  const { allConfig } = useConfig();
  const { requireAuth, AuthModal } = useRequireAuth();
  const pageSize = compact ? 6 : 9;
  const [page, setPage] = useState(1);
  const [currentDimension, setCurrentDimension] = useState<FilterDimension>('city');
  const [selectedSubItem, setSelectedSubItem] = useState<string | number>('all');
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const {
    hoveredJob,
    anchorEl: previewAnchorEl,
    isOpen: isPreviewOpen,
    handleCardMouseEnter,
    handleCardMouseLeave,
    handlePopperMouseEnter,
    handlePopperMouseLeave,
    handleClose: handleClosePreview,
  } = useJobHoverPreview();

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

  const toggleFavorite = (e: React.MouseEvent, id: number, slug?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!requireAuth({ actionType: 'save_job' })) {
      return;
    }
    const currentStatus = favorites[id] !== undefined
      ? favorites[id]
      : Boolean((jobPosts.find((j) => j.id === id) as any)?.isSaved);
    const willSave = !currentStatus;
    setFavorites((prev) => ({ ...prev, [id]: willSave }));
    const run = async () => {
      try {
        const res = await jobService.saveJobPost(slug || String(id)) as { isSaved?: boolean };
        const saved = res?.isSaved ?? willSave;
        setFavorites((prev) => ({ ...prev, [id]: saved }));
        toastMessages.success(saved ? 'Đã lưu tin tuyển dụng' : 'Đã bỏ lưu tin tuyển dụng');
      } catch {
        setFavorites((prev) => ({ ...prev, [id]: currentStatus }));
      }
    };
    run();
  };

  const handleDimensionSelect = (dimId: FilterDimension) => {
    setCurrentDimension(dimId);
    setSelectedSubItem('all');
    setPage(1);
    setAnchorEl(null);
  };

  const handleSubItemSelect = (id: string | number) => {
    setSelectedSubItem(id);
    setPage(1);
  };

  // Fetch full sample pool for this context (e.g. companyId) to determine available filter chips
  const baseContextParams = React.useMemo<GetJobPostsParams>(() => {
    return {
      ...params,
      pageSize: 100,
      page: 1,
    };
  }, [params]);

  const { data: contextJobsData } = useQuery({
    queryKey: ['filter-context-jobs-pool', baseContextParams],
    queryFn: async () => {
      const resData = await jobService.getJobPosts(baseContextParams);
      return resData?.results || [];
    },
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  const activeOptions = React.useMemo(() => {
    if (!contextJobsData || contextJobsData.length === 0) {
      return null;
    }

    const citySet = new Set<number | string>();
    const careerSet = new Set<number | string>();
    const expSet = new Set<number | string>();
    const activeSalaryIds = new Set<string>();

    contextJobsData.forEach((job: any) => {
      // City
      const cId = job.location?.city?.id ?? job.location?.city ?? job.locationDict?.city ?? job.cityId ?? job.city;
      if (cId !== undefined && cId !== null && cId !== '') {
        citySet.add(cId);
        if (typeof cId === 'number' || !isNaN(Number(cId))) {
          citySet.add(Number(cId));
        }
      }

      // Career
      const carId = job.career?.id ?? job.career;
      if (carId !== undefined && carId !== null && carId !== '') {
        careerSet.add(carId);
        if (typeof carId === 'number' || !isNaN(Number(carId))) {
          careerSet.add(Number(carId));
        }
      }

      // Experience
      const expId = job.experience?.id ?? job.experience;
      if (expId !== undefined && expId !== null && expId !== '') {
        expSet.add(expId);
        if (typeof expId === 'number' || !isNaN(Number(expId))) {
          expSet.add(Number(expId));
        }
      }

      // Salary
      const sMin = job.salaryMin;
      const sMax = job.salaryMax;
      SALARY_RANGES.forEach((sr) => {
        if (sr.id === 'all') return;
        if (sr.min !== undefined && sr.max !== undefined) {
          if (sMin && sMax && sMin < sr.max && sMax > sr.min) {
            activeSalaryIds.add(sr.id);
          } else if (sMin && !sMax && sMin >= sr.min && sMin <= sr.max) {
            activeSalaryIds.add(sr.id);
          } else if (!sMin && sMax && sMax >= sr.min && sMax <= sr.max) {
            activeSalaryIds.add(sr.id);
          }
        } else if (sr.min !== undefined && sr.max === undefined) {
          if ((sMin && sMin >= sr.min) || (sMax && sMax >= sr.min)) {
            activeSalaryIds.add(sr.id);
          }
        }
      });
    });

    return { citySet, careerSet, expSet, activeSalaryIds };
  }, [contextJobsData]);

  // Compute sub-items list dynamically from real API data filtered by active job context
  const subItems = React.useMemo(() => {
    let fullList: { id: string | number; label: string }[] = [];

    if (currentDimension === 'city') {
      const citiesFromApi = allConfig?.cityOptions || allConfig?.cities || [];
      fullList = [{ id: 'all', label: 'Tất cả' }, ...citiesFromApi.map((c: any) => ({ id: c.id, label: c.name }))];

      if (activeOptions?.citySet && activeOptions.citySet.size > 0) {
        fullList = fullList.filter(
          (item) => item.id === 'all' || activeOptions.citySet.has(item.id) || activeOptions.citySet.has(Number(item.id))
        );
      }
    } else if (currentDimension === 'salary') {
      fullList = SALARY_RANGES;
      if (activeOptions?.activeSalaryIds && activeOptions.activeSalaryIds.size > 0) {
        fullList = fullList.filter((item) => item.id === 'all' || activeOptions.activeSalaryIds.has(item.id as string));
      }
    } else if (currentDimension === 'experience') {
      const expFromApi = allConfig?.experienceOptions || [];
      fullList = [{ id: 'all', label: 'Tất cả' }, ...expFromApi.map((e: any) => ({ id: e.id, label: e.name }))];

      if (activeOptions?.expSet && activeOptions.expSet.size > 0) {
        fullList = fullList.filter(
          (item) =>
            item.id === 'all' ||
            activeOptions.expSet.has(item.id) ||
            activeOptions.expSet.has(Number(item.id)) ||
            activeOptions.expSet.has(String(item.id))
        );
      }
    } else if (currentDimension === 'career') {
      const careersFromApi = allConfig?.careerOptions || allConfig?.careers || [];
      fullList = [{ id: 'all', label: 'Tất cả' }, ...careersFromApi.map((c: any) => ({ id: c.id, label: c.name }))];

      if (activeOptions?.careerSet && activeOptions.careerSet.size > 0) {
        fullList = fullList.filter(
          (item) => item.id === 'all' || activeOptions.careerSet.has(item.id) || activeOptions.careerSet.has(Number(item.id))
        );
      }
    } else {
      fullList = [{ id: 'all', label: 'Tất cả' }];
    }

    return fullList;
  }, [currentDimension, allConfig, activeOptions]);

  React.useEffect(() => {
    if (selectedSubItem !== 'all' && subItems.length > 0) {
      const exists = subItems.some((item) => String(item.id) === String(selectedSubItem));
      if (!exists) {
        setSelectedSubItem('all');
      }
    }
  }, [subItems, selectedSubItem]);

  const resolvedParams = React.useMemo<GetJobPostsParams>(() => {
    const base = { ...params };
    if (selectedSubItem === 'all') {
      return base;
    }
    if (currentDimension === 'city') {
      base.cityId = selectedSubItem;
    } else if (currentDimension === 'career') {
      base.careerId = selectedSubItem;
    } else if (currentDimension === 'experience') {
      base.experienceId = selectedSubItem;
    } else if (currentDimension === 'salary') {
      const foundSalary = SALARY_RANGES.find((s) => s.id === selectedSubItem);
      if (foundSalary) {
        if (foundSalary.min) base.salaryMin = foundSalary.min;
        if (foundSalary.max) base.salaryMax = foundSalary.max;
      }
    }
    return base;
  }, [params, currentDimension, selectedSubItem]);

  const { data, isLoading } = useQuery({
    queryKey: ['filtered-job-posts', resolvedParams, page, fallbackToAllIfEmpty],
    queryFn: async () => {
      let resData = await jobService.getJobPosts({
        ...resolvedParams,
        pageSize,
        page,
      });

      let isFallback = false;
      if (
        fallbackToAllIfEmpty &&
        (!resData?.results || resData.results.length === 0) &&
        Boolean(resolvedParams.isUrgent || resolvedParams.isHot)
      ) {
        const fallbackParams = { ...resolvedParams };
        delete fallbackParams.isUrgent;
        delete fallbackParams.isHot;
        const fallbackRes = await jobService.getJobPosts({
          ...fallbackParams,
          pageSize,
          page: 1,
        });
        if (fallbackRes?.results && fallbackRes.results.length > 0) {
          resData = fallbackRes;
          isFallback = true;
        }
      }

      return {
        results: resData?.results || [],
        count: resData?.count || 0,
        isFallback,
      };
    },
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  const jobPosts = data?.results || [];
  const totalCount = data?.count || jobPosts.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const isFallbackActive = Boolean(data?.isFallback);

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

  const activeDimensionLabel = FILTER_DIMENSIONS.find((d) => d.id === currentDimension)?.label || 'Địa điểm';
  const displayTitle = headerTitle || (isFallbackActive ? 'Việc làm nổi bật' : (resolvedParams.isUrgent ? 'Việc làm tuyển gấp' : 'Việc làm'));
  const HeaderIcon = isFallbackActive ? TipsAndUpdatesIcon : (resolvedParams.isUrgent ? LocalFireDepartmentIcon : WorkOutlineIcon);
  const headerIconColor = isFallbackActive ? '#2563eb' : (resolvedParams.isUrgent ? '#ea580c' : '#2563eb');

  if (hideIfEmpty && !isLoading && jobPosts.length === 0) {
    return null;
  }

  return (
    <Box id="filter-job-post-card" sx={{ width: '100%' }}>
      {/* ── Section Header Row ───────────────────────────────────────── */}
      {!hideHeader && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <HeaderIcon sx={{ color: headerIconColor, fontSize: 26 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: headerIconColor, letterSpacing: '-0.01em' }}>
              {displayTitle}
            </Typography>
          </Stack>

          <Link href="/viec-lam" style={{ textDecoration: 'none' }}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#e11d48', cursor: 'pointer', '&:hover': { opacity: 0.85 } }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.925rem' }}>Xem thêm</Typography>
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Stack>
          </Link>
        </Stack>
      )}

      {/* ── Filter Bar (Filter Mode dropdown + Scrollable Sub-item Pills) ───── */}
      {!hideFilterBar && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ mb: 3, width: '100%', overflow: 'hidden' }}
        >
          {/* Filter Dimension Dropdown Button */}
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
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2,
              py: 0.8,
              backgroundColor: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
              '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
            }}
          >
            Lọc theo: {activeDimensionLabel}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: '12px',
                mt: 1,
                minWidth: 180,
                p: 0.5,
                boxShadow: '0 16px 36px rgba(15, 23, 42, 0.12)',
                border: '1px solid #e2e8f0',
              },
            }}
          >
            {FILTER_DIMENSIONS.map((dim) => {
              const isSelected = currentDimension === dim.id;
              return (
                <MenuItem
                  key={dim.id}
                  selected={isSelected}
                  onClick={() => handleDimensionSelect(dim.id)}
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: '8px',
                    py: 1,
                    px: 1.5,
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    color: isSelected ? '#e11d48' : '#334155',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(225, 29, 72, 0.08)',
                      '&:hover': { backgroundColor: 'rgba(225, 29, 72, 0.12)' },
                    },
                  }}
                >
                  {dim.label}
                  {isSelected && <CheckIcon sx={{ fontSize: 18, color: '#e11d48', ml: 1 }} />}
                </MenuItem>
              );
            })}
          </Menu>

          {/* Sub-items Row with Left/Right Buttons and scrollable container */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ width: '100%', flex: 1, minWidth: 0, overflow: 'hidden' }}
          >
            {/* Scroll Left Button */}
            <IconButton aria-label="Quay lại"
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
                minWidth: 0,
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              {subItems.map((item) => {
                const isActive = String(selectedSubItem) === String(item.id);
                return (
                  <Box
                    key={String(item.id)}
                    onClick={() => handleSubItemSelect(item.id)}
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
                    {item.label}
                  </Box>
                );
              })}
            </Box>

            {/* Scroll Right Button */}
            <IconButton aria-label="Quay lại"
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
        </Stack>
      )}

      {/* ── Cards Grid (3 Columns or 1 Column in compact mode) ─────── */}
      {isLoading && !data ? (
        <Grid container spacing={2.5}>
          {Array.from(Array(compact ? 6 : 9).keys()).map((i) => (
            <Grid key={i} size={compact ? { xs: 12 } : { xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={160} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      ) : jobPosts.length === 0 ? (
        <NoDataCard />
      ) : (
        <>
          <Grid container spacing={2.5}>
            {jobPosts.map((job: ModelsJobPost & { companyDict?: { companyImageUrl?: string | null; companyName?: string | null }; locationDict?: { city?: number | string; cityName?: string }; isSaved?: boolean }, idx: number) => {
              const isFav = favorites[job.id] !== undefined ? Boolean(favorites[job.id]) : Boolean(job.isSaved);
              const companyNameStr = job.companyDict?.companyName || job.company?.companyName || 'Công ty Tuyển Dụng';
              const companyLogo = job.companyDict?.companyImageUrl || job.company?.logoUrl || IMAGES.companyLogoDefault;
              const locationCity =
                (typeof job.locationDict?.city === 'number'
                  ? allConfig?.cityDict?.[job.locationDict.city]
                  : job.locationDict?.cityName) ||
                (typeof (job.location as any)?.city === 'number'
                  ? allConfig?.cityDict?.[(job.location as any).city]
                  : (job.location as any)?.cityName || (job.location as any)?.city) ||
                'Toàn quốc';
              const daysText = getDaysLeft(job.deadline);
              const salaryDisplay = formatSalary(job.salaryMin, job.salaryMax);

              return (
                <Grid key={job.id} size={compact ? { xs: 12 } : { xs: 12, sm: 6, md: 4 }}>
                  <Box
                    component={Link}
                    href={`/viec-lam/${job.slug}`}
                    onMouseEnter={(e) => handleCardMouseEnter(e, job)}
                    onMouseLeave={handleCardMouseLeave}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      height: '100%',
                      minHeight: 165,
                      p: 2.5,
                      backgroundColor: job.isUrgent ? '#fffaf5' : '#ffffff',
                      border: `1px solid ${job.isUrgent ? 'rgba(251, 146, 60, 0.45)' : 'rgba(226, 232, 240, 0.8)'}`,
                      borderRadius: '20px',
                      textDecoration: 'none',
                      color: 'inherit',
                      position: 'relative',
                      boxShadow: job.isUrgent
                        ? '0 10px 25px -5px rgba(249, 115, 22, 0.08), 0 1px 3px rgba(0,0,0,0.02)'
                        : '0 20px 40px -15px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0,0,0,0.02)',
                      transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease, border-color 180ms ease',
                      animation: 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) backwards',
                      animationDelay: `${(idx % 12) * 40}ms`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: job.isUrgent ? '#ea580c' : '#2563eb',
                        boxShadow: job.isUrgent
                          ? '0 20px 35px -5px rgba(234, 88, 12, 0.16)'
                          : '0 25px 45px -10px rgba(15, 57, 127, 0.12)',
                      },
                      '&:active': {
                        transform: 'scale(0.99)',
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
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {job.isUrgent && (
                          <Tooltip title="Việc làm tuyển gấp" placement="top">
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: '#ea580c',
                                color: '#ffffff',
                                boxShadow: '0 6px 16px rgba(234, 88, 12, 0.25)',
                                flexShrink: 0,
                              }}
                            >
                              <FontAwesomeIcon icon={faBolt} style={{ fontSize: 12 }} />
                            </Box>
                          </Tooltip>
                        )}
                        <IconButton aria-label="Thao tác"
                          size="small"
                          onClick={(e) => toggleFavorite(e, job.id, job.slug)}
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
                      </Stack>
                    </Box>

                    {/* Middle Row: Company Logo + Company Name / Salary / City */}
                    <Stack direction="row" spacing={1.75} alignItems="center" sx={{ mb: 1.5 }}>
                      <Box sx={{ position: 'relative', flexShrink: 0 }}>
                        <MuiImageCustom
                          width={52}
                          height={52}
                          src={companyLogo}
                          fallbackSrc={IMAGES.companyLogoDefault}
                          sx={{
                            borderRadius: '10px',
                            border: `1px solid ${job.isUrgent ? '#fdba74' : '#f1f5f9'}`,
                            objectFit: 'contain',
                            flexShrink: 0,
                            p: 0.5,
                            backgroundColor: '#ffffff',
                          }}
                        />
                        {job.isUrgent && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -7,
                              left: -7,
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              bgcolor: '#f97316',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 6px 14px rgba(249, 115, 22, 0.28)',
                            }}
                          >
                            <FontAwesomeIcon icon={faBolt} style={{ fontSize: 10 }} />
                          </Box>
                        )}
                      </Box>
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
                          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563eb', fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em' }}>
                            {salaryDisplay}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LocationOnIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }} noWrap>
                            {locationCity}
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
              aria-label="Trang trước"
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
              aria-label="Trang sau"
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

      <JobHoverPreviewCard
        job={hoveredJob}
        anchorEl={previewAnchorEl}
        open={isPreviewOpen}
        onClose={handleClosePreview}
        onMouseEnterPopper={handlePopperMouseEnter}
        onMouseLeavePopper={handlePopperMouseLeave}
        isFavorite={
          hoveredJob
            ? favorites[hoveredJob.id] !== undefined
              ? Boolean(favorites[hoveredJob.id])
              : Boolean(hoveredJob.isSaved)
            : false
        }
        onToggleFavorite={toggleFavorite}
        cityLabel={
          hoveredJob
            ? typeof hoveredJob.locationDict?.city === 'number'
              ? allConfig?.cityDict?.[hoveredJob.locationDict.city]
              : hoveredJob.locationDict?.cityName
            : undefined
        }
        experienceLabel={
          hoveredJob?.experience ? allConfig?.experienceDict?.[hoveredJob.experience] : undefined
        }
        academicLevelLabel={
          hoveredJob?.academicLevel
            ? allConfig?.academicLevelDict?.[hoveredJob.academicLevel]
            : undefined
        }
      />

      {AuthModal}
    </Box>
  );
};

const FilterJobPostCard: React.FC<FilterJobPostCardProps> = (props) => {
  return <FilterJobPostCardContent {...props} />;
};

export default React.memo(FilterJobPostCard);
