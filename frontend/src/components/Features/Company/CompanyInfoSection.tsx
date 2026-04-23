import React from 'react';
import Link from 'next/link';
import { Box, Stack, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faFontAwesome, faMapLocation, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import defaultTheme from '@/themeConfigs/defaultTheme';
import { ROUTES } from '@/configs/constants';
import { formatRoute } from '@/utils/funcUtils';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { tConfig } from '@/utils/tConfig';
import type { Theme } from '@mui/material/styles';
import type { TFunction } from 'i18next';

type CompanyInfoSectionProps = {
  slug: string;
  companyName: string;
  employeeSize: string | number;
  fieldOperation?: string;
  city: string | number;
  followNumber: number;
  jobPostNumber: number;
  language: string;
  allConfig: unknown;
  theme: Theme;
  t: TFunction<'public'>;
};

const CompanyInfoSection = ({
  slug,
  companyName,
  employeeSize,
  fieldOperation,
  city,
  followNumber,
  jobPostNumber,
  language,
  allConfig,
  theme,
  t,
}: CompanyInfoSectionProps) => {
  const companyConfig = allConfig as { cityDict?: Record<string, string>; employeeSizeDict?: Record<string, string> };

  return (
    <Box sx={{ p: 2, pt: 5, width: '100%' }}>
      <Box mb={2}>
        <Typography
          variant="h6"
          component={Link}
          href={localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.COMPANY_DETAIL, slug)}`, language)}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 600,
            transition: 'color 0.2s ease',
            '&:hover': {
              color: (muiTheme) => muiTheme.palette.primary.main,
            },
          }}
        >
          {companyName.substring(0, 55)}
          {companyName.length > 55 && '...'}
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FontAwesomeIcon icon={faFontAwesome} style={{ width: 16, color: '#757575' }} />
          {fieldOperation || (
            <span style={{ color: '#9e9e9e', fontStyle: 'italic', fontSize: 13 }}>
              {t('company.notUpdated', 'Chưa cập nhật')}
            </span>
          )}
        </Typography>

        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FontAwesomeIcon icon={faMapLocation} style={{ width: 16, color: '#757575' }} />
          {tConfig(companyConfig.cityDict?.[city]) || (
            <span style={{ color: '#9e9e9e', fontStyle: 'italic', fontSize: 13 }}>
              {t('company.notUpdated', 'Chưa cập nhật')}
            </span>
          )}
        </Typography>

        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FontAwesomeIcon icon={faUser} style={{ width: 16, color: '#757575' }} />
          {tConfig(companyConfig.employeeSizeDict?.[employeeSize]) || (
            <span style={{ color: '#9e9e9e', fontStyle: 'italic', fontSize: 13 }}>
              {t('company.notUpdated', 'Chưa cập nhật')}
            </span>
          )}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'primary.main',
            fontWeight: 500,
          }}
        >
          <FontAwesomeIcon icon={faBriefcase} style={{ width: 16, color: defaultTheme.palette.primary.main }} />
          {t('company.jobCount', { count: jobPostNumber })}
        </Typography>

        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FontAwesomeIcon icon={faUsers} style={{ width: 16, color: '#757575' }} />
          {t('company.followers', { count: followNumber })}
        </Typography>
      </Stack>
    </Box>
  );
};

export default CompanyInfoSection;
