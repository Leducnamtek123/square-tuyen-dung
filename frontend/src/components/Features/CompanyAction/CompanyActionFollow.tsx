'use client';
import React from 'react';
import Link from 'next/link';
import { Box, Card, Stack, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faFontAwesome, faUsers } from '@fortawesome/free-solid-svg-icons';
import MuiImageCustom from '@/components/Common/MuiImageCustom';
import { ROUTES } from '@/configs/constants';
import { formatRoute } from '@/utils/funcUtils';
import type { Company } from '@/types/models';
import { useTranslation } from 'react-i18next';

interface CompanyActionFollowProps {
  company: Partial<Company> | null;
  children?: React.ReactNode;
}

const CompanyActionFollow = ({ company, children }: CompanyActionFollowProps) => {
  const { t } = useTranslation('common');
  const followRef = React.useRef<HTMLDivElement>(null);
  const [stackDirection, setStackDirection] = React.useState<'row' | 'column'>('column');
  const theme = useTheme();
  const companyHref = company?.slug
    ? `/${formatRoute(ROUTES.JOB_SEEKER.COMPANY_DETAIL, company.slug)}`
    : '#';

  React.useEffect(() => {
    const el = followRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setStackDirection(entry.contentRect.width < 800 ? 'column' : 'row');
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={followRef}>
      <Card
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            borderColor: theme.palette.primary.light,
          }
        }}
      >
        <Stack direction={stackDirection} spacing={2}>
          <Box flex={3}>
            <Stack direction="row" spacing={2}>
              <Stack direction="row" justifyContent="center">
                <MuiImageCustom
                  width={85}
                  height={85}
                  src={company?.companyImageUrl}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    p: 0.5,
                    backgroundColor: 'white',
                  }}
                />
              </Stack>
              <Stack flex={1} justifyContent="center" spacing={1.5}>
                <Box>
                  <Tooltip followCursor title={company?.companyName}>
                    <Typography
                      component={Link}
                      href={companyHref}
                      prefetch={Boolean(company?.slug)}
                      variant="h6"
                      sx={{
                        fontSize: 16,
                        cursor: 'pointer',
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        transition: 'color 0.2s ease',
                        '&:hover': { color: theme.palette.primary.dark }
                      }}
                    >
                      {company?.companyName}
                    </Typography>
                  </Tooltip>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.text.secondary }}
                >
                  <FontAwesomeIcon icon={faFontAwesome} style={{ fontSize: 14 }} color={theme.palette.grey[400]} />
                  {company?.fieldOperation || (
                    <span style={{ color: theme.palette.grey[400], fontStyle: 'italic', fontSize: 13 }}>
                      {t('common:labels.notUpdated')}
                    </span>
                  )}
                </Typography>
                <Stack
                  direction="row"
                  spacing={3}
                  sx={{
                    '& .MuiTypography-root': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: theme.palette.text.secondary
                    }
                  }}
                >
                  <Typography variant="body2">
                    <FontAwesomeIcon icon={faUsers} style={{ fontSize: 14 }} color={theme.palette.grey[400]} />
                    {company?.followNumber} {t('companyDetail.followed')}
                  </Typography>
                  <Typography variant="body2">
                    <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: 14 }} color={theme.palette.grey[400]} />
                    {company?.jobPostNumber} {t('nav.jobs')}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" flex={1} spacing={2}>
            {children}
          </Stack>
        </Stack>
      </Card>
    </div>
  );
};

export default CompanyActionFollow;
