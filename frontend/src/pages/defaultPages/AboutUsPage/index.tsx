// @ts-nocheck
import React from "react";

import { Box, Card, Stack, Typography } from "@mui/material";

import Grid from "@mui/material/Grid2";

import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

import { useTranslation } from "react-i18next";
import { TabTitle } from "../../../utils/generalFunction";

import MuiImageCustom from "../../../components/MuiImageCustom";
import { ABOUT_IMAGES, APP_NAME } from "../../../configs/constants";

interface Props {
  [key: string]: any;
}



const AboutUsPage = () => {
  const { t } = useTranslation('about');

  TabTitle(t('tabTitle', { appName: APP_NAME }));

  const features = [
    {
      title: t('features.careerTitle'),
      icon: WorkOutlineIcon,
      description: t('features.careerDesc'),
      color: "primary.main"
    },
    {
      title: t('features.cvTitle'),
      icon: PersonOutlineIcon,
      description: t('features.cvDesc'),
      color: "primary.main"
    },
    {
      title: t('features.locationTitle'),
      icon: LocationOnOutlinedIcon,
      description: t('features.locationDesc'),
      color: "primary.main"
    },
    {
      title: t('features.notificationTitle'),
      icon: NotificationsNoneIcon,
      description: t('features.notificationDesc'),
      color: "primary.main"
    },
  ];

  return (

    <Box sx={{ maxWidth: "1200px", margin: "0 auto", py: 5, px: 3 }}>

      <Box sx={{ mb: 6, textAlign: "center" }}>

        <Typography

          variant="h3"

          sx={{

            mb: 2,

            background: (theme) => theme.palette.primary.gradient,

            WebkitBackgroundClip: "text",

            WebkitTextFillColor: "transparent",

            fontWeight: 700,

          }}

        >

          {t('heading')}
        </Typography>

        <Typography

          sx={{

            maxWidth: "800px",

            margin: "0 auto",

            color: "text.secondary",

            lineHeight: 1.8,

          }}

        >

          {t('description', { appName: APP_NAME })}
        </Typography>

      </Box>

      <Box sx={{ mb: 8 }}>

        <Grid container spacing={4}>

          {features.map((feature, index) => (

            <Grid

              key={index}

              size={{

                xs: 12,

                sm: 6,

                md: 3
              }}>

              <Card

                sx={{

                  height: "100%",

                  p: 3,

                  position: 'relative',

                  overflow: 'visible',

                  transition: "all 0.3s ease-in-out",

                  backgroundColor: 'background.paper',

                  border: '1px solid',

                  borderColor: 'grey.100',

                  "&:hover": {

                    transform: "translateY(-8px)",

                    boxShadow: (theme) => theme.customShadows.card,

                    borderColor: 'primary.light',

                    backgroundColor: (theme) => `${theme.palette.primary.background}`,

                    "& .feature-icon": {

                      color: 'primary.light',

                      transform: "scale(1.1)",

                    }

                  },

                }}

              >

                <Box

                  sx={{

                    position: 'absolute',

                    top: -20,

                    left: 20,

                    backgroundColor: 'background.paper',

                    borderRadius: '12px',

                    p: 1.5,

                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',

                  }}

                >

                  <feature.icon

                    className="feature-icon"

                    sx={{

                      fontSize: 32,

                      transition: "all 0.3s ease-in-out",

                      color: 'grey.500'

                    }}

                  />

                </Box>

                <Box sx={{ mt: 2 }}>

                  <Typography

                    variant="h6"

                    sx={{

                      mb: 2,

                      color: 'grey.700',

                      fontWeight: 600,

                    }}

                  >

                    {feature.title}

                  </Typography>

                  <Typography

                    sx={{

                      lineHeight: 1.7,

                      fontSize: '0.95rem',

                      color: 'grey.600',

                    }}

                  >

                    {feature.description}

                  </Typography>

                </Box>

              </Card>

            </Grid>

          ))}

        </Grid>

      </Box>

      <Typography

        variant="h4"

        sx={{

          mb: 4,

          textAlign: "center",

          background: (theme) => theme.palette.primary.gradient,

          WebkitBackgroundClip: "text",

          WebkitTextFillColor: "transparent",

          fontWeight: 700,

        }}

      >

        {t('mobileAppHeading', { appName: APP_NAME })}
      </Typography>

      <Box sx={{ mt: 5 }}>

        <Card sx={{ p: 5 }}>

          <Stack

            direction={{

              xs: "column",

              sm: "column",

              md: "row",

              lg: "row",

              xl: "row",

            }}

            spacing={2}

          >

            <Box width="100%">

              <Box sx={{ height: 600 }}>

                <MuiImageCustom src={ABOUT_IMAGES.JOB_POST} />

              </Box>

            </Box>

            <Box>

              <Stack spacing={2}>

                <Typography

                  variant="h4"

                  style={{ color: "warning.main", fontSize: 30 }}

                >

                  {t('features.careerTitle')}
                </Typography>

                <Typography textAlign="justify" color="text.secondary">
                  {t('features.careerDesc')}
                </Typography>

              </Stack>

            </Box>

          </Stack>

        </Card>

      </Box>

      <Box sx={{ mt: 5 }}>

        <Card sx={{ p: 5 }}>

          <Stack

            direction={{

              xs: "column-reverse",

              sm: "column-reverse",

              md: "row",

              lg: "row",

              xl: "row",

            }}

            spacing={2}

          >

            <Box>

              <Stack spacing={2}>

                <Typography

                  variant="h4"

                  style={{ color: "warning.main", fontSize: 30 }}

                >

                  {t('cvProfileDetail.title')}
                </Typography>

                <Typography textAlign="justify" color="text.secondary">
                  {t('cvProfileDetail.desc1')}
                </Typography>

                <Typography textAlign="justify" color="text.secondary">
                  {t('cvProfileDetail.desc2')}
                </Typography>

                <Typography textAlign="justify" color="text.secondary">
                  {t('cvProfileDetail.desc3')}
                </Typography>

              </Stack>

            </Box>

            <Box width="100%">

              <Box sx={{ height: 600 }}>

                <MuiImageCustom src={ABOUT_IMAGES.PROFILE} />

              </Box>

            </Box>

          </Stack>

        </Card>

      </Box>

      <Box sx={{ mt: 5 }}>

        <Card sx={{ p: 5 }}>

          <Stack

            direction={{

              xs: "column",

              sm: "column",

              md: "row",

              lg: "row",

              xl: "row",

            }}

            spacing={2}

          >

            <Box width="100%">

              <Box sx={{ height: 600 }}>

                <MuiImageCustom src={ABOUT_IMAGES.AROUND_JOB_POST} />

              </Box>

            </Box>

            <Box>

              <Stack spacing={2}>

                <Typography

                  variant="h4"

                  style={{ color: "warning.main", fontSize: 30 }}

                >

                  {t('aroundJobDetail.title')}
                </Typography>

                <Typography textAlign="justify" color="text.secondary">
                  {t('aroundJobDetail.desc1')}
                </Typography>

                <Typography textAlign="justify" color="text.secondary">
                  {t('aroundJobDetail.desc2')}
                </Typography>

                <Typography textAlign="justify" color="text.secondary">
                  {t('aroundJobDetail.desc3')}
                </Typography>

              </Stack>

            </Box>

          </Stack>

        </Card>

      </Box>

      <Box sx={{ mt: 5 }}>

        <Card sx={{ p: 5 }}>

          <Stack

            direction={{

              xs: "column-reverse",

              sm: "column-reverse",

              md: "row",

              lg: "row",

              xl: "row",

            }}

            spacing={2}

          >

            <Box>

              <Stack spacing={2}>

                <Typography

                  variant="h4"

                  style={{ color: "warning.main", fontSize: 30 }}

                >

                  {t('notificationDetail.title')}
                </Typography>

                <Typography textAlign="justify" color="text.secondary">
                  {t('notificationDetail.desc1')}
                </Typography>

                <Typography textAlign="justify" color="text.secondary">
                  {t('notificationDetail.desc2')}
                </Typography>

                <Typography textAlign="justify" color="text.secondary">
                  {t('notificationDetail.desc3')}
                </Typography>

              </Stack>

            </Box>

            <Box width="100%">

              <Box sx={{ height: 600 }}>

                <MuiImageCustom src={ABOUT_IMAGES.JOB_POST_NOTIFICATION} />

              </Box>

            </Box>

          </Stack>

        </Card>

      </Box>


    </Box>

  );

};

export default AboutUsPage;
