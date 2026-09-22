import React from 'react';
import Link from 'next/link';
import { Box, Stack, Typography, Tooltip } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
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

  const fieldTags = React.useMemo(() => {
    if (!fieldOperation || !fieldOperation.trim()) return [];
    return fieldOperation
      .split(/[,;\n/]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }, [fieldOperation]);

  const primaryTag = fieldTags[0];
  const remainingTags = fieldTags.slice(1);

  return (
    <Box
      sx={{
        px: 2.5,
        pt: 4,
        pb: 1.5,
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Company Name */}
      <Box mb={0.75}>
        <Typography
          variant="h6"
          component={Link}
          href={localizeRoutePath(`/${formatRoute(ROUTES.JOB_SEEKER.COMPANY_DETAIL, slug)}`, language)}
          title={companyName}
          sx={{
            textDecoration: 'none',
            color: '#0f172a',
            fontWeight: 700,
            fontSize: '1.05rem',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'color 0.2s ease',
            '&:hover': {
              color: theme.palette.primary.main,
            },
          }}
        >
          {companyName}
        </Typography>
      </Box>

      {/* Field of Operation / Industry Badges */}
      <Box sx={{ minHeight: 28, display: 'flex', alignItems: 'center', mb: 1.5, width: '100%' }}>
        {fieldTags.length === 0 ? (
          <Typography
            variant="caption"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              color: '#94a3b8',
              fontStyle: 'italic',
              fontSize: '0.78rem',
            }}
          >
            <BusinessOutlinedIcon sx={{ fontSize: 14, color: '#cbd5e1', flexShrink: 0 }} />
            {t('company.notUpdated')}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, maxWidth: '100%', minWidth: 0 }}>
            <Tooltip title={fieldOperation} arrow placement="top">
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  color: '#334155',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  px: 1.1,
                  py: 0.35,
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  maxWidth: remainingTags.length > 0 ? 'calc(100% - 46px)' : '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'default',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#f1f5f9',
                    borderColor: '#cbd5e1',
                  },
                }}
              >
                <BusinessOutlinedIcon sx={{ fontSize: 13, color: '#64748b', flexShrink: 0 }} />
                <Box
                  component="span"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {primaryTag}
                </Box>
              </Box>
            </Tooltip>

            {remainingTags.length > 0 && (
              <Tooltip title={remainingTags.join(' • ')} arrow placement="top">
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #dbeafe',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    px: 0.8,
                    py: 0.3,
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#dbeafe',
                      borderColor: '#bfdbfe',
                    },
                  }}
                >
                  +{remainingTags.length}
                </Box>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      {/* Location & Company Size Row */}
      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'nowrap', gap: 1.5, minHeight: 22, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0, flexShrink: 1 }}>
          <LocationOnOutlinedIcon sx={{ fontSize: 15, color: '#64748b', flexShrink: 0 }} />
          <Typography
            variant="body2"
            sx={{
              color: '#475569',
              fontSize: '0.82rem',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={tConfig(companyConfig.cityDict?.[city]) || ''}
          >
            {tConfig(companyConfig.cityDict?.[city]) || (
              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                {t('company.notUpdated')}
              </span>
            )}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexShrink: 0 }}>
          <PeopleOutlineIcon sx={{ fontSize: 15, color: '#64748b', flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {tConfig(companyConfig.employeeSizeDict?.[employeeSize]) || (
              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                0
              </span>
            )}
          </Typography>
        </Box>
      </Stack>

      {/* Highlights Bar: Job Openings Badge & Followers Count */}
      <Box
        sx={{
          mt: 'auto',
          pt: 1.5,
          borderTop: '1px dashed #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            bgcolor: jobPostNumber > 0 ? '#eff6ff' : '#f8fafc',
            color: jobPostNumber > 0 ? '#1d4ed8' : '#64748b',
            border: jobPostNumber > 0 ? '1px solid #dbeafe' : '1px solid #e2e8f0',
            borderRadius: '999px',
            px: 1.25,
            py: 0.4,
            fontSize: '0.78rem',
            fontWeight: 600,
          }}
        >
          <WorkOutlineIcon sx={{ fontSize: 14, color: jobPostNumber > 0 ? '#2563eb' : '#94a3b8' }} />
          <span>
            {jobPostNumber || 0} {t('company.openingJobs')}
          </span>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: '#64748b',
            fontSize: '0.78rem',
            fontWeight: 500,
          }}
        >
          <PeopleAltOutlinedIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
          {followNumber || 0} {t('company.followers')}
        </Typography>
      </Box>
    </Box>
  );
};

export default CompanyInfoSection;
