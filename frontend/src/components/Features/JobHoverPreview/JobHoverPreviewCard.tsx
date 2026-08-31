'use client';

import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Popper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ElectricBoltRoundedIcon from '@mui/icons-material/ElectricBoltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { useTranslation } from 'react-i18next';
import { formatLocalizedSalaryRange } from '@/utils/customData';
import jobService from '@/services/jobService';

export interface JobHoverPreviewData {
  id: number;
  jobName: string;
  slug: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: string | number;
  deadline?: string;
  isUrgent?: boolean;
  isHot?: boolean;
  companyDict?: {
    companyName?: string | null;
    companyImageUrl?: string | null;
    logoUrl?: string | null;
  } | null;
  company?: any;
  locationDict?: {
    city?: number | string;
    cityName?: string;
  } | null;
  location?: any;
  experience?: number;
  academicLevel?: number;
  jobType?: number;
  jobDescription?: string;
  jobRequirement?: string | null;
  benefitsEnjoyed?: string | null;
  isSaved?: boolean;
  isApplied?: boolean;
}

interface JobHoverPreviewCardProps {
  job: JobHoverPreviewData | null;
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onMouseEnterPopper?: () => void;
  onMouseLeavePopper?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, id: number, slug: string) => void;
  experienceLabel?: string;
  academicLevelLabel?: string;
  cityLabel?: string;
  placement?: 'right-start' | 'left-start' | 'bottom' | 'top';
}

const cleanHtmlToLines = (rawHtml?: string | null): string[] => {
  if (!rawHtml) return [];
  // Strip HTML tags and split by newline or bullet
  const plainText = rawHtml
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  return plainText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

export const JobHoverPreviewCard: React.FC<JobHoverPreviewCardProps> = ({
  job,
  anchorEl,
  open,
  onMouseEnterPopper,
  onMouseLeavePopper,
  isFavorite,
  onToggleFavorite,
  experienceLabel,
  academicLevelLabel,
  cityLabel,
  placement = 'right-start',
}) => {
  const { t, i18n } = useTranslation(['common', 'public']);

  const hasDesc = Boolean(job?.jobDescription && job.jobDescription.trim().length > 0);
  const shouldFetchDetail = Boolean(open && job?.slug && !hasDesc);

  const { data: fullJobDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['hover-preview-job-detail', job?.slug],
    queryFn: async () => {
      if (!job?.slug) return null;
      return await jobService.getJobPostDetailById(job.slug);
    },
    enabled: shouldFetchDetail,
    staleTime: 5 * 60_000,
  });

  if (!job) return null;

  const activeJob: JobHoverPreviewData = fullJobDetail ? { ...job, ...fullJobDetail } : job;

  const companyName =
    activeJob.companyDict?.companyName || activeJob.company?.companyName || t('jobHover.companyDefault', 'Doanh nghiệp tuyển dụng');
  const salaryText = formatLocalizedSalaryRange(activeJob.salaryMin, activeJob.salaryMax, i18n.language);
  const cityName =
    cityLabel ||
    activeJob.locationDict?.cityName ||
    (typeof activeJob.locationDict?.city === 'string' ? activeJob.locationDict.city : '') ||
    (typeof activeJob.location?.city === 'string' ? activeJob.location.city : '') ||
    t('jobHover.nationwide', 'Toàn quốc');

  const expText =
    experienceLabel ||
    (activeJob.experience ? t('jobHover.yearsExp', '{{count}} năm kinh nghiệm', { count: activeJob.experience }) : t('jobHover.noExpRequired', 'Không yêu cầu kinh nghiệm'));
  const eduText =
    academicLevelLabel ||
    (activeJob.academicLevel ? t('jobHover.academicLevel', 'Trình độ {{level}}', { level: activeJob.academicLevel }) : t('jobHover.noDegreeRequired', 'Không yêu cầu bằng cấp'));

  const deadlineFormatted = activeJob.deadline
    ? dayjs(activeJob.deadline).isValid()
      ? dayjs(activeJob.deadline).format('DD/MM/YYYY')
      : activeJob.deadline
    : t('jobHover.activelyHiring', 'Đang tuyển');

  const descLines = cleanHtmlToLines(activeJob.jobDescription);
  const reqLines = cleanHtmlToLines(activeJob.jobRequirement);
  const benefitLines = cleanHtmlToLines(activeJob.benefitsEnjoyed);

  const safeDetailHref = `/viec-lam/${activeJob.slug}`;
  const effectiveIsFavorite = isFavorite !== undefined ? isFavorite : Boolean(activeJob.isSaved);

  return (
    <Popper
      id="job-hover-preview-popper"
      role="tooltip"
      aria-live="polite"
      open={open}
      anchorEl={anchorEl}
      placement={placement}
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 12],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: 'viewport',
            padding: 16,
          },
        },
      ]}
      sx={{
        zIndex: 1400,
        pointerEvents: 'auto',
      }}
      onMouseEnter={onMouseEnterPopper}
      onMouseLeave={onMouseLeavePopper}
    >
      <Paper
        elevation={0}
        sx={{
          width: { xs: 340, sm: 420, md: 460 },
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'min(580px, 85vh)',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
          animation: 'jobPreviewFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          '@keyframes jobPreviewFadeIn': {
            '0%': { opacity: 0, transform: 'scale(0.96) translateY(6px)' },
            '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
          },
        }}
      >
        {/* Top Header Section */}
        <Box sx={{ p: 2.5, pb: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#ffffff' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  color: '#0f172a',
                  lineHeight: 1.35,
                  letterSpacing: '-0.01em',
                }}
              >
                {activeJob.jobName}
              </Typography>
              <Typography
                variant="body2"
                noWrap
                sx={{
                  color: '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                }}
              >
                {companyName}
              </Typography>
            </Stack>

            <Tooltip title={effectiveIsFavorite ? t('jobHover.unsaveJob', 'Bỏ lưu tin') : t('jobHover.saveJob', 'Lưu tin tuyển dụng')} arrow placement="top">
              <IconButton
                size="small"
                aria-label={effectiveIsFavorite ? t('jobHover.unsaveJob', 'Bỏ lưu tin') : t('jobHover.saveJob', 'Lưu tin')}
                onClick={(e) => onToggleFavorite && onToggleFavorite(e, activeJob.id, activeJob.slug)}
                sx={{
                  border: '1px solid #e2e8f0',
                  color: effectiveIsFavorite ? '#ef4444' : '#64748b',
                  bgcolor: effectiveIsFavorite ? '#fef2f2' : '#ffffff',
                  p: 0.85,
                  '&:hover': {
                    bgcolor: effectiveIsFavorite ? '#fee2e2' : '#f8fafc',
                    color: '#ef4444',
                    borderColor: '#fca5a5',
                  },
                }}
              >
                {effectiveIsFavorite ? <FavoriteIcon sx={{ fontSize: 20 }} /> : <FavoriteBorderIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Salary Highlight */}
          <Typography
            sx={{
              mt: 1.5,
              mb: 1.5,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 800,
              color: '#2563eb',
              letterSpacing: '-0.02em',
            }}
          >
            {salaryText}
          </Typography>

          {/* Quick Meta Badges */}
          <Stack direction="row" flexWrap="wrap" gap={1.25} sx={{ color: '#475569', fontSize: '0.8125rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#64748b' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
                {cityName}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WorkOutlineOutlinedIcon sx={{ fontSize: 16, color: '#64748b' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
                {expText}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SchoolOutlinedIcon sx={{ fontSize: 16, color: '#64748b' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
                {eduText}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: '#64748b' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.8rem' }}>
                {deadlineFormatted}
              </Typography>
            </Box>
          </Stack>

          {/* Urgent / Fast apply callout */}
          <Box
            sx={{
              mt: 1.75,
              p: 1.25,
              borderRadius: '12px',
              bgcolor: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <ElectricBoltRoundedIcon sx={{ fontSize: 18, color: '#ea580c' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#c2410c', fontSize: '0.8rem' }}>
                {t('jobHover.urgentHiring', 'Tuyển nhanh')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9a3412', fontSize: '0.75rem' }}>
                {t('jobHover.responseRate', '• Tỷ lệ phản hồi 100%')}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 600, fontSize: '0.75rem' }}>
              {t('jobHover.applyEarlyPrioritized', 'Ứng tuyển sớm để ưu tiên!')}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button
              component={Link}
              href={safeDetailHref}
              variant="contained"
              disableElevation
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                flex: 1,
                py: 1,
                borderRadius: '10px',
                bgcolor: '#2563eb',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.875rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                '&:hover': {
                  bgcolor: '#1d4ed8',
                  boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
                },
              }}
            >
              {t('jobHover.viewDetail', 'Xem chi tiết')}
            </Button>

            <Button
              component={Link}
              href={`${safeDetailHref}#apply`}
              variant="outlined"
              sx={{
                flex: 1,
                py: 1,
                borderRadius: '10px',
                borderColor: '#cbd5e1',
                color: '#1e293b',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: '#2563eb',
                  bgcolor: 'rgba(37, 99, 235, 0.04)',
                  color: '#2563eb',
                },
              }}
            >
              {t('jobHover.applyNow', 'Ứng tuyển ngay')}
            </Button>
          </Stack>
        </Box>

        {/* Scrollable Body: Description & Requirements */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2.5,
            pt: 2,
            '&::-webkit-scrollbar': {
              width: '5px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(100, 116, 139, 0.25)',
              borderRadius: '10px',
            },
          }}
        >
          {/* Job Description */}
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: '0.9rem',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 14,
                  borderRadius: 1,
                  bgcolor: '#2563eb',
                }}
              />
              {t('jobHover.jobDescription', 'Mô tả công việc')}
            </Typography>

            {isLoadingDetail && !hasDesc ? (
              <Stack spacing={1}>
                <Skeleton variant="text" width="90%" height={20} />
                <Skeleton variant="text" width="75%" height={20} />
                <Skeleton variant="text" width="85%" height={20} />
              </Stack>
            ) : descLines.length > 0 ? (
              <Stack spacing={0.75}>
                {descLines.slice(0, 5).map((line, idx) => (
                  <Stack key={`desc-line-${idx}`} direction="row" spacing={1} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        bgcolor: '#64748b',
                        mt: 0.9,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#475569',
                        fontSize: '0.825rem',
                        lineHeight: 1.55,
                      }}
                    >
                      {line}
                    </Typography>
                  </Stack>
                ))}
                {descLines.length > 5 && (
                  <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 600, pt: 0.5 }}>
                    {t('jobHover.moreDescLines', '+{{count}} nội dung mô tả chi tiết...', { count: descLines.length - 5 })}
                  </Typography>
                )}
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.825rem', fontStyle: 'italic' }}>
                {t('jobHover.noDesc', 'Chưa có mô tả chi tiết công việc. Nhấn xem chi tiết để tìm hiểu thêm.')}
              </Typography>
            )}
          </Box>

          {/* Job Requirements */}
          {isLoadingDetail && !hasDesc ? (
            <Box sx={{ mb: 2.5 }}>
              <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
              <Stack spacing={1}>
                <Skeleton variant="text" width="85%" height={20} />
                <Skeleton variant="text" width="70%" height={20} />
              </Stack>
            </Box>
          ) : (reqLines.length > 0 || activeJob.jobRequirement) ? (
            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 14,
                    borderRadius: 1,
                    bgcolor: '#ea580c',
                  }}
                />
                {t('jobHover.jobRequirements', 'Yêu cầu công việc')}
              </Typography>

              {reqLines.length > 0 ? (
                <Stack spacing={0.75}>
                  {reqLines.slice(0, 4).map((line, idx) => (
                    <Stack key={`req-line-${idx}`} direction="row" spacing={1} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          bgcolor: '#64748b',
                          mt: 0.9,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#475569',
                          fontSize: '0.825rem',
                          lineHeight: 1.55,
                        }}
                      >
                        {line}
                      </Typography>
                    </Stack>
                  ))}
                  {reqLines.length > 4 && (
                    <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 600, pt: 0.5 }}>
                      {t('jobHover.moreReqLines', '+{{count}} yêu cầu khác...', { count: reqLines.length - 4 })}
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.825rem' }}>
                  {t('jobHover.discussInInterview', 'Trao đổi chi tiết khi phỏng vấn.')}
                </Typography>
              )}
            </Box>
          ) : null}

          {/* Benefits */}
          {(benefitLines.length > 0 || activeJob.benefitsEnjoyed) && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 14,
                    borderRadius: 1,
                    bgcolor: '#16a34a',
                  }}
                />
                {t('jobHover.benefitsEnjoyed', 'Quyền lợi được hưởng')}
              </Typography>

              {benefitLines.length > 0 ? (
                <Stack spacing={0.75}>
                  {benefitLines.slice(0, 3).map((line, idx) => (
                    <Stack key={`ben-line-${idx}`} direction="row" spacing={1} alignItems="flex-start">
                      <CheckCircleOutlineRoundedIcon
                        sx={{ fontSize: 16, color: '#16a34a', mt: 0.2, flexShrink: 0 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#475569',
                          fontSize: '0.825rem',
                          lineHeight: 1.55,
                        }}
                      >
                        {line}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.825rem' }}>
                  {t('jobHover.standardBenefits', 'Hưởng đầy đủ chế độ theo quy định công ty và Luật Lao động.')}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Popper>
  );
};

export default React.memo(JobHoverPreviewCard);
