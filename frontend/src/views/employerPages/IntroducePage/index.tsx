import React from "react";
import { Box, Card, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid2";

import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import { TabTitle } from "../../../utils/generalFunction";
import { APP_NAME } from "../../../configs/constants";

const IntroducePage = () => {
  const { t } = useTranslation("employer");
  TabTitle(`${t('introduce.pageTitle')} - ${t('common.appName', { defaultValue: APP_NAME })}`);

  const highlights = [
    {
      title: t('introduce.highlights.h1.title'),
      description: t('introduce.highlights.h1.desc'),
      icon: CampaignOutlinedIcon,
    },
    {
      title: t('introduce.highlights.h2.title'),
      description: t('introduce.highlights.h2.desc'),
      icon: PeopleAltOutlinedIcon,
    },
    {
      title: t('introduce.highlights.h3.title'),
      description: t('introduce.highlights.h3.desc'),
      icon: TrackChangesOutlinedIcon,
    },
    {
      title: t('introduce.highlights.h4.title'),
      description: t('introduce.highlights.h4.desc'),
      icon: VerifiedOutlinedIcon,
    },
  ];

  const steps = [
    {
      title: t('introduce.steps.s1.title'),
      description: t('introduce.steps.s1.desc'),
    },
    {
      title: t('introduce.steps.s2.title'),
      description: t('introduce.steps.s2.desc'),
    },
    {
      title: t('introduce.steps.s3.title'),
      description: t('introduce.steps.s3.desc'),
    },
    {
      title: t('introduce.steps.s4.title'),
      description: t('introduce.steps.s4.desc'),
    },
  ];

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", py: 5, px: 3 }}>
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography
          variant="h3"
          sx={{
            mb: 2,
            background: (theme: any) => theme.palette.primary.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          {t('introduce.heroTitle')}
        </Typography>
        <Typography
          sx={{
            maxWidth: "820px",
            margin: "0 auto",
            color: "text.secondary",
            lineHeight: 1.8,
          }}
        >
          {t('introduce.heroSubtitle', { appName: APP_NAME })}
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        {highlights.map((item, index) => (
          <Grid
            key={index}
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card
              sx={{
                height: "100%",
                p: 3,
                border: "1px solid",
                borderColor: "grey.100",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: (theme: any) => theme.customShadows.card,
                  borderColor: "primary.light",
                },
              }}
            >
              <Stack spacing={2}>
                <item.icon sx={{ fontSize: 34, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box>
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            textAlign: "center",
            background: (theme: any) => theme.palette.primary.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          {t('introduce.processTitle')}
        </Typography>
        <Grid container spacing={3}>
          {steps.map((step, index) => (
            <Grid
              key={index}
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  p: 3,
                  border: "1px solid",
                  borderColor: "grey.100",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 1, color: "primary.main" }}
                >
                  {t('introduce.stepLabel', { index: index + 1 })}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {step.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default IntroducePage;
