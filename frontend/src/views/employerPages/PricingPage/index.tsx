import React from "react";
import { Box, Card, Stack, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid2";

import { TabTitle } from "../../../utils/generalFunction";
import { APP_NAME } from "../../../configs/constants";

const PricingPage = () => {
  const { t } = useTranslation("employer");
  TabTitle(`${t('pricing.heroTitle')} - ${APP_NAME}`);

  const plans = [
    {
      title: t('pricing.plans.basic.title'),
      price: t('pricing.plans.basic.price'),
      description: t('pricing.plans.basic.desc'),
      features: [
        t('pricing.plans.basic.f1'),
        t('pricing.plans.basic.f2'),
        t('pricing.plans.basic.f3'),
      ],
    },
    {
      title: t('pricing.plans.standard.title'),
      price: t('pricing.plans.standard.price'),
      description: t('pricing.plans.standard.desc'),
      features: [
        t('pricing.plans.standard.f1'),
        t('pricing.plans.standard.f2'),
        t('pricing.plans.standard.f3'),
      ],
    },
    {
      title: t('pricing.plans.enterprise.title'),
      price: t('pricing.plans.enterprise.price'),
      description: t('pricing.plans.enterprise.desc'),
      features: [
        t('pricing.plans.enterprise.f1'),
        t('pricing.plans.enterprise.f2'),
        t('pricing.plans.enterprise.f3'),
      ],
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
          {t('pricing.heroTitle')}
        </Typography>
        <Typography
          sx={{
            maxWidth: "820px",
            margin: "0 auto",
            color: "text.secondary",
            lineHeight: 1.8,
          }}
        >
          {t('pricing.heroSubtitle')}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {plans.map((plan, index) => (
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
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack spacing={2} sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {plan.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {plan.price}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {plan.description}
                </Typography>
                <Stack spacing={1}>
                  {plan.features.map((feature, featureIndex) => (
                    <Typography
                      key={featureIndex}
                      sx={{ color: "text.secondary" }}
                    >
                      • {feature}
                    </Typography>
                  ))}
                </Stack>
              </Stack>
              <Button
                variant="outlined"
                sx={{ mt: 3 }}
                color="primary"
              >
                {t('pricing.contactBtn')}
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PricingPage;
