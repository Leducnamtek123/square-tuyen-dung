'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  Chip,
  Skeleton,
} from '@mui/material';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { SalaryBenchmarkItem } from '@/types/models';
import SalaryRangeBar from './SalaryRangeBar';

interface SalaryIndustryTableProps {
  benchmarks: SalaryBenchmarkItem[];
  isLoading: boolean;
  onResetFilter: () => void;
}

export const SalaryIndustryTable: React.FC<SalaryIndustryTableProps> = ({
  benchmarks,
  isLoading,
  onResetFilter,
}) => {
  const getSeniorityBadge = (seniority?: string) => {
    const s = (seniority || '').toLowerCase();
    if (s === 'senior' || s === 'lead' || s === 'manager') {
      return {
        label: 'Senior / Quản lý',
        bg: '#faf5ff',
        color: '#7e22ce',
        border: '#e9d5ff',
      };
    }
    if (s === 'mid' || s === 'middle') {
      return {
        label: 'Trung cấp (2 - 4 năm)',
        bg: '#eff6ff',
        color: '#1d4ed8',
        border: '#bfdbfe',
      };
    }
    if (s === 'junior' || s === 'entry') {
      return {
        label: 'Junior / Mới bắt đầu',
        bg: '#f0fdf4',
        color: '#15803d',
        border: '#bbf7d0',
      };
    }
    return {
      label: seniority || 'Chuyên viên',
      bg: '#f8fafc',
      color: '#475569',
      border: '#e2e8f0',
    };
  };

  // Skeleton loading state
  if (isLoading) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Box
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: 2,
            bgcolor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Skeleton variant="text" width={240} height={26} />
          <Skeleton variant="text" width={110} height={20} />
        </Box>
        <Box>
          {[1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              sx={{
                p: { xs: 2.5, sm: 3 },
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                alignItems: { xs: 'stretch', lg: 'center' },
                justifyContent: 'space-between',
                gap: 3,
                borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <Box sx={{ maxWidth: { lg: 380 }, width: '100%' }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: '6px' }} />
                  <Skeleton variant="rounded" width={110} height={22} sx={{ borderRadius: '6px' }} />
                </Stack>
                <Skeleton variant="text" width="80%" height={28} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
              <Box sx={{ flex: 1, maxWidth: { lg: 440 }, width: '100%' }}>
                <Skeleton variant="rounded" height={60} sx={{ borderRadius: '10px' }} />
              </Box>
              <Skeleton variant="rounded" width={140} height={36} sx={{ borderRadius: '10px' }} />
            </Box>
          ))}
        </Box>
      </Card>
    );
  }

  // Clean empty state
  if (benchmarks.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px dashed #cbd5e1',
          bgcolor: '#ffffff',
          p: { xs: 4, sm: 6 },
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            mx: 'auto',
            width: 56,
            height: 56,
            borderRadius: '16px',
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            mb: 2,
          }}
        >
          <SearchOffOutlinedIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem', mb: 0.5 }}>
          Chưa có dữ liệu mức lương
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem', maxWidth: 440, mx: 'auto', mb: 2.5 }}>
          Hiện chưa có tin tuyển dụng phù hợp với tiêu chí này trên hệ thống InfoHR. Thử chọn ngành nghề khác hoặc xóa bộ lọc để hiển thị toàn bộ danh sách.
        </Typography>
        <Button
          variant="contained"
          onClick={onResetFilter}
          startIcon={<RefreshOutlinedIcon />}
          sx={{
            bgcolor: '#0f172a',
            color: '#ffffff',
            borderRadius: '10px',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.8125rem',
            px: 2.5,
            py: 1,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#2563eb', boxShadow: 'none' },
          }}
        >
          Xem lại tất cả dải lương
        </Button>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      {/* Table Section Header */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <PaymentsOutlinedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
            }}
          >
            Dải Lương Chuẩn Theo Vị Trí (VNĐ / Tháng)
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.75rem' }}>
          Năm chuẩn hóa: <strong style={{ color: '#334155' }}>2026</strong>
        </Typography>
      </Box>

      {/* Benchmark List Rows */}
      <Box>
        {benchmarks.map((item, idx) => {
          const min = Number(item.minSalary ?? item.min_salary ?? item.salaryMin ?? item.salary_min ?? 0);
          const max = Number(item.maxSalary ?? item.max_salary ?? item.salaryMax ?? item.salary_max ?? 0);
          const median = Number(
            item.medianSalary ?? item.median_salary ?? item.salaryAvg ?? item.salary_avg ?? Math.round((min + max) / 2)
          );
          const title = item.positionTitle ?? item.jobTitle ?? item.position_title ?? item.job_title ?? 'Chuyên viên';
          const cat = item.careerName ?? item.category ?? item.career_name ?? 'Chung';
          const sampleSize = Number(item.sampleSize ?? item.sample_size ?? item.sampleCount ?? item.sample_count ?? 0);
          const seniority = getSeniorityBadge(item.seniority || item.experienceLevel || item.experience_level);
          const sourceNotes = item.sourceNotes ?? item.source_notes;

          return (
            <Box
              key={item.id || idx}
              sx={{
                p: { xs: 2.5, sm: 3 },
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                alignItems: { xs: 'stretch', lg: 'center' },
                justifyContent: 'space-between',
                gap: { xs: 2.5, lg: 3 },
                borderBottom: idx < benchmarks.length - 1 ? '1px solid #f1f5f9' : 'none',
                transition: 'background-color 150ms ease',
                '&:hover': {
                  bgcolor: 'rgba(248, 250, 252, 0.8)',
                },
              }}
            >
              {/* Left: Job Info */}
              <Box sx={{ maxWidth: { lg: 380 }, width: '100%', minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
                  <Chip
                    label={seniority.label}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      bgcolor: seniority.bg,
                      color: seniority.color,
                      border: `1px solid ${seniority.border}`,
                      borderRadius: '6px',
                    }}
                  />
                  <Chip
                    label={cat}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                    }}
                  />
                </Stack>

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: '#0f172a',
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                    lineHeight: 1.35,
                    mb: 0.75,
                  }}
                >
                  {title}
                </Typography>

                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PeopleAltOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
                      {sampleSize ? `${sampleSize.toLocaleString('vi-VN')} tin tuyển dụng` : '1 tin tuyển dụng'}
                    </Typography>
                  </Stack>
                  {sourceNotes && (
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.725rem' }}>
                      • {sourceNotes}
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Center: Salary Range Bar */}
              <Box sx={{ flex: 1, maxWidth: { lg: 440 }, width: '100%', minWidth: 0 }}>
                <SalaryRangeBar min={min} max={max} median={median} />
              </Box>

              {/* Right: Practice CTA */}
              <Box
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'stretch', lg: 'flex-end' },
                }}
              >
                <Button
                  component={Link}
                  href={`/practice?category=${encodeURIComponent(cat)}&search=${encodeURIComponent(title)}`}
                  variant="outlined"
                  startIcon={<AutoAwesomeOutlinedIcon sx={{ color: '#f59e0b !important', fontSize: 16 }} />}
                  endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    width: { xs: '100%', lg: 'auto' },
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    borderColor: '#e2e8f0',
                    color: '#334155',
                    bgcolor: '#ffffff',
                    py: 0.8,
                    px: 2,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    transition: 'all 150ms ease',
                    '&:hover': {
                      borderColor: '#2563eb',
                      bgcolor: '#eff6ff',
                      color: '#2563eb',
                    },
                  }}
                >
                  Luyện phỏng vấn
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
};

export default SalaryIndustryTable;
