'use client';

import React from "react";
import { Box, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TabTitle } from "@/utils/generalFunction";
import AccountCard from "@/views/components/auths/AccountCard";

const AccountPage = () => {
  const { t } = useTranslation("employer");
  TabTitle(`${t('account.pageTitle')} - Employer Account Management`);

  return (
    <Box sx={{ width: '100%', maxWidth: 960, mx: 'auto' }}>
      <Stack spacing={3}>
        <AccountCard />
      </Stack>
    </Box>
  );
};

export default AccountPage;
