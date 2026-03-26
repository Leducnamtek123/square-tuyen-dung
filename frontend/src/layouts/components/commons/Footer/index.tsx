import React from 'react';

import { useRouter } from 'next/navigation';

import Link from '@mui/material/Link';

import { useTranslation } from 'react-i18next';

import {
  Box,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  Container,
  Divider,
  useTheme,
} from '@mui/material';

import Grid from '@mui/material/Grid2';

import { ICONS, LINKS, ROUTES, APP_NAME, IMAGES } from '../../../../configs/constants';

import MuiImageCustom from '../../../../components/Common/MuiImageCustom';
import { buildPortalPath, getPreferredLanguage } from '../../../../configs/portalRouting';

const Footer = () => {

  const { t } = useTranslation('common');
  const nav = useRouter();
  const language = getPreferredLanguage();
  const employerPrefix = buildPortalPath('employer', '', language);

  const theme = useTheme();

  // Brand colors from Square logo
  const brandNavy   = '#1a407d';
  const brandSky    = '#2aa9e1';
  const brandLight  = '#e1effe';

  const linkSx = {
    cursor: 'pointer',
    color: brandNavy,
    transition: 'color 0.18s',
    '&:hover': { color: brandSky },
  };

  const sectionHeaderSx = {
    fontWeight: 700,
    mb: 1,
    color: brandNavy,
    letterSpacing: '0.01em',
  };

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

          {/* Col 1 — Brand */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >

            <List disablePadding>

              <ListItem sx={{ pb: 2, pl: 0 }}>

                <MuiImageCustom
                  width={150}
                  src={IMAGES.getTextLogo(theme.palette.mode === 'light' ? 'dark' : 'light')}
                  sx={{ display: 'block', cursor: 'pointer' }}
                  onClick={() => nav.push('/')}
                />

              </ListItem>

              {[
                { label: t('footer.aboutApp', { appName: APP_NAME }), route: `/${ROUTES.JOB_SEEKER.ABOUT_US}` },
                { label: t('nav.jobs'),  route: `/${ROUTES.JOB_SEEKER.JOBS}` },
                { label: t('nav.companies'), route: `/${ROUTES.JOB_SEEKER.COMPANY}` },
              ].map((item) => (
                <ListItem key={item.label} sx={{ pl: 0, py: 0.5 }}>
                  <ListItemText
                    sx={linkSx}
                    onClick={() => nav.push(item.route)}
                    primary={item.label}
                    slotProps={{ primary: { variant: 'body2' } }}
                  />
                </ListItem>
              ))}

            </List>

          </Grid>

          {/* Col 2 — Employers */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >

            <List disablePadding>

              <ListItem sx={{ pl: 0 }}>
                <Typography variant="subtitle2" sx={sectionHeaderSx}>
                  {t('footer.forEmployers')}
                </Typography>
              </ListItem>

              {[
                { label: t('footer.postJob'),          route: `${employerPrefix}/${ROUTES.EMPLOYER.JOB_POST}` },
                { label: t('footer.searchResumes'),    route: `${employerPrefix}/${ROUTES.EMPLOYER.PROFILE}` },
                { label: t('footer.employerDashboard'),route: `${employerPrefix}/` },
              ].map((item) => (
                <ListItem key={item.label} sx={{ pl: 0, py: 0.5 }}>
                  <ListItemText
                    sx={linkSx}
                    onClick={() => nav.push(item.route)}
                    primary={item.label}
                    slotProps={{ primary: { variant: 'body2' } }}
                  />
                </ListItem>
              ))}

            </List>

          </Grid>

          {/* Col 3 — Candidates */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >

            <List disablePadding>

              <ListItem sx={{ pl: 0 }}>
                <Typography variant="subtitle2" sx={sectionHeaderSx}>
                  {t('footer.forCandidates')}
                </Typography>
              </ListItem>

              {[
                { label: t('nav.jobs'),                   route: `/${ROUTES.JOB_SEEKER.JOBS}` },
                { label: t('nav.companies'),              route: `/${ROUTES.JOB_SEEKER.COMPANY}` },
                { label: t('footer.candidateDashboard'),  route: `/${ROUTES.JOB_SEEKER.DASHBOARD}` },
              ].map((item) => (
                <ListItem key={item.label} sx={{ pl: 0, py: 0.5 }}>
                  <ListItemText
                    sx={linkSx}
                    onClick={() => nav.push(item.route)}
                    primary={item.label}
                    slotProps={{ primary: { variant: 'body2' } }}
                  />
                </ListItem>
              ))}

            </List>

          </Grid>

          {/* Col 4 — Social */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >

            <List disablePadding>

              <ListItem sx={{ pl: 0 }}>
                <Typography variant="subtitle2" sx={sectionHeaderSx}>
                  {t('footer.connectWith', { appName: APP_NAME })}
                </Typography>
              </ListItem>

              <ListItem sx={{ pl: 0 }}>

                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>

                  {[
                    { icon: ICONS.WEBSITE,  link: LINKS.WEBSITE_LINK },
                    { icon: ICONS.FACEBOOK, link: LINKS.FACEBOOK_LINK },
                  ].map((social, index) => (

                    <Link
                      key={index}
                      href={social.link}
                      target="_blank"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: `2px solid ${brandSky}`,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: brandSky,
                          transform: 'scale(1.1)',
                          '& img': { filter: 'brightness(10)' },
                        },
                      }}
                    >

                      <img height={22} width={22} src={social.icon} alt="" />

                    </Link>

                  ))}

                </Stack>

              </ListItem>

            </List>

          </Grid>

        </Grid>

        <Divider sx={{ mt: 4, borderColor: brandLight }} />

        {/* Bottom bar */}
        <Box
          sx={{
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: brandNavy, opacity: 0.7 }}
            align="center"
          >
            {t('footer.rightsReserved', { year: new Date().getFullYear(), appName: APP_NAME })}
          </Typography>
        </Box>

      </Container>

    </Box>

  );

};

export default Footer;
