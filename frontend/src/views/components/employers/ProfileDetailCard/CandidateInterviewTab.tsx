'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  alpha,
  useTheme,
  Grid2 as Grid,
} from '@mui/material';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AddIcon from '@mui/icons-material/Add';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Link from 'next/link';
import dayjs from '@/configs/dayjs-config';

import interviewService from '@/services/interviewService';
import type { InterviewSession, ResumeDetailResponse } from '@/types/models';
import ScheduleInterviewModal from './ScheduleInterviewModal';

interface CandidateInterviewTabProps {
  profileDetail: ResumeDetailResponse;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        label: 'Đã hoàn thành',
        color: '#16A34A',
        bgcolor: alpha('#16A34A', 0.1),
        borderColor: alpha('#16A34A', 0.25),
      };
    case 'in_progress':
      return {
        label: 'Đang diễn ra',
        color: '#9333EA',
        bgcolor: alpha('#9333EA', 0.1),
        borderColor: alpha('#9333EA', 0.25),
      };
    case 'scheduled':
      return {
        label: 'Đã lên lịch',
        color: '#2563EB',
        bgcolor: alpha('#2563EB', 0.1),
        borderColor: alpha('#2563EB', 0.25),
      };
    case 'cancelled':
      return {
        label: 'Đã hủy',
        color: '#EF4444',
        bgcolor: alpha('#EF4444', 0.1),
        borderColor: alpha('#EF4444', 0.25),
      };
    default:
      return {
        label: 'Bản nháp',
        color: '#64748B',
        bgcolor: '#F1F5F9',
        borderColor: '#E2E8F0',
      };
  }
};

export const CandidateInterviewTab: React.FC<CandidateInterviewTabProps> = ({ profileDetail }) => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const candidateId =
    profileDetail.user?.id ||
    (profileDetail as any).user ||
    profileDetail.jobSeekerProfile?.userDict?.id ||
    (profileDetail.jobSeekerProfile as any)?.userId;

  const candidateName =
    profileDetail.user?.fullName ||
    profileDetail.userDict?.fullName ||
    profileDetail.jobSeekerProfile?.userDict?.fullName ||
    profileDetail.title ||
    'Ứng viên';

  const candidateEmail =
    profileDetail.user?.email ||
    profileDetail.userDict?.email ||
    profileDetail.jobSeekerProfile?.userDict?.email;

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Search by candidate name or query params
      const res = await interviewService.getSessions({
        search: candidateName !== 'Ứng viên' ? candidateName : undefined,
        pageSize: 20,
      });

      const list = res?.results || [];
      // Filter sessions that belong to this candidate
      const filtered = list.filter((item) => {
        if (candidateId && item.candidate && String(item.candidate) === String(candidateId)) {
          return true;
        }
        if (candidateEmail && item.candidateEmail && item.candidateEmail.toLowerCase() === candidateEmail.toLowerCase()) {
          return true;
        }
        if (item.candidateName && item.candidateName.toLowerCase().includes(candidateName.toLowerCase())) {
          return true;
        }
        return false;
      });

      setSessions(filtered);
    } catch (err) {
      console.error('Failed to load candidate interview sessions:', err);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [candidateId, candidateName, candidateEmail]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MicNoneOutlinedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary', letterSpacing: '-0.01em' }}>
                Lịch sử & Quy trình Phỏng vấn
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Theo dõi tiến trình các vòng phỏng vấn AI và đánh giá từ hội đồng tuyển dụng
              </Typography>
            </Box>
          </Stack>

          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 750,
              fontSize: '0.8125rem',
              px: 2.25,
              py: 0.85,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            Lên lịch phỏng vấn
          </Button>
        </Stack>

        {/* Content */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : sessions.length > 0 ? (
          <Stack spacing={2} sx={{ mb: 1 }}>
            {sessions.map((session, index) => {
              const badge = getStatusBadge(session.status);
              const isAi = session.type === 'mixed' || session.type === 'behavioral';
              const formattedDate = session.scheduledAt
                ? dayjs(session.scheduledAt).format('DD/MM/YYYY HH:mm')
                : 'Chưa xếp lịch';

              return (
                <Box
                  key={session.id || index}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.light',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
                    },
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '12px',
                          bgcolor: isAi ? alpha(theme.palette.primary.main, 0.1) : 'action.hover',
                          color: isAi ? 'primary.main' : 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isAi ? <SmartToyOutlinedIcon sx={{ fontSize: 24 }} /> : <PersonOutlineIcon sx={{ fontSize: 24 }} />}
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                            {session.jobName ? `Phỏng vấn vị trí: ${session.jobName}` : `Buổi phỏng vấn #${session.id}`}
                          </Typography>
                          <Chip
                            label={isAi ? 'AI Voice Bot' : 'Trực tiếp (Live)'}
                            size="small"
                            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'action.hover' }}
                          />
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
                            <AccessTimeIcon sx={{ fontSize: 15 }} />
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                              {formattedDate}
                            </Typography>
                          </Stack>

                          {session.duration && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                              • Thời lượng: {session.duration} phút
                            </Typography>
                          )}

                          {session.aiOverallScore !== undefined && session.aiOverallScore !== null && (
                            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 750 }}>
                              • Điểm AI: {session.aiOverallScore}/100
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Chip
                        label={badge.label}
                        size="small"
                        sx={{
                          fontWeight: 750,
                          fontSize: '0.75rem',
                          borderRadius: '8px',
                          bgcolor: badge.bgcolor,
                          color: badge.color,
                          border: '1px solid',
                          borderColor: badge.borderColor,
                        }}
                      />

                      <Button
                        component={Link}
                        href={`/employer/interviews`}
                        size="small"
                        variant="outlined"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: 'text.secondary',
                          borderColor: 'divider',
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        ) : (
          /* Dynamic Empty State */
          <Box
            sx={{
              py: 5,
              px: 3,
              borderRadius: 3,
              bgcolor: 'action.hover',
              border: '1px dashed',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <EventOutlinedIcon sx={{ fontSize: 42, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 800 }}>
              Chưa có biên bản phỏng vấn nào cho ứng viên này
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, mb: 2.5, maxWidth: 520, mx: 'auto', fontSize: '0.8125rem', lineHeight: 1.6 }}>
              Bạn có thể xếp lịch phỏng vấn AI tự động hoặc phỏng vấn trực tiếp để đánh giá chuyên môn, bảng điểm và bản gỡ băng (transcript) sẽ tự động lưu trữ tại đây.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenModal(true)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                px: 2.5,
                py: 0.9,
              }}
            >
              Lên lịch phỏng vấn đầu tiên
            </Button>
          </Box>
        )}
      </Paper>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        candidateId={candidateId ? Number(candidateId) : undefined}
        candidateName={candidateName}
        onScheduled={fetchSessions}
      />
    </Stack>
  );
};

export default CandidateInterviewTab;
