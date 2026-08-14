'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Stack,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useTranslation } from 'react-i18next';
import type { CandidateFullFormValues } from '../schemas/candidateOnboardingSchema';
import type { RecommendedJobPreview } from '@/types/auth';

interface StepCandidateCompleteProps {
  formData: CandidateFullFormValues;
  careerName: string;
  cityName: string;
  completeness: number;
  recommendedJobs: RecommendedJobPreview[];
  onExploreJobs: () => void;
  onViewDashboard: () => void;
}

export default function StepCandidateComplete({
  formData,
  careerName,
  cityName,
  completeness = 80,
  recommendedJobs = [],
  onExploreJobs,
  onViewDashboard,
}: StepCandidateCompleteProps) {
  const { t } = useTranslation('jobSeeker');

  const formatSalaryText = () => {
    if (formData.isSalaryNegotiable) return t('onboarding.step2.salaryNegotiable', 'Thỏa thuận');
    if (formData.salaryMin && formData.salaryMax) {
      return `${Number(formData.salaryMin).toLocaleString('vi-VN')} - ${Number(formData.salaryMax).toLocaleString('vi-VN')} VNĐ`;
    }
    if (formData.salaryMin) {
      return `Từ ${Number(formData.salaryMin).toLocaleString('vi-VN')} VNĐ`;
    }
    return t('onboarding.step2.salaryNegotiable', 'Thỏa thuận');
  };

  return (
    <Box sx={{ textAlign: 'center', py: 1 }}>
      {/* Celebration Header */}
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: '#DCFCE7',
          color: '#16A34A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
          boxShadow: '0 8px 24px rgba(22, 163, 74, 0.2)',
        }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 44 }} />
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, fontSize: { xs: '1.5rem', sm: '1.85rem' } }}>
        {t('onboarding.step4.title', 'Hồ sơ của bạn đã sẵn sàng!')}
      </Typography>
      <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 540, mx: 'auto', mb: 3.5 }}>
        {t('onboarding.step4.subtitle', 'Hệ thống đã phân tích mục tiêu và tìm thấy các cơ hội việc làm phù hợp nhất cho bạn.')}
      </Typography>

      {/* Completeness Progress Meter */}
      <Card
        variant="outlined"
        sx={{
          p: 2.5,
          mb: 3.5,
          borderRadius: 3,
          backgroundColor: '#F8FAFC',
          borderColor: '#E2E8F0',
          textAlign: 'left',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
            {t('onboarding.step4.completenessScore', 'Mức độ hoàn thiện hồ sơ')}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2563EB' }}>
            {completeness}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={completeness}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#E2E8F0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
            },
          }}
        />
      </Card>

      {/* Preferences Summary Card */}
      <Card
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 4,
          borderRadius: 3.5,
          textAlign: 'left',
          backgroundColor: '#FFFFFF',
          borderColor: '#E2E8F0',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: '#2563EB',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            display: 'block',
            mb: 2,
          }}
        >
          {t('onboarding.step4.summaryTitle', 'Tóm tắt mục tiêu công việc đã lưu')}
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <WorkOutlineIcon fontSize="small" sx={{ color: '#64748B' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  {t('onboarding.step4.position', 'Vị trí')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {formData.desiredJobTitle || '—'}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <BusinessCenterOutlinedIcon fontSize="small" sx={{ color: '#64748B' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  {t('onboarding.step4.career', 'Ngành nghề')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {careerName || '—'}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <LocationOnOutlinedIcon fontSize="small" sx={{ color: '#64748B' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  {t('onboarding.step4.location', 'Địa điểm')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {cityName || '—'}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <AttachMoneyOutlinedIcon fontSize="small" sx={{ color: '#64748B' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  {t('onboarding.step4.salary', 'Mức lương')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {formatSalaryText()}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Skills List */}
          {Boolean(formData.skills?.length) && (
            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }} />
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1 }}>
                {t('onboarding.step4.skills', 'Kỹ năng chính')}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {formData.skills?.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    sx={{
                      borderRadius: 1.5,
                      fontWeight: 600,
                      backgroundColor: '#EFF6FF',
                      color: '#1D4ED8',
                    }}
                  />
                ))}
              </Stack>
            </Grid>
          )}

          {/* CV Status */}
          <Grid item xs={12}>
            <Divider sx={{ my: 0.5 }} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <InsertDriveFileOutlinedIcon
                fontSize="small"
                sx={{ color: formData.fileName ? '#16A34A' : '#94A3B8' }}
              />
              <Typography variant="body2" sx={{ color: '#475569' }}>
                <strong>{t('onboarding.step4.cvStatus', 'Trạng thái CV')}:</strong>{' '}
                {formData.fileName ? (
                  <Box component="span" sx={{ color: '#16A34A', fontWeight: 700 }}>
                    {t('onboarding.step4.cvAttached', 'Đã đính kèm')} ({formData.fileName})
                  </Box>
                ) : (
                  <Box component="span" sx={{ color: '#64748B' }}>
                    {t('onboarding.step4.cvNotAttached', 'Chưa đính kèm')}
                  </Box>
                )}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Recommended Jobs Preview (First Value) */}
      {recommendedJobs.length > 0 && (
        <Box sx={{ mb: 4, textAlign: 'left' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, fontSize: '1.05rem' }}>
            {t('onboarding.step4.recommendedJobsTitle', 'Việc làm phù hợp đề xuất cho bạn')}
          </Typography>

          <Stack spacing={1.5}>
            {recommendedJobs.map((job) => (
              <Card
                key={job.id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: '#2563EB',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={job.companyLogo || ''}
                    variant="rounded"
                    sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#F1F5F9', color: '#2563EB', fontWeight: 700 }}
                  >
                    {job.companyName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {job.jobName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                      {job.companyName} • {job.cityName || 'Toàn quốc'}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={onExploreJobs}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  {t('onboarding.step4.viewJob', 'Xem việc')}
                </Button>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {/* Action Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onExploreJobs}
          endIcon={<ArrowForwardIcon />}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 800,
            fontSize: '0.95rem',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
          }}
        >
          {t('onboarding.step4.exploreJobs', 'Khám phá Việc làm Phù hợp ngay')}
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          size="large"
          onClick={onViewDashboard}
          startIcon={<PersonOutlineIcon />}
          sx={{
            borderRadius: 3,
            px: 3.5,
            py: 1.5,
            fontWeight: 700,
            borderColor: '#CBD5E1',
            color: '#334155',
          }}
        >
          {t('onboarding.step4.viewDashboard', 'Xem Trang cá nhân')}
        </Button>
      </Stack>
    </Box>
  );
}
