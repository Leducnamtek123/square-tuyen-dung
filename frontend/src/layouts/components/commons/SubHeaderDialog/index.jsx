/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import * as React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { Alert, Box, Chip, Dialog, Divider, IconButton, Stack, Typography, Container } from "@mui/material";
import Grid from "@mui/material/Grid2";
import CloseIcon from '@mui/icons-material/Close';
import { useSelector } from 'react-redux';

const DesktopContent = (setOpen, careers, handleFilter, t) => {
  const theme = useTheme();

  return (
    <Box>
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => setOpen(false)}
          aria-label="close"
          sx={{ mr: 0.5 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="div">
          {t('nav.careers.allCareersList')}
        </Typography>
      </Stack>
      <Box>
        <Grid container spacing={2}>
          <Grid
            size={{
              sm: 5,
              md: 3
            }}>
            <Alert
              icon={false}
              variant="outlined"
              severity="info"
              sx={{
                color:  theme.palette.mode === 'light' ? 'black' : 'white',
                bgcolor: theme.palette.mode === 'light' ? 'rgba(247,251,255,1)' : 'rgba(0,0,0,0.2)',
              }}
            >
              <Stack>
                <Typography variant="h6">{t('nav.careers.topCareers')}</Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  {careers
                    .filter((value) => value.isHot === true)
                    .map((career) => (
                      <Grid key={career.id} size={12}>
                        <Typography
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              color: '#fca34d',
                              fontWeight: 'bold',
                            },
                          }}
                          onClick={() => handleFilter(career.id)}
                        >
                          {career?.name}
                        </Typography>
                      </Grid>
                    ))}
                </Grid>
              </Stack>
            </Alert>
          </Grid>
          <Grid
            size={{
              sm: 7,
              md: 9
            }}>
            <Stack sx={{ p: 2 }}>
              <Typography variant="h6">{t('nav.careers.otherCareers')}</Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {careers
                  .filter((value) => value.isHot !== true)
                  .map((career) => (
                    <Grid
                      key={career.id}
                      size={{
                        xs: 4,
                        sm: 6,
                        md: 6,
                        lg: 4,
                        xl: 4
                      }}>
                      <Typography
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            color: '#fca34d',
                            fontWeight: 'bold',
                          },
                        }}
                        onClick={() => handleFilter(career.id)}
                      >
                        {career?.name}
                      </Typography>
                    </Grid>
                  ))}
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

const MobileContent = (setOpen, careers, handleFilter, t) => {
  return (
    <Box>
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => setOpen(false)}
          aria-label="close"
          sx={{ mr: 0.5 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="div">
          {t('nav.careers.allCareersList')}
        </Typography>
      </Stack>
      <Box>
        <Grid container spacing={2}>
          {careers.map((career) => (
            <Grid
              key={career.id}
              size={{
                xs: 12,
                sm: 6,
                md: 6
              }}>
              <Typography
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#fca34d',
                    fontWeight: 'bold',
                  },
                }}
                onClick={() => handleFilter(career.id)}
              >
                {career?.name}{' '}
                {career.isHot && (
                  <Chip label={t('common.hot', { ns: 'admin' })} size="small" color="error" />
                )}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

const SubHeaderDialog = ({ open, setOpen, topCareers, handleFilter }) => {
  const { t } = useTranslation('common');
  const { allConfig } = useSelector((state) => state.config);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const customCareers = React.useCallback((allCareers, topCareers) => {
    var topCarrersId = topCareers.map((value) => value.id);
    var careerResult = [];

    for (let i = 0; i < allCareers.length; i++) {
      if (topCarrersId.includes(allCareers[i].id)) {
        careerResult.push({ ...allCareers[i], isHot: true });
      } else {
        careerResult.push({ ...allCareers[i], isHot: false });
      }
    }

    return careerResult;
  }, []);

  const careers = React.useMemo(
    () => customCareers(allConfig?.careerOptions || [], topCareers),
    [allConfig?.careerOptions, topCareers, customCareers]
  );

  return (
    <Dialog
      hideBackdrop={true}
      fullScreen
      open={open}
      onClose={() => setOpen(false)}
      slotProps={{
        paper: {
          sx: {
            top: window.document.getElementById('common-header')?.clientHeight,
            position: 'absolute',
          },
        }
      }}
    >
      <Container maxWidth="xl" sx={{ mt: 1 }}>
        {fullScreen
          ? MobileContent(setOpen, careers, handleFilter, t)
          : DesktopContent(setOpen, careers, handleFilter, t)}
      </Container>
    </Dialog>
  );
};

export default SubHeaderDialog;
