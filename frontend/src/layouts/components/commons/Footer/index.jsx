import React from 'react';

import { useNavigate } from 'react-router-dom';

import Link from '@mui/material/Link';

import { useTranslation } from 'react-i18next';

import { Box, List, ListItem, ListItemText, Stack, Typography, Container, Divider, useTheme } from "@mui/material";

import Grid from "@mui/material/Grid2";

import { ICONS, LINKS, ROUTES, APP_NAME, IMAGES } from '../../../../configs/constants';

import MuiImageCustom from '../../../../components/MuiImageCustom';

const Footer = () => {

  const { t } = useTranslation('common');

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

                  sx={{ display: 'block', cursor: 'pointer' }}

                  onClick={() => window.location.href = '/'}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/${ROUTES.JOB_SEEKER.ABOUT_US}`}

                  primary={t('footer.aboutApp', { appName: APP_NAME })}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/${ROUTES.JOB_SEEKER.CONTACT}`}

                  primary={t('footer.contact')}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/${ROUTES.JOB_SEEKER.FAQ}`}

                  primary={t('footer.faq')}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/${ROUTES.JOB_SEEKER.TERMS_OF_SERVICE}`}

                  primary={t('footer.tos')}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/${ROUTES.JOB_SEEKER.PRIVACY_POLICY}`}

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

                  onClick={() => window.location.href = `/employee/${ROUTES.EMPLOYER.JOB_POST}`}

                  primary={t('footer.postJob')}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/employee/${ROUTES.EMPLOYER.PROFILE}`}

                  primary={t('footer.searchResumes')}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/employee/${ROUTES.EMPLOYER.DASHBOARD}`}

                  primary={t('footer.employerDashboard')}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/employee/${ROUTES.EMPLOYER.CHAT}`}

                  primary={t('footer.messages')}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/employee/${ROUTES.EMPLOYER.NOTIFICATION}`}

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

                  onClick={() => window.location.href = `/${ROUTES.JOB_SEEKER.JOBS}`}

                  primary={t('nav.jobs')}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/${ROUTES.JOB_SEEKER.COMPANY}`}

                  primary={t('nav.companies')}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/${ROUTES.JOB_SEEKER.DASHBOARD}`}

                  primary={t('footer.candidateDashboard')}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/${ROUTES.JOB_SEEKER.CHAT}`}

                  primary={t('footer.messages')}

                />

              </ListItem>

              <ListItem>

                <ListItemText

                  sx={{ cursor: 'pointer' }}

                  onClick={() => window.location.href = `/${ROUTES.JOB_SEEKER.DASHBOARD}/${ROUTES.JOB_SEEKER.NOTIFICATION}`}

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

                    { icon: ICONS.WEBSITE, link: LINKS.WEBSITE_LINK },

                    { icon: ICONS.FACEBOOK, link: LINKS.FACEBOOK_LINK },

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
