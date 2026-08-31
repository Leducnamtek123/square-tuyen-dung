'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { CVTemplateRecord, CVData } from '@/types/cvBuilder';
import { CVTemplateRenderer } from '../templates/CVTemplateRenderer';
import { INITIAL_CV_SAMPLE_DATA, getSampleDataForTemplate } from '../templates/templatesData';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { useTranslation } from 'react-i18next';

interface TemplateCardProps {
  template: CVTemplateRecord;
  onPreview: (template: CVTemplateRecord, selectedColor: string) => void;
}

// Map template code to friendly Vietnamese island/destination names matching Vieclam24h
const TEMPLATE_DISPLAY_INFO: Record<string, { displayName: string; tags: string[] }> = {
  'modern-navy': { displayName: 'Phước Hải', tags: ['Hiện đại', 'Chuyên nghiệp'] },
  'minimal-clean': { displayName: 'Long Hải', tags: ['Đơn giản', 'Chuẩn ATS'] },
  'classic-serif': { displayName: 'Sầm Sơn', tags: ['Cổ điển', 'Chuyên nghiệp'] },
  'creative-coral': { displayName: 'Bãi Cháy', tags: ['Sáng tạo', 'Trẻ trung'] },
  'executive-emerald': { displayName: 'Phú Quốc', tags: ['Cấp Quản lý', 'Chuyên nghiệp'] },
  'nordic-minimal': { displayName: 'Nam Du', tags: ['Đơn giản', 'Tối giản'] },
  'corporate-compact': { displayName: 'Côn Đảo', tags: ['Chuyên nghiệp', '1 Trang'] },
  'tech-dark': { displayName: 'Bình Ba', tags: ['Công nghệ', 'Hiện đại'] },
};

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPreview }) => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const defaultColors = (template.colorPalettes && template.colorPalettes.length > 0)
    ? template.colorPalettes
    : (template.color_palettes && template.color_palettes.length > 0)
    ? template.color_palettes
    : ['#1e40af', '#0f766e', '#374151'];

  const [selectedColor, setSelectedColor] = useState(
    template.defaultTheme?.primaryColor || template.default_theme?.primaryColor || defaultColors[0] || '#1e40af'
  );

  const displayInfo = TEMPLATE_DISPLAY_INFO[template.code] || {
    displayName: template.name.replace(/\s*\(.*\)/, ''),
    tags: [template.categoryName || template.category_name || 'Chuyên nghiệp'],
  };

  // Build rich sample data so preview is ALWAYS realistic and beautiful
  const baseSample = getSampleDataForTemplate(template.code);
  const rawSample = ((template.sampleData || template.sample_data) as CVData) || {};

  const previewData: CVData = {
    ...baseSample,
    ...rawSample,
    templateId: template.code,
    personalInfo: {
      ...baseSample.personalInfo,
      ...(rawSample.personalInfo || {}),
      avatarUrl:
        rawSample.personalInfo?.avatarUrl ||
        baseSample.personalInfo.avatarUrl ||
        '/images/cv-avatars/avatar-modern.jpg',
    },
    experiences: (rawSample.experiences && rawSample.experiences.length > 0)
      ? rawSample.experiences
      : baseSample.experiences,
    educations: (rawSample.educations && rawSample.educations.length > 0)
      ? rawSample.educations
      : baseSample.educations,
    skills: (rawSample.skills && rawSample.skills.length > 0)
      ? rawSample.skills
      : baseSample.skills,
    languages: (rawSample.languages && rawSample.languages.length > 0)
      ? rawSample.languages
      : baseSample.languages,
    certificates: (rawSample.certificates && rawSample.certificates.length > 0)
      ? rawSample.certificates
      : baseSample.certificates,
    projects: (rawSample.projects && rawSample.projects.length > 0)
      ? rawSample.projects
      : baseSample.projects,
    theme: {
      ...baseSample.theme,
      ...(template.default_theme || {}),
      ...(rawSample.theme || {}),
      showAvatar: true,
      primaryColor: selectedColor,
      paperSize: 'A4',
    },
  };

  const handleUseTemplate = () => {
    const targetUrl = localizeRoutePath(
      `/tao-cv?template=${template.code}&color=${encodeURIComponent(selectedColor)}`,
      i18n.language
    );
    router.push(targetUrl);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        bgcolor: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'all 0.25s ease-in-out',
        '&:hover': {
          borderColor: '#93c5fd',
          boxShadow: '0 12px 28px rgba(37, 99, 235, 0.12)',
          transform: 'translateY(-3px)',
          '& .preview-overlay': { opacity: 1 },
        },
      }}
    >
      {/* ── Top Template Preview Container ──────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 380,
          bgcolor: '#f8fafc',
          overflow: 'hidden',
        }}
      >
        {/* Popular / Category Badge on Top Left */}
        {template.is_popular ? (
          <Chip
            size="small"
            icon={<LocalFireDepartmentOutlinedIcon sx={{ fontSize: '14px !important', color: '#fde047 !important' }} />}
            label="Phổ biến"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 10,
              bgcolor: '#e11d48',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.7rem',
              boxShadow: '0 2px 8px rgba(225, 29, 72, 0.3)',
            }}
          />
        ) : (
          <Chip
            size="small"
            label={displayInfo.tags[0]}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 10,
              bgcolor: 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.7rem',
              backdropFilter: 'blur(4px)',
            }}
          />
        )}

        {/* NEW Badge on Top Right */}
        <Chip
          size="small"
          label="MỚI"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            bgcolor: '#2563eb',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.675rem',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
          }}
        />

        {/* Scaled Render of actual Template with realistic styling */}
        <Box
          sx={{
            position: 'absolute',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%) scale(0.38)',
            transformOrigin: 'top center',
            width: 794,
            minHeight: 1123,
            pointerEvents: 'none',
            bgcolor: '#ffffff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <CVTemplateRenderer data={previewData} language={i18n.language === 'en' ? 'en' : 'vi'} />
        </Box>

        {/* Hover Action Overlay */}
        <Box
          className="preview-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            zIndex: 20,
            p: 2,
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => onPreview(template, selectedColor)}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              color: '#1e293b',
              fontWeight: 700,
              fontSize: '0.775rem',
              borderRadius: '10px',
              textTransform: 'none',
              px: 2,
              py: 0.75,
              '&:hover': { bgcolor: '#ffffff', transform: 'scale(1.03)' },
            }}
          >
            Xem trước
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<AutoFixHighOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={handleUseTemplate}
            sx={{
              bgcolor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.775rem',
              borderRadius: '10px',
              textTransform: 'none',
              px: 2,
              py: 0.75,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              '&:hover': { bgcolor: '#1d4ed8', transform: 'scale(1.03)' },
            }}
          >
            Dùng mẫu này
          </Button>
        </Box>
      </Box>

      {/* ── Footer Information Section (Vieclam24h style) ──────────────── */}
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.975rem' }}>
              {displayInfo.displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              {template.name}
            </Typography>
          </Stack>

          {/* Category Tag Pills */}
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.75 }}>
            {displayInfo.tags.map((tag, idx) => (
              <Chip
                key={`tag-${tag}-${idx}`}
                label={tag}
                size="small"
                sx={{
                  bgcolor: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #dbeafe',
                  fontWeight: 700,
                  fontSize: '0.725rem',
                  height: 24,
                  borderRadius: '12px',
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Color Palette Switcher */}
        <Box sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            Tông màu:
          </Typography>

          <Stack direction="row" spacing={0.75} alignItems="center">
            {defaultColors.slice(0, 5).map((color) => (
              <Tooltip key={color} title={color} arrow>
                <Box
                  component="button"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setSelectedColor(color);
                  }}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: color,
                    border: '2px solid #ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 0,
                    transition: 'transform 0.15s ease',
                    '&:hover': { transform: 'scale(1.15)' },
                  }}
                >
                  {selectedColor === color && <CheckIcon sx={{ fontSize: 13, color: '#ffffff' }} />}
                </Box>
              </Tooltip>
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};
