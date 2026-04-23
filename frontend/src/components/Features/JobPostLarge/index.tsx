import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
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
  const nav = useRouter();
  const { allConfig } = useConfig();
  const { i18n } = useTranslation('public');

  const goToDetail = () => {
    nav.push(
      localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.JOB_DETAIL, slug)}`, i18n.language),
    );
  };

  const handleCardKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToDetail();
    }
  };

  const cityLabel =
    tConfig(allConfig?.cityDict?.[String(cityId)]) || (
      <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Chua cap nhat</span>
    );

  return (
    <Card
      variant="outlined"
      sx={{
        boxShadow: 0,
        cursor: 'pointer',
        px: 2,
        pt: 2,
        pb: 1,
        transition: 'all 0.3s ease',
        borderRadius: 2.5,
        border: `1px solid ${theme.palette.divider}`,
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
            background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
          },
        }),
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: theme.customShadows.large,
          borderColor: isUrgent ? theme.palette.secondary.main : theme.palette.primary.main,
          backgroundColor:
            theme.palette.mode === 'light'
              ? isUrgent
                ? theme.palette.secondary.backgroundHover
                : alpha(theme.palette.primary.main, 0.02)
              : theme.palette.grey[800],
        },
      }}
      onClick={goToDetail}
      role="link"
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
      aria-label={jobName || 'Job detail'}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{ position: 'relative' }}>
            <MuiImageCustom
              width={100}
              height={100}
              src={companyImageUrl || IMAGES.companyLogoDefault}
              fallbackSrc={IMAGES.companyLogoDefault}
              sx={{
                border: 1,
                borderRadius: 2.5,
                borderColor: theme.palette.grey[200],
                p: 1,
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

          <Stack flex={1} spacing={0.75}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: theme.palette.grey[900],
                    lineHeight: 1.3,
                    mb: 0.5,
                  }}
                >
                  {jobName}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: 14,
                    fontWeight: 600,
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
