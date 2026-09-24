'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  Grid2 as Grid,
  Chip,
  Tooltip,
} from '@mui/material';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import cvBuilderService from '@/services/cvBuilderService';
import { CVThemeConfig, CVTemplateRecord } from '@/types/cvBuilder';
import { CV_TEMPLATES_CATALOG, getSampleDataForTemplate } from '@/views/cvBuilderPages/templates/templatesData';
import { CVTemplateRenderer } from '@/views/cvBuilderPages/templates/CVTemplateRenderer';

interface DesignCustomizerProps {
  theme: CVThemeConfig;
  templateId: string;
  onChangeTheme: (updated: CVThemeConfig) => void;
  onChangeTemplate: (newTemplateId: string, defaultColor?: string) => void;
}

export const COLOR_PALETTES = [
  '#1e40af', // InfoHR Navy Blue
  '#0284c7', // Sky Blue
  '#059669', // Emerald Green
  '#0d9488', // Teal
  '#e11d48', // Rose
  '#f97316', // Orange
  '#7c3aed', // Purple
  '#312e81', // Indigo
  '#0f172a', // Slate Dark
  '#334155', // Slate Neutral
  '#78350f', // Amber Warm
];

export const PRESET_COLORS = COLOR_PALETTES;

const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  modern: 'Hiện đại',
  simple: 'Tối giản / ATS',
  creative: 'Sáng tạo',
  professional: 'Chuyên nghiệp',
  tech: 'Công nghệ IT',
  executive: 'Cấp Quản lý',
  classic: 'Cổ điển',
};

const getCategoryDisplayName = (category: string) =>
  CATEGORY_DISPLAY_MAP[category] || category || 'Chuyên nghiệp';

export const loadTemplates = async (): Promise<CVTemplateRecord[]> => {
  try {
    const res = await cvBuilderService.getTemplates();
    if (Array.isArray(res) && res.length > 0) {
      return res;
    }
  } catch (err) {
    console.warn('cvBuilderService.getTemplates error, falling back to CV_TEMPLATES_CATALOG:', err);
  }
  return CV_TEMPLATES_CATALOG.map((cat, idx) => ({
    id: idx + 1,
    code: cat.id,
    name: cat.vietnameseName ? `${cat.vietnameseName} (${cat.name})` : cat.name,
    description: cat.description,
    category: cat.category,
    category_name: getCategoryDisplayName(cat.category),
    categoryName: getCategoryDisplayName(cat.category),
    thumbnail_url: cat.thumbnailUrl,
    thumbnailUrl: cat.thumbnailUrl,
    color_palettes: cat.defaultColors,
    colorPalettes: cat.defaultColors,
    default_theme: { primaryColor: cat.defaultColors[0] },
    defaultTheme: { primaryColor: cat.defaultColors[0] },
    is_popular: cat.isPopular,
    isPopular: cat.isPopular,
  }));
};

const FONTS: { id: string; label: string }[] = [
  { id: 'Inter', label: 'Inter - Hiện đại & Sắc nét' },
  { id: 'Roboto', label: 'Roboto - Chuẩn quốc tế' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta - Chuyên nghiệp' },
  { id: 'Geist', label: 'Geist - Tối giản Công nghệ' },
  { id: 'Outfit', label: 'Outfit - Tròn trịa & Tinh tế' },
  { id: 'Playfair Display', label: 'Playfair Display - Cổ điển' },
];

export const DesignCustomizer: React.FC<DesignCustomizerProps> = ({
  theme,
  templateId,
  onChangeTheme,
  onChangeTemplate,
}) => {
  const { data: templates = [] } = useQuery<CVTemplateRecord[]>({
    queryKey: ['cv-templates-compact'],
    queryFn: loadTemplates,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* -- 1. Switch Template ------------------------------------------- */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <DashboardCustomizeOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
            Mẫu giao diện CV
          </Typography>
        </Stack>

        <Grid container spacing={1.5}>
          {templates.map((tpl) => {
            const isSelected = tpl.code === templateId;
            const catalogMeta = CV_TEMPLATES_CATALOG.find((c) => c.id === tpl.code);
            const vietnameseTitle = catalogMeta?.vietnameseName || tpl.name.replace(/\s*\(.*\)/, '');
            const categoryTag = catalogMeta
              ? getCategoryDisplayName(catalogMeta.category)
              : tpl.category_name || tpl.categoryName || 'Chuyên nghiệp';
            const cardActiveColor = isSelected
              ? theme.primaryColor || '#1e40af'
              : tpl.default_theme?.primaryColor || tpl.color_palettes?.[0] || '#1e40af';

            const sample = getSampleDataForTemplate(tpl.code);
            const livePreviewData = {
              ...sample,
              templateId: tpl.code,
              theme: {
                ...sample.theme,
                primaryColor: cardActiveColor,
              },
            };

            return (
              <Grid size={{ xs: 6, sm: 6 }} key={tpl.id || tpl.code}>
                <Box
                  onClick={() => {
                    const fallbackColor = tpl.default_theme?.primaryColor || tpl.color_palettes?.[0];
                    onChangeTemplate(tpl.code, fallbackColor);
                  }}
                  sx={{
                    p: 1.25,
                    borderRadius: '12px',
                    border: isSelected ? `2px solid ${cardActiveColor}` : '1px solid #e2e8f0',
                    bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
                    '&:hover': {
                      borderColor: '#2563eb',
                      bgcolor: isSelected ? '#eff6ff' : '#f8fafc',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {/* Thumbnail Preview */}
                  <Box
                    sx={{
                      position: 'relative',
                      height: 120,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      bgcolor: '#f1f5f9',
                      mb: 1.25,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%) scale(0.18)',
                        transformOrigin: 'top center',
                        width: 794,
                        minHeight: 1123,
                        pointerEvents: 'none',
                        bgcolor: '#ffffff',
                        overflow: 'hidden',
                      }}
                    >
                      <CVTemplateRenderer data={livePreviewData} language="vi" />
                    </Box>
                    {isSelected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          bgcolor: cardActiveColor,
                          color: '#ffffff',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          zIndex: 2,
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 16 }} />
                      </Box>
                    )}
                  </Box>

                  {/* Title & Tag */}
                  <Typography
                    variant="subtitle2"
                    title={vietnameseTitle}
                    sx={{
                      fontWeight: 700,
                      color: isSelected ? '#1e40af' : '#1e293b',
                      fontSize: '0.8rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    {vietnameseTitle}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Chip
                      label={categoryTag}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.675rem',
                        fontWeight: 600,
                        bgcolor: isSelected ? '#dbeafe' : '#f1f5f9',
                        color: isSelected ? '#1e40af' : '#475569',
                        borderRadius: '6px',
                        maxWidth: '100%',
                        '& .MuiChip-label': { px: 0.75, overflow: 'hidden', textOverflow: 'ellipsis' },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* -- 2. Color Palette --------------------------------------------- */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PaletteOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
              Màu sắc chủ đạo
            </Typography>
          </Stack>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>
            {theme.primaryColor}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ gap: 1.25 }}>
          {COLOR_PALETTES.map((color) => {
            const isSelected = (theme.primaryColor || '').toLowerCase() === color.toLowerCase();
            return (
              <Tooltip key={color} title={color}>
                <Box
                  onClick={() => onChangeTheme({ ...theme, primaryColor: color })}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: color,
                    cursor: 'pointer',
                    border: isSelected ? '3px solid #0f172a' : '2px solid #ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    '&:hover': {
                      transform: 'scale(1.15)',
                    },
                  }}
                >
                  {isSelected && <CheckCircleIcon sx={{ fontSize: 16 }} />}
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
      </Paper>

      {/* -- 3. Typography & Sizing --------------------------------------- */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <TextFieldsOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
            Phông chữ & Bố cục
          </Typography>
        </Stack>

        {/* Font Families Grid */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          {FONTS.map((f) => {
            const isSelected = (theme.fontFamily || '').includes(f.id);
            return (
              <Grid size={{ xs: 12, sm: 6 }} key={f.id}>
                <Box
                  onClick={() => onChangeTheme({ ...theme, fontFamily: f.id as any })}
                  sx={{
                    p: 1.25,
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    bgcolor: isSelected ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f1f5f9' },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: isSelected ? 800 : 600, color: isSelected ? '#1e40af' : '#334155', fontSize: '0.775rem' }}>
                    {f.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* Font Size & Spacing Switchers */}
        <Stack spacing={2.5} sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
          {/* Cỡ chữ */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.775rem' }}>
                Cỡ chữ:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#2563eb', fontSize: '0.725rem' }}>
                {theme.fontSize === 'small' ? 'Thu nhỏ' : theme.fontSize === 'large' ? 'Phóng to' : 'Vừa - Chuẩn'}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                bgcolor: '#f8fafc',
                p: 0.5,
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}
            >
              {(
                [
                  { id: 'small', label: 'Nhỏ' },
                  { id: 'medium', label: 'Vừa' },
                  { id: 'large', label: 'Lớn' },
                ] as const
              ).map((sz) => {
                const isSelected = (theme.fontSize || 'medium') === sz.id;
                return (
                  <Button
                    key={sz.id}
                    size="small"
                    onClick={() => onChangeTheme({ ...theme, fontSize: sz.id })}
                    sx={{
                      flex: 1,
                      py: 0.65,
                      px: 1,
                      fontSize: '0.775rem',
                      fontWeight: isSelected ? 700 : 500,
                      textTransform: 'none',
                      borderRadius: '8px',
                      transition: 'all 0.15s ease',
                      ...(isSelected
                        ? {
                            bgcolor: '#ffffff',
                            color: '#1e40af',
                            border: '1px solid #cbd5e1',
                            boxShadow: '0 2px 5px rgba(15, 23, 42, 0.08)',
                            '&:hover': { bgcolor: '#ffffff' },
                          }
                        : {
                            color: '#64748b',
                            border: '1px solid transparent',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.6)', color: '#0f172a' },
                          }),
                    }}
                  >
                    {sz.label}
                  </Button>
                );
              })}
            </Stack>
          </Box>

          {/* Giãn cách */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.775rem' }}>
                Giãn cách:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#2563eb', fontSize: '0.725rem' }}>
                {theme.spacing === 'compact' ? 'Gọn - Tiết kiệm' : theme.spacing === 'relaxed' ? 'Rộng - Thoáng' : 'Chuẩn - Cân đối'}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                bgcolor: '#f8fafc',
                p: 0.5,
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}
            >
              {(
                [
                  { id: 'compact', label: 'Gọn' },
                  { id: 'normal', label: 'Chuẩn' },
                  { id: 'relaxed', label: 'Rộng' },
                ] as const
              ).map((sp) => {
                const isSelected = (theme.spacing || 'normal') === sp.id;
                return (
                  <Button
                    key={sp.id}
                    size="small"
                    onClick={() => onChangeTheme({ ...theme, spacing: sp.id })}
                    sx={{
                      flex: 1,
                      py: 0.65,
                      px: 1,
                      fontSize: '0.775rem',
                      fontWeight: isSelected ? 700 : 500,
                      textTransform: 'none',
                      borderRadius: '8px',
                      transition: 'all 0.15s ease',
                      ...(isSelected
                        ? {
                            bgcolor: '#ffffff',
                            color: '#1e40af',
                            border: '1px solid #cbd5e1',
                            boxShadow: '0 2px 5px rgba(15, 23, 42, 0.08)',
                            '&:hover': { bgcolor: '#ffffff' },
                          }
                        : {
                            color: '#64748b',
                            border: '1px solid transparent',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.6)', color: '#0f172a' },
                          }),
                    }}
                  >
                    {sp.label}
                  </Button>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* -- 4. Avatar Customization -------------------------------------- */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AccountCircleOutlinedIcon sx={{ color: '#2563eb', fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
            Khung ảnh chân dung
          </Typography>
        </Stack>

        <FormControlLabel
          control={
            <Switch
              checked={theme.showAvatar}
              onChange={(e) => onChangeTheme({ ...theme, showAvatar: e.target.checked })}
              color="primary"
            />
          }
          label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.825rem' }}>Hiển thị ảnh chân dung trên CV</Typography>}
          sx={{ mb: 1.5 }}
        />

        {theme.showAvatar && (
          <Box sx={{ pt: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 1 }}>
              Kiểu bo khung ảnh:
            </Typography>
            <Stack direction="row" spacing={1}>
              {(
                [
                  { id: 'circle', label: 'Hình tròn' },
                  { id: 'rounded', label: 'Bo góc nhẹ' },
                  { id: 'square', label: 'Vuông' },
                ] as const
              ).map((sh) => (
                <Button
                  key={sh.id}
                  size="small"
                  variant={theme.avatarShape === sh.id ? 'contained' : 'outlined'}
                  onClick={() => onChangeTheme({ ...theme, avatarShape: sh.id })}
                  sx={{
                    flex: 1,
                    py: 0.6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '8px',
                    ...(theme.avatarShape === sh.id
                      ? { bgcolor: '#1e40af', color: '#ffffff', '&:hover': { bgcolor: '#1d4ed8' } }
                      : { borderColor: '#cbd5e1', color: '#475569', '&:hover': { bgcolor: '#f8fafc' } }),
                  }}
                >
                  {sh.label}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
