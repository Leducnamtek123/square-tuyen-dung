 'use client';
import React from "react";
import { Box, Card, Divider, Typography, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TabTitle } from "../../../utils/generalFunction";
import ProfileCard from "../../components/employers/ProfileCard";

const ProfilePage = () => {
  const { t } = useTranslation('employer');
  TabTitle(t('sidebar.findCandidates'));

  return (
    <Box sx={{ width: '100%', minWidth: 0, p: 0 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#0F172A',
            fontSize: { xs: "1.25rem", md: "1.5rem" },
            letterSpacing: '-0.02em',
          }}
        >
          {t('sidebar.findCandidates')}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#64748B', mt: 0.5, fontSize: '0.85rem' }}
        >
          Tìm và lọc ứng viên phù hợp với vị trí tuyển dụng của bạn
        </Typography>
      </Box>
      <ProfileCard />
    </Box>
  );
};

export default ProfilePage;
