/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import { useTranslation } from 'react-i18next';
import { Box, List, ListItem, ListItemText, Stack, Typography, Container, Divider, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { ICONS, IMAGES, LINKS, ROUTES, APP_NAME } from '../../../../configs/constants';
import MuiImageCustom from '../../../../components/MuiImageCustom';

const Footer = () => {
  const { t } = useTranslation('common');
  const nav = useNavigate();
  const theme = useTheme();

  return (
    <Box>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <List disablePadding>
              <ListItem sx={{ pb: 2 }}>
                <MuiImageCustom
                  width={150}
                  src={IMAGES.getTextLogo(theme.palette.mode === 'light' ? 'dark' : 'light')}
                  sx={{ display: 'block' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav(`/${ROUTES.JOB_SEEKER.ABOUT_US}`)}
                  primary={t('footer.aboutApp', { appName: APP_NAME })}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav('/contact')}
                  primary={t('footer.contact')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav('/faq')}
                  primary={t('footer.faq')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav('/terms-of-service')}
                  primary={t('footer.tos')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav('/privacy-policy')}
                  primary={t('footer.privacy')}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <List disablePadding>
              <ListItem>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {t('footer.forEmployers')}
                </Typography>
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav(`/${ROUTES.EMPLOYER.JOB_POST}`)}
                  primary={t('footer.postJob')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav(`/${ROUTES.EMPLOYER.PROFILE}`)}
                  primary={t('footer.searchResumes')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav(`/${ROUTES.EMPLOYER.DASHBOARD}`)}
                  primary={t('footer.employerDashboard')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav(`/${ROUTES.EMPLOYER.CHAT}`)}
                  primary={t('footer.messages')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav(`/${ROUTES.EMPLOYER.NOTIFICATION}`)}
                  primary={t('footer.notifications')}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <List disablePadding>
              <ListItem>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {t('footer.forCandidates')}
                </Typography>
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav(`/${ROUTES.JOB_SEEKER.JOBS}`)}
                  primary={t('nav.jobs')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav(`/${ROUTES.JOB_SEEKER.COMPANY}`)}
                  primary={t('nav.companies')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav(`/${ROUTES.JOB_SEEKER.DASHBOARD}`)}
                  primary={t('footer.candidateDashboard')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav(`/${ROUTES.JOB_SEEKER.DASHBOARD}/${ROUTES.JOB_SEEKER.CHAT}`)}
                  primary={t('footer.messages')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  sx={{ cursor: 'pointer' }}
                  onClick={() => nav(`/${ROUTES.JOB_SEEKER.DASHBOARD}/${ROUTES.JOB_SEEKER.NOTIFICATION}`)}
                  primary={t('footer.notifications')}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <List disablePadding>
              <ListItem>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {t('footer.mobileApps')}
                </Typography>
              </ListItem>
              <ListItem>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Link href={LINKS.CHPLAY_LINK} target="_blank">
                    <MuiImageCustom
                      width={140}
                      src={IMAGES.chPlayDownload}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    />
                  </Link>
                  <Link href={LINKS.APPSTORE_LINK} target="_blank">
                    <MuiImageCustom
                      width={140}
                      src={IMAGES.appStoreDownload}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    />
                  </Link>
                </Stack>
              </ListItem>
              <ListItem sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {t('footer.connectWith', { appName: APP_NAME })}
                </Typography>
              </ListItem>
              <ListItem>
                <Stack direction="row" spacing={0} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {[
                    { icon: ICONS.FACEBOOK, link: LINKS.FACEBOOK_LINK },
                    { icon: ICONS.FACEBOOK_MESSENGER, link: LINKS.FACEBOOK_MESSENGER_LINK },
                    { icon: ICONS.INSTAGRAM, link: LINKS.INSTAGRAM_LINK },
                    { icon: ICONS.LINKEDIN, link: LINKS.LINKEDIN_LINK },
                    { icon: ICONS.YOUTUBE, link: LINKS.YOUTUBE_LINK },
                    { icon: ICONS.TWITTER, link: LINKS.TWITTER_LINK },
                  ].map((social, index) => (
                    <Link
                      key={index}
                      href={social.link}
                      target="_blank"
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.1)' }
                      }}
                    >
                      <img height="35" width="35" src={social.icon} alt="" />
                    </Link>
                  ))}
                </Stack>
              </ListItem>
            </List>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4 }} />
        <Typography
          variant="body2"
          color="grey.400"
          align="center"
          sx={{ pt: 2 }}
        >
          {t('footer.rightsReserved', { year: new Date().getFullYear(), appName: APP_NAME })}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
