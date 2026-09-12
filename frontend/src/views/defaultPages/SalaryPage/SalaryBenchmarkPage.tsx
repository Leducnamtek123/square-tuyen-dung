'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  Grid2 as Grid,
} from '@mui/material';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { toast } from 'sonner';
import { salaryService } from '@/services/salaryService';
import commonService from '@/services/commonService';
import { SalaryBenchmarkItem } from '@/types/models';
import SalarySearchSection from './components/SalarySearchSection';
import SalaryIndustryTable from './components/SalaryIndustryTable';
import { useTourAutoStart } from '@/components/Features/ProductTour';

const DEFAULT_CATEGORIES = ['Tất cả ngành nghề'];

const SENIORITIES = [
  { value: '', label: 'Tất cả cấp bậc' },
  { value: 'junior', label: 'Junior / Mới bắt đầu (0 - 2 năm)' },
  { value: 'mid', label: 'Trung cấp / Mid-level (2 - 4 năm)' },
  { value: 'senior', label: 'Senior / Quản lý (> 4 năm)' },
];

export const SalaryBenchmarkPage: React.FC = () => {
  // Auto-start salary benchmark tour on first visit
  useTourAutoStart('salary_benchmark', 800);

  const [benchmarks, setBenchmarks] = useState<SalaryBenchmarkItem[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả ngành nghề');
  const [selectedSeniority, setSelectedSeniority] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    salaryService
      .getSalaryBenchmarks({ pageSize: 100 })
      .then((res) => {
        if (!isMounted) return;
        const data = Array.isArray(res) ? res : (res?.results ?? []);
        const activeCategories = Array.from(
          new Set(
            data
              .map((b) => b.careerName ?? b.category ?? b.career_name)
              .filter(Boolean) as string[]
          )
        );
        if (activeCategories.length > 0) {
          setCategories(['Tất cả ngành nghề', ...activeCategories]);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchBenchmarks = async () => {
    setIsLoading(true);
    try {
      const res = await salaryService.getSalaryBenchmarks({
        category: selectedCategory === 'Tất cả ngành nghề' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
      });

      const data = Array.isArray(res) ? res : (res?.results ?? []);
      setBenchmarks(data);
    } catch (err: unknown) {
      console.error('Failed to fetch salary benchmarks:', err);
      toast.error('Không thể tải dữ liệu mức lương. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBenchmarks();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  // Client-side seniority filtering
  const filteredBenchmarks = useMemo(() => {
    return benchmarks.filter((item) => {
      if (!selectedSeniority) return true;
      const s = (item.seniority || item.experienceLevel || item.experience_level || '').toLowerCase();
      if (selectedSeniority === 'junior') return s === 'junior' || s === 'entry';
      if (selectedSeniority === 'mid') return s === 'mid' || s === 'middle';
      if (selectedSeniority === 'senior') return s === 'senior' || s === 'lead' || s === 'manager';
      return s === selectedSeniority.toLowerCase();
    });
  }, [benchmarks, selectedSeniority]);

  // Calculate Market Quick Pulse metrics from filtered data
  const marketMetrics = useMemo(() => {
    const totalCount = filteredBenchmarks.length;
    if (totalCount === 0) {
      return {
        totalCount: 0,
        avgMedianFormatted: '---',
        maxSalaryFormatted: '---',
      };
    }

    const medians = filteredBenchmarks
      .map((b) => Number(b.medianSalary ?? b.median_salary ?? b.salaryAvg ?? b.salary_avg ?? 0))
      .filter((v) => v > 0);
    const avgMedian = medians.length
      ? Math.round(medians.reduce((acc, v) => acc + v, 0) / medians.length)
      : 0;

    const maxSalary = filteredBenchmarks.reduce(
      (max, b) => Math.max(max, Number(b.maxSalary ?? b.max_salary ?? b.salaryMax ?? b.salary_max ?? 0)),
      0
    );

    const formatMillions = (val: number) => {
      if (!val || isNaN(val)) return '---';
      const inMillions = val / 1_000_000;
      return `${inMillions.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tr`;
    };

    return {
      totalCount,
      avgMedianFormatted: avgMedian > 0 ? formatMillions(avgMedian) : '---',
      maxSalaryFormatted: maxSalary > 0 ? formatMillions(maxSalary) : '---',
    };
  }, [filteredBenchmarks]);

  const handleResetFilter = () => {
    setSearchQuery('');
    setSelectedCategory('Tất cả ngành nghề');
    setSelectedSeniority('');
  };

  return (
    <Box sx={{ pt: 0, pb: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Search & Filter Hero Section */}
      <Box data-tour="salary-filters">
        <SalarySearchSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedSeniority={selectedSeniority}
          onSeniorityChange={setSelectedSeniority}
          categories={categories}
          seniorities={SENIORITIES}
          totalCount={filteredBenchmarks.length}
        />
      </Box>

      {/* Market Quick Pulse: Concise 3-Metric Strip */}
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ width: '100%' }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.25 },
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              height: '100%',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BarChartOutlinedIcon sx={{ color: '#2563eb', fontSize: 24 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontSize: '0.6875rem',
                  display: 'block',
                }}
              >
                Vị trí khảo sát
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: '#0f172a',
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  lineHeight: 1.3,
                }}
              >
                {marketMetrics.totalCount > 0 ? `${marketMetrics.totalCount} dải lương chuẩn` : '0 dải lương'}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.25 },
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              height: '100%',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <TrendingUpOutlinedIcon sx={{ color: '#16a34a', fontSize: 24 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontSize: '0.6875rem',
                  display: 'block',
                }}
              >
                Mức lương trung vị (P50)
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: '#16a34a',
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  lineHeight: 1.3,
                }}
              >
                {marketMetrics.avgMedianFormatted !== '---'
                  ? `${marketMetrics.avgMedianFormatted} / tháng`
                  : '---'}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.25 },
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              height: '100%',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#faf5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LocalFireDepartmentOutlinedIcon sx={{ color: '#9333ea', fontSize: 24 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontSize: '0.6875rem',
                  display: 'block',
                }}
              >
                Mốc trần cao nhất
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: '#0f172a',
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  lineHeight: 1.3,
                }}
              >
                {marketMetrics.maxSalaryFormatted !== '---'
                  ? `Lên đến ${marketMetrics.maxSalaryFormatted}`
                  : '---'}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Benchmarks Table with Accurate Visualization */}
      <Box data-tour="salary-benchmark-cards">
        <SalaryIndustryTable
          benchmarks={filteredBenchmarks}
          isLoading={isLoading}
          onResetFilter={handleResetFilter}
        />
      </Box>

      {/* Bottom Practice CTA: Premium Cohesive Banner */}
      <Card
        data-tour="salary-practice-cta"
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
          bgcolor: '#0f172a',
          color: '#ffffff',
          p: { xs: 3, sm: 4, md: 5 },
          border: '1px solid #1e293b',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: -60,
            top: -60,
            width: 260,
            height: 260,
            borderRadius: '50%',
            bgcolor: 'rgba(37, 99, 235, 0.15)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <AutoAwesomeOutlinedIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#93c5fd',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
              }}
            >
              Bước tiếp theo để đạt mức lương kỳ vọng
            </Typography>
          </Stack>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#ffffff',
              fontSize: { xs: '1.35rem', sm: '1.75rem' },
              lineHeight: 1.3,
              mb: 1,
            }}
          >
            Tự Tin Chinh Phục Buổi Phỏng Vấn Với AI Interviewer
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#94a3b8',
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              lineHeight: 1.6,
            }}
          >
            Trải nghiệm phòng phỏng vấn trực tuyến với AI, bộ đếm ngược từng câu hỏi, cấu trúc câu trả lời chi tiết và mẹo phỏng vấn hoàn toàn miễn phí.
          </Typography>
        </Box>

        <Button
          component={Link}
          href="/practice"
          variant="contained"
          endIcon={<ArrowForwardOutlinedIcon />}
          sx={{
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
            bgcolor: '#2563eb',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'none',
            borderRadius: '12px',
            px: 3,
            py: 1.3,
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
            '&:hover': {
              bgcolor: '#1d4ed8',
            },
          }}
        >
          Vào phòng phỏng vấn thử ngay
        </Button>
      </Card>
    </Box>
  );
};

export default SalaryBenchmarkPage;
