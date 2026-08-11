'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
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
  useTheme,
  alpha,
} from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LockIcon from '@mui/icons-material/Lock';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import dayjs from 'dayjs';

import toastMessages from '../../../../utils/toastMessages';
import { ProfileSearchBar, ProfileFilterDrawer, useProfileSearch } from '../ProfileSearch';
import { useEmployerResumes, useToggleSaveResumeOptimistic, useResumeDetail } from '../hooks/useEmployerQueries';
import type { Resume } from '@/types/models';
import pc from '@/utils/muiColors';
import { formatLocalizedSalaryRange } from '@/utils/customData';
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
  const { t, i18n } = useTranslation(['employer', 'common']);
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

  const updatedAtLabel = resume.updateAt
    ? dayjs(resume.updateAt).format('DD/MM/YYYY')
    : '';

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
            width: 44,
            height: 44,
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

          {/* Active status / match chip */}
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25, mb: 0.5 }}>
            <Chip
              label="Đang tìm việc"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: '#FEF3C7',
                color: '#D97706',
                borderRadius: '4px',
              }}
            />
            {resume.matchScore && resume.matchScore > 0 ? (
              <Chip
                label="Phù hợp"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  borderRadius: '4px',
                }}
              />
            ) : null}
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
  const { push } = useRouter();
  const { allConfig } = useConfig();

  const { data: fetchedDetail, isLoading } = useResumeDetail(resumeSlug);
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

  const user = (resume as any).userDict || (resume as any).user;
  const fullName = user?.fullName || resume.title || 'Ứng viên';
  const age = (resume as any).jobSeekerProfileDict?.old;
  const profileDetailHref = localizeRoutePath(
    `/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, resume.slug)}`,
    i18n.language
  );

  const handleOpenFullProfile = () => {
    window.open(profileDetailHref, '_blank');
  };

  const experienceLabel = resume.experience && allConfig?.experienceDict?.[resume.experience]
    ? tConfig(String(allConfig.experienceDict[resume.experience]))
    : 'Chưa cập nhật';
  const cityLabel = resume.city?.id && allConfig?.cityDict?.[resume.city.id]
    ? tConfig(String(allConfig.cityDict[resume.city.id]))
    : 'Chưa cập nhật';
  const careerLabel = resume.career?.id && allConfig?.careerDict?.[resume.career.id]
    ? tConfig(String(allConfig.careerDict[resume.career.id]))
    : 'Chưa cập nhật';
  const academicLabel = resume.academicLevel && allConfig?.academicLevelDict?.[resume.academicLevel]
    ? tConfig(String(allConfig.academicLevelDict[resume.academicLevel]))
    : 'Đại học';
  const positionLabel = resume.position && allConfig?.positionDict?.[resume.position]
    ? tConfig(String(allConfig.positionDict[resume.position]))
    : 'Nhân viên';

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
          {/* Synchronized Save Bookmark Button */}
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

          {/* View Full Profile Button */}
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
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LockIcon sx={{ fontSize: 13 }} /> Thông tin ẩn
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon sx={{ fontSize: 16, color: '#64748B' }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.8rem' }}>
                  Email:
                </Typography>
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LockIcon sx={{ fontSize: 13 }} /> Thông tin ẩn
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
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

        <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

        {/* Overview Parameters Grid */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block', mb: 0.25 }}>
              Trình độ học vấn
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
              {academicLabel}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block', mb: 0.25 }}>
              Kinh nghiệm làm việc
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
              {experienceLabel}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block', mb: 0.25 }}>
              Cấp bậc hiện tại
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
              {positionLabel}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block', mb: 0.25 }}>
              Mức lương mong muốn
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB', fontSize: '0.875rem' }}>
              {formatLocalizedSalaryRange(resume.salaryMin, resume.salaryMax, i18n.language)}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={6}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block', mb: 0.25 }}>
              Ngành nghề ứng tuyển
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
              {careerLabel}
            </Typography>
          </Grid>

          <Grid item xs={6} sm={6}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.75rem', display: 'block', mb: 0.25 }}>
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
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1, fontSize: '0.8125rem' }}>
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
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.75, fontSize: '0.85rem' }}>
              Mục tiêu nghề nghiệp & Giới thiệu bản thân
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
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
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
                  File Hồ sơ đính kèm (CV PDF)
                </Typography>
              </Stack>
              <Button
                size="small"
                variant="outlined"
                component="a"
                href={resume.fileUrl}
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
  const { t } = useTranslation('employer');
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

  const { resumeFilter } = useAppSelector((state) => state.filter);
  const { pageSize } = resumeFilter;
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => ({
    ...resumeFilter,
    page,
  }), [resumeFilter, page]);

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

  const handleChangePage = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    setSelectedSlug('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = (slug: string) => {
    toggleSave(slug, {
      onSuccess: (resData: any) => {
        const isSaved = resData?.isSaved;
        toastMessages.success(
          isSaved ? t('profileCard.messages.saveSuccess') : t('profileCard.messages.unsaveSuccess')
        );
      },
      onError: (err: any) => {
        toastMessages.error('Đã xảy ra lỗi khi lưu hồ sơ. Vui lòng thử lại.');
      },
    });
  };

  const totalPages = Math.ceil(count / pageSize);
  const selectedResume = resumes.find((r) => r.slug === selectedSlug) || (resumes[0] ?? null);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 1. Top Search Bar with Filter Button */}
      <ProfileSearchBar
        control={control}
        handleSubmit={handleSubmit}
        handleFilter={handleFilter}
        allConfig={allConfig}
        t={t}
        onOpenFilterDrawer={() => setDrawerOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* 2. Slide-in Right Filter Drawer Modal */}
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

      {/* 3. Vieclam24h Master-Detail 2-Column Split View */}
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
              borderRadius: '10px',
              bgcolor: pc.actionDisabled(0.04),
              border: '2px dashed',
              borderColor: pc.divider(0.6),
            }}
          >
            <SearchOffIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              {t('profileCard.title.noresultsfound')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500, maxWidth: 360, mx: 'auto', opacity: 0.7 }}>
              Thử thay đổi từ khóa hoặc điều chỉnh bộ lọc để phát hiện thêm các ứng viên tài năng.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2.5} alignItems="flex-start">
            {/* LEFT COLUMN: Master Candidate List (~360px - 400px) */}
            <Grid item xs={12} lg={4.5} xl={4}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>
                    Kết quả: {' '}
                    <Box component="span" sx={{ color: 'primary.main', fontWeight: 900 }}>
                      {count} ứng viên
                    </Box>
                  </Typography>
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
