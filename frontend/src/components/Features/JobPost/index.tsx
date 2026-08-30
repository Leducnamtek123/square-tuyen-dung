'use client';
import React from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { Box, Card, Divider, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faCircleDollarToSlot,
  faLocationDot,
  faFire,
  faBolt,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import TimeAgo from '@/components/Common/TimeAgo';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import { formatLocalizedSalaryRange } from '@/utils/customData';
import { formatRoute } from '@/utils/funcUtils';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { ROUTES, IMAGES } from '@/configs/constants';
import { useConfig } from '@/hooks/useConfig';
import { tConfig } from '@/utils/tConfig';
import { JobHoverPreviewCard, useJobHoverPreview, type JobHoverPreviewData } from '@/components/Features/JobHoverPreview';

interface JobPostProps {
  id: number;
  slug: string;
  companyImageUrl?: string | null;
  companyName?: string;
  jobName?: string;
  cityId: number;
  deadline: string;
  isUrgent?: boolean;
  isHot?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: string | number;
  experience?: number;
  academicLevel?: number;
  jobDescription?: string;
  jobRequirement?: string | null;
  benefitsEnjoyed?: string | null;
  disableHoverPreview?: boolean;
}

const MetaItem = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: any;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary', minWidth: 0 }}>
    <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 500, fontSize: 13, minWidth: 0 }} variant="body2">
      {children}
    </Typography>
  </Box>
);

const JobPost = ({
  id,
  slug,
  companyImageUrl,
  companyName,
  jobName,
  cityId,
  deadline,
  isUrgent,
  isHot,
  salaryMin,
  salaryMax,
  salaryType,
  experience,
  academicLevel,
  jobDescription,
  jobRequirement,
  benefitsEnjoyed,
  disableHoverPreview = false,
}: JobPostProps) => {
  const theme = useTheme();
  const { allConfig } = useConfig();
  const { t, i18n } = useTranslation(['public', 'common']);

  const {
    hoveredJob,
    anchorEl: previewAnchorEl,
    isOpen: isPreviewOpen,
    handleCardMouseEnter,
    handleCardMouseLeave,
    handlePopperMouseEnter,
    handlePopperMouseLeave,
    handleClose: handleClosePreview,
  } = useJobHoverPreview();

  const previewData: JobHoverPreviewData = React.useMemo(() => ({
    id,
    slug,
    jobName: jobName || '',
    companyDict: { companyName, companyImageUrl },
    locationDict: { city: cityId },
    salaryMin,
    salaryMax,
    salaryType,
    deadline,
    isUrgent,
    isHot,
    experience,
    academicLevel,
    jobDescription,
    jobRequirement,
    benefitsEnjoyed,
  }), [
    id,
    slug,
    jobName,
    companyName,
    companyImageUrl,
    cityId,
    salaryMin,
    salaryMax,
    salaryType,
    deadline,
    isUrgent,
    isHot,
    experience,
    academicLevel,
    jobDescription,
    jobRequirement,
    benefitsEnjoyed,
  ]);

  const detailHref = localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.JOB_DETAIL, slug)}`, i18n.language);

  return (
    <>
      <Card
        component={Link}
        href={detailHref}
        prefetch
        variant="outlined"
        aria-label={jobName || t('common:viewDetails')}
        onMouseEnter={disableHoverPreview ? undefined : (e) => handleCardMouseEnter(e, previewData)}
        onMouseLeave={disableHoverPreview ? undefined : handleCardMouseLeave}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          minHeight: 150,
          boxShadow: 0,
          cursor: 'pointer',
          color: 'inherit',
          textDecoration: 'none',
          px: 2,
          pt: 2,
          pb: 1,
          transition: 'all 0.3s ease',
          borderRadius: '24px 8px 24px 8px',
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: theme.palette.background.paper,
          ...(isUrgent && {
            borderLeft: 'none',
            backgroundColor: theme.palette.secondary.background,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              background: theme.palette.secondary.main,
              borderRadius: '24px 0 0 8px',
              boxShadow: `0 0 8px ${theme.palette.secondary.main}40`,
            },
          }),
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.customShadows.large,
            ...(isUrgent
              ? {
                  borderColor: theme.palette.secondary.main,
                  borderLeft: 'none',
                  backgroundColor: theme.palette.secondary.backgroundHover,
                }
              : { borderColor: theme.palette.primary.main }),
          },
        }}
      >
        {isHot && (
          <Tooltip title={t('common:common.hot')} placement="top">
            <Box
              sx={{
                position: 'absolute',
                top: 5,
                right: 6,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: theme.palette.hot.background,
                padding: '4px 8px',
                borderRadius: '8px',
              }}
            >
              <FontAwesomeIcon icon={faFire} color={theme.palette.hot.main} />
              <Typography sx={{ color: theme.palette.hot.main, fontSize: 11, fontWeight: 700 }}>
                {t('common:common.hot')}
              </Typography>
            </Box>
          </Tooltip>
        )}

        {isUrgent && (
          <Tooltip title={t('common:common.urgent')} placement="top">
            <Box
              sx={{
                position: 'absolute',
                top: 5,
                right: 6,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: theme.palette.secondary.backgroundHover,
                padding: '4px 8px',
                borderRadius: '8px',
              }}
            >
              <FontAwesomeIcon icon={faBolt} color={theme.palette.secondary.main} />
              <Typography sx={{ color: theme.palette.secondary.main, fontSize: 11, fontWeight: 700 }}>
                {t('common:common.urgent')}
              </Typography>
            </Box>
          </Tooltip>
        )}

        <Stack direction="row" spacing={1} sx={{ minWidth: 0 }}>
          <Box sx={{ flexShrink: 0 }}>
            <MuiImageCustom
              src={companyImageUrl || IMAGES.companyLogoDefault}
              alt={companyName}
              width={60}
              height={60}
              sx={{
                borderRadius: '50%',
                border: `1px solid ${theme.palette.divider}`,
                p: 0.5,
                objectFit: 'contain',
              }}
            />
          </Box>
          <Stack flex={1} sx={{ minWidth: 0 }} spacing={0.5}>
            <Tooltip followCursor title={jobName}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'Open Sans',
                  color: theme.palette.grey[800],
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                }}
              >
                {jobName}
              </Typography>
            </Tooltip>
            <Tooltip followCursor title={companyName}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ fontSize: 13, color: theme.palette.grey[600], fontWeight: 500 }}
              >
                {companyName}
              </Typography>
            </Tooltip>
          </Stack>
        </Stack>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 1, mt: 2 }}>
          <MetaItem icon={<FontAwesomeIcon icon={faCircleDollarToSlot} color={theme.palette.primary.main} />}>
            {formatLocalizedSalaryRange(salaryMin, salaryMax, i18n.language)}
          </MetaItem>
          <MetaItem icon={<FontAwesomeIcon icon={faLocationDot} color={theme.palette.primary.main} />}>
            {tConfig(allConfig?.cityDict?.[cityId]) || <span style={{ fontStyle: 'italic', color: theme.palette.grey[500] }}>{t('common:labels.notUpdated')}</span>}
          </MetaItem>
          <MetaItem icon={<FontAwesomeIcon icon={faCalendarDays} color={theme.palette.primary.main} />}>
            {dayjs(deadline).format('DD/MM/YYYY')}
          </MetaItem>
        </Box>

        <Divider sx={{ mt: 'auto', mb: 0.75, pt: 1, borderColor: theme.palette.grey[400] }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <MetaItem icon={<FontAwesomeIcon icon={faClock} style={{ fontSize: 14 }} color={theme.palette.grey[400]} />}>
            {t('jobPost.timeLeft')} <TimeAgo date={deadline} type="fromNow" />
          </MetaItem>
        </Box>
      </Card>

      {!disableHoverPreview && (
        <JobHoverPreviewCard
          job={hoveredJob}
          anchorEl={previewAnchorEl}
          open={isPreviewOpen}
          onClose={handleClosePreview}
          onMouseEnterPopper={handlePopperMouseEnter}
          onMouseLeavePopper={handlePopperMouseLeave}
          cityLabel={tConfig(allConfig?.cityDict?.[cityId])}
          experienceLabel={experience ? tConfig(allConfig?.experienceDict?.[experience]) : undefined}
          academicLevelLabel={academicLevel ? tConfig(allConfig?.academicLevelDict?.[academicLevel]) : undefined}
        />
      )}
    </>
  );
};

const Loading = () => (
  <Card sx={{ p: 1, boxShadow: 0 }}>
    <Stack direction="row" spacing={1}>
      <Box>
        <Skeleton variant="rounded" width={60} height={60} />
      </Box>
      <Box flex={1}>
        <Typography variant="subtitle2" sx={{ fontSize: 15 }} gutterBottom>
          <Skeleton height={30} />
        </Typography>
        <Typography variant="subtitle2" color="gray">
          <Skeleton />
        </Typography>
      </Box>
      <Box>
        <Skeleton height={30} width={60} />
      </Box>
    </Stack>
    <Stack direction="row" spacing={1} sx={{ mt: 0.75 }} justifyContent="space-between">
      <Stack direction="row" spacing={1} justifyContent="space-between">
        <Skeleton width={80} />
        <Skeleton width={80} />
        <Skeleton width={80} />
      </Stack>
    </Stack>
  </Card>
);

const MemoizedJobPost = Object.assign(React.memo(JobPost), { Loading });

export default MemoizedJobPost;

