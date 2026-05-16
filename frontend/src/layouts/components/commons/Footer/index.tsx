'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from '@mui/material/Link';
import { useTranslation } from 'react-i18next';
import { localizeRoutePath } from '../../../../configs/routeLocalization';
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import { LINKS, ROUTES, APP_NAME, IMAGES } from '../../../../configs/constants';
import { FacebookIcon, WebsiteIcon } from '../../../../components/Common/SocialIcons';
import MuiImageCustom from '../../../../components/Common/MuiImageCustom';
import { useAppSelector } from '../../../../redux/hooks';
import { canAccessJobSeekerPortal } from '../../../../utils/accessControl';

const subscribeToStaticYear = () => () => {};
const getCurrentYearSnapshot = () => new Date().getFullYear();

const Footer = () => {
  const { t, i18n } = useTranslation('common');
  const { push } = useRouter();
  const { currentUser, isAuthenticated } = useAppSelector((state) => state.user);
  const lang = i18n.language;

  const brandNavy = '#1a407d';
  const brandSky = '#2aa9e1';
  const brandLight = '#e1effe';
  const currentYear = React.useSyncExternalStore(
    subscribeToStaticYear,
    getCurrentYearSnapshot,
    getCurrentYearSnapshot
  );

  const navButtonSx = {
    justifyContent: 'flex-start',
    px: 0,
    py: 0.5,
    minWidth: 0,
    color: brandNavy,
    textTransform: 'none',
    fontWeight: 500,
    '&:hover': {
      color: brandSky,
      backgroundColor: 'transparent',
    },
  } as const;

  const candidateLinks = [
    { label: t('nav.jobs'), route: localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, lang) },
    { label: t('nav.companies'), route: localizeRoutePath(`/${ROUTES.JOB_SEEKER.COMPANY}`, lang) },
    ...(isAuthenticated && canAccessJobSeekerPortal(currentUser)
      ? [{ label: t('footer.candidateDashboard'), route: localizeRoutePath(`/${ROUTES.JOB_SEEKER.DASHBOARD}`, lang) }]
      : []),
  ];

  return (
    <Box
      sx={{
        backgroundColor: '#f0f7ff',
        borderTop: `3px solid ${brandSky}`,
        pt: 6,
        pb: 0,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack spacing={1.25}>
              <MuiImageCustom
                width={150}
                src={IMAGES.getTextLogo('dark')}
                sx={{ display: 'block', cursor: 'pointer' }}
                onClick={() => push('/')}
              />
              {[
                { label: t('footer.aboutApp', { appName: APP_NAME }), route: localizeRoutePath(`/${ROUTES.JOB_SEEKER.ABOUT_US}`, lang) },
                { label: t('nav.jobs'), route: localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, lang) },
                { label: t('nav.companies'), route: localizeRoutePath(`/${ROUTES.JOB_SEEKER.COMPANY}`, lang) },
              ].map((item) => (
                <Button
                  key={item.label}
                  onClick={() => push(item.route)}
                  variant="text"
                  sx={navButtonSx}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack spacing={1.25}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brandNavy }}>
                {t('footer.forEmployers')}
              </Typography>
              {[
                { label: t('footer.postJob'), route: `/${ROUTES.EMPLOYER.JOB_POST}` },
                { label: t('footer.searchResumes'), route: `/${ROUTES.EMPLOYER.PROFILE}` },
                { label: t('footer.employerDashboard'), route: `/${ROUTES.EMPLOYER.DASHBOARD}` },
              ].map((item) => (
                <Button
                  key={item.label}
                  onClick={() => push(item.route)}
                  variant="text"
                  sx={navButtonSx}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack spacing={1.25}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brandNavy }}>
                {t('footer.forCandidates')}
              </Typography>
              {candidateLinks.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => push(item.route)}
                  variant="text"
                  sx={navButtonSx}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack spacing={1.25}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: brandNavy }}>
                {t('footer.connectWith', { appName: APP_NAME })}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                {[
                  { Icon: WebsiteIcon, link: LINKS.WEBSITE_LINK },
                  { Icon: FacebookIcon, link: LINKS.FACEBOOK_LINK },
                ].map((social) => (
                  <Link
                    key={social.link}
                    href={social.link}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      border: `2px solid ${brandSky}`,
                      color: brandNavy,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: brandSky,
                        color: 'white',
                        transform: 'scale(1.08)',
                      },
                    }}
                  >
                    <social.Icon size={22} />
                  </Link>
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 4, borderColor: brandLight }} />

        <Box
          sx={{
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: brandNavy, opacity: 0.7 }} align="center">
            {t('footer.rightsReserved', { year: currentYear, appName: APP_NAME })}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
