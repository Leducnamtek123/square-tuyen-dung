'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Box,
  Typography,
  Chip,
  Grid2 as Grid,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Skeleton,
  Avatar,
  Stack,
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { localizeRoutePath } from '@/configs/routeLocalization';
import jobService from '@/services/jobService';
import type { JobPost } from '@/types/models';

const formatSalary = (min?: number | null, max?: number | null) => {
  if (min && max) {
    const minM = (min / 1_000_000).toLocaleString('vi-VN');
    const maxM = (max / 1_000_000).toLocaleString('vi-VN');
    return `${minM} - ${maxM} triệu VNĐ`;
  }
  if (min) return `Từ ${(min / 1_000_000).toLocaleString('vi-VN')} triệu VNĐ`;
  if (max) return `Đến ${(max / 1_000_000).toLocaleString('vi-VN')} triệu VNĐ`;
  return 'Thỏa thuận';
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return 'Mới đăng';
  const d = dayjs(dateStr);
  return d.isValid() ? d.format('DD/MM/YYYY') : 'Mới đăng';
};

const getLocationName = (loc: unknown): string => {
  if (!loc) return 'Thành phố Hồ Chí Minh';
  if (typeof loc === 'string') return loc;
  if (typeof loc === 'object' && loc !== null) {
    const l = loc as Record<string, unknown>;
    if (l.address && typeof l.address === 'string') return l.address;
    if (typeof l.city === 'object' && l.city !== null) {
      const c = l.city as Record<string, unknown>;
      if (c.name && typeof c.name === 'string') return c.name;
    }
    if (typeof l.city === 'string') return l.city;
  }
  return 'Thành phố Hồ Chí Minh';
};

const CandidateRecommendedJobsCard = () => {
  const { i18n } = useTranslation('common');
  const [jobs, setJobs] = React.useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [savedJobs, setSavedJobs] = React.useState<Record<number, boolean>>({});
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Fetch real jobs from backend API
    jobService
      .getJobPosts({ page: 1, pageSize: 6 })
      .then((res) => {
        if (!isMounted) return;
        const jobList = res.results || [];
        setJobs(jobList);
      })
      .catch((err) => {
        console.error('Failed to load recommended jobs from API:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleSave = async (e: React.MouseEvent, jobId: number, title: string, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    const currentlySaved = !!savedJobs[jobId];

    setSavedJobs((prev) => ({ ...prev, [jobId]: !currentlySaved }));

    try {
      await jobService.saveJobPost(slug);
      setToastMessage(!currentlySaved ? `Đã lưu công việc: "${title}"` : `Đã bỏ lưu công việc: "${title}"`);
    } catch {
      // Toggle back on error
      setSavedJobs((prev) => ({ ...prev, [jobId]: currentlySaved }));
      setToastMessage(`Đã cập nhật trạng thái lưu cho "${title}"`);
    }
  };

  const jobsPath = localizeRoutePath('/jobs', i18n.language);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Việc làm gợi ý cho bạn
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem' }}>
            Dựa trên hồ sơ và sở thích của bạn (Cập nhật từ hệ thống API)
          </Typography>
        </Box>

        <Button
          component={Link}
          href={jobsPath}
          size="small"
          endIcon={<ArrowForwardIcon />}
          sx={{
            color: '#2563eb',
            fontWeight: 700,
            fontSize: '0.8rem',
            textTransform: 'none',
            '&:hover': { backgroundColor: 'transparent', color: '#1d4ed8' },
          }}
        >
          Xem tất cả việc làm
        </Button>
      </Box>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={idx}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
                  height: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '10px' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="90%" height={24} />
                    <Skeleton variant="text" width="60%" height={18} />
                  </Box>
                </Box>
                <Stack spacing={0.5} sx={{ my: 1 }}>
                  <Skeleton variant="text" width="70%" height={18} />
                  <Skeleton variant="text" width="50%" height={18} />
                </Stack>
                <Skeleton variant="rectangular" height={24} sx={{ borderRadius: '6px' }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : jobs.length === 0 ? (
        /* Empty State */
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
            Hiện chưa có việc làm gợi ý phù hợp. Vui lòng quay lại sau!
          </Typography>
          <Button
            component={Link}
            href={jobsPath}
            variant="outlined"
            size="small"
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            Khám phá việc làm ngay
          </Button>
        </Box>
      ) : (
        /* Real API Job Cards */
        <Grid container spacing={2}>
          {jobs.map((job) => {
            const jobDetailPath = localizeRoutePath(`/jobs/${job.slug}`, i18n.language);
            const isSaved = !!savedJobs[job.id];
            const companyName = job.companyDict?.companyName || job.company?.companyName || 'Square Tuyen Dung';
            const companyLogo = job.companyDict?.logoUrl || job.company?.logoUrl;
            const salaryText = formatSalary(job.salaryMin, job.salaryMax);
            const locationText = getLocationName(job.location);
            const tagLabel = job.isHot ? 'Hot' : job.isUrgent ? 'Tuyển gấp' : 'Phù hợp';
            const tagBg = job.isHot ? '#fee2e2' : job.isUrgent ? '#fff7ed' : '#dcfce7';
            const tagColor = job.isHot ? '#dc2626' : job.isUrgent ? '#ea580c' : '#15803d';

            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={job.id}>
                <Box
                  component={Link}
                  href={jobDetailPath}
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#cbd5e1',
                      boxShadow: '0 8px 30px -4px rgba(0,0,0,0.06)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', flexGrow: 1, minWidth: 0 }}>
                        {companyLogo ? (
                          <Avatar
                            src={companyLogo}
                            variant="rounded"
                            sx={{ width: 40, height: 40, borderRadius: '10px', flexShrink: 0 }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '10px',
                              backgroundColor: '#1e293b',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <ApartmentIcon sx={{ fontSize: 22 }} />
                          </Box>
                        )}
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: '#0f172a',
                              fontSize: '0.875rem',
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              height: '2.6em',
                              '&:hover': { color: '#2563eb' },
                            }}
                          >
                            {job.jobName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', display: 'block', mt: 0.25 }} noWrap>
                            {companyName}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        size="small"
                        label={tagLabel}
                        sx={{
                          backgroundColor: tagBg,
                          color: tagColor,
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 20,
                          flexShrink: 0,
                          '& .MuiChip-label': { px: 0.75 },
                        }}
                      />
                    </Box>

                    <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <MonetizationOnOutlinedIcon sx={{ fontSize: 16, color: '#2563eb', flexShrink: 0 }} />
                        <Typography variant="caption" noWrap sx={{ color: '#2563eb', fontWeight: 700, fontSize: '0.775rem' }}>
                          {salaryText}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#64748b', flexShrink: 0 }} />
                        <Typography variant="caption" noWrap sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                          {locationText}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8', flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.725rem' }}>
                          {formatDate(job.createAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid #f8fafc' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleToggleSave(e, job.id, job.jobName, job.slug)}
                      sx={{ color: isSaved ? '#2563eb' : '#94a3b8', p: 0.5, '&:hover': { color: '#2563eb' } }}
                    >
                      {isSaved ? <BookmarkIcon sx={{ fontSize: 18 }} /> : <BookmarkBorderIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.725rem' }}>
                      {job.deadline ? `Hạn: ${formatDate(job.deadline)}` : 'Đang tuyển'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* MUI Snackbar Feedback */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToastMessage(null)} severity="success" sx={{ width: '100%', borderRadius: '10px' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CandidateRecommendedJobsCard;
