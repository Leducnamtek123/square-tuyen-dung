'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Stack,
  Box,
  Button,
  IconButton,
  Avatar,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import VerifiedIcon from '@mui/icons-material/Verified';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BusinessIcon from '@mui/icons-material/Business';
import { CompanyQuestionSet } from '@/types/models';

interface CompanyQuestionSetModalProps {
  open: boolean;
  questionSet: CompanyQuestionSet | null;
  onClose: () => void;
  onPracticeSet?: (questionSet: CompanyQuestionSet) => void;
  isStarting?: boolean;
}

export const CompanyQuestionSetModal: React.FC<CompanyQuestionSetModalProps> = ({
  open,
  questionSet,
  onClose,
  onPracticeSet,
  isStarting = false,
}) => {
  if (!open || !questionSet) return null;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '02:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const questions = questionSet.questions || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderBottom: '1px solid #f1f5f9',
          bgcolor: '#f8fafc',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
          <Avatar
            src={questionSet.companyLogo || questionSet.company_logo || undefined}
            sx={{
              width: 52,
              height: 52,
              bgcolor: '#eff6ff',
              color: '#2563eb',
              border: '2px solid #ffffff',
              boxShadow: '0 4px 12px rgba(37,99,235,0.12)',
              fontSize: '1.25rem',
              fontWeight: 800,
            }}
          >
            {(questionSet.companyName || questionSet.company_name) ? (questionSet.companyName || questionSet.company_name)!.charAt(0).toUpperCase() : <BusinessIcon />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {questionSet.companyName || questionSet.company_name || 'Square Tuyển Dụng'}
                <VerifiedIcon sx={{ fontSize: 16, color: '#0284c7' }} />
              </Typography>
              {(questionSet.careerName || questionSet.career_name) && (
                <Chip
                  size="small"
                  label={questionSet.careerName || questionSet.career_name}
                  sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                />
              )}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5, lineHeight: 1.35 }}>
              {questionSet.name}
            </Typography>
            {questionSet.description && (
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.825rem' }}>
                {questionSet.description}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Đóng cửa sổ"
          sx={{
            borderRadius: '10px',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 3 }, pt: { xs: '20px !important', sm: '24px !important' }, bgcolor: '#ffffff' }}>
        {/* Set Metadata Strip */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            p: 2,
            mb: 3,
            borderRadius: '12px',
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                Số lượng câu hỏi:
              </Typography>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 800 }}>
                {questionSet.questionsCount ?? questionSet.questions_count ?? questions.length} câu
              </Typography>
            </Box>
            <Box sx={{ width: '1px', height: 16, bgcolor: '#cbd5e1', display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                Thời lượng hoàn thành:
              </Typography>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 800 }}>
                Khoảng {questionSet.totalDurationMinutes ?? questionSet.total_duration_minutes ?? 10} phút
              </Typography>
            </Box>
            <Box sx={{ width: '1px', height: 16, bgcolor: '#cbd5e1', display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                Cấp bậc áp dụng:
              </Typography>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 800 }}>
                {questionSet.seniority || 'Mọi cấp độ'}
              </Typography>
            </Box>
          </Box>
          <Chip
            size="small"
            label="Phỏng vấn giọng nói với AI"
            sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: '0.7rem', height: 24 }}
          />
        </Box>

        {/* Vietnamese Category Tags */}
        {(questionSet.categoryTags || questionSet.category_tags) && (questionSet.categoryTags || questionSet.category_tags)!.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', mb: 1, display: 'block' }}>
              Các nhóm năng lực được đánh giá trong bộ này:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {(questionSet.categoryTags || questionSet.category_tags)!.map((tag, idx) => (
                <Chip
                  key={idx}
                  label={tag}
                  sx={{
                    bgcolor: '#f1f5f9',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* List of Questions */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
          Danh sách câu hỏi trong bộ tuyển dụng
        </Typography>

        <Stack spacing={1.5}>
          {questions.map((q, index) => (
            <Box
              key={q.id || index}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                transition: 'all 0.15s ease',
                '&:hover': { borderColor: '#93c5fd', bgcolor: '#f8fafc' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    size="small"
                    label={`Câu ${index + 1}`}
                    sx={{ bgcolor: '#1e3a8a', color: '#ffffff', fontWeight: 800, fontSize: '0.7rem', height: 22 }}
                  />
                  <Chip
                    size="small"
                    label={q.categoryDisplay || q.category_display || q.category}
                    sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                  />
                </Box>
                <Chip
                  size="small"
                  icon={<AccessTimeIcon sx={{ fontSize: '13px !important', color: '#64748b' }} />}
                  label={formatDuration(q.defaultDurationSeconds ?? q.default_duration_seconds)}
                  sx={{ bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.7rem', height: 22 }}
                />
              </Box>

              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
                {q.text}
              </Typography>

              {(q.interviewerIntent || q.interviewer_intent) && (
                <Box sx={{ mt: 1, p: 1.25, borderRadius: '8px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem' }}>
                    <HelpOutlineIcon sx={{ fontSize: 14, color: '#0284c7' }} />
                    <Box component="span" sx={{ fontWeight: 700, color: '#1e293b' }}>Ý đồ đánh giá:</Box>
                    {q.interviewerIntent || q.interviewer_intent}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderTop: '1px solid #f1f5f9',
          bgcolor: '#f8fafc',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            borderColor: '#cbd5e1',
            color: '#475569',
            px: 2.5,
            '&:hover': { borderColor: '#94a3b8', bgcolor: '#ffffff' },
            '&:active': { transform: 'scale(0.98)' },
          }}
        >
          Đóng
        </Button>

        {onPracticeSet && (
          <Button
            variant="contained"
            disabled={isStarting}
            onClick={() => onPracticeSet(questionSet)}
            startIcon={isStarting ? <CircularProgress size={16} color="inherit" /> : <VideoCameraFrontIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              bgcolor: '#2563eb',
              px: 3,
              py: 1,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)' },
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            {isStarting ? 'Đang khởi tạo phòng phỏng vấn...' : 'Luyện tập bộ này với AI'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CompanyQuestionSetModal;
