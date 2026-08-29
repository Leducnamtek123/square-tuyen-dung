'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';

import { CVData, AICvReviewResult } from '@/types/cvBuilder';
import cvBuilderService from '@/services/cvBuilderService';
import toastMessages from '@/utils/toastMessages';

interface AICvScoreTabProps {
  data: CVData;
  candidateCvId?: number | string | null;
  onUpdate: (data: CVData) => void;
}

export const AICvScoreTab: React.FC<AICvScoreTabProps> = ({ data, candidateCvId, onUpdate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState<AICvReviewResult | null>(null);

  const handleRunAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      if (candidateCvId) {
        const res = await cvBuilderService.reviewCvWithAI(candidateCvId);
        setReviewResult(res);
        toastMessages.success(`AI đã chấm điểm thành công: ${res.score}/100 điểm (${res.grade})`);
      } else {
        // Fallback local ATS analysis if not yet saved on server
        const personalInfo = data.personalInfo || {};
        const experiences = data.experiences || [];
        const skills = data.skills || [];
        const educations = data.educations || [];

        let score = 40;
        if (personalInfo.fullName && personalInfo.email && personalInfo.phoneNumber) score += 20;
        if (experiences.length >= 1) score += 15;
        if (experiences.length >= 2) score += 10;
        if (skills.length >= 4) score += 10;
        if (educations.length >= 1) score += 5;

        setReviewResult({
          score: Math.min(score, 100),
          grade: score >= 85 ? 'Xuất sắc (Chuẩn ATS)' : score >= 70 ? 'Tốt (Khá hoàn thiện)' : 'Cần cải thiện',
          badge_color: score >= 85 ? 'emerald' : score >= 70 ? 'blue' : 'amber',
          summary_feedback:
            'Hồ sơ của bạn đã có các thành phần cơ bản. Hãy lưu lại CV lên hệ thống để AI quét sâu toàn diện hơn.',
          breakdown: {
            contact: { score: personalInfo.fullName ? 18 : 10, max: 20, label: 'Thông tin liên hệ' },
            experience: { score: experiences.length > 0 ? 22 : 10, max: 30, label: 'Kinh nghiệm & Thành tích' },
            skills: { score: skills.length >= 4 ? 18 : 12, max: 20, label: 'Kỹ năng chuyên môn' },
            education: { score: educations.length > 0 ? 14 : 8, max: 15, label: 'Học vấn & Bằng cấp' },
            structure: { score: 12, max: 15, label: 'Bố cục & Độ hoàn thiện' },
          },
          strengths: [
            'Thông tin cơ bản được bố cục rõ ràng',
            'Đã có danh mục kỹ năng và kinh nghiệm tương đối',
          ],
          suggestions: [
            {
              category: 'Kinh nghiệm',
              priority: 'high',
              title: 'Thêm số liệu định lượng (%, KPI)',
              detail: 'Bổ sung các con số cụ thể vào mô tả công việc để tăng tỷ lệ phản hồi từ NTD.',
              example: '• Tăng trưởng doanh thu 30%, tối ưu hóa quy trình giúp tiết kiệm 15 giờ/tuần.',
            },
            {
              category: 'Kỹ năng',
              priority: 'medium',
              title: 'Bổ sung thêm 2-3 kỹ năng chuyên sâu',
              detail: 'Các hệ thống ATS đối chiếu từ khóa kỹ năng với bản tin tuyển dụng của công ty.',
              example: 'Ví dụ: Docker, CI/CD, TypeScript, Agile/Scrum...',
            },
          ],
        });
        toastMessages.success(`Phân tích sơ bộ hoàn tất: ${score}/100 điểm`);
      }
    } catch (err: any) {
      toastMessages.error(err?.response?.data?.errors?.detail || 'Không thể chấm điểm CV với AI lúc này. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '16px',
          bgcolor: '#1e40af',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ maxWidth: 320 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 18, color: '#93c5fd' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.875rem' }}>
              Trợ Lý AI Chấm Điểm ATS
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: '#bfdbfe', fontSize: '0.75rem', lineHeight: 1.4 }}>
            Quét và đánh giá độ tương thích của CV theo tiêu chuẩn lọc tự động ATS của các nhà tuyển dụng.
          </Typography>
        </Box>

        <Button
          variant="contained"
          disabled={isAnalyzing}
          onClick={handleRunAnalysis}
          startIcon={<RefreshIcon sx={{ fontSize: 16, animation: isAnalyzing ? 'spin 1s linear infinite' : 'none' }} />}
          sx={{
            bgcolor: '#ffffff',
            color: '#1e40af',
            fontWeight: 800,
            fontSize: '0.75rem',
            borderRadius: '10px',
            textTransform: 'none',
            px: 2,
            py: 0.75,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': { bgcolor: '#f8fafc', color: '#1d4ed8' },
          }}
        >
          {isAnalyzing ? 'Đang chấm điểm...' : reviewResult ? 'Chấm điểm lại' : 'Bắt đầu chấm điểm'}
        </Button>
      </Paper>

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {!reviewResult && !isAnalyzing && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '16px',
            border: '1px dashed #cbd5e1',
            bgcolor: '#ffffff',
            textAlign: 'center',
          }}
        >
          <TrackChangesOutlinedIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
            Chưa có kết quả phân tích
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.775rem', mt: 0.5, maxWidth: 360, mx: 'auto' }}>
            Bấm nút <strong>&quot;Bắt đầu chấm điểm&quot;</strong> ở trên để nhận báo cáo điểm số ATS và danh sách các gợi ý cải thiện.
          </Typography>
        </Paper>
      )}

      {/* ── Review Result ───────────────────────────────────────────────── */}
      {reviewResult && (
        <Stack spacing={2.5}>
          {/* Main Score Overview Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: reviewResult.score >= 80 ? '#f0fdf4' : '#eff6ff',
                  border: `3px solid ${reviewResult.score >= 80 ? '#22c55e' : '#2563eb'}`,
                  color: reviewResult.score >= 80 ? '#15803d' : '#1d4ed8',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                }}
              >
                {reviewResult.score}
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                  Xếp loại: {reviewResult.grade}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                  {reviewResult.summary_feedback}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Breakdown Categories */}
          {reviewResult.breakdown && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', mb: 2 }}>
                Chi tiết tiêu chí đánh giá
              </Typography>

              <Stack spacing={1.75}>
                {Object.entries(reviewResult.breakdown).map(([key, item]: [string, any]) => (
                  <Box key={key}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.75rem' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563eb', fontSize: '0.75rem' }}>
                        {item.score}/{item.max} điểm
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(item.score / item.max) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': { bgcolor: '#2563eb', borderRadius: 3 },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}

          {/* Suggestions List */}
          {reviewResult.suggestions && reviewResult.suggestions.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', mb: 1.5 }}>
                Đề xuất cải thiện để đạt điểm tối đa
              </Typography>

              <Stack spacing={1.5}>
                {reviewResult.suggestions.map((sug, sIdx) => (
                  <Box
                    key={sIdx}
                    sx={{
                      p: 1.5,
                      bgcolor: '#f8fafc',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <WarningAmberOutlinedIcon sx={{ fontSize: 16, color: '#d97706' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.8rem' }}>
                        {sug.title}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.75rem', mb: 0.5 }}>
                      {sug.detail}
                    </Typography>
                    {sug.example && (
                      <Typography variant="caption" sx={{ color: '#2563eb', fontStyle: 'italic', fontSize: '0.725rem' }}>
                        {sug.example}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}
        </Stack>
      )}
    </Box>
  );
};
