'use client';

import React from "react";
import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TabTitle } from "@/utils/generalFunction";
import SettingCard from "@/views/components/settings/SettingCard";

const SettingPage = () => {
  const { t } = useTranslation("employer");
  TabTitle(`${t('setting.title')} - Square HR`);

  return (
    <Box sx={{ width: '100%', maxWidth: 840, mx: 'auto' }}>
      <Stack spacing={3}>
        <SettingCard />
      </Stack>
    </Box>
  );
};

export default SettingPage;
