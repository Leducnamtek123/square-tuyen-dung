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
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import { QuestionBankItem } from '@/types/models';

interface QuestionDetailModalProps {
  open: boolean;
  question: QuestionBankItem | null;
  onClose: () => void;
  onPracticeQuestion?: (question: QuestionBankItem) => void;
  isStarting?: boolean;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  open,
  question,
  onClose,
  onPracticeQuestion,
  isStarting = false,
}) => {
  if (!open || !question) return null;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '02:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getSeniorityLabel = (seniority?: string) => {
    switch (seniority) {
      case 'senior':
      case 'lead':
        return 'Senior / Quản lý';
      case 'middle':
        return 'Cấp độ Middle';
      default:
        return 'Cấp độ Junior và Fresher';
    }
  };

  const steps = question.answer_structure?.steps || [];
  const tips = question.important_tips || [];
  const followUps = question.follow_up_questions || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Box sx={{ pr: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
            <Chip
              size="small"
              label={getSeniorityLabel(question.seniority)}
              sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, fontSize: '0.75rem' }}
            />
            {question.career_name && (
              <Chip
                size="small"
                label={question.career_name}
                sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.75rem' }}
              />
            )}
            {question.category && (
              <Chip
                size="small"
                label={question.category_display || question.category}
                sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.75rem' }}
              />
            )}
            <Chip
              size="small"
              icon={<AccessTimeIcon sx={{ fontSize: '14px !important', color: '#64748b' }} />}
              label={`Thời lượng gợi ý: ${formatDuration(question.default_duration_seconds)}`}
              sx={{ bgcolor: '#f8fafc', color: '#64748b', fontSize: '0.75rem' }}
            />
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }}>
            {question.question_text || question.text}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: '24px !important', bgcolor: '#ffffff' }}>
        <Stack spacing={3}>
          {/* Ý đồ của nhà tuyển dụng */}
          {question.interviewer_intent && (
            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                bgcolor: '#eff6ff',
                border: '1px solid #bfdbfe',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1d4ed8', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyOutlinedIcon sx={{ fontSize: 20 }} />
                Ý đồ &amp; Trọng tâm nhà tuyển dụng muốn đánh giá
              </Typography>
              <Typography variant="body2" sx={{ color: '#1e3a8a', lineHeight: 1.6 }}>
                {question.interviewer_intent}
              </Typography>
            </Box>
          )}

          {/* Dàn ý trả lời theo chuẩn STAR */}
          {steps.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 20, color: '#2563eb' }} />
                Dàn ý trả lời đề xuất theo khung chuẩn STAR
              </Typography>
              <Stack spacing={1.5}>
                {steps.map((step, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      bgcolor: '#f8fafc',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Bước {step.step || idx + 1}: {step.title || `Bước ${idx + 1}`}
                    </Typography>
                    {(step.guidance || step.detail) && (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mt: 0.25, mb: 0.5 }}>
                        {step.guidance || step.detail}
                      </Typography>
                    )}
                    {step.detail && step.guidance && (
                      <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic', display: 'block', bgcolor: '#ffffff', p: 1, borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                        Chi tiết: {step.detail}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Mẹo ứng xử & Điểm cộng */}
          {tips.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbOutlinedIcon sx={{ fontSize: 20, color: '#d97706' }} />
                Mẹo ghi điểm &amp; Bẫy cần tránh
              </Typography>
              <Stack spacing={1}>
                {tips.map((tip, idx) => {
                  const tipText = typeof tip === 'string' ? tip : (tip?.text || tip?.content || '');
                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: '8px',
                        bgcolor: '#fffbeb',
                        border: '1px solid #fde68a',
                      }}
                    >
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#d97706', mt: 1, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: '#92400e', lineHeight: 1.5 }}>
                        {tipText}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Câu hỏi đào sâu tiếp theo */}
          {followUps.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HelpOutlineIcon sx={{ fontSize: 20, color: '#64748b' }} />
                Câu hỏi phỏng vấn đào sâu có thể gặp (Follow-up)
              </Typography>
              <Stack spacing={1}>
                {followUps.map((fu, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      borderRadius: '8px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#334155' }}>
                      &bull; {fu}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, px: 3, bgcolor: '#ffffff', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, color: '#64748b', borderColor: '#cbd5e1' }}
        >
          Đóng
        </Button>
        {onPracticeQuestion && (
          <Button
            variant="contained"
            disabled={isStarting}
            onClick={() => onPracticeQuestion(question)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#2563eb',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              px: 3,
              '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)' },
            }}
          >
            Luyện câu này trong phòng AI
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QuestionDetailModal;
