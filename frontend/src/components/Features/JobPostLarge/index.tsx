'use client';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { Box, Card, Skeleton, Stack, Typography } from '@mui/material';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import { formatRoute } from '@/utils/funcUtils';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { ROUTES, IMAGES } from '@/configs/constants';
import { tConfig } from '@/utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import { useTranslation } from 'react-i18next';
import { JobPostLargeFooter } from './JobPostLargeFooter';
import { JobPostLargeInfoChips } from './JobPostLargeInfoChips';
import { HotBadge, UrgentBadge } from './JobPostLargeStatusBadges';
import type { JobPostLargeProps } from './types';
import pc from '@/utils/muiColors';

const JobPostLarge = ({
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
}: JobPostLargeProps) => {
  const theme = useTheme();
  const { allConfig } = useConfig();
  const { t, i18n } = useTranslation(['public', 'common']);

  const detailHref = localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.JOB_DETAIL, slug)}`, i18n.language);

  const cityLabel =
    tConfig(allConfig?.cityDict?.[String(cityId)]) || (
      <span style={{ fontStyle: 'italic', opacity: 0.7 }}>{t('common:labels.notUpdated')}</span>
    );

  return (
    <Card
      component={Link}
      href={detailHref}
      prefetch
      variant="outlined"
      sx={{
        display: 'block',
        width: '100%',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        cursor: 'pointer',
        color: 'inherit',
        textDecoration: 'none',
        px: { xs: 2, sm: 2.75 },
        pt: { xs: 2, sm: 2.5 },
        pb: 1.5,
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease',
        borderRadius: '20px',
        border: '1px solid rgba(226, 232, 240, 0.85)',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor:
          theme.palette.mode === 'light'
            ? theme.palette.common.white
            : theme.palette.grey[900],
        ...(isUrgent && {
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '4px',
            background: `linear-gradient(90deg, #f97316, #fb923c)`,
          },
        }),
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 25px 45px -10px rgba(15, 57, 127, 0.12)',
          borderColor: isUrgent ? '#f97316' : '#2563eb',
          backgroundColor:
            theme.palette.mode === 'light'
              ? isUrgent
                ? '#fffaf5'
                : '#fbfcfe'
              : theme.palette.grey[800],
        },
        '&:active': {
          transform: 'scale(0.99)',
        },
      }}
      aria-label={jobName || t('common:viewDetails')}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
          <Box
            sx={{
              position: 'relative',
              width: { xs: 64, sm: 84, md: 100 },
              height: { xs: 64, sm: 84, md: 100 },
              flexShrink: 0,
            }}
          >
            <MuiImageCustom
              width="100%"
              height="100%"
              src={companyImageUrl || IMAGES.companyLogoDefault}
              fallbackSrc={IMAGES.companyLogoDefault}
              sx={{
                width: '100%',
                height: '100%',
                border: 1,
                borderRadius: 2.5,
                borderColor: theme.palette.grey[200],
                p: { xs: 0.5, sm: 1 },
                backgroundColor: theme.palette.common.white,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: theme.customShadows.medium,
                },
              }}
            />
            {isUrgent && <UrgentBadge theme={theme} />}
          </Box>

          <Stack flex={1} sx={{ minWidth: 0 }} spacing={0.75}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box flex={1} sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 15, sm: 16, md: 18 },
                    fontWeight: 700,
                    color: theme.palette.grey[900],
                    lineHeight: 1.3,
                    mb: 0.5,
                    overflowWrap: 'break-word',
                  }}
                >
                  {jobName}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: { xs: 13, sm: 14 },
                    fontWeight: 600,
                    overflowWrap: 'break-word',
                  }}
                >
                  {companyName}
                </Typography>
              </Box>
              {isHot && <HotBadge theme={theme} />}
            </Stack>

            <JobPostLargeInfoChips
              theme={theme}
              salaryMin={salaryMin}
              salaryMax={salaryMax}
              salaryLanguage={i18n.language}
              cityLabel={cityLabel}
              deadline={deadline}
            />
          </Stack>
        </Stack>
      </Stack>

      <Box sx={{ my: 0.75 }}>
        <Box sx={{ borderTop: `1px solid ${theme.palette.grey[400]}` }} />
      </Box>

      <JobPostLargeFooter theme={theme} deadline={deadline} />
    </Card>
  );
};

const Loading = () => (
  <>
    <Card sx={{ p: 1, boxShadow: 0 }}>
      <Stack direction="row" spacing={2}>
        <Box>
          <Skeleton variant="rounded" width={100} height={100} />
        </Box>
        <Stack flex={1} justifyContent="center" spacing={0.8}>
          <Typography variant="subtitle2">
            <Skeleton height={40} />
          </Typography>
          <Typography variant="subtitle2">
            <Skeleton height={30} />
          </Typography>
          <Typography variant="body1">
            <Skeleton height={25} />
          </Typography>
        </Stack>
      </Stack>
    </Card>
  </>
);

const MemoizedJobPostLarge = Object.assign(React.memo(JobPostLarge), { Loading });

export default MemoizedJobPostLarge;
