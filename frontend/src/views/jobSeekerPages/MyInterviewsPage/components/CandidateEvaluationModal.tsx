'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Typography,
  LinearProgress,
  Chip,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Paper,
  Alert,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import type { InterviewSession } from '@/types/models';
import interviewService from '@/services/interviewService';
import { transformInterviewSession } from '@/utils/transformers';
import CompetencyRadarChart, { RadarDimension } from '@/views/interviewPages/components/CompetencyRadarChart';

interface CandidateEvaluationModalProps {
  session: InterviewSession | null;
  onClose: () => void;
  practicePath?: string;
}

const getRatingBadge = (score: number) => {
  if (score >= 8.0) return { label: 'Xuất sắc', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
  if (score >= 6.5) return { label: 'Khá / Đạt yêu cầu', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' };
  if (score >= 5.0) return { label: 'Trung bình', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  return { label: 'Cần cải thiện', color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' };
};

export const CandidateEvaluationModal: React.FC<CandidateEvaluationModalProps> = ({
  session: initialSession,
  onClose,
  practicePath = '/ung-vien/phong-van-thu',
}) => {
  const [session, setSession] = useState<InterviewSession | null>(initialSession);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSession(initialSession);
    if (!initialSession) return;

    // If initial session lacks detailed feedback, fetch full detail
    const hasFullDetail =
      initialSession.aiTechnicalScore != null ||
      initialSession.aiCommunicationScore != null ||
      Boolean(initialSession.aiStrengths) ||
      Boolean(initialSession.aiWeaknesses);

    if (!hasFullDetail && (initialSession.id || initialSession.inviteToken)) {
      setLoading(true);
      const fetchPromise = initialSession.id
        ? interviewService.getSessionDetail(initialSession.id)
        : interviewService.getSessionDetailByInviteToken(initialSession.inviteToken!);

      fetchPromise
        .then((data) => {
          const transformed = transformInterviewSession(data);
          if (transformed) setSession(transformed);
        })
        .catch((err) => {
          console.warn('[CandidateEvaluationModal] Could not fetch detailed session:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [initialSession]);

  if (!initialSession) return null;

  const currentSession = session || initialSession;
  const overallScore = currentSession.aiOverallScore ?? currentSession.ai_overall_score;
  const numOverallScore = overallScore != null ? Number(overallScore) : null;
  const technicalScore = currentSession.aiTechnicalScore != null ? Number(currentSession.aiTechnicalScore) : null;
  const communicationScore = currentSession.aiCommunicationScore != null ? Number(currentSession.aiCommunicationScore) : null;
  const rating = numOverallScore != null ? getRatingBadge(numOverallScore) : null;

  const strengthsList: string[] = Array.isArray(currentSession.aiStrengths)
    ? currentSession.aiStrengths
    : typeof currentSession.aiStrengths === 'string' && currentSession.aiStrengths.trim()
    ? [currentSession.aiStrengths]
    : [];

  const weaknessesList: string[] = Array.isArray(currentSession.aiWeaknesses)
    ? currentSession.aiWeaknesses
    : typeof currentSession.aiWeaknesses === 'string' && currentSession.aiWeaknesses.trim()
    ? [currentSession.aiWeaknesses]
    : [];

  const detailedFeedback = currentSession.aiDetailedFeedback as any;
  const questionPerformance: Array<{ question: string; feedback: string; score: number }> =
    Array.isArray(detailedFeedback?.question_performance) ? detailedFeedback.question_performance : [];

  const isMock =
    currentSession.sessionType === 'mock' ||
    (currentSession as any).type === 'practice' ||
    (!currentSession.jobPost && !currentSession.companyName);

  const hasScores = numOverallScore != null || technicalScore != null || communicationScore != null;
  const isZeroDataSession =
    !hasScores &&
    (currentSession.aiSummary?.includes('Chưa có dữ liệu') ||
      currentSession.aiSummary?.includes('chưa ghi nhận') ||
      !currentSession.aiSummary);

  const score100 = numOverallScore != null ? Math.round(numOverallScore <= 10 ? numOverallScore * 10 : numOverallScore) : 0;
  const techScore100 = technicalScore != null ? Math.round(technicalScore <= 10 ? technicalScore * 10 : technicalScore) : score100;
  const commScore100 = communicationScore != null ? Math.round(communicationScore <= 10 ? communicationScore * 10 : communicationScore) : score100;
  const softSkills = detailedFeedback?.soft_skills;
  const confidenceScore = softSkills?.confidence != null ? Math.round(Number(softSkills.confidence) * 10) : Math.round(score100 * 0.95);
  const clarityScore = softSkills?.clarity != null ? Math.round(Number(softSkills.clarity) * 10) : commScore100;
  const relevanceScore = Math.round((techScore100 + score100) / 2);

  const radarDimensions: RadarDimension[] = [
    { key: 'content', label: 'Nội dung', value: techScore100 },
    { key: 'clarity', label: 'Rõ ràng', value: clarityScore },
    { key: 'relevance', label: 'Liên quan', value: relevanceScore },
    { key: 'confidence', label: 'Tự tin', value: confidenceScore },
  ];

  return (
    <Dialog
      open={Boolean(initialSession)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          p: { xs: 2, sm: 2.5 },
          bgcolor: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ pr: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Chip
              size="small"
              icon={
                isMock ? (
                  <SmartToyOutlinedIcon sx={{ fontSize: '13px !important', color: '#1d4ed8 !important' }} />
                ) : (
                  <ApartmentOutlinedIcon sx={{ fontSize: '13px !important', color: '#1d4ed8 !important' }} />
                )
              }
              label={isMock ? 'Đánh giá Luyện tập AI' : 'Kết quả Phỏng vấn Chính thức'}
              sx={{
                bgcolor: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #bfdbfe',
                height: 24,
              }}
            />
            <Chip
              size="small"
              icon={
                isMock ? (
                  <LockOutlinedIcon sx={{ fontSize: '12px !important', color: '#047857 !important' }} />
                ) : (
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: '13px !important', color: '#065f46 !important' }} />
                )
              }
              label={isMock ? 'Dữ liệu riêng tư' : 'Đã hoàn thành'}
              sx={{
                bgcolor: '#ecfdf5',
                color: '#065f46',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid #a7f3d0',
                height: 24,
              }}
            />
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
            {currentSession.jobName || (isMock ? 'Luyện tập kỹ năng phỏng vấn' : 'Buổi phỏng vấn tuyển dụng')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isMock ? (
              <>
                <SmartToyOutlinedIcon sx={{ fontSize: 15, color: '#2563eb' }} />
                <span>Trợ lý AI Ly · Huấn luyện viên phỏng vấn cá nhân</span>
              </>
            ) : (
              <>
                <ApartmentOutlinedIcon sx={{ fontSize: 15, color: '#2563eb' }} />
                <span>{currentSession.companyName || 'Nhà tuyển dụng InfoHR'}</span>
              </>
            )}
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          aria-label="close"
          sx={{
            color: '#64748b',
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
          }}
        >
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Modal Body */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: { xs: '20px !important', sm: '24px !important' }, bgcolor: '#f8fafc' }}>
        {loading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={36} sx={{ color: '#2563eb', mb: 2 }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Đang tải kết quả và phân tích chi tiết...
            </Typography>
          </Box>
        ) : isZeroDataSession ? (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: '16px',
              border: '1px solid',
              borderColor: '#bfdbfe',
              bgcolor: '#ffffff',
              textAlign: 'center',
              boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '16px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Chưa có dữ liệu phân tích hội thoại
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', maxWidth: 520, mx: 'auto', lineHeight: 1.6, mb: 3 }}>
              {currentSession.aiSummary ||
                'Buổi phỏng vấn này chưa ghi nhận được tín hiệu giọng nói hoặc đã kết thúc trước khi hoàn tất câu hỏi. Bạn có thể bấm "Luyện tập lại" để bắt đầu một buổi phỏng vấn mới đầy đủ hơn.'}
            </Typography>
            {isMock && (
              <Button
                component={Link}
                href={practicePath}
                variant="contained"
                startIcon={<ReplayRoundedIcon />}
                onClick={onClose}
                sx={{
                  borderRadius: '10px',
                  bgcolor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  px: 3.5,
                  py: 1,
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  '&:hover': { bgcolor: '#1d4ed8' },
                }}
              >
                Bắt đầu luyện tập lại phiên mới
              </Button>
            )}
          </Paper>
        ) : (
          <Stack spacing={2.5}>
            {/* Top Scorecard Bento Grid */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 2, sm: 3 }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
              >
                {/* Left: Overall Score with Guaranteed White Typography Contrast */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box
                    sx={{
                      width: { xs: 68, sm: 78 },
                      height: { xs: 68, sm: 78 },
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.35)',
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                        color: '#ffffff !important',
                      }}
                    >
                      {numOverallScore != null ? numOverallScore : '-'}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        opacity: 0.9,
                        color: '#ffffff !important',
                      }}
                    >
                      /10
                    </Typography>
                  </Box>

                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Điểm Tổng Quát
                      </Typography>
                      {rating && (
                        <Chip
                          size="small"
                          label={rating.label}
                          sx={{
                            bgcolor: rating.bg,
                            color: rating.color,
                            border: `1px solid ${rating.border}`,
                            fontWeight: 800,
                            fontSize: '0.6875rem',
                            height: 20,
                          }}
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                      {isMock
                        ? 'Được đánh giá tự động bởi Trợ lý Phỏng vấn AI Ly'
                        : 'Được đánh giá tự động bởi Trợ lý Tuyển dụng AI'}
                    </Typography>
                  </Box>
                </Box>

                {/* Right: Sub-scores Bars */}
                <Box sx={{ minWidth: { sm: 260 }, flex: { sm: 1 }, maxWidth: { sm: 340 } }}>
                  <Stack spacing={1.5}>
                    {/* Technical Score */}
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PsychologyOutlinedIcon sx={{ fontSize: 15, color: '#2563eb' }} />
                          Chuyên môn & Kiến thức
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563eb' }}>
                          {technicalScore != null ? `${technicalScore}/10` : 'Chưa có điểm'}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={technicalScore != null ? technicalScore * 10 : 0}
                        sx={{
                          height: 7,
                          borderRadius: 2,
                          bgcolor: '#eff6ff',
                          '& .MuiLinearProgress-bar': { bgcolor: '#2563eb', borderRadius: 2 },
                        }}
                      />
                    </Box>

                    {/* Communication Score */}
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <RecordVoiceOverOutlinedIcon sx={{ fontSize: 15, color: '#0284c7' }} />
                          Kỹ năng giao tiếp & Ứng xử
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#0284c7' }}>
                          {communicationScore != null ? `${communicationScore}/10` : 'Chưa có điểm'}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={communicationScore != null ? communicationScore * 10 : 0}
                        sx={{
                          height: 7,
                          borderRadius: 2,
                          bgcolor: '#f0f9ff',
                          '& .MuiLinearProgress-bar': { bgcolor: '#0284c7', borderRadius: 2 },
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* Competency Radar Overview Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                  Tổng quan năng lực phỏng vấn
                </Typography>
                <Chip
                  label="Thang điểm 0 - 100"
                  size="small"
                  sx={{ fontWeight: 700, fontSize: '0.6875rem', height: 22, bgcolor: '#f1f5f9', color: '#475569' }}
                />
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <CompetencyRadarChart dimensions={radarDimensions} size={280} accentColor="#2563eb" />
              </Box>
            </Paper>

            {/* AI Summary Card */}
            {currentSession.aiSummary && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #2563eb',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                  Nhận xét tổng quát từ AI
                </Typography>
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {currentSession.aiSummary}
                </Typography>
              </Paper>
            )}

            {/* Strengths & Weaknesses Split Columns */}
            {(strengthsList.length > 0 || weaknessesList.length > 0) && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {/* Strengths */}
                {strengthsList.length > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.25,
                      borderRadius: '16px',
                      bgcolor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                      Điểm mạnh nổi bật
                    </Typography>
                    <Stack spacing={1}>
                      {strengthsList.map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16a34a', mt: 0.8, flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ color: '#14532d', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                )}

                {/* Weaknesses / Improvements */}
                {weaknessesList.length > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.25,
                      borderRadius: '16px',
                      bgcolor: '#fffbeb',
                      border: '1px solid #fde68a',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400e', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <LightbulbOutlinedIcon sx={{ fontSize: 18, color: '#d97706' }} />
                      Gợi ý cải thiện
                    </Typography>
                    <Stack spacing={1}>
                      {weaknessesList.map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#d97706', mt: 0.8, flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ color: '#78350f', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                )}
              </Box>
            )}

            {/* Question Performance List */}
            {questionPerformance.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QuizOutlinedIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                  Đánh giá chi tiết từng câu hỏi ({questionPerformance.length})
                </Typography>
                <Stack spacing={1.75}>
                  {questionPerformance.map((q, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.75,
                        borderRadius: '12px',
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          Câu {idx + 1}: {q.question}
                        </Typography>
                        {q.score != null && (
                          <Chip
                            size="small"
                            icon={<StarRoundedIcon sx={{ fontSize: '13px !important', color: '#eab308 !important' }} />}
                            label={`${q.score}/10`}
                            sx={{
                              bgcolor: '#fefce8',
                              color: '#854d0e',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              border: '1px solid #fef08a',
                              height: 22,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                        {q.feedback}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        )}
      </DialogContent>

      {/* Modal Actions */}
      <DialogActions
        sx={{
          p: { xs: 2, sm: 2.5 },
          bgcolor: '#ffffff',
          borderTop: '1px solid #f1f5f9',
          justifyContent: 'space-between',
        }}
      >
        {isMock ? (
          <Button
            component={Link}
            href={practicePath}
            variant="outlined"
            startIcon={<ReplayRoundedIcon />}
            onClick={onClose}
            sx={{
              borderRadius: '10px',
              borderColor: '#cbd5e1',
              color: '#475569',
              fontWeight: 700,
              textTransform: 'none',
              px: 2.5,
              py: 0.9,
              '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' },
            }}
          >
            Luyện tập lại
          </Button>
        ) : (
          <Box />
        )}

        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            bgcolor: '#2563eb',
            color: '#ffffff',
            fontWeight: 700,
            textTransform: 'none',
            px: 3,
            py: 0.9,
            boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
            '&:hover': { bgcolor: '#1d4ed8' },
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CandidateEvaluationModal;
