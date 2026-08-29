'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { CV_TEMPLATES_CATALOG } from '../../templates/templatesData';
import { CVTemplateMeta } from '@/types/cvBuilder';

interface TemplateSwitcherModalProps {
  open: boolean;
  onClose: () => void;
  currentTemplateId: string;
  currentColor: string;
  onSelectTemplate: (templateId: string, color?: string) => void;
}

export const TemplateSwitcherModal: React.FC<TemplateSwitcherModalProps> = ({
  open,
  onClose,
  currentTemplateId,
  currentColor,
  onSelectTemplate,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(currentTemplateId);
  const [selectedColor, setSelectedColor] = useState<string>(currentColor);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất cả mẫu' },
    { id: 'modern', label: 'Hiện đại' },
    { id: 'simple', label: 'Đơn giản & ATS' },
    { id: 'professional', label: 'Chuyên nghiệp' },
    { id: 'executive', label: 'Cấp Quản lý' },
    { id: 'creative', label: 'Sáng tạo' },
    { id: 'tech', label: 'Công nghệ IT' },
  ];

  const filteredTemplates = CV_TEMPLATES_CATALOG.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  const currentMeta = CV_TEMPLATES_CATALOG.find((t) => t.id === selectedTemplateId) || CV_TEMPLATES_CATALOG[0];

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
          borderRadius: '20px',
          overflow: 'hidden',
          maxHeight: '90vh',
        },
      }}
    >
      {/* ── Dialog Header ────────────────────────────────────────────── */}
      <DialogTitle
        sx={{
          p: 2.5,
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#f8fafc',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem' }}>
            Đổi Mẫu CV
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
            Toàn bộ thông tin bạn đã nhập sẽ được giữ nguyên và tự động hiển thị theo bố cục mới.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f1f5f9' } }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {/* ── Dialog Content ───────────────────────────────────────────── */}
      <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
        {/* Category Filters */}
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 2, mb: 2, borderBottom: '1px solid #f1f5f9' }}>
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <Chip
                key={cat.id}
                label={cat.label}
                onClick={() => setActiveCategory(cat.id)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  px: 0.5,
                  cursor: 'pointer',
                  bgcolor: isSelected ? '#1e40af' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#475569',
                  border: isSelected ? 'none' : '1px solid #e2e8f0',
                  '&:hover': {
                    bgcolor: isSelected ? '#1d4ed8' : '#f1f5f9',
                  },
                }}
              />
            );
          })}
        </Stack>

        {/* Templates Grid */}
        <Grid container spacing={2.5}>
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplateId === template.id;
            return (
              <Grid item xs={12} sm={6} md={3} key={template.id}>
                <Box
                  onClick={() => {
                    setSelectedTemplateId(template.id);
                    if (template.defaultColors && template.defaultColors.length > 0) {
                      setSelectedColor(template.defaultColors[0]);
                    }
                  }}
                  sx={{
                    border: isSelected ? '2.5px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    p: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    bgcolor: isSelected ? '#eff6ff' : '#ffffff',
                    boxShadow: isSelected
                      ? '0 8px 24px rgba(37, 99, 235, 0.15)'
                      : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    '&:hover': {
                      borderColor: '#2563eb',
                      transform: 'translateY(-2px)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  {/* Thumbnail Container */}
                  <Box
                    sx={{
                      position: 'relative',
                      height: 180,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      bgcolor: '#f1f5f9',
                      mb: 1.5,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <img
                      src={template.thumbnailUrl}
                      alt={template.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        // Fallback SVG preview placeholder
                        e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" fill="%23e2e8f0"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="sans-serif" font-size="14" font-weight="bold">${template.name}</text></svg>`;
                      }}
                    />

                    {/* Selected Badge */}
                    {isSelected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: '#2563eb',
                          color: '#ffffff',
                          borderRadius: '50%',
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 20 }} />
                      </Box>
                    )}

                    {/* Popular / ATS Badge */}
                    {template.badge && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          bgcolor: 'rgba(15, 23, 42, 0.85)',
                          color: '#ffffff',
                          px: 1,
                          py: 0.3,
                          borderRadius: '6px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                        }}
                      >
                        {template.badge}
                      </Box>
                    )}
                  </Box>

                  {/* Title & Info */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
                    {template.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700, mb: 0.5 }}>
                    {template.vietnameseName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      fontSize: '0.725rem',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 1.5,
                      flex: 1,
                    }}
                  >
                    {template.description}
                  </Typography>

                  {/* Color Palette Previews */}
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    {template.defaultColors.slice(0, 5).map((c) => (
                      <Box
                        key={c}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplateId(template.id);
                          setSelectedColor(c);
                        }}
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: c,
                          border: isSelected && selectedColor === c ? '2px solid #0f172a' : '1.5px solid #ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          cursor: 'pointer',
                          transform: isSelected && selectedColor === c ? 'scale(1.25)' : 'scale(1)',
                          transition: 'transform 0.15s ease',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>

      {/* ── Dialog Actions ───────────────────────────────────────────── */}
      <DialogActions
        sx={{
          p: 2.5,
          borderTop: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            Mẫu đang chọn: <strong style={{ color: '#0f172a' }}>{currentMeta.name} ({currentMeta.vietnameseName})</strong>
          </Typography>
          <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: selectedColor, border: '2px solid #ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              borderColor: '#cbd5e1',
              color: '#475569',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' },
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleApply}
            variant="contained"
            startIcon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderRadius: '10px',
              bgcolor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1d4ed8' },
            }}
          >
            Áp dụng mẫu này
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
