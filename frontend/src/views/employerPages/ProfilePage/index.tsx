 'use client';
import React from "react";
import { Box, Card, Divider, Typography, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TabTitle } from "@/utils/generalFunction";
import ProfileCard from "@/views/components/employers/ProfileCard";

const ProfilePage = () => {
  const { t } = useTranslation('employer');
  TabTitle(t('sidebar.findCandidates'));

  return (
    <Box sx={{ width: '100%', minWidth: 0, p: 0 }}>
      <Box sx={{ mb: 2.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, sm: { alignItems: 'center' }, justifyContent: 'space-between', gap: 1 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#0F172A',
              fontSize: { xs: "1.35rem", md: "1.65rem" },
              letterSpacing: '-0.025em',
            }}
          >
            {t('sidebar.findCandidates')}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#64748B', mt: 0.5, fontSize: '0.875rem', fontWeight: 500 }}
          >
            Tìm kiếm, đánh giá và khớp nối ứng viên tiềm năng phù hợp với tiêu chí tuyển dụng
          </Typography>
        </Box>
      </Box>
      <ProfileCard />
    </Box>
  );
};

export default ProfilePage;
