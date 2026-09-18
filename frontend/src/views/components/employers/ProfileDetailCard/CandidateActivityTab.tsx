'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Stack, Typography, ButtonBase, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClockCounterClockwise,
  CheckCircle,
  Eye,
  Briefcase,
  Microphone,
  Sparkle,
  ArrowClockwise,
  CalendarBlank,
  FunnelSimple,
} from '@phosphor-icons/react';
import dayjs from '@/configs/dayjs-config';

import jobPostActivityService from '@/services/jobPostActivityService';
import interviewService from '@/services/interviewService';
import type { ResumeDetailResponse, JobPostActivity, InterviewSession } from '@/types/models';

interface CandidateActivityTabProps {
  profileDetail: ResumeDetailResponse;
}

export type ActivityCategory = 'all' | 'application' | 'interview' | 'system';

interface ActivityBadge {
  label: string;
  color: string;
  bgcolor: string;
  border: string;
}

interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  relativeTime: string;
  timestamp: number;
  icon: React.ElementType;
  color: string;
  bgcolor: string;
  borderColor: string;
  category: 'application' | 'interview' | 'system';
  badge?: ActivityBadge;
}

const getRelativeTime = (timestamp: number): string => {
  const now = dayjs();
  const target = dayjs(timestamp);
  const diffMinutes = now.diff(target, 'minute');
  const diffHours = now.diff(target, 'hour');
  const diffDays = now.diff(target, 'day');

  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return target.format('DD/MM/YYYY');
};

export const CandidateActivityTab: React.FC<CandidateActivityTabProps> = ({ profileDetail }) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ActivityCategory>('all');

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
      const ts = createdDate.valueOf();
      events.push({
        id: 'profile-created',
        title: 'Hồ sơ được khởi tạo trên hệ thống',
        description: 'Ứng viên hoàn tất tạo hồ sơ trực tuyến và thiết lập thông tin cơ bản.',
        time: createdDate.format('DD/MM/YYYY HH:mm'),
        relativeTime: getRelativeTime(ts),
        timestamp: ts,
        icon: Sparkle,
        color: '#475569',
        bgcolor: '#F8FAFC',
        borderColor: '#E2E8F0',
        category: 'system',
        badge: {
          label: 'Khởi tạo',
          color: '#475569',
          bgcolor: '#F1F5F9',
          border: '#E2E8F0',
        },
      });
    }

    // 2. Profile Last Updated Event
    if (profileDetail.updateAt && profileDetail.updateAt !== profileDetail.createAt) {
      const updatedDate = dayjs(profileDetail.updateAt);
      const ts = updatedDate.valueOf();
      events.push({
        id: 'profile-updated',
        title: 'Hồ sơ được cập nhật thông tin',
        description: 'Ứng viên cập nhật thông tin liên hệ, nguyện vọng làm việc hoặc kỹ năng chuyên môn.',
        time: updatedDate.format('DD/MM/YYYY HH:mm'),
        relativeTime: getRelativeTime(ts),
        timestamp: ts,
        icon: CheckCircle,
        color: '#16A34A',
        bgcolor: '#F0FDF4',
        borderColor: '#BBF7D0',
        category: 'system',
        badge: {
          label: 'Cập nhật',
          color: '#15803D',
          bgcolor: '#DCFCE7',
          border: '#BBF7D0',
        },
      });
    }

    // 3. Profile Views Event
    const views = profileDetail.viewEmployerNumber || 0;
    if (views > 0) {
      const viewDate = profileDetail.updateAt ? dayjs(profileDetail.updateAt) : dayjs();
      const ts = viewDate.valueOf();
      events.push({
        id: 'profile-views',
        title: 'Nhà tuyển dụng đã xem hồ sơ',
        description: `Hồ sơ có tổng cộng ${views} lượt xem từ các nhà tuyển dụng trên hệ thống.`,
        time: viewDate.format('DD/MM/YYYY HH:mm'),
        relativeTime: getRelativeTime(ts),
        timestamp: ts,
        icon: Eye,
        color: '#2563EB',
        bgcolor: '#EFF6FF',
        borderColor: '#BFDBFE',
        category: 'system',
        badge: {
          label: `${views} lượt xem`,
          color: '#1D4ED8',
          bgcolor: '#DBEAFE',
          border: '#BFDBFE',
        },
      });
    }

    // 4. Query Applications & Interviews from API
    try {
      const [applicationsRes, interviewsRes] = await Promise.allSettled([
        jobPostActivityService.getAppliedResume({
          kw: candidateName !== 'Ứng viên' ? candidateName : undefined,
          pageSize: 20,
        }),
        interviewService.getSessions({
          search: candidateName !== 'Ứng viên' ? candidateName : undefined,
          pageSize: 20,
        }),
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
          const ts = appTime.valueOf();
          events.push({
            id: `app-${app.id}`,
            title: `Ứng tuyển: ${app.jobName || 'Tin tuyển dụng'}`,
            description: `Đơn ứng tuyển được gửi qua hệ thống. Vị trí tiếp nhận đã được ghi nhận.`,
            time: appTime.format('DD/MM/YYYY HH:mm'),
            relativeTime: getRelativeTime(ts),
            timestamp: ts,
            icon: Briefcase,
            color: '#0284C7',
            bgcolor: '#F0F9FF',
            borderColor: '#BAE6FD',
            category: 'application',
            badge: {
              label: app.statusName || 'Đang xử lý',
              color: '#0369A1',
              bgcolor: '#E0F2FE',
              border: '#BAE6FD',
            },
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
          const sTime = s.scheduledAt ? dayjs(s.scheduledAt) : s.startTime ? dayjs(s.startTime) : dayjs();
          const ts = sTime.valueOf();
          const isAi = s.type === 'mixed';
          events.push({
            id: `interview-${s.id}`,
            title: `Lên lịch phỏng vấn: ${s.jobName || 'Buổi phỏng vấn'}`,
            description: `Hình thức: ${isAi ? 'AI Voice Bot' : 'Trực tiếp'}. Lịch hẹn đã sẵn sàng trên hệ thống.`,
            time: sTime.format('DD/MM/YYYY HH:mm'),
            relativeTime: getRelativeTime(ts),
            timestamp: ts,
            icon: Microphone,
            color: '#7C3AED',
            bgcolor: '#F5F3FF',
            borderColor: '#DDD6FE',
            category: 'interview',
            badge: {
              label: isAi ? 'AI Voice' : 'Phỏng vấn',
              color: '#6D28D9',
              bgcolor: '#EDE9FE',
              border: '#DDD6FE',
            },
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

  // Filtered activities
  const filteredActivities = useMemo(() => {
    if (activeFilter === 'all') return activities;
    return activities.filter((act) => act.category === activeFilter);
  }, [activities, activeFilter]);

  // Counts for filters
  const counts = useMemo(() => {
    return {
      all: activities.length,
      application: activities.filter((a) => a.category === 'application').length,
      interview: activities.filter((a) => a.category === 'interview').length,
      system: activities.filter((a) => a.category === 'system').length,
    };
  }, [activities]);

  const filterButtons: { id: ActivityCategory; label: string; count: number }[] = [
    { id: 'all', label: 'Tất cả', count: counts.all },
    { id: 'application', label: 'Ứng tuyển', count: counts.application },
    { id: 'interview', label: 'Phỏng vấn', count: counts.interview },
    { id: 'system', label: 'Hồ sơ & Hệ thống', count: counts.system },
  ];

  return (
    <Stack spacing={2.5}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
        }}
      >
        {/* 1. HEADER ROW WITH ACTION */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1.5}
          sx={{ mb: 3 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#2563EB',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            >
              <ClockCounterClockwise size={20} weight="duotone" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Nhật ký hoạt động
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748B',
                  fontWeight: 500,
                  fontSize: '0.78rem',
                }}
              >
                Lịch sử tương tác và các mốc thời gian thực của ứng viên
              </Typography>
            </Box>
          </Stack>

          {/* Tactile Refresh Button */}
          <ButtonBase
            onClick={loadActivities}
            disabled={isLoading}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: '8px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#334155',
              fontSize: '0.78rem',
              fontWeight: 650,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: '#F1F5F9',
                borderColor: '#CBD5E1',
                color: '#0F172A',
              },
              '&:active': {
                transform: 'scale(0.97)',
              },
            }}
          >
            <ArrowClockwise
              size={14}
              weight="bold"
              style={{
                animation: isLoading ? 'spin 1s linear infinite' : 'none',
                color: '#64748B',
              }}
            />
            <span>Làm mới</span>
          </ButtonBase>
        </Stack>

        {/* 2. SEGMENTED FILTER CONTROLS */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 3.5,
            overflowX: 'auto',
            pb: 0.5,
            scrollbarWidth: 'none',
            '::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {filterButtons.map((btn) => {
            const isSelected = activeFilter === btn.id;
            return (
              <ButtonBase
                key={btn.id}
                onClick={() => setActiveFilter(btn.id)}
                sx={{
                  position: 'relative',
                  px: 1.75,
                  py: 0.8,
                  borderRadius: '9px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 750 : 600,
                  color: isSelected ? '#FFFFFF' : '#475569',
                  bgcolor: isSelected ? '#0F172A' : '#F8FAFC',
                  border: '1px solid',
                  borderColor: isSelected ? '#0F172A' : '#E2E8F0',
                  boxShadow: isSelected ? '0 2px 6px rgba(15, 23, 42, 0.12)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isSelected ? '#1E293B' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#0F172A',
                  },
                  '&:active': {
                    transform: 'scale(0.97)',
                  },
                }}
              >
                <span>{btn.label}</span>
                <Box
                  component="span"
                  sx={{
                    px: 0.75,
                    py: 0.1,
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 750,
                    fontFamily: 'var(--font-mono)',
                    bgcolor: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0',
                    color: isSelected ? '#FFFFFF' : '#64748B',
                    lineHeight: 1.2,
                  }}
                >
                  {btn.count}
                </Box>
              </ButtonBase>
            );
          })}
        </Box>

        {/* 3. TIMELINE CONTENT BODY */}
        {isLoading ? (
          /* SKELETON TIMELINE (ANTI-AI: NO CIRCULAR SPINNERS) */
          <Box sx={{ position: 'relative', pl: 1, py: 1 }}>
            {/* Background Rail */}
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                bottom: 20,
                left: 27,
                width: 2,
                bgcolor: '#F1F5F9',
              }}
            />

            <Stack spacing={3}>
              {[1, 2, 3].map((idx) => (
                <Stack key={idx} direction="row" spacing={2.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '12px',
                      bgcolor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      flexShrink: 0,
                      animation: 'pulse 1.6s ease-in-out infinite',
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0, pt: 0.5 }}>
                    <Box
                      sx={{
                        width: idx === 1 ? '45%' : idx === 2 ? '60%' : '35%',
                        height: 16,
                        borderRadius: '4px',
                        bgcolor: '#F1F5F9',
                        mb: 1.2,
                        animation: 'pulse 1.6s ease-in-out infinite',
                      }}
                    />
                    <Box
                      sx={{
                        width: '85%',
                        height: 12,
                        borderRadius: '4px',
                        bgcolor: '#F8FAFC',
                        animation: 'pulse 1.6s ease-in-out infinite',
                      }}
                    />
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        ) : filteredActivities.length > 0 ? (
          /* REAL TIMELINE WITH CONTINUOUS SPINE & SPRING REVEAL */
          <Box sx={{ position: 'relative', pl: 1, py: 1 }}>
            {/* Continuous Vertical Timeline Rail Spine */}
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                bottom: 24,
                left: 27,
                width: 2,
                bgcolor: '#E2E8F0',
                borderRadius: '1px',
              }}
            />

            <Stack spacing={2.5}>
              <AnimatePresence mode="popLayout">
                {filteredActivities.map((act, index) => {
                  const Icon = act.icon;
                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        type: 'spring',
                        stiffness: 280,
                        damping: 24,
                        delay: index * 0.04,
                      }}
                    >
                      <Stack direction="row" spacing={2.5} alignItems="flex-start">
                        {/* Node Symbol Container */}
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '12px',
                            bgcolor: act.bgcolor,
                            border: `1.5px solid ${act.borderColor}`,
                            color: act.color,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                            position: 'relative',
                            zIndex: 2,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                            transition: 'transform 0.15s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            },
                          }}
                        >
                          <Icon size={19} weight="duotone" />
                        </Box>

                        {/* Event Content Card */}
                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            p: 2,
                            borderRadius: '12px',
                            bgcolor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.02)',
                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                            '&:hover': {
                              borderColor: '#CBD5E1',
                              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={1}
                            flexWrap="wrap"
                            gap={0.5}
                          >
                            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 750,
                                  color: '#0F172A',
                                  fontSize: '0.875rem',
                                  letterSpacing: '-0.01em',
                                }}
                              >
                                {act.title}
                              </Typography>

                              {act.badge && (
                                <Box
                                  component="span"
                                  sx={{
                                    px: 1,
                                    py: 0.2,
                                    borderRadius: '6px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    bgcolor: act.badge.bgcolor,
                                    color: act.badge.color,
                                    border: `1px solid ${act.badge.border}`,
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {act.badge.label}
                                </Box>
                              )}
                            </Stack>

                            {/* Relative & Absolute Monospace Time Pill */}
                            <Tooltip title={`Thời gian chính xác: ${act.time}`} arrow placement="top">
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 650,
                                  fontFamily: 'var(--font-mono)',
                                  bgcolor: '#F8FAFC',
                                  color: '#475569',
                                  border: '1px solid #E2E8F0',
                                  cursor: 'help',
                                }}
                              >
                                <span>{act.relativeTime}</span>
                              </Box>
                            </Tooltip>
                          </Stack>

                          <Typography
                            variant="body2"
                            sx={{
                              color: '#64748B',
                              mt: 0.75,
                              fontSize: '0.8125rem',
                              lineHeight: 1.6,
                            }}
                          >
                            {act.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Stack>
          </Box>
        ) : (
          /* PURPOSEFUL EMPTY STATE (ANTI-AI: NO BARE ITEN TEXT) */
          <Box
            sx={{
              py: 6,
              px: 3,
              textAlign: 'center',
              borderRadius: '12px',
              bgcolor: '#F8FAFC',
              border: '1px dashed #CBD5E1',
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#94A3B8',
                display: 'grid',
                placeItems: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <CalendarBlank size={26} weight="duotone" />
            </Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 750,
                color: '#0F172A',
                fontSize: '0.92rem',
                letterSpacing: '-0.01em',
              }}
            >
              {activeFilter !== 'all'
                ? 'Không có hoạt động nào trong danh mục này'
                : 'Chưa ghi nhận hoạt động nào'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748B',
                mt: 0.75,
                mb: 2.5,
                fontSize: '0.8125rem',
                maxWidth: 420,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Các tương tác như nộp đơn ứng tuyển, tham gia phỏng vấn hay cập nhật hồ sơ sẽ tự
              động được hệ thống lưu lại và đồng bộ tại đây.
            </Typography>
            <ButtonBase
              onClick={loadActivities}
              sx={{
                px: 2,
                py: 0.9,
                borderRadius: '8px',
                bgcolor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#94A3B8',
                  bgcolor: '#F1F5F9',
                },
                '&:active': {
                  transform: 'scale(0.97)',
                },
              }}
            >
              <ArrowClockwise size={15} weight="bold" />
              <span>Kiểm tra lại dữ liệu</span>
            </ButtonBase>
          </Box>
        )}
      </Paper>
    </Stack>
  );
};

export default CandidateActivityTab;
