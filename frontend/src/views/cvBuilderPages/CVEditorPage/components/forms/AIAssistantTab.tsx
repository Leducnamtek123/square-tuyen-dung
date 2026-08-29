'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  MenuItem,
  Chip,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';

import cvBuilderService from '@/services/cvBuilderService';
import { CVSuggestionRecord } from '@/types/cvBuilder';

interface AIAssistantTabProps {
  onApplyBio: (text: string) => void;
}

const INDUSTRY_OPTIONS = [
  { value: 'all', label: 'Tất cả ngành nghề' },
  { value: 'IT', label: 'Công nghệ thông tin / IT' },
  { value: 'Marketing', label: 'Marketing & Truyền thông' },
  { value: 'Sales', label: 'Kinh doanh & B2B Sales' },
  { value: 'HR', label: 'Nhân sự & Tuyển dụng' },
];

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({ onApplyBio }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: suggestions = [], isLoading } = useQuery<CVSuggestionRecord[]>({
    queryKey: ['cv-suggestions', selectedIndustry, searchQuery],
    queryFn: () =>
      cvBuilderService.getSuggestions({
        industry: selectedIndustry === 'all' ? undefined : selectedIndustry,
        search: searchQuery.trim() || undefined,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '12px',
          bgcolor: '#eff6ff',
          border: '1px solid #bfdbfe',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          <AutoAwesomeOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', fontSize: '0.85rem' }}>
            Gợi ý Văn phong & Mục tiêu Chuyên nghiệp
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: '#3b82f6', fontSize: '0.75rem', lineHeight: 1.4 }}>
          Tham khảo các mẫu tóm tắt bản thân và mô tả năng lực chuẩn văn phong chuyên nghiệp được đội ngũ chuyên gia tuyển dụng biên soạn sẵn.
        </Typography>
      </Paper>

      {/* ── Filter & Search Toolbar (Standard MUI Inputs) ────────────────── */}
      <Stack direction="row" spacing={1.5}>
        <TextField
          select
          size="small"
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          sx={{ width: 170, bgcolor: '#ffffff' }}
        >
          {INDUSTRY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.8rem' }}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          fullWidth
          placeholder="Tìm gợi ý..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: '#ffffff' }}
        />
      </Stack>

      {/* ── Suggestions List ────────────────────────────────────────────── */}
      <Stack spacing={2}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#2563eb' }} />
          </Box>
        ) : suggestions.length > 0 ? (
          suggestions.map((item, index) => (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: '#93c5fd' },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {/* Card Header & Standard MUI Action Buttons */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700, fontSize: '0.7rem' }}>
                    {item.industry_name}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} sx={{ shrink: 0 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleCopy(item.content, index)}
                    startIcon={
                      copiedIndex === index ? (
                        <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                      ) : (
                        <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
                      )
                    }
                    sx={{
                      borderRadius: '8px',
                      borderColor: '#cbd5e1',
                      color: copiedIndex === index ? '#16a34a' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.725rem',
                      textTransform: 'none',
                      px: 1.25,
                      py: 0.4,
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
                    }}
                  >
                    {copiedIndex === index ? 'Đã chép' : 'Sao chép'}
                  </Button>

                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onApplyBio(item.content)}
                    startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      borderRadius: '8px',
                      bgcolor: '#1e40af',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.725rem',
                      textTransform: 'none',
                      px: 1.5,
                      py: 0.4,
                      boxShadow: '0 2px 6px rgba(30, 64, 175, 0.25)',
                      '&:hover': { bgcolor: '#1d4ed8' },
                    }}
                  >
                    Áp dụng
                  </Button>
                </Stack>
              </Stack>

              {/* Content Body */}
              <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.775rem', lineHeight: 1.5 }}>
                  {item.content}
                </Typography>
              </Box>

              {/* Skills Chips */}
              {item.skills_list && item.skills_list.length > 0 && (
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {item.skills_list.map((skill, skIdx) => (
                    <Chip
                      key={skIdx}
                      label={skill}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        bgcolor: '#f1f5f9',
                        color: '#475569',
                        borderRadius: '6px',
                        height: 22,
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Paper>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8', fontSize: '0.8rem' }}>
            Không tìm thấy gợi ý phù hợp.
          </Box>
        )}
      </Stack>
    </Box>
  );
};
