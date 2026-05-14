'use client';
import React from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
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
import { salaryString } from '@/utils/customData';
import { formatRoute } from '@/utils/funcUtils';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { ROUTES, IMAGES } from '@/configs/constants';
import { useConfig } from '@/hooks/useConfig';
import { tConfig } from '@/utils/tConfig';

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
}

const MetaItem = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
    {icon}
    <Typography sx={{ fontWeight: 500, fontSize: 13 }} variant="body2">
      {children}
    </Typography>
  </Box>
);

const JobPost = ({
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
}: JobPostProps) => {
  const { push } = useRouter();
  const theme = useTheme();
  const { allConfig } = useConfig();
  const { t, i18n } = useTranslation('public');

  const goToDetail = () => {
    push(localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.JOB_DETAIL, slug)}`, i18n.language));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToDetail();
    }
  };

  return (
    <Card
      variant="outlined"
      onClick={goToDetail}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
      aria-label={jobName || 'Job detail'}
      sx={{
        boxShadow: 0,
        cursor: 'pointer',
        px: 2,
        pt: 2,
        pb: 1,
        transition: 'all 0.3s ease',
        borderRadius: '24px 8px 24px 8px',
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        overflow: 'hidden',
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
        <Tooltip title="Hot" placement="top">
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
              borderRadius: '4px',
              zIndex: 1,
            }}
          >
            <FontAwesomeIcon icon={faFire} style={{ fontSize: 14, color: theme.palette.hot.main }} />
            <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: theme.palette.hot.main, lineHeight: 1 }}>
              HOT
            </Typography>
          </Box>
        </Tooltip>
      )}

      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ position: 'relative' }}>
          <MuiImageCustom
            width={65}
            height={65}
            src={companyImageUrl}
            fallbackSrc={IMAGES.companyLogoDefault}
            sx={{
              border: 1,
              borderRadius: '12px 4px 12px 4px',
              borderColor: theme.palette.grey[200],
              p: 1,
              backgroundColor: theme.palette.common.white,
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          />
          {isUrgent && (
            <Tooltip title={t('jobPostForm.label.isUrgent')} placement="top">
              <Box
                sx={{
                  position: 'absolute',
                  top: -6,
                  left: -6,
                  backgroundColor: theme.palette.common.white,
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: theme.customShadows.small,
                  zIndex: 1,
                }}
              >
                <FontAwesomeIcon icon={faBolt} style={{ fontSize: 12, color: theme.palette.warning.main }} />
              </Box>
            </Tooltip>
          )}
        </Box>

        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
          <Tooltip followCursor title={jobName}>
            <Typography
              variant="subtitle2"
              noWrap
              flex={1}
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

      <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }} justifyContent="flex-start">
        <MetaItem icon={<FontAwesomeIcon icon={faCircleDollarToSlot} color={theme.palette.primary.main} />}>
          {salaryString(salaryMin, salaryMax)}
        </MetaItem>
        <MetaItem icon={<FontAwesomeIcon icon={faLocationDot} color={theme.palette.primary.main} />}>
          {tConfig(allConfig?.cityDict?.[cityId]) || <span style={{ fontStyle: 'italic', color: theme.palette.grey[500] }}>{t('common:labels.notUpdated')}</span>}
        </MetaItem>
        <MetaItem icon={<FontAwesomeIcon icon={faCalendarDays} color={theme.palette.primary.main} />}>
          {dayjs(deadline).format('DD/MM/YYYY')}
        </MetaItem>
      </Stack>

      <Divider sx={{ mt: 1, mb: 0.75, borderColor: theme.palette.grey[400] }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <MetaItem icon={<FontAwesomeIcon icon={faClock} style={{ fontSize: 14 }} color={theme.palette.grey[400]} />}>
          {t('jobPost.timeLeft', { defaultValue: 'Còn' })} <TimeAgo date={deadline} type="fromNow" />
        </MetaItem>
      </Box>
    </Card>
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
