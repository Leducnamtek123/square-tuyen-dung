'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid2 as Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { ROUTES } from '@/configs/constants';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { ChipProps } from '@mui/material';
import { localizeRoutePath } from '@/configs/routeLocalization';

interface Props {
  statusLabel: string;
  statusColor: ChipProps['color'];
  completion: number;
  missingCount: number;
  canPost: boolean;
  legalReady: boolean;
  status?: 'pending' | 'reviewing' | 'approved' | 'rejected';
  adminNote?: string;
  hasLicense?: boolean;
}

const VerificationIntroCard = ({
  statusLabel,
  statusColor,
  completion,
  missingCount,
  canPost,
  legalReady,
  status = 'pending',
  adminNote,
  hasLicense,
}: Props) => {
  const { push } = useRouter();
  const { t, i18n } = useTranslation('employer');
  const companyHref = localizeRoutePath(`/${ROUTES.EMPLOYER.COMPANY}`, i18n.language);

  const isApproved = status === 'approved' || canPost;

  // Step 2 badge calculation
  const step2Badge = isApproved
    ? { label: 'Đã duyệt', bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' }
    : status === 'reviewing' || legalReady || hasLicense
    ? { label: 'Chờ duyệt', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' }
    : { label: 'Chưa tải lên', bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };

  // Step 3 badge calculation
  const step3Badge = isApproved
    ? { label: 'Đã xác minh', bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' }
    : { label: 'Chờ kích hoạt', bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        mb: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#ffffff',
        boxShadow: (theme) => theme.customShadows?.z1,
      }}
    >
      {/* 1. Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        sx={{ pb: 2.5, borderBottom: '1px solid #f1f5f9' }}
      >
        <Stack direction="row" spacing={1.75} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.25)',
            }}
          >
            <VerifiedUserOutlinedIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: '#0f172a',
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                letterSpacing: '-0.01em',
              }}
            >
              Xác thực doanh nghiệp
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mt: 0.25 }}>
              Hoàn tất các bước xác thực để mở khóa tính năng đăng tin tuyển dụng và sử dụng đầy đủ các tính năng của InfoHR.
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={statusLabel}
          color={statusColor}
          sx={{
            fontWeight: 800,
            fontSize: '0.8125rem',
            px: 1.25,
            height: 32,
            borderRadius: 2,
          }}
        />
      </Stack>

      {/* 2. Top Stepper + Status Banner */}
      <Grid container spacing={{ xs: 2.5, lg: 3 }} sx={{ mt: 1 }}>
        {/* Left Column: Progress Metric + 3-Step Stepper */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {t('verification.summary.progress')}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 800, color: completion === 100 ? '#16a34a' : '#2563eb' }}
              >
                {completion}% hoàn tất
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={completion}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: completion === 100 ? '#16a34a' : '#2563eb',
                },
              }}
            />
          </Box>

          {/* 3 Steps */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            {/* Step 1 */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 2.5,
                border: '1px solid #bbf7d0',
                bgcolor: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <BusinessOutlinedIcon sx={{ color: '#16a34a', fontSize: 19 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803d', fontSize: '0.8125rem' }}>
                  1. {t('verification.summary.companyProfile')}
                </Typography>
              </Stack>
              <Chip
                label={completion > 0 ? 'Đã hoàn tất' : 'Đang xử lý'}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  bgcolor: '#dcfce7',
                  color: '#16a34a',
                }}
              />
            </Paper>

            {/* Step 2 */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: step2Badge.border,
                bgcolor: step2Badge.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AssignmentTurnedInOutlinedIcon sx={{ color: step2Badge.color, fontSize: 19 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: step2Badge.color, fontSize: '0.8125rem' }}>
                  2. {t('verification.summary.legalProfile')}
                </Typography>
              </Stack>
              <Chip
                label={step2Badge.label}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  bgcolor: step2Badge.bg,
                  color: step2Badge.color,
                }}
              />
            </Paper>

            {/* Step 3 */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: step3Badge.border,
                bgcolor: step3Badge.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <VerifiedUserOutlinedIcon sx={{ color: step3Badge.color, fontSize: 19 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: step3Badge.color, fontSize: '0.8125rem' }}>
                  3. Xác minh
                </Typography>
              </Stack>
              <Chip
                label={step3Badge.label}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  bgcolor: step3Badge.bg,
                  color: step3Badge.color,
                }}
              />
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column: Status Banner */}
        <Grid size={{ xs: 12, lg: 5 }}>
          {isApproved ? (
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                minHeight: 120,
                p: 2,
                borderRadius: 2.5,
                border: '1px solid #bbf7d0',
                bgcolor: '#f0fdf4',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#15803d', fontSize: '0.9375rem' }}>
                    Doanh nghiệp đã được xác minh
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#166534', fontWeight: 500, fontSize: '0.8125rem', mt: 0.25 }}>
                    {t('verification.summary.canPost')}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => push(companyHref)}
                  sx={{
                    borderRadius: 2,
                    borderColor: '#86efac',
                    color: '#15803d',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.8125rem',
                    bgcolor: '#ffffff',
                    '&:hover': {
                      bgcolor: '#dcfce7',
                      borderColor: '#4ade80',
                    },
                  }}
                >
                  {t('verification.step1.openBtn')}
                </Button>
              </Box>
            </Paper>
          ) : status === 'reviewing' ? (
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                minHeight: 120,
                p: 2,
                borderRadius: 2.5,
                border: '1px solid #fed7aa',
                bgcolor: '#fff7ed',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: '#ffedd5',
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <HourglassTopOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9a3412', fontSize: '0.9375rem' }}>
                    Hồ sơ đang chờ phê duyệt
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#c2410c', fontWeight: 500, fontSize: '0.8125rem', mt: 0.25 }}>
                    Hồ sơ xác thực đã được gửi và đang được ban quản trị xét duyệt (thời gian xử lý 1 - 3 ngày làm việc).
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => push(companyHref)}
                  sx={{
                    borderRadius: 2,
                    borderColor: '#fdba74',
                    color: '#9a3412',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.8125rem',
                    bgcolor: '#ffffff',
                    '&:hover': {
                      bgcolor: '#ffedd5',
                    },
                  }}
                >
                  {t('verification.step1.openBtn')}
                </Button>
              </Box>
            </Paper>
          ) : status === 'rejected' ? (
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                minHeight: 120,
                p: 2,
                borderRadius: 2.5,
                border: '1px solid #fecaca',
                bgcolor: '#fef2f2',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: '#fee2e2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <ErrorOutlineOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991b1b', fontSize: '0.9375rem' }}>
                    Hồ sơ cần bổ sung / Bị từ chối
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 500, fontSize: '0.8125rem', mt: 0.25 }}>
                    {adminNote || 'Hồ sơ xác thực chưa đạt yêu cầu. Vui lòng kiểm tra lại thông tin và giấy phép kinh doanh.'}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => push(companyHref)}
                  sx={{
                    borderRadius: 2,
                    borderColor: '#fca5a5',
                    color: '#991b1b',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.8125rem',
                    bgcolor: '#ffffff',
                    '&:hover': {
                      bgcolor: '#fee2e2',
                    },
                  }}
                >
                  {t('verification.step1.openBtn')}
                </Button>
              </Box>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                minHeight: 120,
                p: 2,
                borderRadius: 2.5,
                border: '1px solid #cbd5e1',
                bgcolor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <ErrorOutlineOutlinedIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem' }}>
                    Chưa hoàn tất xác minh
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.8125rem', mt: 0.25 }}>
                    {t('verification.summary.cannotPost', { count: missingCount })}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={() => push(companyHref)}
                  sx={{
                    borderRadius: 2,
                    borderColor: '#cbd5e1',
                    color: '#0f172a',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.8125rem',
                    bgcolor: '#ffffff',
                    '&:hover': {
                      bgcolor: '#f1f5f9',
                    },
                  }}
                >
                  {t('verification.step1.openBtn')}
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Card>
  );
};

export default VerificationIntroCard;
