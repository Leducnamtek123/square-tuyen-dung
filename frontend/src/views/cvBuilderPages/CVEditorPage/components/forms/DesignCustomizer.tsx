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
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 0.75 }}>
              Cỡ chữ:
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ bgcolor: '#f1f5f9', p: 0.5, borderRadius: '8px' }}>
              {(['small', 'medium', 'large'] as const).map((sz) => (
                <Button
                  key={sz}
                  size="small"
                  onClick={() => onChangeTheme({ ...theme, fontSize: sz })}
                  sx={{
                    flex: 1,
                    py: 0.4,
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '6px',
                    ...(theme.fontSize === sz
                      ? { bgcolor: '#ffffff', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                      : { color: '#64748b' }),
                  }}
                >
                  {sz === 'small' ? 'Nhỏ' : sz === 'medium' ? 'Vừa' : 'Lớn'}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 0.75 }}>
              Giãn cách:
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ bgcolor: '#f1f5f9', p: 0.5, borderRadius: '8px' }}>
              {(['compact', 'normal', 'relaxed'] as const).map((sp) => (
                <Button
                  key={sp}
                  size="small"
                  onClick={() => onChangeTheme({ ...theme, spacing: sp })}
                  sx={{
                    flex: 1,
                    py: 0.4,
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '6px',
                    ...(theme.spacing === sp
                      ? { bgcolor: '#ffffff', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                      : { color: '#64748b' }),
                  }}
                >
                  {sp === 'compact' ? 'Gọn' : sp === 'normal' ? 'Chuẩn' : 'Rộng'}
                </Button>
              ))}
            </Stack>
          </Box>
        </Box>
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
