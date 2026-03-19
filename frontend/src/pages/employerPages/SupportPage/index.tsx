import React from "react";
import { Box, Card, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid2";

import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";

import { TabTitle } from "../../../utils/generalFunction";
import { APP_NAME } from "../../../configs/constants";

const SupportPage = () => {
  const { t } = useTranslation("employer");
  TabTitle(`${t('support.pageTitle')} - ${APP_NAME}`);

  const supportChannels = [
    {
      title: t('support.directSupport.title'),
      description: t('support.directSupport.desc'),
      note: t('support.directSupport.note'),
      icon: SupportAgentOutlinedIcon,
    },
    {
      title: t('support.docs.title'),
      description: t('support.docs.desc'),
      note: t('support.docs.note'),
      icon: LibraryBooksOutlinedIcon,
    },
    {
      title: t('support.feedback.title'),
      description: t('support.feedback.desc'),
      note: t('support.feedback.note'),
      icon: ChatBubbleOutlineOutlinedIcon,
    },
  ];

  const faqs = [
    {
      question: t('support.faq.q1'),
      answer: t('support.faq.a1'),
    },
    {
      question: t('support.faq.q2'),
      answer: t('support.faq.a2'),
    },
    {
      question: t('support.faq.q3'),
      answer: t('support.faq.a3'),
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
          {t('support.heroTitle')}
        </Typography>
        <Typography
          sx={{
            maxWidth: "820px",
            margin: "0 auto",
            color: "text.secondary",
            lineHeight: 1.8,
          }}
        >
          {t('support.heroSubtitle', { appName: APP_NAME })}
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        {supportChannels.map((item, index) => (
          <Grid
            key={index}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
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
              <Stack spacing={2}>
                <item.icon sx={{ fontSize: 34, color: "primary.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {item.note}
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
            mb: 3,
            background: (theme: any) => theme.palette.primary.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}
        >
          {t('support.faq.title')}
        </Typography>
        <Grid container spacing={3}>
          {faqs.map((faq, index) => (
            <Grid
              key={index}
              size={{
                xs: 12,
                md: 4,
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
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {faq.question}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {faq.answer}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default SupportPage;
