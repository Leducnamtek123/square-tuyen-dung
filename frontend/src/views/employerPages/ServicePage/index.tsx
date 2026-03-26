import React from "react";
import { Box, Card, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid2";

import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";

import { TabTitle } from "../../../utils/generalFunction";
import { APP_NAME } from "../../../configs/constants";

const ServicePage = () => {
  const { t } = useTranslation("employer");
  TabTitle(`${t('service.pageTitle')} - ${APP_NAME}`);

  const services = [
    {
      title: t('service.jobPost.title'),
      description: t('service.jobPost.desc'),
      icon: FactCheckOutlinedIcon,
    },
    {
      title: t('service.search.title'),
      description: t('service.search.desc'),
      icon: SearchOutlinedIcon,
    },
    {
      title: t('service.interview.title'),
      description: t('service.interview.desc'),
      icon: VideoCallOutlinedIcon,
    },
    {
      title: t('service.report.title'),
      description: t('service.report.desc'),
      icon: InsightsOutlinedIcon,
    },
  ];

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", py: 5, px: 3 }}>
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography
          variant="h3"
          sx={{
            mb: 2,
            background: (theme: any) => theme.palette.primary.main,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          {t('service.heroTitle')}
        </Typography>
        <Typography
          sx={{
            maxWidth: "820px",
            margin: "0 auto",
            color: "text.secondary",
            lineHeight: 1.8,
          }}
        >
          {t('service.heroSubtitle', { appName: APP_NAME })}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {services.map((service, index) => (
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
                <service.icon sx={{ fontSize: 34, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {service.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {service.description}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ServicePage;
