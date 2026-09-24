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
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

import { CVData, AICvReviewResult } from '@/types/cvBuilder';
import cvBuilderService from '@/services/cvBuilderService';
import toastMessages from '@/utils/toastMessages';

interface AICvScoreTabProps {
  data: CVData;
  candidateCvId?: number | string | null;
  onUpdate: (data: CVData) => void;
  onNavigateTab?: (tab: 'content' | 'design' | 'ai') => void;
  onAddSkill?: (skillName: string) => void;
  onQuickFix?: (fixType: 'bio' | 'experience' | 'skills' | 'contact') => void;
}

export const AICvScoreTab: React.FC<AICvScoreTabProps> = ({
  data,
  candidateCvId,
  onUpdate,
  onNavigateTab,
  onAddSkill,
  onQuickFix,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState<AICvReviewResult | null>(null);
  const [addedSkillName, setAddedSkillName] = useState<string | null>(null);

  const parseSkillsFromExample = (exampleText: string): string[] => {
    if (!exampleText) return [];
    const clean = exampleText.replace(/^ví dụ:?\s*/i, '').replace(/\.{2,}/g, '');
    return clean
      .split(/[,;\n•]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 35);
  };

  const getSuggestionType = (sug: { category: string; title: string; detail: string }) => {
    const cat = (sug.category || '').toLowerCase();
    const title = (sug.title || '').toLowerCase();
    const detail = (sug.detail || '').toLowerCase();

    if (
      cat.includes('kỹ năng') ||
      cat.includes('skill') ||
      title.includes('kỹ năng') ||
      title.includes('từ khóa') ||
      detail.includes('kỹ năng')
    ) {
      return 'skills';
    }
    if (
      cat.includes('kinh nghiệm') ||
      cat.includes('experience') ||
      title.includes('kinh nghiệm') ||
      title.includes('số liệu') ||
      title.includes('kpi') ||
      detail.includes('kinh nghiệm')
    ) {
      return 'experience';
    }
    if (
      cat.includes('tóm tắt') ||
      cat.includes('mục tiêu') ||
      cat.includes('bio') ||
      cat.includes('summary') ||
      title.includes('tóm tắt') ||
      title.includes('mục tiêu') ||
      detail.includes('tóm tắt')
    ) {
      return 'bio';
    }
    if (
      cat.includes('liên hệ') ||
      cat.includes('contact') ||
      cat.includes('thông tin') ||
      title.includes('liên hệ') ||
      title.includes('email') ||
      title.includes('điện thoại')
    ) {
      return 'contact';
    }
    return 'other';
  };

  const handleRunAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      let targetId = candidateCvId;

      if (targetId) {
        try {
          await cvBuilderService.updateCandidateCV(targetId, {
            cv_data: data,
            template_code: data?.templateId,
            title: data?.title || 'CV Ứng tuyển',
          });
        } catch (syncErr) {
          console.warn('Failed auto-sync before AI review:', syncErr);
        }

        const res = await cvBuilderService.reviewCvWithAI(targetId);
        setReviewResult(res);
        toastMessages.success(`AI đã chấm điểm thành công: ${res.score}/100 điểm - Xếp loại: ${res.grade}`);
      } else {
        try {
          const created = await cvBuilderService.createCandidateCV({
            title: data?.title || 'CV Ứng tuyển',
            template_code: data?.templateId,
            cv_data: data,
            theme_config: data?.theme || { primaryColor: '#1e40af' },
            is_public: true,
          });
          if (created?.id) {
            const res = await cvBuilderService.reviewCvWithAI(created.id);
            setReviewResult(res);
            toastMessages.success(`AI đã chấm điểm thành công: ${res.score}/100 điểm - Xếp loại: ${res.grade}`);
            return;
          }
        } catch (createErr) {
          console.warn('Auto-save before AI review failed, running comprehensive ATS engine:', createErr);
        }

        // Fallback local ATS analysis if unauthenticated or offline
        const personalInfo = data?.personalInfo || {};
        const experiences = Array.isArray(data?.experiences) ? data.experiences : [];
        const skills = Array.isArray(data?.skills) ? data.skills : [];
        const educations = Array.isArray(data?.educations) ? data.educations : [];

        let score = 40;
        if (personalInfo.fullName && personalInfo.email && personalInfo.phoneNumber) score += 20;
        if (experiences.length >= 1) score += 15;
        if (experiences.length >= 2) score += 10;
        if (skills.length >= 4) score += 10;
        if (educations.length >= 1) score += 5;

        const localSuggestions = [];

        // 1. Contact suggestion if missing
        if (!personalInfo.fullName || !personalInfo.email || !personalInfo.phoneNumber) {
          localSuggestions.push({
            category: 'Thông tin liên hệ',
            priority: 'high' as const,
            title: 'Bổ sung đầy đủ thông tin liên hệ và vị trí',
            detail: 'Điền chính xác họ tên, email và số điện thoại để nhà tuyển dụng có thể liên hệ ngay khi duyệt hồ sơ.',
            example: 'Ví dụ: Số điện thoại, Email, Địa chỉ, Vị trí ứng tuyển...',
          });
        }

        // 2. Summary / bio suggestion if missing
        if (!personalInfo.bio && !(personalInfo as any).summary) {
          localSuggestions.push({
            category: 'Tóm tắt & Mục tiêu',
            priority: 'medium' as const,
            title: 'Bổ sung tóm tắt nghề nghiệp nổi bật',
            detail: 'Viết 2-3 câu súc tích nêu bật định hướng và giá trị chuyên môn bạn đem lại cho doanh nghiệp.',
            example: 'Hơn 3 năm kinh nghiệm trong ngành, thành thạo tối ưu quy trình và luôn cam kết vượt chỉ tiêu KPI...',
          });
        }

        // 3. Experience suggestion
        localSuggestions.push({
          category: 'Kinh nghiệm',
          priority: 'high' as const,
          title: 'Thêm số liệu định lượng về phần trăm và chỉ số KPI',
          detail: 'Bổ sung các con số cụ thể vào mô tả công việc để tăng tỷ lệ phản hồi từ NTD.',
          example: '• Tăng trưởng doanh thu 30%, tối ưu hóa quy trình giúp tiết kiệm 15 giờ/tuần.',
        });

        // 4. Skills suggestion
        localSuggestions.push({
          category: 'Kỹ năng',
          priority: 'medium' as const,
          title: 'Bổ sung thêm 2-3 kỹ năng chuyên sâu',
          detail: 'Các hệ thống ATS đối chiếu từ khóa kỹ năng với bản tin tuyển dụng của công ty.',
          example: 'Ví dụ: Docker, CI/CD, TypeScript, Agile/Scrum...',
        });

        setReviewResult({
          score: Math.min(score, 100),
          grade: score >= 85 ? 'Xuất sắc - Chuẩn ATS' : score >= 70 ? 'Tốt - Khá hoàn thiện' : 'Cần cải thiện',
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
          suggestions: localSuggestions,
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
      {/* -- Banner -------------------------------------------------------- */}
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

      {/* -- Empty State --------------------------------------------------- */}
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

      {/* -- Review Result ------------------------------------------------- */}
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
                {Object.entries(reviewResult.breakdown).map(([key, item]: [string, any]) => {
                  const scoreVal = typeof item?.score === 'number' ? item.score : 0;
                  const maxVal = typeof item?.max === 'number' && item.max > 0 ? item.max : 100;
                  const progressPercent = Math.min(Math.max((scoreVal / maxVal) * 100, 0), 100);

                  return (
                    <Box key={key}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.75rem' }}>
                          {item?.label || key}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563eb', fontSize: '0.75rem' }}>
                          {scoreVal}/{maxVal} điểm
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: '#f1f5f9',
                          '& .MuiLinearProgress-bar': { bgcolor: '#2563eb', borderRadius: 3 },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          )}

          {/* Suggestions List */}
          {Array.isArray(reviewResult.suggestions) && reviewResult.suggestions.length > 0 && (
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
                {reviewResult.suggestions.map((sug, sIdx) => {
                  const type = getSuggestionType(sug);
                  const extractedSkills = type === 'skills' ? parseSkillsFromExample(sug?.example || '') : [];

                  return (
                    <Box
                      key={sIdx}
                      sx={{
                        p: 1.75,
                        bgcolor: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <WarningAmberOutlinedIcon sx={{ fontSize: 16, color: '#d97706' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.825rem' }}>
                          {sug?.title}
                        </Typography>
                        <Chip
                          label={sug?.category}
                          size="small"
                          sx={{
                            ml: 'auto',
                            fontSize: '0.675rem',
                            fontWeight: 700,
                            height: 20,
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                          }}
                        />
                      </Stack>

                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.75rem', lineHeight: 1.45 }}>
                        {sug?.detail}
                      </Typography>

                      {sug?.example && (
                        <Typography variant="caption" sx={{ color: '#2563eb', fontStyle: 'italic', fontSize: '0.725rem' }}>
                          {sug.example}
                        </Typography>
                      )}

                      {/* Interactive Action Area */}
                      <Divider sx={{ my: 0.25, borderColor: '#f1f5f9' }} />

                      {type === 'skills' && (
                        <Stack spacing={1} sx={{ mt: 0.5 }}>
                          {extractedSkills.length > 0 && (
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                              {extractedSkills.map((sk, kIdx) => {
                                const isAdded = addedSkillName === sk;
                                return (
                                  <Chip
                                    key={kIdx}
                                    label={isAdded ? `✓ ${sk}` : `+ ${sk}`}
                                    clickable
                                    size="small"
                                    onClick={() => {
                                      if (onAddSkill) {
                                        onAddSkill(sk);
                                        setAddedSkillName(sk);
                                        setTimeout(() => setAddedSkillName(null), 2500);
                                      } else {
                                        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                                          navigator.clipboard.writeText(sk).catch((err) => {
                                            console.warn('Clipboard writeText failed:', err);
                                          });
                                        }
                                        toastMessages.success(`Đã sao chép: ${sk}`);
                                      }
                                    }}
                                    sx={{
                                      fontSize: '0.7rem',
                                      fontWeight: 600,
                                      bgcolor: isAdded ? '#dcfce7' : '#ede9fe',
                                      color: isAdded ? '#15803d' : '#6d28d9',
                                      borderRadius: '6px',
                                      height: 22,
                                      cursor: 'pointer',
                                      '&:hover': { bgcolor: isAdded ? '#bbf7d0' : '#ddd6fe' },
                                    }}
                                  />
                                );
                              })}
                            </Stack>
                          )}

                          <Stack direction="row" spacing={1} alignItems="center">
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => {
                                const skillsToAdd =
                                  extractedSkills.length > 0
                                    ? extractedSkills
                                    : ['Docker', 'CI/CD', 'TypeScript', 'Agile/Scrum'];
                                skillsToAdd.forEach((sk) => onAddSkill?.(sk));
                                onQuickFix?.('skills');
                              }}
                              startIcon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
                              sx={{
                                borderRadius: '8px',
                                bgcolor: '#7c3aed',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '0.725rem',
                                textTransform: 'none',
                                px: 1.5,
                                py: 0.4,
                                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                                '&:hover': { bgcolor: '#6d28d9' },
                              }}
                            >
                              Thêm kỹ năng chuẩn ATS
                            </Button>
                            {onNavigateTab && (
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => {
                                  onQuickFix?.('skills');
                                  onNavigateTab('content');
                                }}
                                sx={{
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  color: '#64748b',
                                  textTransform: 'none',
                                }}
                              >
                                Tự nhập kỹ năng
                              </Button>
                            )}
                          </Stack>
                        </Stack>
                      )}

                      {type === 'experience' && (
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              onQuickFix?.('experience');
                              if (onNavigateTab) onNavigateTab('content');
                              toastMessages.info('Đang chuyển đến mục Kinh nghiệm để bổ sung số liệu');
                            }}
                            startIcon={<EditNoteOutlinedIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              borderRadius: '8px',
                              bgcolor: '#2563eb',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.725rem',
                              textTransform: 'none',
                              px: 1.5,
                              py: 0.4,
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                              '&:hover': { bgcolor: '#1d4ed8' },
                            }}
                          >
                            Sửa mục Kinh nghiệm ngay
                          </Button>
                        </Box>
                      )}

                      {type === 'bio' && (
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              onQuickFix?.('bio');
                              if (onNavigateTab) onNavigateTab('ai');
                              toastMessages.info('Mở Trợ lý AI tạo Tóm tắt chuẩn ATS');
                            }}
                            startIcon={<AutoFixHighOutlinedIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              borderRadius: '8px',
                              bgcolor: '#7c3aed',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.725rem',
                              textTransform: 'none',
                              px: 1.5,
                              py: 0.4,
                              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                              '&:hover': { bgcolor: '#6d28d9' },
                            }}
                          >
                            Mở AI tạo Tóm tắt
                          </Button>
                        </Box>
                      )}

                      {type === 'contact' && (
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              onQuickFix?.('contact');
                              if (onNavigateTab) onNavigateTab('content');
                              toastMessages.info('Đang chuyển đến phần Thông tin liên hệ');
                            }}
                            startIcon={<PersonOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              borderRadius: '8px',
                              bgcolor: '#0f766e',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.725rem',
                              textTransform: 'none',
                              px: 1.5,
                              py: 0.4,
                              boxShadow: '0 2px 6px rgba(15, 118, 110, 0.25)',
                              '&:hover': { bgcolor: '#0d9488' },
                            }}
                          >
                            Bổ sung liên hệ
                          </Button>
                        </Box>
                      )}

                      {type === 'other' && onNavigateTab && (
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onNavigateTab('content')}
                            endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              borderRadius: '8px',
                              borderColor: '#cbd5e1',
                              color: '#334155',
                              fontWeight: 700,
                              fontSize: '0.725rem',
                              textTransform: 'none',
                              px: 1.5,
                              py: 0.4,
                              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                            }}
                          >
                            Hoàn thiện mục này trong CV
                          </Button>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          )}
        </Stack>
      )}
    </Box>
  );
};
