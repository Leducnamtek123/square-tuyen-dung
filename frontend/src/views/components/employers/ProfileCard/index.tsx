'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Box,
  Pagination,
  Stack,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Grid,
  Skeleton,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import dayjs from 'dayjs';

import toastMessages from '../../../../utils/toastMessages';
import { ProfileSearchBar, ProfileFilterDrawer, useProfileSearch } from '../ProfileSearch';
import {
  useEmployerResumes,
  useToggleSaveResumeOptimistic,
  useResumeDetail,
  useJobPostOptions,
} from '../hooks/useEmployerQueries';
import { searchResume } from '../../../../redux/filterSlice';
import type { ResumeFilter } from '../../../../redux/filterSlice';
import type { Resume } from '@/types/models';
import pc from '@/utils/muiColors';
import { formatLocalizedSalaryRange } from '@/utils/customData';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';

import { localizeRoutePath } from '@/configs/routeLocalization';
import { formatRoute } from '@/utils/funcUtils';
import { CV_TYPES, ROUTES } from '@/configs/constants';
import { tConfig } from '@/utils/tConfig';
import { useConfig } from '@/hooks/useConfig';

/* ─── Compact Candidate Item (Left Master List) ─────────────────────────────── */
interface MasterItemProps {
  resume: Resume;
  isSelected: boolean;
  onSelect: () => void;
  onSave: (slug: string) => void;
}

const MasterCandidateItem: React.FC<MasterItemProps> = ({
  resume,
  isSelected,
  onSelect,
  onSave,
}) => {
  const { t } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();

  const user = resume.userDict || resume.user;
  const fullName = user?.fullName || resume.title || 'Ứng viên';
  const age = resume.jobSeekerProfileDict?.old;
  const experienceLabel = resume.experience && allConfig?.experienceDict?.[resume.experience]
    ? tConfig(String(allConfig.experienceDict[resume.experience]))
    : null;
  const cityLabel = resume.city?.id && allConfig?.cityDict?.[resume.city.id]
    ? tConfig(String(allConfig.cityDict[resume.city.id]))
    : null;

  const matchScore = typeof resume.matchScore === 'number' ? resume.matchScore : 0;

  const updatedAtLabel = useMemo(() => {
    if (!resume.updateAt) return '';
    const now = dayjs();
    const updated = dayjs(resume.updateAt);
    const diffHours = now.diff(updated, 'hour');
    if (diffHours < 1) {
      const diffMins = Math.max(1, now.diff(updated, 'minute'));
      return `${diffMins} phút trước`;
    }
    if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    }
    if (diffHours < 48) {
      return 'Hôm qua';
    }
    return updated.format('DD/MM/YYYY');
  }, [resume.updateAt]);

  return (
    <Paper
      elevation={0}
      onClick={onSelect}
      sx={{
        p: 1.75,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : '#E2E8F0',
        bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
        boxShadow: isSelected ? '0 4px 14px rgba(37, 99, 235, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
        position: 'relative',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        {/* Avatar */}
        <Avatar
          src={(user as any)?.avatar || (user as any)?.avatarUrl || undefined}
          variant="rounded"
          sx={{
            width: 46,
            height: 46,
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            flexShrink: 0,
            mt: 0.25,
          }}
        />

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: '0.875rem',
                color: isSelected ? 'primary.main' : '#0F172A',
                lineHeight: 1.3,
              }}
            >
              {fullName}
              {age && String(age) !== '---' && (
                <Box component="span" sx={{ fontWeight: 500, color: '#64748B', ml: 0.5, fontSize: '0.78rem' }}>
                  ({age} tuổi)
                </Box>
              )}
            </Typography>

            <Tooltip title={resume.isSaved ? 'Bỏ lưu hồ sơ' : 'Lưu hồ sơ'} arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(resume.slug);
                }}
                sx={{
                  p: 0.4,
                  color: resume.isSaved ? 'primary.main' : '#94A3B8',
                  '&:hover': { color: 'primary.main', bgcolor: '#EFF6FF' },
                }}
              >
                {resume.isSaved ? <BookmarkIcon sx={{ fontSize: 18 }} /> : <BookmarkBorderIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Active status & AI Match Score Chip */}
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ mt: 0.4, mb: 0.5 }}>
            <Chip
              label="Đang tìm việc"
              size="small"
              sx={{
                height: 19,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: '#FEF3C7',
                color: '#D97706',
                borderRadius: '4px',
              }}
            />
            {matchScore > 0 && (
              <Chip
                icon={
                  <AutoAwesomeIcon
                    sx={{
                      fontSize: '12px !important',
                      color: matchScore >= 70 ? '#059669 !important' : '#2563EB !important',
                    }}
                  />
                }
                label={`${matchScore}% ${t('employer:profileCard.aiMatch.badgeText', 'Phù hợp')}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  bgcolor: matchScore >= 70 ? '#ECFDF5' : '#EFF6FF',
                  color: matchScore >= 70 ? '#059669' : '#2563EB',
                  border: `1px solid ${matchScore >= 70 ? '#A7F3D0' : '#BFDBFE'}`,
                  borderRadius: '6px',
                  pl: 0.25,
                }}
              />
            )}
          </Stack>

          {/* Job Title */}
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: 600,
              color: '#334155',
              fontSize: '0.8125rem',
              lineHeight: 1.3,
            }}
          >
            {resume.title || 'Chưa cập nhật vị trí'}
          </Typography>

          {/* Experience & City Tags */}
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
            {experienceLabel && (
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.725rem', fontWeight: 500 }}>
                • {experienceLabel}
              </Typography>
            )}
            {cityLabel && (
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.725rem', fontWeight: 500 }}>
                • {cityLabel}
              </Typography>
            )}
          </Stack>

          {/* Bottom Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.75 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 500 }}>
              Cập nhật: {updatedAtLabel}
            </Typography>
            {resume.type === CV_TYPES.cvUpload && (
              <Chip
                icon={<PictureAsPdfIcon sx={{ fontSize: '12px !important', color: '#EF4444' }} />}
                label="CV PDF"
                size="small"
                sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#FEE2E2', color: '#B91C1C', fontWeight: 600 }}
              />
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

/* ─── Detail Preview Panel (Right Side Panel) ────────────────────────────────── */
interface DetailPreviewProps {
  resumeSlug: string;
  initialResume: Resume | null;
  onSave: (slug: string) => void;
}

const CandidateDetailPreviewPanel: React.FC<DetailPreviewProps> = ({
  resumeSlug,
  initialResume,
  onSave,
}) => {
  const { t, i18n } = useTranslation(['employer', 'common']);
  const { allConfig } = useConfig();

  const { data: fetchedDetail } = useResumeDetail(resumeSlug);
  const resume = fetchedDetail || initialResume;

  if (!resumeSlug || !resume) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          minHeight: 450,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SearchOffIcon sx={{ fontSize: 56, color: '#94A3B8', mb: 1.5, opacity: 0.4 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569', fontSize: '1rem' }}>
          Chọn một ứng viên từ danh sách bên trái
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5, fontSize: '0.85rem' }}>
          Chi tiết hồ sơ và xem trước CV sẽ hiển thị ngay tại đây.
        </Typography>
      </Paper>
    );
  }

  const user = (resume as any).user || (resume as any).userDict;
  const profileObj = (resume as any).jobSeekerProfile || (resume as any).jobSeekerProfileDict;
  const phone = (resume as any).jobSeekerProfile?.phone || (resume as any).jobSeekerProfileDict?.phone || profileObj?.phone || user?.phone || (resume as any).phone || (resume as any).contactPhone;
  const email = (resume as any).user?.email || (resume as any).userDict?.email || user?.email || profileObj?.email || (resume as any).email || (resume as any).contactEmail;
  const fullName = user?.fullName || resume.title || 'Ứng viên';
  const age = (resume as any).jobSeekerProfileDict?.old;
  const profileDetailHref = localizeRoutePath(
    `/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, resume.slug)}`,
    i18n.language
  );

  const handleOpenFullProfile = () => {
    window.open(profileDetailHref, '_blank');
  };

  const expId = typeof resume.experience === 'number' ? resume.experience : (typeof resume.experience === 'object' ? (resume.experience as any)?.id : undefined);
  const experienceLabel = expId && allConfig?.experienceDict?.[expId]
    ? tConfig(String(allConfig.experienceDict[expId]))
    : 'Chưa cập nhật';

  const cityId = typeof resume.city === 'number' ? resume.city : (typeof resume.city === 'object' ? (resume.city as any)?.id : profileObj?.location?.city);
  const cityLabel = cityId && allConfig?.cityDict?.[cityId]
    ? tConfig(String(allConfig.cityDict[cityId]))
    : (profileObj?.contactAddress || profileObj?.location?.address || 'Chưa cập nhật');

  const careerId = typeof resume.career === 'number' ? resume.career : (typeof resume.career === 'object' ? (resume.career as any)?.id : undefined);
  const careerLabel = careerId && allConfig?.careerDict?.[careerId]
    ? tConfig(String(allConfig.careerDict[careerId]))
    : 'Chưa cập nhật';

  const academicId = typeof resume.academicLevel === 'number' ? resume.academicLevel : (typeof resume.academicLevel === 'object' ? (resume.academicLevel as any)?.id : undefined);
  const academicLabel = academicId && allConfig?.academicLevelDict?.[academicId]
    ? tConfig(String(allConfig.academicLevelDict[academicId]))
    : 'Đại học';

  const positionId = typeof resume.position === 'number' ? resume.position : (typeof resume.position === 'object' ? (resume.position as any)?.id : undefined);
  const positionLabel = positionId && allConfig?.positionDict?.[positionId]
    ? tConfig(String(allConfig.positionDict[positionId]))
    : 'Nhân viên';

  const matchScore = typeof resume.matchScore === 'number' ? resume.matchScore : 0;
  const aiAnalysis = (resume as any).aiAnalysis;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        position: 'sticky',
        top: '80px',
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: '5px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' },
      }}
    >
      {/* 1. Header Action Bar */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#FAFCFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.125rem' }}>
              {fullName}
              {age && String(age) !== '---' && (
                <Box component="span" sx={{ fontWeight: 500, color: '#64748B', ml: 0.75, fontSize: '0.9rem' }}>
                  ({age} tuổi)
                </Box>
              )}
            </Typography>
            <Chip
              label="Đang tìm việc"
              size="small"
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#FEF3C7', color: '#D97706' }}
            />
          </Stack>

          <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mt: 0.25, fontSize: '0.9rem' }}>
            {resume.title || 'Chưa cập nhật vị trí'}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant={resume.isSaved ? 'contained' : 'outlined'}
            color={resume.isSaved ? 'primary' : 'inherit'}
            startIcon={resume.isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            onClick={() => onSave(resume.slug)}
            sx={{
              height: 38,
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8125rem',
              textTransform: 'none',
              px: 2,
              borderColor: resume.isSaved ? 'primary.main' : '#CBD5E1',
              bgcolor: resume.isSaved ? 'primary.main' : '#FFFFFF',
              color: resume.isSaved ? '#FFFFFF' : '#334155',
              '&:hover': {
                bgcolor: resume.isSaved ? '#1D4ED8' : '#F1F5F9',
              },
            }}
          >
            {resume.isSaved ? 'Đã lưu' : 'Lưu hồ sơ'}
          </Button>

          <Button
            variant="contained"
            color="primary"
            endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            onClick={handleOpenFullProfile}
            sx={{
              height: 38,
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8125rem',
              textTransform: 'none',
              px: 2.25,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              },
            }}
          >
            Xem chi tiết hồ sơ
          </Button>
        </Stack>
      </Box>

      {/* 2. Main Profile Overview Body */}
      <Box sx={{ p: 3 }}>
        {/* AI Match Insights Card */}
        {matchScore > 0 && (
          <Box
            sx={{
              mb: 3,
              p: 2.5,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F0FDF4 0%, #EFF6FF 100%)',
              border: '1px solid #BFDBFE',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AutoAwesomeIcon sx={{ color: '#2563EB', fontSize: 22 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E3A8A', fontSize: '0.95rem' }}>
                  {t('employer:profileCard.aiMatch.insightsTitle', 'Đánh giá mức độ phù hợp bởi AI')}
                </Typography>
              </Stack>
              <Chip
                label={`${matchScore}% ${t('employer:profileCard.aiMatch.badgeText', 'Phù hợp')}`}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  bgcolor: matchScore >= 70 ? '#059669' : '#2563EB',
                  color: '#FFFFFF',
                  px: 0.5,
                  borderRadius: '6px',
                }}
              />
            </Stack>

            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', mb: 2 }}>
              {t(
                'employer:profileCard.aiMatch.insightsSubtitle',
                'Phân tích tự động dựa trên JD tin tuyển dụng và hồ sơ ứng viên'
              )}
            </Typography>

            {/* Criteria Match Grid */}
            <Grid container spacing={1.5}>
              <Grid item xs={6} sm={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.25,
                    bgcolor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}
                  >
                    {t('employer:profileCard.aiMatch.criteriaCareer', 'Ngành nghề')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.8rem', mt: 0.25 }}
                    noWrap
                  >
                    {careerLabel}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.25,
                    bgcolor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}
                  >
                    {t('employer:profileCard.aiMatch.criteriaLocation', 'Địa điểm')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.8rem', mt: 0.25 }}
                    noWrap
                  >
                    {cityLabel}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.25,
                    bgcolor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}
                  >
                    {t('employer:profileCard.aiMatch.criteriaExperience', 'Kinh nghiệm')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.8rem', mt: 0.25 }}
                    noWrap
                  >
                    {experienceLabel}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.25,
                    bgcolor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748B', fontWeight: 600, display: 'block', fontSize: '0.72rem' }}
                  >
                    {t('employer:profileCard.aiMatch.criteriaSalary', 'Mức lương')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: '#2563EB', fontSize: '0.8rem', mt: 0.25 }}
                    noWrap
                  >
                    {formatLocalizedSalaryRange(resume.salaryMin, resume.salaryMax, i18n.language)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {aiAnalysis?.summary && (
              <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #BFDBFE' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E3A8A', display: 'block', mb: 0.5 }}>
                  Tóm tắt phân tích AI:
                </Typography>
                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  {aiAnalysis.summary}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Contact Info Header */}
        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
          <Avatar
            src={(user as any)?.avatar || (user as any)?.avatarUrl || undefined}
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: '2px solid #DBEAFE',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)',
            }}
          />

          <Grid container spacing={1.5} flex={1}>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon sx={{ fontSize: 16, color: '#64748B' }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.8rem' }}>
                  Số điện thoại:
                </Typography>
                {phone ? (
                  <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.8rem' }}>
                    {phone}
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LockIcon sx={{ fontSize: 13, color: '#2563EB' }} />
                    <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, fontSize: '0.8rem' }}>
                      Thông tin ẩn
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon sx={{ fontSize: 16, color: '#64748B' }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.8rem' }}>
                  Email:
                </Typography>
                <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.8rem' }}>
                  {email || 'Chưa cập nhật'}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnIcon sx={{ fontSize: 16, color: '#64748B' }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.8rem' }}>
                  Tỉnh/Thành phố:
                </Typography>
                <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.8rem' }}>
                  {cityLabel}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Stack>

        <Divider sx={{ mb: 3, borderColor: '#F1F5F9' }} />

        {/* 3. Detailed Information Grid */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block', mb: 0.25 }}
            >
              Trình độ học vấn
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
              {academicLabel}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block', mb: 0.25 }}
            >
              Kinh nghiệm làm việc
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
              {experienceLabel}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block', mb: 0.25 }}
            >
              Cấp bậc hiện tại
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
              {positionLabel}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block', mb: 0.25 }}
            >
              Mức lương mong muốn
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB', fontSize: '0.875rem' }}>
              {formatLocalizedSalaryRange(resume.salaryMin, resume.salaryMax, i18n.language)}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={6}>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block', mb: 0.25 }}
            >
              Ngành nghề ứng tuyển
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
              {careerLabel}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={6}>
            <Typography
              variant="caption"
              sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block', mb: 0.25 }}
            >
              Địa điểm mong muốn
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
              {cityLabel}
            </Typography>
          </Grid>
        </Grid>

        {/* Skills Summary Chips */}
        {resume.skillsSummary ? (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: '#334155', mb: 1, fontSize: '0.8125rem' }}
            >
              Kỹ năng chuyên môn & Kỹ năng mềm
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ gap: 0.75 }}>
              {resume.skillsSummary.split(',').map((skill, idx) => (
                <Chip
                  key={idx}
                  label={skill.trim()}
                  size="small"
                  sx={{
                    bgcolor: '#FFFFFF',
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    border: '1px solid #CBD5E1',
                  }}
                />
              ))}
            </Stack>
          </Box>
        ) : null}

        {/* Description / Summary */}
        {resume.description && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: '#0F172A', mb: 0.75, fontSize: '0.85rem' }}
            >
              Mục tiêu nghề nghiệp & Giới thiệu bản thân
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}
            >
              {resume.description}
            </Typography>
          </Box>
        )}

        {/* PDF CV Preview Section */}
        {resume.fileUrl ? (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #E2E8F0' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PictureAsPdfIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}
                >
                  File Hồ sơ đính kèm (CV PDF)
                </Typography>
              </Stack>
              <Button
                size="small"
                variant="outlined"
                component="a"
                href={getSafeExternalOpenUrl(resume.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: '0.75rem', textTransform: 'none', fontWeight: 600 }}
              >
                Mở trong tab mới
              </Button>
            </Stack>

            <Box
              sx={{
                width: '100%',
                height: 480,
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                overflow: 'hidden',
                bgcolor: '#F1F5F9',
              }}
            >
              <iframe
                src={`${resume.fileUrl}#toolbar=0`}
                title="CV Preview"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </Box>
          </Box>
        ) : null}
      </Box>
    </Paper>
  );
};

/* ─── Main ProfileCard Master-Detail Container ────────────────────────────── */
const ProfileCardContent: React.FC = () => {
  const { t, i18n } = useTranslation(['employer', 'common']);
  const dispatch = useDispatch();
  const {
    control,
    handleSubmit,
    handleFilter,
    handleReset,
    allConfig,
    drawerOpen,
    setDrawerOpen,
    activeFilterCount,
  } = useProfileSearch();

  const { data: rawJobPosts = [] } = useJobPostOptions();
  const formattedJobPostOptions = useMemo(
    () => [
      { id: '', name: t('employer:profileCard.aiMatch.allJobPosts', 'Tất cả tin tuyển dụng đang mở') },
      ...rawJobPosts.map((jp) => ({ id: String(jp.id), name: jp.jobName })),
    ],
    [rawJobPosts, t]
  );

  const { resumeFilter } = useAppSelector((state) => state.filter);
  const { pageSize } = resumeFilter;
  const [page, setPage] = useState(1);

  // Active Tab: 'all' (Find candidates) vs 'ai' (AI-suggested candidates)
  const [activeTab, setActiveTab] = useState<'all' | 'ai'>(
    resumeFilter.aiSuggested ? 'ai' : 'all'
  );

  // Sort: 'suitable' (Most suitable) vs 'newest' (Newest)
  const [sortOption, setSortOption] = useState<string>(
    resumeFilter.sort || 'suitable'
  );

  const queryParams = useMemo(
    () => ({
      ...resumeFilter,
      sort: sortOption,
      aiSuggested: activeTab === 'ai' ? true : undefined,
      page,
    }),
    [resumeFilter, sortOption, activeTab, page]
  );

  const { data: queryData, isLoading } = useEmployerResumes(queryParams);
  const resumes: Resume[] = queryData?.results || [];
  const count = queryData?.count || 0;

  // Selected candidate state
  const [selectedSlug, setSelectedSlug] = useState<string>('');

  // Synchronously select first candidate when resumes load
  useEffect(() => {
    if (resumes.length > 0 && !selectedSlug) {
      setSelectedSlug(resumes[0].slug);
    }
  }, [resumes, selectedSlug]);

  const { mutate: toggleSave } = useToggleSaveResumeOptimistic();

  const currentSelectedIndex = useMemo(() => {
    return resumes.findIndex((r) => r.slug === (selectedSlug || resumes[0]?.slug));
  }, [resumes, selectedSlug]);

  const handleSave = React.useCallback((slug: string) => {
    toggleSave(slug, {
      onSuccess: (resData: any) => {
        const isSaved = resData?.isSaved;
        toastMessages.success(
          isSaved ? t('profileCard.messages.saveSuccess') : t('profileCard.messages.unsaveSuccess')
        );
      },
      onError: () => {
        toastMessages.error('Đã xảy ra lỗi khi lưu hồ sơ. Vui lòng thử lại.');
      },
    });
  }, [toggleSave, t]);

  // Keyboard navigation for Master Candidate List (↑/↓ to navigate, S to save, Enter to open full profile)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (!resumes || resumes.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentSelectedIndex < resumes.length - 1 ? currentSelectedIndex + 1 : 0;
        if (resumes[nextIndex]) {
          setSelectedSlug(resumes[nextIndex].slug);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentSelectedIndex > 0 ? currentSelectedIndex - 1 : resumes.length - 1;
        if (resumes[prevIndex]) {
          setSelectedSlug(resumes[prevIndex].slug);
        }
      } else if (e.key === 's' || e.key === 'S') {
        const activeResume = resumes[currentSelectedIndex >= 0 ? currentSelectedIndex : 0];
        if (activeResume) {
          e.preventDefault();
          handleSave(activeResume.slug);
        }
      } else if (e.key === 'Enter') {
        const activeResume = resumes[currentSelectedIndex >= 0 ? currentSelectedIndex : 0];
        if (activeResume) {
          e.preventDefault();
          const targetUrl = localizeRoutePath(
            `/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, activeResume.slug)}`,
            i18n.language
          );
          window.open(targetUrl, '_blank');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [resumes, currentSelectedIndex, handleSave, i18n.language]);

  const handleChangePage = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    setSelectedSlug('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (_: React.SyntheticEvent, newTab: 'all' | 'ai') => {
    setActiveTab(newTab);
    setPage(1);
    setSelectedSlug('');
    dispatch(
      searchResume({
        ...resumeFilter,
        aiSuggested: newTab === 'ai' ? true : undefined,
        sort: newTab === 'ai' ? 'suitable' : sortOption,
        page: 1,
      } as ResumeFilter)
    );
  };

  const handleSortChange = (newSort: string) => {
    setSortOption(newSort);
    setPage(1);
    dispatch(
      searchResume({
        ...resumeFilter,
        sort: newSort,
        page: 1,
      } as ResumeFilter)
    );
  };

  const totalPages = Math.ceil(count / pageSize);
  const selectedResume = resumes.find((r) => r.slug === selectedSlug) || (resumes[0] ?? null);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 1. High-End Segmented AI Match & Search Mode Switcher */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          p: 1.5,
          boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
        >
          {/* Segmented Mode Switcher */}
          <Box
            sx={{
              display: 'inline-flex',
              p: '4px',
              borderRadius: '12px',
              bgcolor: '#F1F5F9',
              border: '1px solid #E2E8F0',
              gap: '4px',
            }}
          >
            {/* Standard Search Button */}
            <Button
              onClick={(e) => handleTabChange(e, 'all')}
              disableRipple
              startIcon={
                <PersonSearchIcon
                  sx={{
                    fontSize: '18px !important',
                    color: activeTab === 'all' ? 'primary.main' : '#64748B',
                    transition: 'color 0.2s',
                  }}
                />
              }
              sx={{
                px: 2.25,
                py: 1,
                borderRadius: '9px',
                textTransform: 'none',
                fontWeight: activeTab === 'all' ? 800 : 600,
                fontSize: '0.875rem',
                color: activeTab === 'all' ? '#0F172A' : '#64748B',
                bgcolor: activeTab === 'all' ? '#FFFFFF' : 'transparent',
                boxShadow: activeTab === 'all' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                border: activeTab === 'all' ? '1px solid #E2E8F0' : '1px solid transparent',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  bgcolor: activeTab === 'all' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  color: '#0F172A',
                },
              }}
            >
              {t('employer:profileCard.tabs.findNewCandidates', 'Tìm kiếm ứng viên')}
            </Button>

            {/* AI Match Button */}
            <Button
              onClick={(e) => handleTabChange(e, 'ai')}
              disableRipple
              startIcon={
                <AutoAwesomeIcon
                  sx={{
                    fontSize: '18px !important',
                    color: activeTab === 'ai' ? '#2563EB' : '#6366F1',
                    filter: activeTab === 'ai' ? 'drop-shadow(0 0 6px rgba(37,99,235,0.4))' : 'none',
                    transition: 'all 0.2s',
                  }}
                />
              }
              sx={{
                px: 2.25,
                py: 1,
                borderRadius: '9px',
                textTransform: 'none',
                fontWeight: activeTab === 'ai' ? 800 : 600,
                fontSize: '0.875rem',
                color: activeTab === 'ai' ? '#1E3A8A' : '#475569',
                bgcolor: activeTab === 'ai' ? '#FFFFFF' : 'transparent',
                boxShadow: activeTab === 'ai' ? '0 2px 10px rgba(37, 99, 235, 0.12)' : 'none',
                border: activeTab === 'ai' ? '1px solid #BFDBFE' : '1px solid transparent',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  bgcolor: activeTab === 'ai' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  color: '#1E3A8A',
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{t('employer:profileCard.tabs.aiSuggestedCandidates', 'Ứng viên AI gợi ý')}</span>
                <Chip
                  label="AI MATCH PRO"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    background: activeTab === 'ai'
                      ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)'
                      : '#E0E7FF',
                    color: activeTab === 'ai' ? '#FFFFFF' : '#4338CA',
                    border: 'none',
                    boxShadow: activeTab === 'ai' ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
                  }}
                />
              </Stack>
            </Button>
          </Box>

          {/* Quick Pool Status Indicator */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#10B981',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
              }}
            />
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.78rem' }}>
              Kho dữ liệu:{' '}
              <Box component="span" sx={{ color: '#0F172A', fontWeight: 700 }}>
                {count > 0 ? `${count} hồ sơ sẵn sàng` : 'Hồ sơ đã kiểm duyệt'}
              </Box>
            </Typography>
          </Stack>
        </Stack>

        {/* Dynamic Contextual AI Insight Bar when in AI Mode */}
        {activeTab === 'ai' && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(245, 243, 255, 0.7) 100%)',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <AutoAwesomeIcon sx={{ color: '#2563EB', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: '#1E3A8A', fontWeight: 600, fontSize: '0.8125rem' }}>
                Thuật toán AI tự động chấm điểm tương đồng dựa trên JD vị trí tuyển dụng (Ngành nghề, Tỉnh thành, Kinh nghiệm & Kỹ năng).
              </Typography>
            </Stack>
            <Chip
              label="Bộ lọc tối ưu AI"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.6875rem',
                fontWeight: 700,
                bgcolor: '#DBEAFE',
                color: '#1D4ED8',
                border: '1px solid #93C5FD',
              }}
            />
          </Box>
        )}
      </Paper>

      {/* 2. Top Search Bar with Job Post Selector & Filter Button */}
      <ProfileSearchBar
        control={control}
        handleSubmit={handleSubmit}
        handleFilter={handleFilter}
        allConfig={allConfig}
        primaryFieldName="jobPostId"
        primaryFieldOptions={formattedJobPostOptions}
        primaryFieldPlaceholder={t('employer:profileCard.aiMatch.jobPostSelector', 'Khớp theo tin tuyển dụng...')}
        t={t}
        onOpenFilterDrawer={() => setDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* 3. Slide-in Right Filter Drawer Modal */}
      <ProfileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        control={control}
        handleReset={handleReset}
        handleSubmit={handleSubmit}
        handleFilter={handleFilter}
        allConfig={allConfig}
        t={t}
      />

      {/* 4. Vieclam24h Master-Detail 2-Column Split View */}
      <Box sx={{ width: '100%', minWidth: 0 }}>
        {isLoading ? (
          <Grid container spacing={2}>
            <Grid item xs={12} lg={4}>
              <Stack spacing={1.5}>
                {Array.from({ length: pageSize }, (_, idx) => (
                  <Skeleton key={idx} variant="rounded" height={100} sx={{ borderRadius: '12px' }} />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} lg={8}>
              <Skeleton variant="rounded" height={500} sx={{ borderRadius: '12px' }} />
            </Grid>
          </Grid>
        ) : resumes.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              py: 10,
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            }}
          >
            <SearchOffIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              {t('profileCard.title.noresultsfound')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, fontWeight: 500, maxWidth: 360, mx: 'auto', opacity: 0.7 }}
            >
              Thử thay đổi từ khóa hoặc điều chỉnh bộ lọc để phát hiện thêm các ứng viên tài năng.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2.5} alignItems="flex-start">
            {/* LEFT COLUMN: Master Candidate List (~360px - 400px) */}
            <Grid item xs={12} lg={4.5} xl={4}>
              <Stack spacing={1.5}>
                {/* Result count & Sort dropdown bar */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 0.5,
                    px: 0.5,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                      Kết quả:{' '}
                      <Box component="span" sx={{ color: 'primary.main', fontWeight: 900 }}>
                        {count} ứng viên
                      </Box>
                    </Typography>
                    <Tooltip title="Dùng phím mũi tên ↑/↓ để chuyển ứng viên, phím S để lưu/bỏ lưu, Enter để xem chi tiết" arrow>
                      <Chip
                        label="↑/↓ duyệt nhanh"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          bgcolor: '#F1F5F9',
                          color: '#475569',
                          border: '1px solid #E2E8F0',
                          cursor: 'help',
                          display: { xs: 'none', sm: 'inline-flex' },
                        }}
                      />
                    </Tooltip>
                  </Stack>

                  {/* Sort Selection */}
                  <FormControl size="small" variant="standard" sx={{ minWidth: 140 }}>
                    <Select
                      value={sortOption}
                      onChange={(e) => handleSortChange(e.target.value)}
                      disableUnderline
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: 'primary.main',
                        '& .MuiSelect-select': {
                          py: 0.5,
                          pr: '24px !important',
                        },
                      }}
                    >
                      <MenuItem value="suitable" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {t('employer:profileCard.sort.mostSuitable', 'Phù hợp nhất')}
                      </MenuItem>
                      <MenuItem value="newest" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {t('employer:profileCard.sort.newest', 'Mới nhất')}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Candidate List */}
                <Stack spacing={1.25}>
                  {resumes.map((resume) => (
                    <MasterCandidateItem
                      key={resume.id}
                      resume={resume}
                      isSelected={selectedSlug === resume.slug}
                      onSelect={() => setSelectedSlug(resume.slug)}
                      onSave={handleSave}
                    />
                  ))}
                </Stack>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                      color="primary"
                      shape="rounded"
                      variant="outlined"
                      count={totalPages}
                      page={page}
                      onChange={handleChangePage}
                      size="small"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          backgroundColor: 'background.paper',
                          fontWeight: 700,
                          borderRadius: '6px',
                          height: 32,
                          minWidth: 32,
                          fontSize: '0.8rem',
                        },
                      }}
                    />
                  </Box>
                )}
              </Stack>
            </Grid>

            {/* RIGHT COLUMN: Candidate Detail Preview Panel */}
            <Grid item xs={12} lg={7.5} xl={8}>
              <CandidateDetailPreviewPanel
                resumeSlug={selectedSlug || selectedResume?.slug}
                initialResume={selectedResume}
                onSave={handleSave}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

const ProfileCard: React.FC = () => {
  const { resumeFilter } = useAppSelector((state) => state.filter);
  const filterKey = useMemo(() => JSON.stringify(resumeFilter), [resumeFilter]);

  return <ProfileCardContent key={filterKey} />;
};

export default ProfileCard;
