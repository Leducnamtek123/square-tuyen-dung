'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Chip,
} from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import { ProductTourTrigger } from '@/components/Features/ProductTour';

interface SalarySearchSectionProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedSeniority: string;
  onSeniorityChange: (val: string) => void;
  categories: string[];
  seniorities: { value: string; label: string }[];
  totalCount: number;
}

export const SalarySearchSection: React.FC<SalarySearchSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSeniority,
  onSeniorityChange,
  categories,
  seniorities,
  totalCount,
}) => {
  return (
    <Stack spacing={2.5}>
      {/* -- 1. Hero Banner: Brand Blue Gradient (InfoHR Standard) -- */}
      <Box
        sx={{
          borderRadius: { xs: '14px', sm: '16px' },
          p: { xs: 2.5, sm: 3.5 },
          background: `linear-gradient(100deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 58, 138, 0.80) 50%, rgba(15, 23, 42, 0.40) 100%), url(/images/banners/banner-salary.webp)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          color: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2.5,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 35px -5px rgba(15, 23, 42, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <Box sx={{ maxWidth: 680 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '10px',
                bgcolor: 'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <TrendingUpOutlinedIcon sx={{ fontSize: 26, color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Cổng Tra Cứu Dải Lương Chuẩn Theo Vị Trí & Cấp Bậc
              </Typography>
            </Box>
          </Stack>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
            Dữ liệu được tổng hợp trực tiếp từ các tin tuyển dụng thực tế trên hệ thống InfoHR, hỗ trợ bạn định giá năng lực, tham khảo mức lương thị trường và luyện phỏng vấn AI.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ flexShrink: 0 }}
        >
          <ProductTourTrigger
            tourKey="salary_benchmark"
            variant="button"
            label="Hướng dẫn tra cứu lương"
            sx={{
              color: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.45)',
              bgcolor: 'rgba(255, 255, 255, 0.14)',
              backdropFilter: 'blur(8px)',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '10px',
              py: 1.1,
              px: 2,
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.25)',
                borderColor: '#ffffff',
                color: '#ffffff',
              },
            }}
          />
          <Button
            component={Link}
            href="/practice"
            variant="contained"
            startIcon={<PsychologyOutlinedIcon />}
            sx={{
              bgcolor: '#ffffff',
              color: '#1e40af',
              fontWeight: 700,
              borderRadius: '10px',
              px: 2.5,
              py: 1.2,
              textTransform: 'none',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: '#f8fafc',
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              },
            }}
          >
            Luyện tập phỏng vấn AI ngay
          </Button>
        </Stack>
      </Box>

      {/* -- 2. Control Card: Search & Filters (InfoHR Standard) -- */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Stack spacing={2}>
          {/* Top Row: Search Input + Seniority Dropdown */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center">
            <TextField
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Kỹ sư xây dựng, Kiến trúc sư, Frontend, Sales B2B..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => onSearchChange('')} edge="end">
                      <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#f8fafc',
                  fontSize: '0.875rem',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                  '&.Mui-focused fieldset': { borderColor: '#2563eb' },
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 240 } }}>
              <Select
                value={selectedSeniority}
                onChange={(e) => onSeniorityChange(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: '10px',
                  bgcolor: '#f8fafc',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#334155',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb' },
                }}
              >
                {seniorities.map((sen) => (
                  <MenuItem key={sen.value} value={sen.value} sx={{ fontSize: '0.875rem' }}>
                    {sen.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Middle Row: Career Categories as MUI Tabs */}
          <Box sx={{ borderBottom: '1px solid #f1f5f9', pt: 0.5 }}>
            <Tabs
              value={categories.indexOf(selectedCategory) !== -1 ? categories.indexOf(selectedCategory) : 0}
              onChange={(_, newIndex) => {
                if (categories[newIndex]) {
                  onCategoryChange(categories[newIndex]);
                }
              }}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 40,
                '& .MuiTabs-indicator': {
                  backgroundColor: '#2563eb',
                  height: 3,
                  borderRadius: '3px',
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minHeight: 40,
                  px: 2,
                  color: '#64748b',
                  '&.Mui-selected': {
                    color: '#2563eb',
                    fontWeight: 700,
                  },
                },
              }}
            >
              {categories.map((cat) => (
                <Tab key={cat} label={cat} />
              ))}
            </Tabs>
          </Box>

          {/* Bottom Row: Status Metadata */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
            sx={{ pt: 0.5 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <WorkOutlineIcon sx={{ fontSize: 16, color: '#2563eb' }} />
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.825rem' }}>
                Đang hiển thị <strong style={{ color: '#0f172a' }}>{totalCount}</strong> dải lương chuẩn hóa phù hợp
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                icon={<VerifiedOutlinedIcon sx={{ fontSize: '14px !important', color: '#16a34a' }} />}
                label="Chuẩn hóa 2026"
                size="small"
                sx={{
                  bgcolor: '#f0fdf4',
                  color: '#16a34a',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #bbf7d0',
                }}
              />
              <Chip
                icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: '14px !important', color: '#2563eb' }} />}
                label="Kèm câu hỏi phỏng vấn AI"
                size="small"
                sx={{
                  bgcolor: '#eff6ff',
                  color: '#2563eb',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe',
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};

export default SalarySearchSection;
