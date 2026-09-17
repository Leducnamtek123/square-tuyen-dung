'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  Typography,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Stack,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import { TabTitle } from '@/utils/generalFunction';
import { useMyInterviews } from './hooks/useMyInterviews';
import { transformInterviewSession } from '@/utils/transformers';
import type { InterviewSession } from '@/types/models';
import { ROUTES } from '@/configs/constants';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { localizeRoutePath } from '@/configs/routeLocalization';
import CandidateEvaluationModal from './components/CandidateEvaluationModal';

type FilterTab = 'all' | 'official' | 'mock' | 'scheduled' | 'completed';

const MyInterviewsPage = () => {
  const { t, i18n } = useTranslation(['jobSeeker', 'common', 'errors', 'interview', 'employer']);
  TabTitle(t('jobSeeker:myInterviewsTitle'));

  const { push } = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [evaluationSession, setEvaluationSession] = useState<InterviewSession | null>(null);

  const { data: interviewsData, isLoading, isError } = useMyInterviews({ pageSize: 50 });

  const interviews: InterviewSession[] = useMemo(() => {
    return (interviewsData?.results || []).flatMap((session) => {
      const interview = transformInterviewSession(session);
      return interview ? [interview] : [];
    });
  }, [interviewsData]);

  const handleJoin = (inviteToken: string) => {
    push(`/${ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM.replace(':id', inviteToken)}`);
  };

  const jobsPath = localizeRoutePath('/jobs', i18n.language);
  const practicePath = localizeRoutePath('/ung-vien/phong-van-thu', i18n.language);

  // Filtered interviews based on Tab and Search
  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      // Tab filter
      const st = (item.status || '').toLowerCase();
      const isMock = item.sessionType === 'mock';
      if (activeTab === 'official') {
        if (isMock) return false;
      } else if (activeTab === 'mock') {
        if (!isMock) return false;
      } else if (activeTab === 'scheduled') {
        if (!['scheduled', 'in_progress', 'calibration'].includes(st)) return false;
      } else if (activeTab === 'completed') {
        if (st !== 'completed') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const jName = (item.jobName || '').toLowerCase();
        const cName = (item.companyName || '').toLowerCase();
        return jName.includes(query) || cName.includes(query);
      }

      return true;
    });
  }, [interviews, activeTab, searchQuery]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    return {
      all: interviews.length,
      official: interviews.filter((i) => i.sessionType !== 'mock').length,
      mock: interviews.filter((i) => i.sessionType === 'mock').length,
      scheduled: interviews.filter((i) => ['scheduled', 'in_progress', 'calibration'].includes((i.status || '').toLowerCase())).length,
      completed: interviews.filter((i) => (i.status || '').toLowerCase() === 'completed').length,
    };
  }, [interviews]);

  const formatScheduledDate = (scheduledAt?: string | null) => {
    if (!scheduledAt) return null;
    try {
      const d = new Date(scheduledAt);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Ho_Chi_Minh',
      });
    } catch {
      return null;
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Banner */}
      <Box
        sx={{
          mb: 3,
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '16px',
          background: `linear-gradient(100deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 58, 138, 0.80) 45%, rgba(15, 23, 42, 0.40) 100%), url(/images/banners/banner-interviews.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          color: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 35px -5px rgba(15, 23, 42, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: 'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <VideoCameraFrontIcon sx={{ fontSize: 24, color: '#ffffff' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {t('jobSeeker:myInterviewsTitle')}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: 620, lineHeight: 1.5 }}>
            {t('jobSeeker:myInterviews.pageSubtitle', {
              defaultValue: 'Theo dõi lịch phỏng vấn cùng Nhà tuyển dụng và lịch sử các buổi luyện tập phỏng vấn AI thông minh.',
            })}
          </Typography>
        </Box>

        <Button
          component={Link}
          href={practicePath}
          variant="contained"
          startIcon={<AutoAwesomeOutlinedIcon />}
          sx={{
            bgcolor: '#ffffff',
            color: '#1e40af',
            fontWeight: 700,
            borderRadius: '10px',
            px: 2.5,
            py: 1.1,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap',
            '&:hover': {
              bgcolor: '#f8fafc',
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
            },
          }}
        >
          {t('jobSeeker:myInterviews.practiceNow', { defaultValue: 'Luyện tập phỏng vấn AI ngay' })}
        </Button>
      </Box>

      {/* Control Bar: Tabs & Search */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 1.5, sm: 2 },
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', xl: 'row' },
          alignItems: { xs: 'stretch', xl: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 40,
            '& .MuiTabs-indicator': {
              backgroundColor: '#2563eb',
              height: 3,
              borderRadius: '3px',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              minHeight: 40,
              px: { xs: 1.25, sm: 2 },
              color: '#64748b',
              '&.Mui-selected': {
                color: '#2563eb',
                fontWeight: 700,
              },
            },
          }}
        >
          <Tab
            value="all"
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                <span>{t('jobSeeker:myInterviews.tabs.all', { defaultValue: 'Tất cả' })}</span>
                <Box
                  component="span"
                  sx={{
                    px: 0.85,
                    py: 0.15,
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    bgcolor: activeTab === 'all' ? '#dbeafe' : '#f1f5f9',
                    color: activeTab === 'all' ? '#1d4ed8' : '#64748b',
                  }}
                >
                  {tabCounts.all}
                </Box>
              </Box>
            }
          />
          <Tab
            value="official"
            icon={<ApartmentOutlinedIcon sx={{ fontSize: '16px !important' }} />}
            iconPosition="start"
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                <span>{t('jobSeeker:myInterviews.tabs.official', { defaultValue: 'Phỏng vấn NTD' })}</span>
                <Box
                  component="span"
                  sx={{
                    px: 0.85,
                    py: 0.15,
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    bgcolor: activeTab === 'official' ? '#dbeafe' : '#f1f5f9',
                    color: activeTab === 'official' ? '#1d4ed8' : '#64748b',
                  }}
                >
                  {tabCounts.official}
                </Box>
              </Box>
            }
          />
          <Tab
            value="mock"
            icon={<SmartToyOutlinedIcon sx={{ fontSize: '16px !important', color: activeTab === 'mock' ? '#2563eb' : 'inherit' }} />}
            iconPosition="start"
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                <span>{t('jobSeeker:myInterviews.tabs.mock', { defaultValue: 'Luyện tập AI' })}</span>
                <Box
                  component="span"
                  sx={{
                    px: 0.85,
                    py: 0.15,
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    bgcolor: activeTab === 'mock' ? '#dbeafe' : '#f1f5f9',
                    color: activeTab === 'mock' ? '#1d4ed8' : '#64748b',
                  }}
                >
                  {tabCounts.mock}
                </Box>
              </Box>
            }
          />
          <Tab
            value="scheduled"
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                <span>{t('jobSeeker:myInterviews.tabs.scheduled', { defaultValue: 'Sắp diễn ra' })}</span>
                <Box
                  component="span"
                  sx={{
                    px: 0.85,
                    py: 0.15,
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    bgcolor: activeTab === 'scheduled' ? '#dbeafe' : '#f1f5f9',
                    color: activeTab === 'scheduled' ? '#1d4ed8' : '#64748b',
                  }}
                >
                  {tabCounts.scheduled}
                </Box>
              </Box>
            }
          />
          <Tab
            value="completed"
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                <span>{t('jobSeeker:myInterviews.tabs.completed', { defaultValue: 'Đã hoàn thành' })}</span>
                <Box
                  component="span"
                  sx={{
                    px: 0.85,
                    py: 0.15,
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    bgcolor: activeTab === 'completed' ? '#dbeafe' : '#f1f5f9',
                    color: activeTab === 'completed' ? '#1d4ed8' : '#64748b',
                  }}
                >
                  {tabCounts.completed}
                </Box>
              </Box>
            }
          />
        </Tabs>

        <TextField
          size="small"
          placeholder={t('jobSeeker:myInterviews.searchPlaceholder', { defaultValue: 'Tìm theo vị trí, công ty...' })}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon sx={{ fontSize: 20, color: '#94a3b8' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            minWidth: { xs: '100%', sm: 240, lg: 280 },
            width: { xs: '100%', lg: 'auto' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              fontSize: '0.875rem',
              '&:hover fieldset': {
                borderColor: '#cbd5e1',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#2563eb',
              },
            },
          }}
        />
      </Card>

      {/* Main Content Area */}
      {isLoading ? (
        <Card
          elevation={0}
          sx={{
            p: 8,
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            bgcolor: '#ffffff',
          }}
        >
          <CircularProgress size={40} sx={{ color: '#2563eb', mb: 2 }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
            {t('interview:loading', { defaultValue: 'Đang tải danh sách các buổi phỏng vấn...' })}
          </Typography>
        </Card>
      ) : isError ? (
        <Card
          elevation={0}
          sx={{
            p: 5,
            borderRadius: '16px',
            border: '1px solid #fecaca',
            bgcolor: '#fef2f2',
            textAlign: 'center',
          }}
        >
          <Typography variant="subtitle1" sx={{ color: '#dc2626', fontWeight: 700, mb: 1 }}>
            {t('errors:systemErrorTitle')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#b91c1c' }}>
            {t('errors:systemErrorDesc', { defaultValue: 'Không thể nạp dữ liệu phỏng vấn. Vui lòng tải lại trang hoặc liên hệ hỗ trợ.' })}
          </Typography>
        </Card>
      ) : filteredInterviews.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '24px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <CalendarMonthOutlinedIcon sx={{ fontSize: 44 }} />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
            {t('jobSeeker:myInterviews.emptyTitle')}
          </Typography>

          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', mb: 3, maxWidth: 440, lineHeight: 1.6 }}>
            {t('jobSeeker:myInterviews.emptySubtitle')}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              component={Link}
              href={jobsPath}
              variant="contained"
              sx={{
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                fontWeight: 700,
                px: 3.5,
                py: 1.1,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                  boxShadow: 'none',
                },
              }}
            >
              {t('jobSeeker:myInterviews.findJobs')}
            </Button>
            <Button
              component={Link}
              href={practicePath}
              variant="outlined"
              sx={{
                borderRadius: '10px',
                borderColor: '#cbd5e1',
                color: '#334155',
                fontWeight: 700,
                px: 3,
                py: 1.1,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#94a3b8',
                  bgcolor: '#f8fafc',
                },
              }}
            >
              {t('jobSeeker:myInterviews.practiceNow', { defaultValue: 'Luyện tập với AI' })}
            </Button>
          </Stack>
        </Card>
      ) : (
        <Stack spacing={2.5}>
          {filteredInterviews.map((interview: InterviewSession) => {
            const isMock = interview.sessionType === 'mock';
            const statusKey = (interview.status || 'scheduled').toLowerCase();
            const isCompleted = statusKey === 'completed';
            const isInProgress = statusKey === 'in_progress' || statusKey === 'calibration';
            const formattedDate = formatScheduledDate(interview.scheduledAt);
            const durationMins = interview.duration ? Math.round(interview.duration / 60) : null;
            const questionsCount = interview.questionsCount || (interview.questions?.length ?? null);

            return (
              <Card
                key={interview.id}
                variant="outlined"
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: '16px',
                  borderColor: '#bfdbfe',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.04)',
                  transition: 'all 0.25s ease-in-out',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: '#60a5fa',
                    boxShadow: '0 10px 25px -4px rgba(37,99,235,0.12)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {/* Top Accent Indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
                  }}
                />

                {/* Top Row: Avatar + Title/Company + Action Button */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 2,
                  }}
                >
                  {/* Left: Avatar & Title info */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minWidth: 0, flex: 1 }}>
                    <Avatar
                      src={!isMock ? (interview.companyLogo || undefined) : undefined}
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '14px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.1)',
                        flexShrink: 0,
                      }}
                    >
                      {isMock ? (
                        <SmartToyOutlinedIcon sx={{ fontSize: 28 }} />
                      ) : (
                        <ApartmentOutlinedIcon sx={{ fontSize: 28 }} />
                      )}
                    </Avatar>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      {/* Badges Stack */}
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
                        {/* Session Type Badge */}
                        {isMock ? (
                          <Chip
                            size="small"
                            icon={<SmartToyOutlinedIcon sx={{ fontSize: '14px !important', color: '#1d4ed8 !important' }} />}
                            label={t('jobSeeker:myInterviews.mockBadge', { defaultValue: 'Phiên luyện tập AI' })}
                            sx={{
                              bgcolor: '#eff6ff',
                              color: '#1d4ed8',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              border: '1px solid #bfdbfe',
                              height: 24,
                            }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            icon={<VerifiedUserOutlinedIcon sx={{ fontSize: '14px !important', color: '#1d4ed8 !important' }} />}
                            label={t('jobSeeker:myInterviews.officialBadge', { defaultValue: 'Phỏng vấn chính thức với NTD' })}
                            sx={{
                              bgcolor: '#eff6ff',
                              color: '#1d4ed8',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              border: '1px solid #bfdbfe',
                              height: 24,
                            }}
                          />
                        )}

                        {/* Status Badge */}
                        {isCompleted ? (
                          <Chip
                            size="small"
                            icon={<CheckCircleOutlineIcon sx={{ fontSize: '14px !important', color: '#059669 !important' }} />}
                            label={t(`employer:interviewListCard.statuses.${statusKey}`)}
                            sx={{
                              bgcolor: '#ecfdf5',
                              color: '#065f46',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              border: '1px solid #a7f3d0',
                              height: 24,
                            }}
                          />
                        ) : isInProgress ? (
                          <Chip
                            size="small"
                            label={t(`employer:interviewListCard.statuses.${statusKey}`)}
                            sx={{
                              bgcolor: '#fffbeb',
                              color: '#b45309',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              border: '1px solid #fde68a',
                              height: 24,
                              animation: 'pulse 2s infinite',
                            }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            icon={<AccessTimeOutlinedIcon sx={{ fontSize: '14px !important', color: '#2563eb !important' }} />}
                            label={t(`employer:interviewListCard.statuses.${statusKey}`)}
                            sx={{
                              bgcolor: '#f1f5f9',
                              color: '#334155',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              border: '1px solid #e2e8f0',
                              height: 24,
                            }}
                          />
                        )}

                        {/* AI Score Badge if evaluated */}
                        {interview.aiOverallScore != null && (
                          <Chip
                            size="small"
                            icon={<StarRoundedIcon sx={{ fontSize: '15px !important', color: '#eab308 !important' }} />}
                            label={Number(interview.aiOverallScore) <= 10 ? `${interview.aiOverallScore}/10` : `${interview.aiOverallScore}/100`}
                            sx={{
                              bgcolor: '#fefce8',
                              color: '#854d0e',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              border: '1px solid #fef08a',
                              height: 24,
                            }}
                          />
                        )}
                      </Stack>

                      {/* Job / Practice Topic Title */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          color: '#0f172a',
                          fontSize: { xs: '1rem', md: '1.125rem' },
                          lineHeight: 1.4,
                          mb: 0.5,
                        }}
                      >
                        {interview.jobName || (isMock ? 'Luyện tập kỹ năng phỏng vấn' : t('jobSeeker:myInterviews.jobNameFallback'))}
                      </Typography>

                      {/* Subtitle / Company or AI Ly info */}
                      {isMock ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#1e40af', fontWeight: 600, fontSize: '0.8125rem' }}>
                          <SmartToyOutlinedIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                          <span>{t('jobSeeker:myInterviews.aiInterviewer', { defaultValue: 'Trợ lý AI Ly · Huấn luyện viên phỏng vấn cá nhân' })}</span>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#1e3a8a', fontWeight: 600, fontSize: '0.8125rem' }}>
                          <ApartmentOutlinedIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                          <Typography component="span" sx={{ fontWeight: 700, color: '#1e40af', fontSize: '0.8125rem' }}>
                            {interview.companyName || t('jobSeeker:myInterviews.companyNameFallback')}
                          </Typography>
                          <Typography component="span" sx={{ color: '#64748b', fontSize: '0.8125rem' }}>
                            · Phỏng vấn trực tiếp cùng Hội đồng tuyển dụng
                          </Typography>
                        </Box>
                      )}

                      {/* Purpose & Privacy Notice */}
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                          color: '#1e40af',
                          bgcolor: '#eff6ff',
                          px: 1.25,
                          py: 0.4,
                          borderRadius: '6px',
                          mt: 0.75,
                          border: '1px solid #bfdbfe',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      >
                        {isMock
                          ? t('jobSeeker:myInterviews.mockCardHint', { defaultValue: 'Phiên luyện tập tự do với Trợ lý AI Ly · Kết quả riêng tư, không gửi tới NTD.' })
                          : t('jobSeeker:myInterviews.officialCardHint', { defaultValue: 'Buổi phỏng vấn trực tuyến chính thức cùng đại diện Hội đồng tuyển dụng.' })}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right: Actions */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      alignSelf: { xs: 'stretch', md: 'center' },
                      justifyContent: { xs: 'flex-end', md: 'flex-end' },
                    }}
                  >
                    {isCompleted ? (
                      <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        {isMock && (
                          <Button
                            component={Link}
                            href={practicePath}
                            variant="outlined"
                            startIcon={<ReplayRoundedIcon />}
                            sx={{
                              flex: { xs: 1, sm: 'none' },
                              borderRadius: '10px',
                              borderColor: '#bfdbfe',
                              color: '#2563eb',
                              textTransform: 'none',
                              fontWeight: 600,
                              px: 2,
                              py: 0.9,
                              '&:hover': {
                                borderColor: '#2563eb',
                                bgcolor: '#eff6ff',
                              },
                            }}
                          >
                            {t('jobSeeker:myInterviews.practiceAgain', { defaultValue: 'Luyện tập lại' })}
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          onClick={() => setEvaluationSession(interview)}
                          startIcon={<LaunchRoundedIcon />}
                          sx={{
                            flex: { xs: 1, sm: 'none' },
                            borderRadius: '10px',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2.5,
                            py: 0.9,
                            boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                            '&:hover': {
                              backgroundColor: '#1d4ed8',
                              boxShadow: '0 6px 16px rgba(37,99,235,0.35)',
                            },
                          }}
                        >
                          {t('jobSeeker:myInterviews.viewResults', { defaultValue: 'Xem kết quả & Đánh giá' })}
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={() => handleJoin(interview.inviteToken || '')}
                        startIcon={isMock ? <SmartToyOutlinedIcon /> : isInProgress ? <PlayArrowRoundedIcon /> : <VideoCameraFrontIcon />}
                        sx={{
                          width: { xs: '100%', sm: 'auto' },
                          borderRadius: '10px',
                          backgroundColor: isInProgress ? '#ea580c' : '#2563eb',
                          fontWeight: 700,
                          px: 3,
                          py: 1,
                          textTransform: 'none',
                          boxShadow: isInProgress
                            ? '0 4px 14px rgba(234,88,12,0.35)'
                            : '0 4px 14px rgba(37,99,235,0.28)',
                          '&:hover': {
                            backgroundColor: isInProgress ? '#c2410c' : '#1d4ed8',
                            boxShadow: isInProgress
                              ? '0 6px 18px rgba(234,88,12,0.4)'
                              : '0 6px 18px rgba(37,99,235,0.35)',
                          },
                        }}
                      >
                        {isMock
                          ? (isInProgress
                            ? t('jobSeeker:myInterviews.enterMockRoom', { defaultValue: 'Vào luyện tập với AI' })
                            : t('jobSeeker:myInterviews.joinMock', { defaultValue: 'Bắt đầu luyện tập với AI' }))
                          : (isInProgress
                            ? t('jobSeeker:myInterviews.enterOfficialRoom', { defaultValue: 'Vào phỏng vấn với NTD' })
                            : t('jobSeeker:myInterviews.joinOfficial', { defaultValue: 'Tham gia phỏng vấn với NTD' }))}
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Divider */}
                <Divider sx={{ my: 1.75, borderColor: '#f1f5f9' }} />

                {/* Bottom Row: Metadata Highlights */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1.25, sm: 3 }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ color: '#64748b', fontSize: '0.8125rem' }}
                >
                  {/* Scheduled Time */}
                  {formattedDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                      <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                        {formattedDate}
                      </Typography>
                    </Box>
                  )}

                  {/* Duration */}
                  {durationMins ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: '#64748b' }} />
                      <Typography variant="caption" sx={{ color: '#475569' }}>
                        {t('jobSeeker:myInterviews.durationMinutes', { minutes: durationMins, defaultValue: `${durationMins} phút` })}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: '#64748b' }} />
                      <Typography variant="caption" sx={{ color: '#475569' }}>
                        {t('jobSeeker:myInterviews.durationMinutes', { minutes: '15-30', defaultValue: '15-30 phút' })}
                      </Typography>
                    </Box>
                  )}

                  {/* Question Count */}
                  {questionsCount ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <QuizOutlinedIcon sx={{ fontSize: 16, color: '#64748b' }} />
                      <Typography variant="caption" sx={{ color: '#475569' }}>
                        {t('jobSeeker:myInterviews.questionsCount', { count: questionsCount, defaultValue: `${questionsCount} câu hỏi` })}
                      </Typography>
                    </Box>
                  ) : null}

                  {/* Interviewer persona */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {isMock ? (
                      <>
                        <SmartToyOutlinedIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                        <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600 }}>
                          {t('jobSeeker:myInterviews.aiInterviewer', { defaultValue: 'Trợ lý AI Ly (Luyện phản xạ)' })}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <BusinessCenterOutlinedIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                        <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 600 }}>
                          {`${t('interview:interviewListCard.interviewer', { defaultValue: 'Người phỏng vấn' })}: ${interview.companyName || 'Nhà tuyển dụng'}`}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Stack>

                {/* AI Summary note if available */}
                {interview.aiSummary && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      borderRadius: '10px',
                      bgcolor: '#f8fafc',
                      borderLeft: '3px solid #2563eb',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#334155', fontStyle: 'italic', display: 'block', lineHeight: 1.5 }}>
                      "{interview.aiSummary}"
                    </Typography>
                  </Box>
                )}
              </Card>
            );
          })}
        </Stack>
      )}

      <CandidateEvaluationModal
        session={evaluationSession}
        onClose={() => setEvaluationSession(null)}
        practicePath={practicePath}
      />
    </Box>
  );
};

export default MyInterviewsPage;

