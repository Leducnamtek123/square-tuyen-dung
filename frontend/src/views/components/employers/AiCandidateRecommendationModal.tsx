'use client';

import React, { useState, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  Tooltip,
  Paper,
  useTheme,
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
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import StarsIcon from '@mui/icons-material/Stars';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
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

const getScoreColor = (score: number) => {
  if (score >= 70) return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', dot: '#10b981' };
  if (score >= 40) return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', dot: '#3b82f6' };
  return { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe', dot: '#8b5cf6' };
};

const getAvatarGradient = (name: string) => {
  const gradients = [
    'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
    'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
};

export const AiCandidateRecommendationModal: React.FC<AiCandidateRecommendationModalProps> = ({
  open,
  onClose,
  jobPost,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<CandidateRecommendation[]>([]);
  const [savedCandidateIds, setSavedCandidateIds] = useState<Set<number>>(new Set());
  const [savingCandidateIds, setSavingCandidateIds] = useState<Set<number>>(new Set());
  const [invitedCandidateIds, setInvitedCandidateIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high_match' | 'experienced'>('all');

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

  const filteredCandidates = useMemo(() => {
    let list = candidates;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.title?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.skillsSummary?.toLowerCase().includes(q)
      );
    }
    if (selectedFilter === 'high_match') {
      list = list.filter((c) => c.matchScore >= 50);
    } else if (selectedFilter === 'experienced') {
      list = list.filter(
        (c) =>
          c.experience &&
          !c.experience.toLowerCase().includes('chưa có') &&
          !c.experience.toLowerCase().includes('0 năm')
      );
    }
    return list;
  }, [candidates, searchQuery, selectedFilter]);

  const handleInvite = (cand: CandidateRecommendation) => {
    setInvitedCandidateIds((prev) => new Set(prev).add(cand.id));
    toastMessages.success(`Đã gửi lời mời ứng tuyển trực tiếp tới ${cand.fullName}!`);
  };

  const handleInviteAll = () => {
    const newInvited = new Set(invitedCandidateIds);
    filteredCandidates.forEach((c) => newInvited.add(c.id));
    setInvitedCandidateIds(newInvited);
    toastMessages.success(`Đã gửi lời mời ứng tuyển tới tất cả ${filteredCandidates.length} ứng viên phù hợp!`);
  };

  const handleToggleSave = async (cand: CandidateRecommendation) => {
    const candIdNum = Number(cand.id);
    const rawId = cand.id as any;
    if (savingCandidateIds.has(candIdNum) || savingCandidateIds.has(rawId)) return;

    const isCurrentlySaved = savedCandidateIds.has(candIdNum) || savedCandidateIds.has(rawId);
    const targetSlug = cand.slug ? String(cand.slug) : String(cand.id);

    // Optimistically update save state in UI
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

  const handleOpenProfile = (cand: CandidateRecommendation) => {
    const targetUrl = cand.slug ? `/online-profile/${cand.slug}` : `/employer/candidates/${cand.id}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(15, 23, 42, 0.45)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.9)',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.2)'
            : '0 25px 50px -12px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.08)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* 1. Header Studio Bar */}
      <DialogTitle
        sx={{
          m: 0,
          p: 0,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.9)',
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            px: { xs: 2.5, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(79, 70, 229, 0.3)',
                position: 'relative',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 24 }} />
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: '#10b981',
                  border: '2px solid',
                  borderColor: isDark ? '#1e293b' : '#ffffff',
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontSize: { xs: '1.05rem', sm: '1.2rem' },
                    letterSpacing: '-0.02em',
                  }}
                >
                  Hồ Sơ Ứng Viên Gợi Ý Bởi AI
                </Typography>
                <Chip
                  label="AILA Match Engine"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    bgcolor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(79, 70, 229, 0.1)',
                    color: isDark ? '#a5b4fc' : '#4f46e5',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.2)',
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontWeight: 500,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 0.2,
                }}
              >
                Vị trí tuyển dụng: <strong style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{jobPost?.jobName || 'Vị trí công việc'}</strong>
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Đóng (Esc)">
            <IconButton
              aria-label="Đóng"
              onClick={onClose}
              size="small"
              sx={{
                color: isDark ? '#94a3b8' : '#64748b',
                borderRadius: '10px',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  color: isDark ? '#ffffff' : '#0f172a',
                  transform: 'rotate(90deg)',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* 2. Sub-Toolbar: Filter & Search */}
        {!loading && candidates.length > 0 && (
          <Box
            sx={{
              px: { xs: 2.5, sm: 3 },
              py: 1.2,
              bgcolor: isDark ? '#111c38' : '#f1f5f9',
              borderTop: '1px solid',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(226, 232, 240, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.2,
            }}
          >
            {/* Filter Pills */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
                Lọc:
              </Typography>
              <Chip
                label={`Tất cả (${candidates.length})`}
                size="small"
                onClick={() => setSelectedFilter('all')}
                sx={{
                  height: 26,
                  fontSize: '0.75rem',
                  fontWeight: selectedFilter === 'all' ? 700 : 500,
                  cursor: 'pointer',
                  bgcolor: selectedFilter === 'all' ? '#4f46e5' : isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                  color: selectedFilter === 'all' ? '#ffffff' : isDark ? '#cbd5e1' : '#475569',
                  border: '1px solid',
                  borderColor: selectedFilter === 'all' ? '#4f46e5' : isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                }}
              />
              <Chip
                label="Phù hợp cao (>50%)"
                size="small"
                onClick={() => setSelectedFilter('high_match')}
                sx={{
                  height: 26,
                  fontSize: '0.75rem',
                  fontWeight: selectedFilter === 'high_match' ? 700 : 500,
                  cursor: 'pointer',
                  bgcolor: selectedFilter === 'high_match' ? '#4f46e5' : isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                  color: selectedFilter === 'high_match' ? '#ffffff' : isDark ? '#cbd5e1' : '#475569',
                  border: '1px solid',
                  borderColor: selectedFilter === 'high_match' ? '#4f46e5' : isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                }}
              />
              <Chip
                label="Có kinh nghiệm"
                size="small"
                onClick={() => setSelectedFilter('experienced')}
                sx={{
                  height: 26,
                  fontSize: '0.75rem',
                  fontWeight: selectedFilter === 'experienced' ? 700 : 500,
                  cursor: 'pointer',
                  bgcolor: selectedFilter === 'experienced' ? '#4f46e5' : isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                  color: selectedFilter === 'experienced' ? '#ffffff' : isDark ? '#cbd5e1' : '#475569',
                  border: '1px solid',
                  borderColor: selectedFilter === 'experienced' ? '#4f46e5' : isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                }}
              />
            </Box>

            {/* Search Input & Quick Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: { xs: 1, sm: 'none' } }}>
              <TextField
                size="small"
                placeholder="Tìm tên, kỹ năng, tỉnh thành..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: '100%', sm: 220 },
                  '& .MuiOutlinedInput-root': {
                    height: 30,
                    fontSize: '0.78rem',
                    bgcolor: isDark ? '#1e293b' : '#ffffff',
                    borderRadius: '8px',
                  },
                }}
              />

              {filteredCandidates.length > 1 && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />}
                  onClick={handleInviteAll}
                  sx={{
                    height: 30,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    borderColor: '#4f46e5',
                    color: '#4f46e5',
                    '&:hover': {
                      bgcolor: 'rgba(79, 70, 229, 0.08)',
                      borderColor: '#4338ca',
                    },
                  }}
                >
                  Mời tất cả ({filteredCandidates.length})
                </Button>
              )}
            </Box>
          </Box>
        )}
      </DialogTitle>

      {/* 3. Candidate List Content */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowX: 'hidden', flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2.5 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
                animation: 'pulse 1.8s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.1)', opacity: 0.7 },
                },
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 32, color: '#4f46e5' }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 700, mb: 0.5 }}>
                AI đang phân tích mô tả công việc và đối soát kho hồ sơ...
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                Hệ thống đang quét độ tương thích về kỹ năng, kinh nghiệm và mức đãi ngộ
              </Typography>
            </Box>
            <CircularProgress size={24} sx={{ color: '#4f46e5' }} />
          </Box>
        ) : filteredCandidates.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 32, color: isDark ? '#475569' : '#94a3b8' }} />
            </Box>
            <Typography variant="body1" sx={{ color: isDark ? '#e2e8f0' : '#334155', fontWeight: 700, mb: 0.5 }}>
              {candidates.length === 0
                ? 'Chưa tìm thấy ứng viên phù hợp với tiêu chí hiện tại'
                : 'Không có ứng viên nào khớp với bộ lọc tìm kiếm'}
            </Typography>
            <Typography variant="caption" sx={{ maxWidth: 400, display: 'block', mx: 'auto' }}>
              {candidates.length === 0
                ? 'Hệ thống sẽ tiếp tục theo dõi và gợi ý hồ sơ mới ngay khi có ứng viên đăng ký phù hợp.'
                : 'Hãy thử xóa từ khóa tìm kiếm hoặc chọn bộ lọc khác để xem danh sách đầy đủ.'}
            </Typography>
            {searchQuery && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
                sx={{ mt: 2, borderRadius: '8px', textTransform: 'none', fontSize: '0.8rem' }}
              >
                Xóa bộ lọc tìm kiếm
              </Button>
            )}
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredCandidates.map((cand) => {
              const scoreStyle = getScoreColor(cand.matchScore);
              const isInvited = invitedCandidateIds.has(cand.id);
              const candIdNum = Number(cand.id);
              const rawId = cand.id as any;
              const isSaved = savedCandidateIds.has(candIdNum) || savedCandidateIds.has(rawId);
              const isSaving = savingCandidateIds.has(candIdNum) || savingCandidateIds.has(rawId);

              return (
                <Paper
                  key={cand.id}
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: '16px',
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.9)',
                    boxShadow: isDark
                      ? '0 4px 12px rgba(0,0,0,0.25)'
                      : '0 4px 14px rgba(15, 23, 42, 0.03)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: '#6366f1',
                      boxShadow: isDark
                        ? '0 8px 25px rgba(0,0,0,0.4)'
                        : '0 8px 24px rgba(79, 70, 229, 0.08)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {/* Left Highlight Strip */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      bgcolor: scoreStyle.dot,
                    }}
                  />

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'stretch', md: 'flex-start' },
                      gap: 2.5,
                    }}
                  >
                    {/* Left & Middle: Candidate Info & AI Insights */}
                    <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 0 }}>
                      {/* Avatar */}
                      <Avatar
                        src={cand.avatarUrl}
                        alt={cand.fullName}
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: '14px',
                          border: '2px solid',
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          background: getAvatarGradient(cand.fullName),
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          color: '#ffffff',
                          flexShrink: 0,
                        }}
                      >
                        {cand.fullName.charAt(0)}
                      </Avatar>

                      {/* Details Block */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Name + Match Score + Source */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap', mb: 0.4 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 800,
                              color: isDark ? '#f8fafc' : '#0f172a',
                              fontSize: '0.98rem',
                              lineHeight: 1.3,
                            }}
                          >
                            {cand.fullName}
                          </Typography>

                          {/* Match Score Badge */}
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.6,
                              px: 1.2,
                              py: 0.3,
                              borderRadius: '8px',
                              bgcolor: isDark ? 'rgba(99, 102, 241, 0.2)' : scoreStyle.bg,
                              border: '1px solid',
                              borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : scoreStyle.border,
                            }}
                          >
                            <AutoAwesomeIcon sx={{ fontSize: 13, color: isDark ? '#a5b4fc' : scoreStyle.text }} />
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.75rem',
                                color: isDark ? '#a5b4fc' : scoreStyle.text,
                              }}
                            >
                              Phù hợp {cand.matchScore}%
                            </Typography>
                          </Box>
                        </Box>

                        {/* Title / Current Position */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: isDark ? '#818cf8' : '#4f46e5',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            mb: 1,
                            wordBreak: 'break-word',
                          }}
                        >
                          {cand.title}
                        </Typography>

                        {/* Metadata Row: City & Experience */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: isDark ? '#94a3b8' : '#64748b' }}>
                            <LocationOnOutlinedIcon sx={{ fontSize: 15 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                              {cand.city || 'Toàn quốc'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: isDark ? '#94a3b8' : '#64748b' }}>
                            <WorkOutlineOutlinedIcon sx={{ fontSize: 15 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                              {cand.experience || 'Chưa cập nhật'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* AI Match Reasons Box */}
                        {cand.matchReasons && cand.matchReasons.length > 0 && (
                          <Box
                            sx={{
                              p: 1.2,
                              px: 1.5,
                              borderRadius: '10px',
                              bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                              border: '1px solid',
                              borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(226, 232, 240, 0.8)',
                              mb: 1.2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: isDark ? '#94a3b8' : '#475569',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mb: 0.6,
                                fontSize: '0.72rem',
                              }}
                            >
                              <AutoAwesomeIcon sx={{ fontSize: 12, color: '#4f46e5' }} /> Đánh giá tương thích AI:
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {cand.matchReasons.map((reason, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                                  <CheckCircleOutlineIcon
                                    sx={{ fontSize: 14, color: '#10b981', mt: '2px', flexShrink: 0 }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '0.78rem',
                                      lineHeight: 1.45,
                                      color: isDark ? '#cbd5e1' : '#334155',
                                    }}
                                  >
                                    {reason}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Skills Summary Chips */}
                        {cand.skillsSummary && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                            <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600, fontSize: '0.72rem' }}>
                              Kỹ năng:
                            </Typography>
                            {cand.skillsSummary.split(',').map((skill, sIdx) => (
                              <Chip
                                key={sIdx}
                                label={skill.trim()}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                                  color: isDark ? '#e2e8f0' : '#334155',
                                  border: '1px solid',
                                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
                                  borderRadius: '6px',
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Right Column: Actions (Non-wrapping, Fixed Ergonomics) */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'row', md: 'column' },
                        gap: 1,
                        minWidth: { xs: '100%', md: '145px' },
                        flexShrink: 0,
                        justifyContent: 'center',
                      }}
                    >
                      {/* Primary Invite Button */}
                      <Button
                        variant="contained"
                        size="small"
                        disabled={isInvited}
                        startIcon={isInvited ? <CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> : <SendOutlinedIcon sx={{ fontSize: 15 }} />}
                        onClick={() => handleInvite(cand)}
                        sx={{
                          borderRadius: '10px',
                          py: 0.8,
                          px: 1.8,
                          background: isInvited
                            ? '#10b981'
                            : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          boxShadow: isInvited ? 'none' : '0 4px 12px rgba(79, 70, 229, 0.3)',
                          flex: { xs: 1, md: 'none' },
                          '&:hover': {
                            background: isInvited
                              ? '#059669'
                              : 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                          },
                        }}
                      >
                        {isInvited ? 'Đã mời' : 'Mời ứng tuyển'}
                      </Button>

                      {/* Secondary Save Resume Button */}
                      <Button
                        variant={isSaved ? 'contained' : 'outlined'}
                        size="small"
                        disabled={isSaving}
                        startIcon={
                          isSaving ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : isSaved ? (
                            <BookmarkIcon sx={{ fontSize: 15 }} />
                          ) : (
                            <BookmarkBorderOutlinedIcon sx={{ fontSize: 15 }} />
                          )
                        }
                        onClick={() => handleToggleSave(cand)}
                        sx={{
                          borderRadius: '10px',
                          py: 0.8,
                          px: 1.8,
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          whiteSpace: 'nowrap',
                          flex: { xs: 1, md: 'none' },
                          borderColor: isSaved ? '#10b981' : isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
                          backgroundColor: isSaved ? '#10b981' : 'transparent',
                          color: isSaved ? '#ffffff' : isDark ? '#f1f5f9' : '#334155',
                          boxShadow: 'none',
                          '&:hover': {
                            borderColor: isSaved ? '#059669' : '#6366f1',
                            backgroundColor: isSaved ? '#059669' : isDark ? 'rgba(99, 102, 241, 0.1)' : '#f8fafc',
                          },
                        }}
                      >
                        {isSaving ? 'Đang lưu...' : isSaved ? 'Đã lưu' : 'Lưu ứng viên'}
                      </Button>

                      {/* Quick View Profile Link */}
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        onClick={() => handleOpenProfile(cand)}
                        sx={{
                          borderRadius: '8px',
                          py: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          color: isDark ? '#94a3b8' : '#64748b',
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            color: '#4f46e5',
                            bgcolor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.05)',
                          },
                        }}
                      >
                        Xem chi tiết CV
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </DialogContent>

      {/* 4. Footer Summary Bar */}
      <Divider sx={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)' }} />
      <DialogActions
        sx={{
          p: 2,
          px: 3,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ fontSize: 14, color: '#4f46e5' }} />
          <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.75rem' }}>
            Hệ thống tự động học và đối soát từ hơn 50,000+ hồ sơ ứng viên theo tiêu chuẩn JD InfoHR.
          </Typography>
        </Box>

        <Button
          onClick={onClose}
          variant="outlined"
          size="small"
          sx={{
            borderRadius: '10px',
            fontWeight: 700,
            px: 2.5,
            color: isDark ? '#cbd5e1' : '#475569',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#6366f1',
              bgcolor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#f8fafc',
            },
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AiCandidateRecommendationModal;
