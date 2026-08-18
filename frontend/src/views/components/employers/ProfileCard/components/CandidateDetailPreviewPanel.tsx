'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Stack,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  Divider,
  Grid,
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

import { useResumeDetail } from '../../hooks/useEmployerQueries';
import type { Resume } from '@/types/models';
import { formatLocalizedSalaryRange } from '@/utils/customData';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { formatRoute } from '@/utils/funcUtils';
import { ROUTES } from '@/configs/constants';
import { tConfig } from '@/utils/tConfig';
import { useConfig } from '@/hooks/useConfig';

export interface DetailPreviewProps {
  resumeSlug: string;
  initialResume: Resume | null;
  onSave: (slug: string) => void;
}

export const CandidateDetailPreviewPanel: React.FC<DetailPreviewProps> = ({
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
  const phone =
    (resume as any).jobSeekerProfile?.phone ||
    (resume as any).jobSeekerProfileDict?.phone ||
    profileObj?.phone ||
    user?.phone ||
    (resume as any).phone ||
    (resume as any).contactPhone;
  const email =
    (resume as any).user?.email ||
    (resume as any).userDict?.email ||
    user?.email ||
    profileObj?.email ||
    (resume as any).email ||
    (resume as any).contactEmail;
  const fullName = user?.fullName || resume.title || 'Ứng viên';
  const age = (resume as any).jobSeekerProfileDict?.old;
  const profileDetailHref = localizeRoutePath(
    `/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, resume.slug)}`,
    i18n.language
  );

  const handleOpenFullProfile = () => {
    window.open(profileDetailHref, '_blank');
  };

  const expId =
    typeof resume.experience === 'number'
      ? resume.experience
      : typeof resume.experience === 'object'
      ? (resume.experience as any)?.id
      : undefined;
  const experienceLabel =
    expId && allConfig?.experienceDict?.[expId]
      ? tConfig(String(allConfig.experienceDict[expId]))
      : 'Chưa cập nhật';

  const cityId =
    typeof resume.city === 'number'
      ? resume.city
      : typeof resume.city === 'object'
      ? (resume.city as any)?.id
      : profileObj?.location?.city;
  const cityLabel =
    cityId && allConfig?.cityDict?.[cityId]
      ? tConfig(String(allConfig.cityDict[cityId]))
      : profileObj?.contactAddress || profileObj?.location?.address || 'Chưa cập nhật';

  const careerId =
    typeof resume.career === 'number'
      ? resume.career
      : typeof resume.career === 'object'
      ? (resume.career as any)?.id
      : undefined;
  const careerLabel =
    careerId && allConfig?.careerDict?.[careerId]
      ? tConfig(String(allConfig.careerDict[careerId]))
      : 'Chưa cập nhật';

  const academicId =
    typeof resume.academicLevel === 'number'
      ? resume.academicLevel
      : typeof resume.academicLevel === 'object'
      ? (resume.academicLevel as any)?.id
      : undefined;
  const academicLabel =
    academicId && allConfig?.academicLevelDict?.[academicId]
      ? tConfig(String(allConfig.academicLevelDict[academicId]))
      : 'Đại học';

  const positionId =
    typeof resume.position === 'number'
      ? resume.position
      : typeof resume.position === 'object'
      ? (resume.position as any)?.id
      : undefined;
  const positionLabel =
    positionId && allConfig?.positionDict?.[positionId]
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
              {resume.skillsSummary.split(',').map((skill: string, idx: number) => (
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

export default CandidateDetailPreviewPanel;
