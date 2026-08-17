'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import resumeService from '@/services/resumeService';
import { useQueryClient } from '@tanstack/react-query';
import httpRequest from '@/utils/httpRequest';
import toastMessages from '@/utils/toastMessages';
import { unwrapDataResponse } from '@/utils/apiResponse';
import type { JobPost } from '@/types/models';

interface CandidateRecommendation {
  id: number;
  slug?: string;
  userId: number;
  fullName: string;
  title: string;
  avatarUrl?: string;
  city: string;
  experience: string;
  matchScore: number;
  matchReasons: string[];
  skillsSummary?: string;
  updatedAt?: string;
  isSaved?: boolean;
}

interface AiCandidateRecommendationModalProps {
  open: boolean;
  onClose: () => void;
  jobPost: JobPost | null;
}

const AiCandidateRecommendationModal: React.FC<AiCandidateRecommendationModalProps> = ({
  open,
  onClose,
  jobPost,
}) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = React.useState(false);
  const [candidates, setCandidates] = React.useState<CandidateRecommendation[]>([]);
  const [savedCandidateIds, setSavedCandidateIds] = React.useState<Set<number>>(new Set());
  const [savingCandidateIds, setSavingCandidateIds] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (!open || !jobPost) {
      setCandidates([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const slug = jobPost.slug || jobPost.id;
    httpRequest
      .get(`job/web/private-job-posts/${slug}/ai-recommended-candidates/`)
      .then((res) => {
        if (!isMounted) return;
        const data = unwrapDataResponse<{ candidates: (CandidateRecommendation & { isSaved?: boolean })[] }>(res);
        const fetchedCandidates = data?.candidates || [];
        setCandidates(fetchedCandidates);

        const initialSaved = new Set<number>();
        fetchedCandidates.forEach((c) => {
          if (c.isSaved) {
            initialSaved.add(c.id);
          }
        });
        setSavedCandidateIds(initialSaved);
      })
      .catch(() => {
        if (isMounted) setCandidates([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, jobPost]);

  const handleAction = (actionName: string, candidateName: string) => {
    toastMessages.success(`Đã ${actionName} tới ứng viên ${candidateName}!`);
  };

  const handleToggleSave = async (cand: CandidateRecommendation) => {
    const candIdNum = Number(cand.id);
    const rawId = cand.id as any;
    if (savingCandidateIds.has(candIdNum) || savingCandidateIds.has(rawId)) return;

    const isCurrentlySaved = savedCandidateIds.has(candIdNum) || savedCandidateIds.has(rawId);
    const targetSlug = cand.slug ? String(cand.slug) : String(cand.id);

    // Optimistically update save state in UI immediately!
    setSavedCandidateIds((prev) => {
      const next = new Set(prev);
      if (!isCurrentlySaved) {
        next.add(candIdNum);
        next.add(rawId);
      } else {
        next.delete(candIdNum);
        next.delete(rawId);
      }
      return next;
    });

    setSavingCandidateIds((prev) => {
      const next = new Set(prev);
      next.add(candIdNum);
      next.add(rawId);
      return next;
    });

    try {
      const res = await resumeService.saveResume(targetSlug);
      const isNowSaved = res?.isSaved !== undefined ? Boolean(res.isSaved) : !isCurrentlySaved;

      setSavedCandidateIds((prev) => {
        const next = new Set(prev);
        if (isNowSaved) {
          next.add(candIdNum);
          next.add(rawId);
        } else {
          next.delete(candIdNum);
          next.delete(rawId);
        }
        return next;
      });

      if (isNowSaved) {
        toastMessages.success(`Đã lưu hồ sơ ứng viên ${cand.fullName}`);
      } else {
        toastMessages.info(`Đã bỏ lưu hồ sơ ứng viên ${cand.fullName}`);
      }

      queryClient.invalidateQueries({ queryKey: ['savedResumes'] });
      queryClient.invalidateQueries({ queryKey: ['employerResumes'] });
    } catch (err) {
      console.error('Error toggling save resume in AI modal:', err);

      // Rollback optimistic state on error
      setSavedCandidateIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlySaved) {
          next.add(candIdNum);
          next.add(rawId);
        } else {
          next.delete(candIdNum);
          next.delete(rawId);
        }
        return next;
      });

      toastMessages.error(`Lỗi khi lưu hồ sơ ứng viên ${cand.fullName}`);
    } finally {
      setSavingCandidateIds((prev) => {
        const next = new Set(prev);
        next.delete(candIdNum);
        next.delete(rawId);
        return next;
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#f8fafc',
        },
      }}
    >
      {/* Header Modal */}
      <DialogTitle
        sx={{
          m: 0,
          p: 3,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AutoAwesomeIcon />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Hồ sơ gợi ý bởi AI
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Cho bài tuyển dụng: <strong>{jobPost?.jobName || 'Vị trí công việc'}</strong>
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
            <CircularProgress size={36} sx={{ color: '#2563eb' }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
              AI đang phân tích mô tả công việc và đối soát kho hồ sơ phù hợp nhất...
            </Typography>
          </Box>
        ) : candidates.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" sx={{ color: '#475569', fontWeight: 600 }}>
              Chưa tìm thấy ứng viên phù hợp cho vị trí này
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {candidates.map((cand) => (
              <Box
                key={cand.id}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px -2px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    boxShadow: '0 8px 24px -4px rgba(0,0,0,0.06)',
                  },
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                  {/* Candidate Info */}
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                      src={cand.avatarUrl}
                      alt={cand.fullName}
                      sx={{ width: 56, height: 56, borderRadius: '14px', border: '1px solid #e2e8f0' }}
                    >
                      {cand.fullName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" mb={0.5}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {cand.fullName}
                        </Typography>
                        <Chip
                          icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
                          label={`Phù hợp ${cand.matchScore}%`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            backgroundColor: '#f0fdf4',
                            color: '#16a34a',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                          }}
                        />
                      </Stack>

                      <Typography variant="body2" sx={{ color: '#2563eb', fontWeight: 700, mb: 1 }}>
                        {cand.title}
                      </Typography>

                      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                          <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {cand.city}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                          <WorkOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {cand.experience}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* AI Match Reasons Chips */}
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                        {cand.matchReasons.map((reason, idx) => (
                          <Chip
                            key={idx}
                            icon={<CheckCircleOutlineIcon sx={{ fontSize: '14px !important', color: '#2563eb !important' }} />}
                            label={reason}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.725rem',
                              fontWeight: 600,
                              backgroundColor: '#eff6ff',
                              color: '#1e40af',
                              borderRadius: '6px',
                            }}
                          />
                        ))}
                      </Stack>

                      {/* Candidate Skills Summary */}
                      {cand.skillsSummary && (
                        <Box sx={{ mt: 1, p: 1.25, backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                          <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <AutoAwesomeIcon sx={{ fontSize: 13, color: '#2563EB' }} /> Kỹ năng chuyên môn cốt lõi:
                          </Typography>
                          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                            {cand.skillsSummary.split(',').map((skill, sIdx) => (
                              <Chip
                                key={sIdx}
                                label={skill.trim()}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  backgroundColor: '#ffffff',
                                  color: '#334155',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </Stack>

                  {/* Actions */}
                  <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1} justifyContent="center">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleAction('gửi lời mời ứng tuyển', cand.fullName)}
                      sx={{
                        borderRadius: '10px',
                        backgroundColor: '#2563eb',
                        fontWeight: 700,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#1d4ed8' },
                      }}
                    >
                      Mời ứng tuyển
                    </Button>

                    {(() => {
                      const candIdNum = Number(cand.id);
                      const rawId = cand.id as any;
                      const isSaved = savedCandidateIds.has(candIdNum) || savedCandidateIds.has(rawId);
                      const isSaving = savingCandidateIds.has(candIdNum) || savingCandidateIds.has(rawId);
                      return (
                        <Button
                          variant={isSaved ? "contained" : "outlined"}
                          size="small"
                          disabled={isSaving}
                          startIcon={
                            isSaving ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : isSaved ? (
                              <BookmarkIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <BookmarkBorderOutlinedIcon sx={{ fontSize: 16 }} />
                            )
                          }
                          onClick={() => handleToggleSave(cand)}
                          sx={{
                            borderRadius: '10px',
                            borderColor: isSaved ? '#16a34a' : '#cbd5e1',
                            backgroundColor: isSaved ? '#16a34a' : 'transparent',
                            color: isSaved ? '#ffffff' : '#334155',
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                              borderColor: isSaved ? '#15803d' : '#94a3b8',
                              backgroundColor: isSaved ? '#15803d' : '#f8fafc',
                            },
                          }}
                        >
                          {isSaving ? 'Đang lưu...' : isSaved ? 'Đã lưu' : 'Lưu ứng viên'}
                        </Button>
                      );
                    })()}
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2.5, backgroundColor: '#ffffff' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '10px', fontWeight: 700, px: 3, color: '#475569', borderColor: '#cbd5e1' }}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AiCandidateRecommendationModal;
