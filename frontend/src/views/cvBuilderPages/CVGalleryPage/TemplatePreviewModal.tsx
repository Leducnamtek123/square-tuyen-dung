'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { CVTemplateRecord, CVData } from '@/types/cvBuilder';
import { CVTemplateRenderer } from '../templates/CVTemplateRenderer';
import { getSampleDataForTemplate } from '../templates/templatesData';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { useTranslation } from 'react-i18next';

interface TemplatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  template: CVTemplateRecord | null;
  initialColor?: string;
}

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

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  open,
  onClose,
  template,
  initialColor,
}) => {
  const router = useRouter();
  const { i18n } = useTranslation();

  const defaultColors = template?.color_palettes && template.color_palettes.length > 0
    ? template.color_palettes
    : ['#1e40af', '#0f766e', '#374151'];

  const [currentColor, setCurrentColor] = useState<string>(
    initialColor || template?.default_theme?.primaryColor || defaultColors[0] || '#1e40af'
  );

  useEffect(() => {
    if (initialColor) {
      setCurrentColor(initialColor);
    } else if (template?.default_theme?.primaryColor) {
      setCurrentColor(template.default_theme.primaryColor);
    } else if (defaultColors[0]) {
      setCurrentColor(defaultColors[0]);
    }
  }, [initialColor, template]);

  if (!template) return null;

  const displayInfo = TEMPLATE_DISPLAY_INFO[template.code] || {
    displayName: template.name.replace(/\s*\(.*\)/, ''),
    tags: [template.category_name || 'Chuyên nghiệp'],
  };

  const baseSample = getSampleDataForTemplate(template.code);
  const rawSample = (template.sample_data as CVData) || {};

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
      primaryColor: currentColor,
      paperSize: 'A4',
    },
  };

  const handleUseTemplate = () => {
    const targetUrl = localizeRoutePath(
      `/tao-cv?template=${template.code}&color=${encodeURIComponent(currentColor)}`,
      i18n.language
    );
    router.push(targetUrl);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: '20px',
          bgcolor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          maxHeight: '92vh',
        },
      }}
    >
      {/* ── Dialog Header (Consistent with project modal header) ─────────── */}
      <DialogTitle
        sx={{
          p: 2.5,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ pr: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>
              Mẫu CV {displayInfo.displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              ({template.name})
            </Typography>
            {template.is_popular && (
              <Chip
                size="small"
                icon={<LocalFireDepartmentOutlinedIcon sx={{ fontSize: '14px !important', color: '#fde047 !important' }} />}
                label="Phổ biến"
                sx={{
                  bgcolor: '#e11d48',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.675rem',
                  height: 22,
                }}
              />
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
            {template.description || 'Mẫu CV chuẩn ATS, tối ưu hóa bố cục chuyên nghiệp theo tiêu chuẩn tuyển dụng.'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Color Switcher */}
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ bgcolor: '#ffffff', p: 0.75, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, px: 0.5 }}>
              Màu:
            </Typography>
            {defaultColors.slice(0, 5).map((color) => (
              <Tooltip key={color} title={color} arrow>
                <Box
                  component="button"
                  onClick={() => setCurrentColor(color)}
                  sx={{
                    width: 22,
                    height: 22,
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
                  {currentColor === color && <CheckIcon sx={{ fontSize: 14, color: '#ffffff' }} />}
                </Box>
              </Tooltip>
            ))}
          </Stack>

          <Button
            variant="contained"
            size="small"
            startIcon={<AutoFixHighOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={handleUseTemplate}
            sx={{
              bgcolor: '#2563eb',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.8rem',
              borderRadius: '10px',
              textTransform: 'none',
              px: 2.5,
              py: 0.85,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Dùng mẫu này
          </Button>

          <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* ── Dialog Content: Centered High-Fidelity A4 Sheet ─────────────── */}
      <DialogContent sx={{ p: 4, bgcolor: '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto' }}>
        <Box
          sx={{
            width: 794,
            minHeight: 1123,
            bgcolor: '#ffffff',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <CVTemplateRenderer data={previewData} language={i18n.language === 'en' ? 'en' : 'vi'} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
