'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Stack, Typography, CircularProgress, Chip } from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import dayjs from '@/configs/dayjs-config';

import jobPostActivityService from '@/services/jobPostActivityService';
import interviewService from '@/services/interviewService';
import type { ResumeDetailResponse, JobPostActivity, InterviewSession } from '@/types/models';

interface CandidateActivityTabProps {
  profileDetail: ResumeDetailResponse;
}

interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  timestamp: number;
  icon: React.ElementType;
  color: string;
  bgcolor: string;
}

export const CandidateActivityTab: React.FC<CandidateActivityTabProps> = ({ profileDetail }) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const candidateName =
    profileDetail.user?.fullName ||
    profileDetail.userDict?.fullName ||
    profileDetail.jobSeekerProfile?.userDict?.fullName ||
    profileDetail.title ||
    'Ứng viên';

  const candidateId =
    profileDetail.user?.id ||
    (profileDetail as any).user ||
    profileDetail.jobSeekerProfile?.userDict?.id ||
    (profileDetail.jobSeekerProfile as any)?.userId;

  const candidateEmail =
    profileDetail.user?.email ||
    profileDetail.userDict?.email ||
    profileDetail.jobSeekerProfile?.userDict?.email;

  const candidateSlug = profileDetail.slug;

  const loadActivities = useCallback(async () => {
    setIsLoading(true);
    const events: ActivityEvent[] = [];

    // 1. Profile Creation Event
    if (profileDetail.createAt) {
      const createdDate = dayjs(profileDetail.createAt);
      events.push({
        id: 'profile-created',
        title: 'Hồ sơ được khởi tạo trên hệ thống',
        description: 'Ứng viên hoàn tất tạo hồ sơ trực tuyến và thiết lập thông tin cơ bản.',
        time: createdDate.format('DD/MM/YYYY HH:mm'),
        timestamp: createdDate.valueOf(),
        icon: HistoryOutlinedIcon,
        color: '#64748B',
        bgcolor: '#F1F5F9',
      });
    }

    // 2. Profile Last Updated Event
    if (profileDetail.updateAt && profileDetail.updateAt !== profileDetail.createAt) {
      const updatedDate = dayjs(profileDetail.updateAt);
      events.push({
        id: 'profile-updated',
        title: 'Hồ sơ được cập nhật thông tin',
        description: 'Ứng viên cập nhật thông tin liên hệ, nguyện vọng làm việc hoặc kỹ năng chuyên môn.',
        time: updatedDate.format('DD/MM/YYYY HH:mm'),
        timestamp: updatedDate.valueOf(),
        icon: CheckCircleOutlineIcon,
        color: '#22C55E',
        bgcolor: '#DCFCE7',
      });
    }

    // 3. Profile Views Event
    const views = profileDetail.viewEmployerNumber || 0;
    if (views > 0) {
      events.push({
        id: 'profile-views',
        title: 'Nhà tuyển dụng đã xem hồ sơ',
        description: `Hồ sơ có tổng cộng ${views} lượt xem từ các nhà tuyển dụng trên hệ thống.`,
        time: profileDetail.updateAt
          ? dayjs(profileDetail.updateAt).format('DD/MM/YYYY HH:mm')
          : dayjs().format('DD/MM/YYYY HH:mm'),
        timestamp: profileDetail.updateAt ? dayjs(profileDetail.updateAt).valueOf() : Date.now(),
        icon: RemoveRedEyeOutlinedIcon,
        color: '#2563EB',
        bgcolor: '#EFF6FF',
      });
    }

    // 4. Query Applications & Interviews from API
    try {
      const [applicationsRes, interviewsRes] = await Promise.allSettled([
        jobPostActivityService.getAppliedResume({ kw: candidateName !== 'Ứng viên' ? candidateName : undefined, pageSize: 20 }),
        interviewService.getSessions({ search: candidateName !== 'Ứng viên' ? candidateName : undefined, pageSize: 20 }),
      ]);

      // Process real Applications
      if (applicationsRes.status === 'fulfilled') {
        const applications: JobPostActivity[] = applicationsRes.value?.results || [];
        const filteredApps = applications.filter((app) => {
          if (candidateSlug && (app.resumeSlug === candidateSlug || (app.resume as any)?.slug === candidateSlug)) return true;
          if (candidateId && (app.userId === candidateId || app.userDict?.id === candidateId || (app.resume as any)?.userId === candidateId)) return true;
          if (candidateEmail && (app.email?.toLowerCase() === candidateEmail.toLowerCase() || app.userDict?.email?.toLowerCase() === candidateEmail.toLowerCase())) return true;
          if (app.fullName && candidateName !== 'Ứng viên' && app.fullName.toLowerCase().includes(candidateName.toLowerCase())) return true;
          return false;
        });

        filteredApps.forEach((app) => {
          const appTime = app.createAt ? dayjs(app.createAt) : dayjs();
          events.push({
            id: `app-${app.id}`,
            title: `Ứng tuyển vị trí: ${app.jobName || 'Tin tuyển dụng'}`,
            description: `Đơn ứng tuyển được tiếp nhận. Trạng thái hiện tại: ${app.statusName || 'Đang xử lý'}.`,
            time: appTime.format('DD/MM/YYYY HH:mm'),
            timestamp: appTime.valueOf(),
            icon: WorkOutlineOutlinedIcon,
            color: '#0891B2',
            bgcolor: '#ECFEFF',
          });
        });
      }

      // Process real Interviews
      if (interviewsRes.status === 'fulfilled') {
        const sessions: InterviewSession[] = interviewsRes.value?.results || [];
        const filteredSessions = sessions.filter((s) => {
          if (candidateId && s.candidate && String(s.candidate) === String(candidateId)) return true;
          if (candidateEmail && s.candidateEmail && s.candidateEmail.toLowerCase() === candidateEmail.toLowerCase()) return true;
          if (s.candidateName && candidateName !== 'Ứng viên' && s.candidateName.toLowerCase().includes(candidateName.toLowerCase())) return true;
          return false;
        });

        filteredSessions.forEach((s) => {
          const sTime = s.scheduledAt ? dayjs(s.scheduledAt) : (s.startTime ? dayjs(s.startTime) : dayjs());
          events.push({
            id: `interview-${s.id}`,
            title: `Lên lịch phỏng vấn: ${s.jobName || 'Buổi phỏng vấn'}`,
            description: `Hình thức: ${s.type === 'mixed' ? 'AI Voice Bot' : 'Trực tiếp'}. Trạng thái: ${s.status || 'Đã lên lịch'}.`,
            time: sTime.format('DD/MM/YYYY HH:mm'),
            timestamp: sTime.valueOf(),
            icon: MicNoneOutlinedIcon,
            color: '#7C3AED',
            bgcolor: '#F5F3FF',
          });
        });
      }
    } catch (err) {
      console.error('Failed to load candidate real activities:', err);
    }

    // Sort events in chronological order (newest first)
    events.sort((a, b) => b.timestamp - a.timestamp);

    setActivities(events);
    setIsLoading(false);
  }, [profileDetail, candidateName, candidateId, candidateEmail, candidateSlug]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <HistoryOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
            Nhật ký hoạt động
          </Typography>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
            <CircularProgress size={30} />
          </Box>
        ) : activities.length > 0 ? (
          <Stack spacing={2.5}>
            {activities.map((act) => {
              const Icon = act.icon;
              return (
                <Stack key={act.id} direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      bgcolor: act.bgcolor,
                      color: act.color,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    <Icon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} flexWrap="wrap">
                      <Typography variant="subtitle2" sx={{ fontWeight: 750, color: '#0F172A', fontSize: '0.875rem' }}>
                        {act.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem' }}>
                        {act.time}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25, fontSize: '0.8125rem', lineHeight: 1.5 }}>
                      {act.description}
                    </Typography>
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>
              Chưa có ghi nhận hoạt động nào trên hồ sơ ứng viên này.
            </Typography>
          </Box>
        )}
      </Paper>
    </Stack>
  );
};

export default CandidateActivityTab;
