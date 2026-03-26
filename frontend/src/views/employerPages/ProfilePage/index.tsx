import React from "react";
import { Box, Card, Divider, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TabTitle } from "../../../utils/generalFunction";
import ProfileCard from "../../components/employers/ProfileCard";

const ProfilePage = () => {
  const { t } = useTranslation('employer');
  TabTitle(t('sidebar.findCandidates'));

  return (
    <Card sx={{ p: 3, pt: 4 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          background: (theme: any) => theme.palette.primary.main,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        {t('sidebar.findCandidates')}
      </Typography>
      <Divider sx={{ mt: 2, mb: 3 }} />
      <Box>
        <ProfileCard />
      </Box>
    </Card>
  );
};

export default ProfilePage;
