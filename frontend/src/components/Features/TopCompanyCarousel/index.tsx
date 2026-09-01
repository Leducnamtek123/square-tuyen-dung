'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  Grid2 as Grid,
  Skeleton,
  Stack,
  Typography,
  IconButton,
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import companyService from '@/services/companyService';
import commonService from '@/services/commonService';
import { IMAGES } from '@/configs/constants';
import { useConfig } from '@/hooks/useConfig';
import { tConfig } from '@/utils/tConfig';
import type { Company } from '@/types/models';

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: '1', name: 'Hậu cần và dịch vụ giao nhận' },
  { id: '2', name: 'Giáo dục và đào tạo' },
  { id: '3', name: 'Dịch vụ lưu trú, nhà hàng, khách sạn' },
  { id: '4', name: 'Sản xuất và phân phối dược phẩm' },
  { id: '5', name: 'Bán lẻ và bán sỉ' },
];

const TopCompanyCarousel = () => {
  const { t } = useTranslation(['public', 'common']);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { allConfig } = useConfig();

  const { data: dynamicCareers = [] } = useQuery({
    queryKey: ['top-careers'],
    queryFn: async () => {
      const res = await commonService.getTop10Careers();
      return res || [];
    },
    staleTime: 10 * 60_000,
  });

  const categoriesList = dynamicCareers.length > 0
    ? [{ id: 'all', name: t('common:all', 'Tất cả') }, ...dynamicCareers.map((c) => ({ id: String(c.id), name: c.name }))]
    : [{ id: 'all', name: t('common:all', 'Tất cả') }, ...DEFAULT_CATEGORIES.slice(1)];

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['top-companies'],
    queryFn: async () => {
      return companyService.getTopCompanies();
    },
    staleTime: 5 * 60_000,
  });

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const filteredCompanies = companies.filter((c: any) => {
    if (selectedCategory === 'all') return true;
    return c.category?.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const displayList = filteredCompanies.length > 0 ? filteredCompanies : companies;

  return (
    <Box id="top-company-carousel" sx={{ width: '100%', mt: 4 }}>
      {/* ── Section Header Row ───────────────────────────────────────── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <WorkspacePremiumIcon sx={{ color: '#eab308', fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
            {t('public:featuredCompanies', 'Công ty nổi bật')}
          </Typography>
        </Stack>

        <Link href="/cong-ty" style={{ textDecoration: 'none' }}>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#e11d48', cursor: 'pointer', '&:hover': { opacity: 0.85 } }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.925rem' }}>{t('common:actions.viewMore', 'Xem thêm')}</Typography>
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </Stack>
        </Link>
      </Stack>

      {/* ── Industry Category Pills Bar ─────────────────────────────── */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3, width: '100%', overflow: 'hidden' }}>
        <IconButton aria-label={t('common:actions.scrollLeft', 'Cuộn sang trái')}
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
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <Box
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                sx={{
                  px: 2.2,
                  py: 0.85,
                  borderRadius: '24px',
                  border: '1px solid',
                  borderColor: isActive ? '#e11d48' : '#e2e8f0',
                  backgroundColor: isActive ? '#fff1f2' : '#ffffff',
                  color: isActive ? '#e11d48' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#e11d48',
                    backgroundColor: isActive ? '#fff1f2' : '#fff5f5',
                    color: '#e11d48',
                  },
                }}
              >
                {cat.name}
              </Box>
            );
          })}
        </Box>

        <IconButton aria-label={t('common:actions.scrollRight', 'Cuộn sang phải')}
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

      {/* ── 3-Column / 2-Row Grid Carousel Container ────────────────── */}
      {isLoading ? (
        <Grid container spacing={2.5}>
          {Array.from(Array(6).keys()).map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={96} sx={{ borderRadius: '16px' }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2.5}>
          {displayList.slice(0, 9).map((company: Company) => {
            const openJobs = Number.isFinite(Number(company.jobPostNumber)) ? Number(company.jobPostNumber) : 0;
            const logo = company.companyImageUrl || company.logoUrl || IMAGES.companyLogoDefault;
            const employeeSizeLabel = company.employeeSize != null
              ? tConfig(allConfig?.employeeSizeDict?.[String(company.employeeSize)])
              : '';

            return (
              <Grid key={company.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  component={Link}
                  href={`/cong-ty/${company.slug}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    height: '100%',
                    minHeight: 96,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    boxShadow: 0,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: '#cbd5e1',
                      boxShadow: '0 10px 25px rgba(15, 23, 42, 0.07)',
                    },
                  }}
                >
                  {/* Left: Company Logo */}
                  <MuiImageCustom
                    width={56}
                    height={56}
                    src={logo}
                    fallbackSrc={IMAGES.companyLogoDefault}
                    sx={{
                      borderRadius: '12px',
                      border: '1px solid #f1f5f9',
                      objectFit: 'contain',
                      p: 0.5,
                      backgroundColor: '#ffffff',
                      flexShrink: 0,
                    }}
                  />

                  {/* Right: Company Name & Stats */}
                  <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#0f172a',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {company.companyName}
                    </Typography>

                    <Stack direction="row" spacing={0.6} alignItems="center">
                      <WorkOutlineIcon sx={{ fontSize: 15, color: '#e11d48' }} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#e11d48' }}>
                        {t('public:openPositions', '{{count}} vị trí đang tuyển', { count: openJobs })}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.6} alignItems="center">
                      <PeopleOutlineIcon sx={{ fontSize: 15, color: '#d97706' }} />
                      <Typography sx={{ fontSize: '0.775rem', fontWeight: 500, color: '#b45309' }}>
                        {employeeSizeLabel || '0'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default TopCompanyCarousel;
