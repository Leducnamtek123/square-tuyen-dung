'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Stack,
  Tooltip,
  Button,
} from '@mui/material';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { CVData } from '@/types/cvBuilder';
import * as CountryFlags from 'country-flag-icons/react/3x2';
import { useTranslation } from 'react-i18next';
import { CVTemplateRenderer } from '@/views/cvBuilderPages/templates/CVTemplateRenderer';
import { CV_TEMPLATES_CATALOG } from '@/views/cvBuilderPages/templates/templatesData';

interface CVLivePreviewProps {
  data: CVData;
  onOpenTemplateSwitcher?: () => void;
  onChangeColor?: (color: string) => void;
  onDownloadPDF?: () => void;
  isDownloadingPDF?: boolean;
}

export const CVLivePreview: React.FC<CVLivePreviewProps> = ({
  data,
  onOpenTemplateSwitcher,
  onChangeColor,
  onDownloadPDF,
  isDownloadingPDF,
}) => {
  const { t } = useTranslation();
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [cvLanguage, setCvLanguage] = useState<'vi' | 'en'>('vi');

  const currentTemplate =
    CV_TEMPLATES_CATALOG.find((t) => t.id === data.templateId) || CV_TEMPLATES_CATALOG[0];
  const paletteColors = currentTemplate.defaultColors || [
    '#1e40af',
    '#0284c7',
    '#059669',
    '#7c3aed',
    '#dc2626',
    '#1e293b',
  ];

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 1.4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.45));
  };

  const handleResetZoom = () => {
    setZoomLevel(0.85);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#e2e8f0',
        overflow: 'hidden',
      }}
    >
      {/* ── Vieclam24h-Style Top Control Bar ─────────────────────────────── */}
      <Paper
        elevation={0}
        className="no-print"
        sx={{
          py: 1,
          px: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#ffffff',
          borderBottom: '1px solid #cbd5e1',
          zIndex: 15,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        {/* Left: Template Switcher & Language & Colors */}
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {onOpenTemplateSwitcher && (
            <Button
              size="small"
              variant="outlined"
              onClick={onOpenTemplateSwitcher}
              startIcon={<DashboardCustomizeOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '10px',
                borderColor: '#cbd5e1',
                color: '#1e293b',
                fontWeight: 700,
                fontSize: '0.75rem',
                textTransform: 'none',
                px: 1.75,
                py: 0.6,
                bgcolor: '#f8fafc',
                '&:hover': { borderColor: '#2563eb', bgcolor: '#eff6ff', color: '#2563eb' },
              }}
            >
              {t('cvBuilder.preview.switchTemplate', 'Đổi mẫu')} ({currentTemplate.name})
            </Button>
          )}

          {/* Language Switcher Pill with Vector Flag Icons */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ bgcolor: '#f1f5f9', p: 0.35, borderRadius: '8px', border: '1px solid #e2e8f0' }}
          >
            <Button
              size="small"
              onClick={() => setCvLanguage('vi')}
              startIcon={
                <Box sx={{ width: 17, height: 11, borderRadius: '2px', overflow: 'hidden', display: 'flex', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                  <CountryFlags.VN style={{ display: 'block', width: '100%', height: '100%' }} />
                </Box>
              }
              sx={{
                py: 0.3,
                px: 1.25,
                fontSize: '0.725rem',
                fontWeight: 700,
                textTransform: 'none',
                minWidth: 0,
                borderRadius: '6px',
                ...(cvLanguage === 'vi'
                  ? { bgcolor: '#ffffff', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: '#64748b', '&:hover': { bgcolor: 'rgba(255,255,255,0.6)', color: '#0f172a' } }),
              }}
            >
              {t('cvBuilder.preview.vietnamese', 'Việt')}
            </Button>
            <Button
              size="small"
              onClick={() => setCvLanguage('en')}
              startIcon={
                <Box sx={{ width: 17, height: 11, borderRadius: '2px', overflow: 'hidden', display: 'flex', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
                  <CountryFlags.GB style={{ display: 'block', width: '100%', height: '100%' }} />
                </Box>
              }
              sx={{
                py: 0.3,
                px: 1.25,
                fontSize: '0.725rem',
                fontWeight: 700,
                textTransform: 'none',
                minWidth: 0,
                borderRadius: '6px',
                ...(cvLanguage === 'en'
                  ? { bgcolor: '#ffffff', color: '#2563eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                  : { color: '#64748b', '&:hover': { bgcolor: 'rgba(255,255,255,0.6)', color: '#0f172a' } }),
              }}
            >
              {t('cvBuilder.preview.english', 'Anh')}
            </Button>
          </Stack>

          {/* Color Palette Dots */}
          {onChangeColor && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', display: { xs: 'none', md: 'inline' } }}>
                {t('cvBuilder.preview.color', 'Màu sắc:')}
              </Typography>
              {paletteColors.map((color) => {
                const isSelected = (data.theme.primaryColor || '').toLowerCase() === color.toLowerCase();
                return (
                  <Tooltip key={color} title={color}>
                    <Box
                      onClick={() => onChangeColor(color)}
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: color,
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        border: isSelected ? '2.5px solid #0f172a' : '2px solid #ffffff',
                        transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                        '&:hover': { transform: 'scale(1.2)' },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Stack>
          )}
        </Stack>

        {/* Right: Zoom controls */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              bgcolor: '#f8fafc',
              p: 0.35,
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
            }}
          >
            <Tooltip title={t('cvBuilder.preview.zoomOut', 'Thu nhỏ')}>
              <IconButton size="small" onClick={handleZoomOut} sx={{ color: '#475569', p: 0.5 }}>
                <ZoomOutOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: '#1e293b', minWidth: 42, textAlign: 'center', fontFamily: 'Inter, monospace', fontSize: '0.75rem' }}
            >
              {Math.round(zoomLevel * 100)}%
            </Typography>

            <Tooltip title={t('cvBuilder.preview.zoomIn', 'Phóng to')}>
              <IconButton size="small" onClick={handleZoomIn} sx={{ color: '#475569', p: 0.5 }}>
                <ZoomInOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('cvBuilder.preview.zoomReset', 'Tỉ lệ chuẩn 85%')}>
              <IconButton size="small" onClick={handleResetZoom} sx={{ color: '#475569', p: 0.5 }}>
                <RestartAltOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* ── Center Canvas Area with Pan & Scroll ─────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 4, md: 5 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Box
          sx={{
            transition: 'transform 0.15s ease-out',
            transformOrigin: 'top center',
            transform: `scale(${zoomLevel})`,
            width: '210mm',
            minHeight: '297mm',
            mb: 5,
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.15)',
            borderRadius: '4px',
            overflow: 'hidden',
            bgcolor: '#ffffff',
          }}
        >
          <div id="cv-print-area" style={{ width: '100%', background: '#ffffff' }}>
            <CVTemplateRenderer data={data} language={cvLanguage} />
          </div>
        </Box>
      </Box>
    </Box>
  );
};
