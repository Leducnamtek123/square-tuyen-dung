'use client';

import React from "react";
import { Box, Card, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import SettingCard from "../../components/settings/SettingCard";

const SettingPage = () => {
  const { t } = useTranslation("employer");

  return (
    <Box sx={{ width: '100%', maxWidth: 840, mx: 'auto' }}>
      <Stack spacing={3}>
        <Card
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.customShadows?.z1,
          }}
        >
          <SettingCard
            title={
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#0F172A',
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  letterSpacing: '-0.02em',
                }}
              >
                {t('setting.title')}
              </Typography>
            }
            sx={{ boxShadow: 0 }}
          />
        </Card>
      </Stack>
    </Box>
  );
};

export default SettingPage;
