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
  Grid,
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

interface DesignCustomizerProps {
  theme: CVThemeConfig;
  templateId: string;
  onChangeTheme: (updated: CVThemeConfig) => void;
  onChangeTemplate: (newTemplateId: string, defaultColor?: string) => void;
}

const PRESET_COLORS = [
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

const FONTS: { id: string; label: string }[] = [
  { id: 'Inter', label: 'Inter (Hiện đại & Sắc nét)' },
  { id: 'Roboto', label: 'Roboto (Chuẩn quốc tế)' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta (Chuyên nghiệp)' },
  { id: 'Geist', label: 'Geist (Tối giản Công nghệ)' },
  { id: 'Outfit', label: 'Outfit (Tròn trịa & Tinh tế)' },
  { id: 'Playfair Display', label: 'Playfair Display (Cổ điển)' },
];

export const DesignCustomizer: React.FC<DesignCustomizerProps> = ({
  theme,
  templateId,
  onChangeTheme,
  onChangeTemplate,
}) => {
  const { data: templates = [] } = useQuery<CVTemplateRecord[]>({
    queryKey: ['cv-templates-compact'],
    queryFn: () => cvBuilderService.getTemplates(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── 1. Switch Template ─────────────────────────────────────────── */}
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
            return (
              <Grid item xs={6} sm={4} key={tpl.id}>
                <Box
                  onClick={() => {
                    const fallbackColor = tpl.default_theme?.primaryColor || tpl.color_palettes?.[0];
                    onChangeTemplate(tpl.code, fallbackColor);
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    bgcolor: isSelected ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#2563eb',
                      bgcolor: '#f1f5f9',
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: isSelected ? '#1e40af' : '#1e293b',
                        fontSize: '0.8rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tpl.name.replace(/\s*\(.*\)/, '')}
                    </Typography>
                    {isSelected && <CheckCircleIcon sx={{ fontSize: 16, color: '#2563eb' }} />}
                  </Stack>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                    {tpl.category_name}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* ── 2. Color Palette ───────────────────────────────────────────── */}
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

        <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
          {PRESET_COLORS.map((color) => {
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
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  {isSelected && <CheckCircleIcon sx={{ fontSize: 16 }} />}
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
      </Paper>

      {/* ── 3. Typography & Sizing ─────────────────────────────────────── */}
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
              <Grid item xs={12} sm={6} key={f.id}>
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
                {theme.fontSize === 'small' ? 'Thu nhỏ' : theme.fontSize === 'large' ? 'Phóng to' : 'Vừa (Chuẩn)'}
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
                {theme.spacing === 'compact' ? 'Gọn (Tiết kiệm)' : theme.spacing === 'relaxed' ? 'Rộng (Thoáng)' : 'Chuẩn (Cân đối)'}
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

      {/* ── 4. Avatar Customization ────────────────────────────────────── */}
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
