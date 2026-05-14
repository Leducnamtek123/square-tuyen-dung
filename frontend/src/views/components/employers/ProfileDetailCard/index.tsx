'use client';

import React, { Suspense, lazy } from 'react';
import { useParams } from 'next/navigation';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid2 as Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArticleIcon from '@mui/icons-material/Article';
import BadgeIcon from '@mui/icons-material/Badge';
import CallIcon from '@mui/icons-material/Call';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PaymentsIcon from '@mui/icons-material/Payments';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import TimeAgo from '../../../../components/Common/TimeAgo';
import { CV_TYPES } from '../../../../configs/constants';
import { salaryString } from '../../../../utils/customData';
import { tConfig } from '../../../../utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import type { ResumeDetailResponse } from '@/types/models';
import pc from '@/utils/muiColors';
import { useResumeDetail } from '../hooks/useEmployerQueries';

import PersonalInfoSection from './PersonalInfoSection';
import GeneralInfoSection from './GeneralInfoSection';
import CareerGoalsSection from './CareerGoalsSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import CertificateSection from './CertificateSection';
import LanguageSection from './LanguageSection';
import AdvancedSkillSection from './AdvancedSkillSection';

const LazyPdf = lazy(() => import('../../../../components/Common/Pdf'));

type ConfigDict = Record<string, string> | undefined;
type ConfigValue =
  | string
  | number
  | null
  | undefined
  | {
      id?: string | number;
      name?: string | null;
    };

type DetailMetricProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
};

type SidebarInfoProps = DetailMetricProps & {
  href?: string;
};

const resolveConfigText = (dict: ConfigDict, value: ConfigValue): string => {
  if (value === undefined || value === null || value === '') return '';

  if (typeof value === 'object') {
    return value.name || tConfig(dict?.[String(value.id ?? '')]);
  }

  return tConfig(dict?.[String(value)]);
};

const getInitials = (name?: string): string => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'UV';
  return parts.slice(-2).map((part) => part[0]).join('').toUpperCase();
};

const valueOrFallback = (value: React.ReactNode, fallback: string): React.ReactNode => {
  if (value === undefined || value === null || value === '' || value === '---') return fallback;
  return value;
};

const DetailMetric = ({ icon, label, value }: DetailMetricProps) => (
  <Paper
    variant="outlined"
    sx={{
      height: '100%',
      p: 2,
      borderRadius: 2,
      borderColor: pc.divider(0.65),
      bgcolor: pc.bgPaper(0.92),
      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.05)',
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          bgcolor: pc.primary(0.08),
          color: 'primary.main',
          '& svg': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: 'text.secondary',
            fontWeight: 800,
            lineHeight: 1.2,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            mt: 0.5,
            color: 'text.primary',
            fontWeight: 900,
            lineHeight: 1.35,
            overflowWrap: 'anywhere',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const SidebarInfo = ({ icon, label, value, href }: SidebarInfoProps) => {
  const content = (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{
        width: '100%',
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: pc.divider(0.6),
        bgcolor: pc.bgDefault(0.35),
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          bgcolor: pc.primary(0.08),
          color: 'primary.main',
          '& svg': { fontSize: 19 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            fontWeight: 800,
            overflowWrap: 'anywhere',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  );

  if (!href) return content;

  return (
    <Box
      component="a"
      href={href}
      sx={{
        display: 'block',
        color: 'inherit',
        textDecoration: 'none',
        '&:hover > div': {
          borderColor: 'primary.main',
          bgcolor: pc.primary(0.05),
        },
      }}
    >
      {content}
    </Box>
  );
};

const ProfileDetailCard: React.FC = () => {
  const { t } = useTranslation(['employer', 'common']);
  const params = useParams();
  const slug = params?.slug as string;
  const { allConfig } = useConfig();

  const { data, isLoading } = useResumeDetail(slug);

  if (isLoading) return <BackdropLoading open={true} />;
  if (!data) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 7 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: pc.divider(0.7),
          textAlign: 'center',
        }}
      >
        <AccountCircleIcon sx={{ fontSize: 58, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          {t('profileDetailCard.title.profileNotFound')}
        </Typography>
        <Typography sx={{ mt: 1, color: 'text.secondary', fontWeight: 600 }}>
          {t('profileDetailCard.title.privateProfile')}
        </Typography>
      </Paper>
    );
  }

  const profileDetail = data as ResumeDetailResponse;
  const isOnlineCv = profileDetail.type === CV_TYPES.cvWebsite;
  const fileUrl = profileDetail.fileUrl || '';
  const notUpdated = t('common:labels.notUpdated');
  const candidateName =
    profileDetail.user?.fullName ||
    profileDetail.userDict?.fullName ||
    profileDetail.jobSeekerProfile?.userDict?.fullName ||
    profileDetail.jobSeekerProfileDict?.fullName ||
    notUpdated;
  const candidateEmail =
    profileDetail.user?.email ||
    profileDetail.userDict?.email ||
    profileDetail.jobSeekerProfile?.userDict?.email ||
    profileDetail.jobSeekerProfileDict?.email ||
    '';
  const candidatePhone = profileDetail.jobSeekerProfile?.phone || '';
  const avatarUrl =
    profileDetail.user?.avatarUrl ||
    profileDetail.userDict?.avatarUrl ||
    profileDetail.jobSeekerProfile?.userDict?.avatarUrl ||
    undefined;
  const salaryText = salaryString(profileDetail.salaryMin, profileDetail.salaryMax);
  const locationText =
    resolveConfigText(allConfig?.cityDict, profileDetail.city) ||
    resolveConfigText(allConfig?.cityDict, profileDetail.jobSeekerProfile?.location?.city);
  const careerText = resolveConfigText(allConfig?.careerDict, profileDetail.career);
  const experienceText = resolveConfigText(allConfig?.experienceDict, profileDetail.experience);
  const updatedAt = profileDetail.updateAt || profileDetail.createAt;

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          border: '1px solid',
          borderColor: pc.divider(0.7),
          bgcolor: 'background.paper',
          boxShadow: '0 18px 44px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(26, 64, 125, 0.08) 0%, rgba(42, 169, 225, 0.08) 42%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ position: 'relative', p: { xs: 2.5, md: 4 } }}>
          <Grid container spacing={3} alignItems="stretch">
            <Grid size={{ xs: 12, lg: 7 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2.5}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ height: '100%' }}
              >
                <Avatar
                  src={avatarUrl}
                  sx={{
                    width: { xs: 76, md: 92 },
                    height: { xs: 76, md: 92 },
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    fontSize: { xs: 26, md: 32 },
                    fontWeight: 900,
                    boxShadow: '0 16px 36px rgba(26, 64, 125, 0.22)',
                  }}
                >
                  {getInitials(candidateName)}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.25 }}>
                    <Chip
                      size="small"
                      label={isOnlineCv ? t('profileDetailCard.label.onlineCv') : t('profileDetailCard.label.attachedCv')}
                      sx={{
                        height: 26,
                        fontWeight: 900,
                        color: 'primary.main',
                        bgcolor: pc.primary(0.08),
                        border: '1px solid',
                        borderColor: pc.primary(0.18),
                      }}
                    />
                    <Chip
                      size="small"
                      label={
                        profileDetail.isActive === false
                          ? t('profileDetailCard.label.inactive')
                          : t('profileDetailCard.label.active')
                      }
                      sx={{
                        height: 26,
                        fontWeight: 900,
                        color: profileDetail.isActive === false ? 'text.secondary' : 'success.main',
                        bgcolor: profileDetail.isActive === false ? pc.actionDisabled(0.18) : pc.success(0.09),
                        border: '1px solid',
                        borderColor: profileDetail.isActive === false ? pc.divider(0.7) : pc.success(0.18),
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="h3"
                    sx={{
                      color: 'text.primary',
                      fontWeight: 1000,
                      fontSize: { xs: '1.8rem', md: '2.35rem' },
                      lineHeight: 1.12,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {candidateName}
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 1,
                      color: 'text.secondary',
                      fontWeight: 800,
                      lineHeight: 1.35,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {valueOrFallback(profileDetail.title, notUpdated)}
                  </Typography>

                  <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                    {locationText && (
                      <Chip
                        icon={<FmdGoodIcon />}
                        label={locationText}
                        variant="outlined"
                        sx={{ borderRadius: 2, fontWeight: 800, bgcolor: 'background.paper' }}
                      />
                    )}
                    {careerText && (
                      <Chip
                        icon={<BadgeIcon />}
                        label={careerText}
                        variant="outlined"
                        sx={{ borderRadius: 2, fontWeight: 800, bgcolor: 'background.paper' }}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailMetric
                    icon={<PaymentsIcon />}
                    label={t('profileDetailCard.label.desiredSalary')}
                    value={valueOrFallback(salaryText, notUpdated)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailMetric
                    icon={<WorkHistoryIcon />}
                    label={t('profileDetailCard.label.experience')}
                    value={valueOrFallback(experienceText, notUpdated)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailMetric
                    icon={<RemoveRedEyeIcon />}
                    label={t('profileDetailCard.label.views')}
                    value={profileDetail.viewEmployerNumber || 0}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DetailMetric
                    icon={<EventAvailableIcon />}
                    label={t('profileDetailCard.label.lastUpdated')}
                    value={updatedAt ? <TimeAgo date={updatedAt} type="format" /> : notUpdated}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 4 },
                borderRadius: 3,
                border: '1px solid',
                borderColor: pc.divider(0.7),
                bgcolor: 'background.paper',
                boxShadow: '0 14px 34px rgba(15, 23, 42, 0.06)',
              }}
            >
              <Stack spacing={4}>
                <PersonalInfoSection profileDetail={profileDetail} />
                <Divider sx={{ borderColor: pc.divider(0.75) }} />
                <GeneralInfoSection profileDetail={profileDetail} />
                <Divider sx={{ borderColor: pc.divider(0.75) }} />
                <CareerGoalsSection profileDetail={profileDetail} />
              </Stack>
            </Paper>

            {isOnlineCv ? (
              <Stack spacing={3}>
                <ExperienceSection profileDetail={profileDetail} />
                <EducationSection profileDetail={profileDetail} />
                <CertificateSection profileDetail={profileDetail} />
                <LanguageSection profileDetail={profileDetail} />
                <AdvancedSkillSection profileDetail={profileDetail} />
              </Stack>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: pc.divider(0.7),
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.06)',
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ xs: 'stretch', md: 'center' }}
                  justifyContent="space-between"
                  spacing={2}
                  sx={{
                    px: { xs: 2.5, md: 3 },
                    py: 2.25,
                    borderBottom: '1px solid',
                    borderColor: pc.divider(0.75),
                    bgcolor: pc.bgDefault(0.55),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        bgcolor: pc.error(0.1),
                        color: 'error.main',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <DescriptionIcon sx={{ fontSize: 23 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary' }}>
                        {t('common:labels.attachedResume')}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {valueOrFallback(profileDetail.title, notUpdated)}
                      </Typography>
                    </Box>
                    <Chip
                      label="PDF"
                      size="small"
                      sx={{
                        fontWeight: 900,
                        height: 22,
                        bgcolor: pc.error(0.08),
                        color: 'error.main',
                        border: '1px solid',
                        borderColor: pc.error(0.16),
                      }}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<OpenInNewIcon fontSize="small" />}
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      disabled={!fileUrl}
                      sx={{ fontWeight: 900, textTransform: 'none' }}
                    >
                      {t('common:actions.openNewTab')}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DownloadIcon fontSize="small" />}
                      href={fileUrl}
                      download
                      disabled={!fileUrl}
                      sx={{
                        
                        fontWeight: 900,
                        textTransform: 'none',
                        boxShadow: (theme) => theme.customShadows?.primary,
                      }}
                    >
                      {t('common:actions.download')}
                    </Button>
                  </Stack>
                </Stack>

                {fileUrl ? (
                  <Box sx={{ minHeight: { xs: 560, md: 760 }, bgcolor: '#f8fafc' }}>
                    <Suspense
                      fallback={
                        <Stack alignItems="center" justifyContent="center" sx={{ height: 420 }}>
                          <ArticleIcon sx={{ fontSize: 58, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 700 }}>
                            {t('profileDetailCard.messages.loadingPdf')}
                          </Typography>
                        </Stack>
                      }
                    >
                      <LazyPdf fileUrl={fileUrl} title={profileDetail.title || ''} />
                    </Suspense>
                  </Box>
                ) : (
                  <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
                    <DescriptionIcon sx={{ fontSize: 58, color: 'text.disabled', mb: 2, opacity: 0.4 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 900 }}>
                      {t('profileDetailCard.messages.noAttachedFile')}
                    </Typography>
                  </Stack>
                )}
              </Paper>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3} sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: pc.divider(0.7),
                bgcolor: 'background.paper',
                boxShadow: '0 14px 34px rgba(15, 23, 42, 0.06)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 1000, mb: 2 }}>
                {t('profileDetailCard.label.contactInfo')}
              </Typography>
              <Stack spacing={1.5}>
                <SidebarInfo
                  icon={<EmailIcon />}
                  label={t('common:labels.email')}
                  value={valueOrFallback(candidateEmail, notUpdated)}
                  href={candidateEmail ? `mailto:${candidateEmail}` : undefined}
                />
                <SidebarInfo
                  icon={<CallIcon />}
                  label={t('profileDetailCard.label.phone')}
                  value={valueOrFallback(candidatePhone, notUpdated)}
                  href={candidatePhone ? `tel:${candidatePhone}` : undefined}
                />
                <SidebarInfo
                  icon={<FmdGoodIcon />}
                  label={t('profileDetailCard.label.workLocation')}
                  value={valueOrFallback(locationText, notUpdated)}
                />
              </Stack>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: pc.divider(0.7),
                bgcolor: 'background.paper',
                boxShadow: '0 14px 34px rgba(15, 23, 42, 0.06)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 1000, mb: 2 }}>
                {t('profileDetailCard.label.quickFacts')}
              </Typography>
              <Stack spacing={1.5}>
                <SidebarInfo
                  icon={<BadgeIcon />}
                  label={t('profileDetailCard.label.profileType')}
                  value={isOnlineCv ? t('profileDetailCard.label.onlineCv') : t('profileDetailCard.label.attachedCv')}
                />
                <SidebarInfo
                  icon={<EventAvailableIcon />}
                  label={t('profileDetailCard.label.lastViewed')}
                  value={profileDetail.lastViewedDate ? <TimeAgo date={profileDetail.lastViewedDate} type="format" /> : notUpdated}
                />
                <SidebarInfo
                  icon={<RemoveRedEyeIcon />}
                  label={t('profileDetailCard.label.views')}
                  value={profileDetail.viewEmployerNumber || 0}
                />
              </Stack>

              {!isOnlineCv && (
                <>
                  <Divider sx={{ my: 2.5, borderColor: pc.divider(0.75) }} />
                  <Stack spacing={1.25}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<OpenInNewIcon />}
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      disabled={!fileUrl}
                      sx={{
                        
                        py: 1.15,
                        fontWeight: 900,
                        textTransform: 'none',
                        boxShadow: (theme) => theme.customShadows?.primary,
                      }}
                    >
                      {t('common:actions.openNewTab')}
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      href={fileUrl}
                      download
                      disabled={!fileUrl}
                      sx={{ py: 1.15, fontWeight: 900, textTransform: 'none' }}
                    >
                      {t('common:actions.download')}
                    </Button>
                  </Stack>
                </>
              )}
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ProfileDetailCard;
