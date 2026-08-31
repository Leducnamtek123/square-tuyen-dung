'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Chip,
  Stack,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SparklesIcon from '@mui/icons-material/AutoFixHighOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import FlashOnOutlinedIcon from '@mui/icons-material/FlashOnOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import { useTranslation } from 'react-i18next';
import { CV_TEMPLATES_CATALOG, getSampleDataForTemplate } from '@/views/cvBuilderPages/templates/templatesData';
import { CVTemplateRenderer } from '@/views/cvBuilderPages/templates/CVTemplateRenderer';
import { CVData, CVTemplateMeta } from '@/types/cvBuilder';

interface TemplateSwitcherModalProps {
  open: boolean;
  onClose: () => void;
  currentTemplateId: string;
  currentColor: string;
  onSelectTemplate: (templateId: string, color?: string) => void;
}

// Multi-category tag mapping so filtered views are always rich and balanced
const TEMPLATE_CATEGORY_TAGS: Record<string, string[]> = {
  'modern-navy': ['popular', 'modern', 'professional', 'tech'],
  'minimal-clean': ['popular', 'simple', 'professional', 'tech'],
  'executive-emerald': ['popular', 'executive', 'professional'],
  'creative-coral': ['creative', 'modern', 'popular'],
  'tech-dark': ['tech', 'modern', 'creative'],
  'classic-serif': ['professional', 'executive', 'simple'],
  'nordic-minimal': ['simple', 'modern', 'creative'],
  'corporate-compact': ['popular', 'professional', 'executive', 'simple'],
};

const CATEGORIES = [
  { id: 'all', label: 'Tất cả mẫu', icon: AppsOutlinedIcon },
  { id: 'popular', label: 'Phổ biến nhất', icon: LocalFireDepartmentOutlinedIcon },
  { id: 'modern', label: 'Hiện đại', icon: AutoAwesomeOutlinedIcon },
  { id: 'simple', label: 'Đơn giản & ATS', icon: FlashOnOutlinedIcon },
  { id: 'executive', label: 'Cấp Quản lý', icon: WorkspacePremiumOutlinedIcon },
  { id: 'professional', label: 'Chuyên nghiệp', icon: BusinessCenterOutlinedIcon },
  { id: 'creative', label: 'Sáng tạo', icon: PaletteOutlinedIcon },
  { id: 'tech', label: 'Công nghệ IT', icon: ComputerOutlinedIcon },
];

export const TemplateSwitcherModal: React.FC<TemplateSwitcherModalProps> = ({
  open,
  onClose,
  currentTemplateId,
  currentColor,
  onSelectTemplate,
}) => {
  const { t } = useTranslation();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(currentTemplateId);
  const [selectedColor, setSelectedColor] = useState<string>(currentColor);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTemplates = useMemo(() => {
    return CV_TEMPLATES_CATALOG.filter((t) => {
      if (activeCategory === 'all') return true;
      const tags = TEMPLATE_CATEGORY_TAGS[t.id] || [t.category];
      return tags.includes(activeCategory);
    });
  }, [activeCategory]);

  const currentMeta = useMemo(() => {
    return CV_TEMPLATES_CATALOG.find((t) => t.id === selectedTemplateId) || CV_TEMPLATES_CATALOG[0];
  }, [selectedTemplateId]);

  const handleApply = () => {
    onSelectTemplate(selectedTemplateId, selectedColor);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          maxHeight: '92vh',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        },
      }}
    >
      {/* ── Dialog Header ────────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          px: 3.5,
          py: 2.5,
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                bgcolor: '#eff6ff',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SparklesIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                {t('cvBuilder.templateModal.title', 'Chọn Mẫu Giao Diện CV')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.825rem', mt: 0.2 }}>
                {t('cvBuilder.templateModal.subtitle', 'Toàn bộ nội dung & thông tin bạn đã nhập sẽ được giữ nguyên 100% khi chuyển sang mẫu mới.')}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#64748b',
            bgcolor: '#f1f5f9',
            '&:hover': { bgcolor: '#e2e8f0', color: '#0f172a' },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {/* ── Dialog Content ───────────────────────────────────────────── */}
      <DialogContent sx={{ p: { xs: 2, sm: 3.5 }, bgcolor: '#f8fafc' }}>
        {/* Category Filters Carousel */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: 'auto',
            pb: 1.5,
            mb: 3,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 4 },
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const IconComp = cat.icon;
            return (
              <Chip
                key={cat.id}
                icon={
                  <IconComp
                    sx={{
                      fontSize: '16px !important',
                      color: isSelected ? '#ffffff !important' : '#475569 !important',
                    }}
                  />
                }
                label={t(`cvBuilder.categories.${cat.id}`, cat.label)}
                onClick={() => setActiveCategory(cat.id)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  borderRadius: '12px',
                  px: 1,
                  py: 2.2,
                  cursor: 'pointer',
                  bgcolor: isSelected ? '#1e40af' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: isSelected ? '1px solid #1e40af' : '1px solid #e2e8f0',
                  boxShadow: isSelected ? '0 4px 12px rgba(30, 64, 175, 0.25)' : '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isSelected ? '#1d4ed8' : '#f1f5f9',
                    transform: 'translateY(-1px)',
                  },
                }}
              />
            );
          })}
        </Stack>

        {/* Templates Grid with Live Scaled Preview */}
        <Grid container spacing={3}>
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplateId === template.id;
            const cardActiveColor = isSelected ? selectedColor : template.defaultColors[0] || '#1e40af';

            // Rich sample data for live scaled mini preview
            const sample = getSampleDataForTemplate(template.id);
            const livePreviewData: CVData = {
              ...sample,
              templateId: template.id,
              theme: {
                ...sample.theme,
                primaryColor: cardActiveColor,
              },
            };

            return (
              <Grid item xs={12} sm={6} md={3} key={template.id}>
                <Box
                  onClick={() => {
                    setSelectedTemplateId(template.id);
                    if (template.defaultColors && template.defaultColors.length > 0) {
                      if (!template.defaultColors.includes(selectedColor)) {
                        setSelectedColor(template.defaultColors[0]);
                      }
                    }
                  }}
                  sx={{
                    position: 'relative',
                    border: isSelected ? `2.5px solid ${cardActiveColor}` : '1.5px solid #e2e8f0',
                    borderRadius: '20px',
                    p: 1.75,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: '#ffffff',
                    boxShadow: isSelected
                      ? `0 12px 28px -4px ${cardActiveColor}33, 0 4px 12px -2px ${cardActiveColor}22`
                      : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    '&:hover': {
                      borderColor: cardActiveColor,
                      boxShadow: '0 12px 24px -4px rgba(15, 23, 42, 0.1)',
                      transform: 'translateY(-4px)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  {/* Scaled Live Render Box */}
                  <Box
                    sx={{
                      position: 'relative',
                      height: 220,
                      borderRadius: '14px',
                      overflow: 'hidden',
                      bgcolor: '#f1f5f9',
                      mb: 2,
                      border: '1px solid #e2e8f0',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Live Miniature Document Viewport */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%) scale(0.24)',
                        transformOrigin: 'top center',
                        width: 794,
                        minHeight: 1123,
                        pointerEvents: 'none',
                        bgcolor: '#ffffff',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
                        overflow: 'hidden',
                        borderRadius: '4px',
                      }}
                    >
                      <CVTemplateRenderer data={livePreviewData} language="vi" />
                    </Box>

                    {/* Selected Active Checkmark */}
                    {isSelected && (
                      <Fade in={isSelected}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            bgcolor: cardActiveColor,
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 4px 12px ${cardActiveColor}66`,
                            zIndex: 10,
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 20 }} />
                        </Box>
                      </Fade>
                    )}

                    {/* Badge Pill (Popular / ATS) */}
                    {template.badge && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 10,
                          left: 10,
                          bgcolor: 'rgba(15, 23, 42, 0.88)',
                          color: '#ffffff',
                          px: 1.25,
                          py: 0.4,
                          borderRadius: '8px',
                          fontSize: '0.675rem',
                          fontWeight: 800,
                          letterSpacing: '0.02em',
                          backdropFilter: 'blur(4px)',
                          zIndex: 10,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        }}
                      >
                        {template.badge}
                      </Box>
                    )}
                  </Box>

                  {/* Title & Vietnamese Name */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.95rem', lineHeight: 1.2 }}>
                    {template.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: cardActiveColor, fontWeight: 800, fontSize: '0.75rem', mt: 0.25, mb: 0.75 }}>
                    {template.vietnameseName}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      fontSize: '0.75rem',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                      flex: 1,
                    }}
                  >
                    {template.description}
                  </Typography>

                  {/* Dynamic Color Palette Swatches */}
                  <Box sx={{ pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      {template.defaultColors.slice(0, 5).map((c) => {
                        const isColorActive = isSelected && selectedColor.toLowerCase() === c.toLowerCase();
                        return (
                          <Box
                            key={c}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemplateId(template.id);
                              setSelectedColor(c);
                            }}
                            sx={{
                              width: isColorActive ? 22 : 18,
                              height: isColorActive ? 22 : 18,
                              borderRadius: '50%',
                              bgcolor: c,
                              border: isColorActive ? '2.5px solid #0f172a' : '2px solid #ffffff',
                              boxShadow: isColorActive
                                ? `0 0 0 2px ${c}, 0 2px 6px rgba(0,0,0,0.25)`
                                : '0 1px 3px rgba(0,0,0,0.15)',
                              cursor: 'pointer',
                              transform: isColorActive ? 'scale(1.15)' : 'scale(1)',
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                transform: 'scale(1.25)',
                              },
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>

      {/* ── Dialog Actions ───────────────────────────────────────────── */}
      <DialogActions
        sx={{
          px: 3.5,
          py: 2.5,
          borderTop: '1px solid #f1f5f9',
          bgcolor: '#ffffff',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
            {t('cvBuilder.templateModal.selectedLabel', 'Mẫu đang chọn:')} <strong style={{ color: '#0f172a' }}>{currentMeta.name} ({currentMeta.vietnameseName})</strong>
          </Typography>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: selectedColor,
              border: '2px solid #ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              borderColor: '#cbd5e1',
              color: '#475569',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              py: 1.1,
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
            }}
          >
            {t('common.actions.cancel', 'Hủy bỏ')}
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            startIcon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              color: '#ffffff',
              fontWeight: 800,
              textTransform: 'none',
              px: 3.5,
              py: 1.1,
              boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {t('cvBuilder.templateModal.apply', 'Áp dụng mẫu này')}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

