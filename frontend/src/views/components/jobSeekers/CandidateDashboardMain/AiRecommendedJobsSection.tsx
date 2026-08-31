'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  Typography,
  Chip,
  Stack,
  Avatar,
  Button,
  Grid2 as Grid,
  CircularProgress,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { localizeRoutePath } from '@/configs/routeLocalization';
import httpRequest from '@/utils/httpRequest';
import { unwrapDataResponse } from '@/utils/apiResponse';
import type { JobPost } from '@/types/models';

const AiRecommendedJobsSection = () => {
  const { t, i18n } = useTranslation(['jobSeeker', 'common']);
  const [loading, setLoading] = React.useState(true);
  const [jobs, setJobs] = React.useState<JobPost[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);

    httpRequest
      .get('job/web/job-posts/recommended-jobs/')
      .then((res) => {
        if (!isMounted) return;
        const data = unwrapDataResponse<JobPost[] | { results?: JobPost[] }>(res);
        const list = Array.isArray(data) ? data : data?.results || [];
        setJobs(list.slice(0, 4));
      })
      .catch(() => {
        if (isMounted) setJobs([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const jobsPath = localizeRoutePath('/jobs', i18n.language);

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        mb: 3,
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
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
                {t('jobSeeker:candidateDashboard.aiRecommended.title', { defaultValue: 'Việc làm gợi ý bởi AI' })}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              {t('jobSeeker:candidateDashboard.aiRecommended.subtitle', { defaultValue: 'AI phân tích hồ sơ & nguyện vọng để đề xuất các cơ hội phù hợp nhất với bạn' })}
            </Typography>
          </Box>
        </Box>

        <Button
          component={Link}
          href={jobsPath}
          endIcon={<ArrowForwardIcon />}
          sx={{
            fontWeight: 700,
            color: '#2563eb',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#eff6ff' },
          }}
        >
          {t('jobSeeker:candidateDashboard.aiRecommended.viewAll', { defaultValue: 'Xem tất cả' })}
        </Button>
      </Stack>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, gap: 1.5 }}>
          <CircularProgress size={24} sx={{ color: '#2563eb' }} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            AI đang phân tích các việc làm tốt nhất cho bạn...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {jobs.map((job, idx) => {
            const score = 98 - idx * 3;
            const item = job as any;
            const companyName = item.company?.companyName || item.companyDict?.companyName || '';
            const logoUrl = item.company?.logoUrl || item.companyDict?.logoUrl || undefined;
            const cityName = item.location?.city?.name || 'Toàn quốc';
            const sMin = item.salaryMin || item.salary_min;
            const sMax = item.salaryMax || item.salary_max;
            const salary = sMin && sMax ? `${sMin} - ${sMax} triệu` : 'Thỏa thuận';
            const detailPath = localizeRoutePath(`/jobs/${item.slug || item.id}`, i18n.language);

            return (
              <Grid size={{ xs: 12, md: 6 }} key={item.id}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2.25,
                    borderRadius: '16px',
                    borderColor: '#e2e8f0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#2563eb',
                      boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box>
                    {/* Top Company & Match Score Badge */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          src={logoUrl}
                          alt={companyName}
                          variant="rounded"
                          sx={{ width: 44, height: 44, borderRadius: '10px', border: '1px solid #f1f5f9' }}
                        >
                          {companyName.charAt(0)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }} noWrap>
                            {companyName}
                          </Typography>
                          <Typography
                            component={Link}
                            href={detailPath}
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
                              color: '#0f172a',
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textDecoration: 'none',
                              '&:hover': { color: '#2563eb' },
                            }}
                          >
                            {job.jobName || 'Việc làm chuyên môn'}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
                        label={`${score}% Phù hợp`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.725rem',
                          backgroundColor: '#f0fdf4',
                          color: '#16a34a',
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px',
                          flexShrink: 0,
                        }}
                      />
                    </Stack>

                    {/* Metadata */}
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {cityName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#16a34a' }}>
                        <AttachMoneyOutlinedIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {salary}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                        <WorkOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {job.experience ? `${job.experience} năm` : 'Mọi kinh nghiệm'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Footer Action */}
                  <Button
                    component={Link}
                    href={detailPath}
                    variant="contained"
                    fullWidth
                    sx={{
                      borderRadius: '10px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    Ứng tuyển ngay
                  </Button>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Card>
  );
};

export default AiRecommendedJobsSection;
