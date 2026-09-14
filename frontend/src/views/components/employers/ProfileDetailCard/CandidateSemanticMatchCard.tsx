'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import RefreshIcon from '@mui/icons-material/Refresh';

import jobService from '@/services/jobService';
import resumeService, { type SemanticMatchResponse } from '@/services/resumeService';
import type { JobPost, ResumeDetailResponse } from '@/types/models';

interface CandidateSemanticMatchCardProps {
  profileDetail: ResumeDetailResponse;
  onScheduleInterview?: () => void;
}

const getFitLevelStyle = (score: number) => {
  if (score >= 85) {
    return {
      label: 'Xuất sắc',
      color: '#15803D',
      bgcolor: '#DCFCE7',
      borderColor: '#86EFAC',
      progressColor: '#16A34A',
    };
  }
  if (score >= 70) {
    return {
      label: 'Rất phù hợp',
      color: '#1D4ED8',
      bgcolor: '#DBEAFE',
      borderColor: '#93C5FD',
      progressColor: '#2563EB',
    };
  }
  if (score >= 55) {
    return {
      label: 'Tương thích khá',
      color: '#B45309',
      bgcolor: '#FEF3C7',
      borderColor: '#FCD34D',
      progressColor: '#D97706',
    };
  }
  return {
    label: 'Cần xem xét thêm',
    color: '#B91C1C',
    bgcolor: '#FEE2E2',
    borderColor: '#FCA5A5',
    progressColor: '#DC2626',
  };
};

interface NormalizedMatchResult {
  semanticScore: number;
  fitLevel: string;
  matchedSkills: string[];
  missingSkills: string[];
  dimensionScores: {
    skillsOverlap: number;
    experienceFit: number;
    domainRelevance: number;
    educationFit: number;
  };
  aiRecommendation: string;
  resumeId?: number | null;
  jobPostId?: number | null;
  jobName?: string | null;
}

const normalizeSemanticResult = (raw: any): NormalizedMatchResult => {
  const ds = raw?.dimensionScores || raw?.dimension_scores || {};
  return {
    semanticScore: Number(raw?.semanticScore ?? raw?.semantic_score ?? 0),
    fitLevel: String(raw?.fitLevel ?? raw?.fit_level ?? ''),
    matchedSkills: Array.isArray(raw?.matchedSkills)
      ? raw.matchedSkills
      : Array.isArray(raw?.matched_skills)
        ? raw.matched_skills
        : [],
    missingSkills: Array.isArray(raw?.missingSkills)
      ? raw.missingSkills
      : Array.isArray(raw?.missing_skills)
        ? raw.missing_skills
        : [],
    dimensionScores: {
      skillsOverlap: Number(ds.skillsOverlap ?? ds.skills_overlap ?? 0),
      experienceFit: Number(ds.experienceFit ?? ds.experience_fit ?? 0),
      domainRelevance: Number(ds.domainRelevance ?? ds.domain_relevance ?? 0),
      educationFit: Number(ds.educationFit ?? ds.education_fit ?? 0),
    },
    aiRecommendation: String(raw?.aiRecommendation ?? raw?.ai_recommendation ?? ''),
    resumeId: raw?.resumeId ?? raw?.resume_id,
    jobPostId: raw?.jobPostId ?? raw?.job_post_id,
    jobName: raw?.jobName ?? raw?.job_name ?? '',
  };
};

export const CandidateSemanticMatchCard: React.FC<CandidateSemanticMatchCardProps> = ({
  profileDetail,
  onScheduleInterview,
}) => {
  const theme = useTheme();
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [selectedJobPost, setSelectedJobPost] = useState<number | ''>('');
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [matchResult, setMatchResult] = useState<NormalizedMatchResult | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [customJdText, setCustomJdText] = useState('');

  // Load employer job posts
  useEffect(() => {
    let active = true;
    setLoadingJobs(true);
    jobService
      .getEmployerJobPost({ pageSize: 50 })
      .then((res) => {
        if (!active) return;
        const list = res?.results || [];
        setJobPosts(list);
        if (list.length > 0) {
          setSelectedJobPost(list[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load employer jobs for semantic match:', err);
      })
      .finally(() => {
        if (active) setLoadingJobs(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const runSemanticMatch = useCallback(
    async (jobId?: number | '', jdText?: string) => {
      if (!profileDetail.slug) return;
      setLoadingMatch(true);
      try {
        const res = await resumeService.getSemanticMatch(profileDetail.slug, {
          jobPostId: jobId || undefined,
          jdText: jdText || undefined,
        });
        if (res) {
          setMatchResult(normalizeSemanticResult(res));
        }
      } catch (err) {
        console.error('Failed to run semantic match:', err);
      } finally {
        setLoadingMatch(false);
      }
    },
    [profileDetail.slug]
  );

  useEffect(() => {
    if (selectedJobPost && !customMode) {
      runSemanticMatch(selectedJobPost);
    }
  }, [selectedJobPost, customMode, runSemanticMatch]);

  const fitStyle = getFitLevelStyle(matchResult?.semanticScore || 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 4,
        bgcolor: '#FFFFFF',
        border: '1px solid',
        borderColor: '#E2E8F0',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 320,
          height: 180,
          background: 'radial-gradient(circle at top right, rgba(124, 58, 237, 0.07), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.75}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: alpha('#7C3AED', 0.1),
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.12)',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
              Đối sánh ngữ nghĩa thông minh giữa CV và JD
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
              Phân tích độ phù hợp đa chiều bằng trí tuệ nhân tạo AILA
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="text"
            onClick={() => setCustomMode(!customMode)}
            sx={{
              textTransform: 'none',
              fontWeight: 650,
              fontSize: '0.78rem',
              color: '#64748B',
            }}
          >
            {customMode ? 'Chọn tin tuyển dụng có sẵn' : 'Nhập văn bản JD tùy chỉnh'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => runSemanticMatch(selectedJobPost, customMode ? customJdText : undefined)}
            disabled={loadingMatch}
            startIcon={loadingMatch ? <CircularProgress size={14} /> : <RefreshIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderColor: '#CBD5E1',
              color: '#334155',
            }}
          >
            Phân tích lại
          </Button>
        </Stack>
      </Stack>

      {/* Selector / Custom JD input */}
      <Box sx={{ mb: 3 }}>
        {!customMode ? (
          <TextField
            select
            label="Tin tuyển dụng đối sánh *"
            size="small"
            fullWidth
            value={selectedJobPost}
            onChange={(e) => setSelectedJobPost(Number(e.target.value))}
            disabled={loadingJobs || jobPosts.length === 0}
            helperText="Chọn tin tuyển dụng để hệ thống đối chiếu kỹ năng và kinh nghiệm của ứng viên"
            sx={{
              bgcolor: '#F8FAFC',
              borderRadius: '8px',
              '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            }}
          >
            {jobPosts.map((job) => (
              <MenuItem key={job.id} value={job.id}>
                {job.jobName}
              </MenuItem>
            ))}
            {jobPosts.length === 0 && (
              <MenuItem value="" disabled>
                {loadingJobs ? 'Đang tải danh sách tin tuyển dụng...' : 'Chưa có tin tuyển dụng nào'}
              </MenuItem>
            )}
          </TextField>
        ) : (
          <Stack spacing={1.5}>
            <TextField
              label="Mô tả công việc JD tùy chỉnh *"
              size="small"
              fullWidth
              multiline
              rows={3}
              placeholder="Dán nội dung yêu cầu công việc, kỹ năng, thâm niên và học vấn để đối sánh..."
              value={customJdText}
              onChange={(e) => setCustomJdText(e.target.value)}
              sx={{
                bgcolor: '#F8FAFC',
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': { borderRadius: '8px' },
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => runSemanticMatch(undefined, customJdText)}
              disabled={loadingMatch || !customJdText.trim()}
              sx={{
                alignSelf: 'flex-start',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                bgcolor: '#7C3AED',
                '&:hover': { bgcolor: '#6D28D9' },
              }}
            >
              Tiến hành đối sánh
            </Button>
          </Stack>
        )}
      </Box>

      {/* Analysis Results */}
      {loadingMatch ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, gap: 1.5 }}>
          <CircularProgress size={36} sx={{ color: '#7C3AED' }} />
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
            Trí tuệ nhân tạo AILA đang đối sánh hồ sơ ứng viên với mô tả công việc...
          </Typography>
        </Box>
      ) : matchResult ? (
        <Stack spacing={3}>
          {/* Top Score Banner */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2.5,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2.5}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '2px solid',
                  borderColor: fitStyle.borderColor,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
                  flexShrink: 0,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 900, color: fitStyle.color, lineHeight: 1 }}>
                  {matchResult.semanticScore}%
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: '#64748B', mt: 0.25 }}>
                  Tương thích
                </Typography>
              </Box>

              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Mức độ phù hợp:
                  </Typography>
                  <Chip
                    label={fitStyle.label}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      color: fitStyle.color,
                      bgcolor: fitStyle.bgcolor,
                      border: '1px solid',
                      borderColor: fitStyle.borderColor,
                      borderRadius: '6px',
                    }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.85rem' }}>
                  {matchResult.jobName ? `Đối chiếu theo vị trí: ${matchResult.jobName}` : 'Đối chiếu theo mô tả tùy chỉnh'}
                </Typography>
              </Box>
            </Stack>

            {onScheduleInterview && (
              <Button
                variant="contained"
                size="small"
                onClick={onScheduleInterview}
                startIcon={<WorkOutlineIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 750,
                  fontSize: '0.8125rem',
                  bgcolor: '#2563EB',
                  px: 2.5,
                  py: 1,
                  '&:hover': { bgcolor: '#1D4ED8' },
                  alignSelf: { xs: 'stretch', md: 'center' },
                }}
              >
                Lên lịch phỏng vấn vị trí này
              </Button>
            )}
          </Box>

          {/* 4 Dimensions Breakdown */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.75 }}>
              Chi tiết 4 chiều đánh giá tương thích
            </Typography>
            <Stack spacing={1.75}>
              {/* 1. Skills Overlap */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PsychologyIcon sx={{ fontSize: 18, color: '#7C3AED' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      Kỹ năng chuyên môn
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {matchResult.dimensionScores.skillsOverlap}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={matchResult.dimensionScores.skillsOverlap}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': { bgcolor: '#7C3AED', borderRadius: 4 },
                  }}
                />
              </Box>

              {/* 2. Experience Fit */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <HistoryEduIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      Kinh nghiệm thực tế
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {matchResult.dimensionScores.experienceFit}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={matchResult.dimensionScores.experienceFit}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': { bgcolor: '#2563EB', borderRadius: 4 },
                  }}
                />
              </Box>

              {/* 3. Domain Relevance */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <WorkOutlineIcon sx={{ fontSize: 18, color: '#059669' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      Chuyên ngành đào tạo và lĩnh vực
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {matchResult.dimensionScores.domainRelevance}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={matchResult.dimensionScores.domainRelevance}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': { bgcolor: '#059669', borderRadius: 4 },
                  }}
                />
              </Box>

              {/* 4. Education Fit */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SchoolIcon sx={{ fontSize: 18, color: '#D97706' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      Bằng cấp học vấn
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {matchResult.dimensionScores.educationFit}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={matchResult.dimensionScores.educationFit}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': { bgcolor: '#D97706', borderRadius: 4 },
                  }}
                />
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: '#E2E8F0' }} />

          {/* Matched & Missing Skills */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
            {/* Matched Skills */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: '#F0FDF4',
                border: '1px solid #BBF7D0',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '0.85rem' }}>
                  Kỹ năng đã đáp ứng
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {matchResult.matchedSkills.length > 0 ? (
                  matchResult.matchedSkills.map((skill, idx) => (
                    <Chip
                      key={`matched-${idx}`}
                      label={skill}
                      size="small"
                      sx={{
                        bgcolor: '#FFFFFF',
                        color: '#15803D',
                        border: '1px solid #86EFAC',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: '#4B5563', fontStyle: 'italic' }}>
                    Chưa phát hiện kỹ năng tương thích rõ rệt
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Missing Skills */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: '#FEF2F2',
                border: '1px solid #FECACA',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <HelpOutlineIcon sx={{ fontSize: 18, color: '#DC2626' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991B1B', fontSize: '0.85rem' }}>
                  Kỹ năng cần kiểm tra thêm
                </Typography>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {matchResult.missingSkills.length > 0 ? (
                  matchResult.missingSkills.map((skill, idx) => (
                    <Chip
                      key={`missing-${idx}`}
                      label={skill}
                      size="small"
                      sx={{
                        bgcolor: '#FFFFFF',
                        color: '#B91C1C',
                        border: '1px solid #FCA5A5',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: '#4B5563', fontStyle: 'italic' }}>
                    Ứng viên đáp ứng đầy đủ kỹ năng then chốt của vị trí
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* AI Recommendation Quote Box */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: alpha('#7C3AED', 0.04),
              border: '1px solid',
              borderColor: alpha('#7C3AED', 0.2),
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.75,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#7C3AED',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.25,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Khuyến nghị chiến lược từ AI AILA
              </Typography>
              <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, mt: 0.5, lineHeight: 1.6 }}>
                {matchResult.aiRecommendation}
              </Typography>
            </Box>
          </Box>
        </Stack>
      ) : (
        <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
            Vui lòng chọn tin tuyển dụng hoặc dán mô tả công việc để bắt đầu đối sánh ngữ nghĩa thông minh.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CandidateSemanticMatchCard;
