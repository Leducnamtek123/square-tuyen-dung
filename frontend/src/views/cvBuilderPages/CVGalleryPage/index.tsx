'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Grid2 as Grid,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import FolderSpecialOutlinedIcon from '@mui/icons-material/FolderSpecialOutlined';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { CVTemplateCategory, CVTemplateRecord } from '@/types/cvBuilder';
import cvBuilderService from '@/services/cvBuilderService';
import { TemplateCard } from './TemplateCard';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { CVGuideSection } from './CVGuideSection';
import { TabTitle } from '@/utils/generalFunction';
import { useTranslation } from 'react-i18next';
import { localizeRoutePath } from '@/configs/routeLocalization';

const TOPIC_CATEGORIES: { id: CVTemplateCategory; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'simple', label: 'Đơn giản' },
  { id: 'classic', label: 'Chuyên nghiệp' },
  { id: 'modern', label: 'Hiện đại' },
  { id: 'creative', label: 'Sáng tạo' },
  { id: 'tech', label: 'Công nghệ' },
  { id: 'executive', label: 'Cấp Quản lý' },
];

export const CVGalleryPage: React.FC = () => {
  const { i18n } = useTranslation();
  TabTitle('Trang trí CV & Danh Sách Mẫu CV Đẹp | InfoHR Tuyển Dụng');

  const [selectedCategory, setSelectedCategory] = useState<CVTemplateCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplateRecord | null>(null);
  const [previewColor, setPreviewColor] = useState<string | undefined>(undefined);

  const {
    data: templates = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<CVTemplateRecord[]>({
    queryKey: ['cv-templates', selectedCategory, searchQuery],
    queryFn: () =>
      cvBuilderService.getTemplates({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const handleOpenPreview = (template: CVTemplateRecord, color: string) => {
    setPreviewTemplate(template);
    setPreviewColor(color);
  };

  return (
    <Box sx={{ width: '100%', pb: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── Top Hero Banner (Matching Candidate Dashboard style) ──────────── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 55%, #1d4ed8 100%)',
          color: '#ffffff',
          p: { xs: 3, sm: 4 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(37, 99, 235, 0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -60,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Stack spacing={2} sx={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          <Box sx={{ display: 'inline-flex' }}>
            <Chip
              icon={<AutoFixHighOutlinedIcon sx={{ fontSize: '15px !important', color: '#ffffff !important' }} />}
              label="Thư viện Mẫu CV Tuyển Dụng 2026"
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.775rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(8px)',
              }}
            />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.4rem', sm: '1.85rem' },
              lineHeight: 1.25,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Danh sách các mẫu CV được Top nhà tuyển dụng ưa thích
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: { xs: '0.85rem', sm: '0.925rem' },
              lineHeight: 1.6,
            }}
          >
            Tạo ấn tượng chuyên nghiệp ngay từ cái nhìn đầu tiên. Tự động đồng bộ thông tin từ hồ sơ của bạn, tùy biến màu sắc, font chữ và xuất file chuẩn A4 chỉ trong 2 phút.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ pt: 1 }}>
            <Stack direction="row" spacing={2.5} sx={{ color: '#ffffff', fontSize: '0.825rem', fontWeight: 600, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 17, color: '#6ee7b7' }} />
                <span>Chuẩn ATS 100%</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <AutoFixHighOutlinedIcon sx={{ fontSize: 17, color: '#fde047' }} />
                <span>Đồng bộ 1 chạm</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CloudDoneOutlinedIcon sx={{ fontSize: 17, color: '#93c5fd' }} />
                <span>Lưu trữ đám mây</span>
              </Box>
            </Stack>

            <Button
              component={Link}
              href={localizeRoutePath('/ung-vien/quan-ly-cv', i18n.language)}
              size="small"
              variant="contained"
              startIcon={<FolderSpecialOutlinedIcon sx={{ color: '#1e40af' }} />}
              sx={{
                borderRadius: '12px',
                bgcolor: '#ffffff',
                color: '#1e40af',
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'none',
                px: 2.5,
                py: 0.85,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  color: '#1d4ed8',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              Quản lý CV đã tạo
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* ── Topic Filter Bar (Lọc theo chủ đề: Match Vieclam24h UI) ──────── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          p: { xs: 2, sm: 2.5 },
          bgcolor: '#ffffff',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          {/* Filter Pills */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflowX: 'auto', pb: { xs: 0.5, md: 0 } }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>
              Lọc theo chủ đề:
            </Typography>

            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.25 }}>
              {TOPIC_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <Chip
                    key={cat.id}
                    label={cat.label}
                    onClick={() => setSelectedCategory(cat.id)}
                    variant={isSelected ? 'filled' : 'outlined'}
                    color={isSelected ? 'primary' : 'default'}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      borderRadius: '20px',
                      px: 0.5,
                      cursor: 'pointer',
                      ...(isSelected
                        ? {
                            bgcolor: '#2563eb',
                            color: '#ffffff',
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                            '&:hover': { bgcolor: '#1d4ed8' },
                          }
                        : {
                            bgcolor: '#f8fafc',
                            borderColor: '#e2e8f0',
                            color: '#475569',
                            '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
                          }),
                    }}
                  />
                );
              })}
            </Stack>
          </Box>

          {/* Compact Search Input */}
          <TextField
            size="small"
            placeholder="Tìm theo tên mẫu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: '100%', md: 240 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                fontSize: '0.825rem',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#cbd5e1' },
                '&.Mui-focused fieldset': { borderColor: '#2563eb' },
              },
            }}
          />
        </Stack>
      </Card>

      {/* ── Templates Grid or Loading / Empty States ─────────────────────── */}
      <Box id="cv-template-grid">
        {isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={idx}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    p: 2,
                    height: 480,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#ffffff',
                  }}
                >
                  <CircularProgress size={32} thickness={4} sx={{ color: '#2563eb' }} />
                  <Typography variant="caption" sx={{ mt: 1.5, color: '#94a3b8', fontWeight: 600 }}>
                    Đang tải mẫu CV...
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : isError ? (
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: '1px solid #fecdd3',
              bgcolor: '#fff1f2',
              p: 6,
              textAlign: 'center',
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#be123c', mb: 2 }}>
              Không thể tải danh sách mẫu CV từ máy chủ. Vui lòng thử lại.
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              sx={{ borderRadius: '10px', bgcolor: '#e11d48', textTransform: 'none', fontWeight: 700 }}
            >
              Thử lại
            </Button>
          </Card>
        ) : templates.length > 0 ? (
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={template.id}>
                <TemplateCard
                  template={template}
                  onPreview={handleOpenPreview}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              p: 6,
              textAlign: 'center',
              maxWidth: 480,
              mx: 'auto',
            }}
          >
            <ArticleOutlinedIcon sx={{ fontSize: 48, color: '#3b82f6', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
              Không tìm thấy mẫu phù hợp
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.825rem', mb: 2.5 }}>
              Hãy thử chọn chủ đề khác hoặc xóa từ khóa tìm kiếm để xem tất cả các mẫu CV.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
            >
              Xem tất cả mẫu
            </Button>
          </Card>
        )}
      </Box>

      {/* ── Comprehensive CV Writing Guide & Knowledge Section ──────────── */}
      <CVGuideSection />

      {/* Interactive Template Preview Modal */}
      <TemplatePreviewModal
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
        initialColor={previewColor}
      />
    </Box>
  );
};
