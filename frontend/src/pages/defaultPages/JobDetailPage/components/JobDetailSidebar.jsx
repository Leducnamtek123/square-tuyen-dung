import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Card, Stack, Typography } from "@mui/material";

import FilterJobPostCard from "../../../components/defaults/FilterJobPostCard";

const JobDetailSidebar = ({ jobPostDetail }) => {
  const { t } = useTranslation(["public"]);
  return (
    <Card sx={{ p: { xs: 1.5, sm: 1.5, md: 2, lg: 2, xl: 2 } }}>
      <Stack spacing={2}>
        <Typography variant="h5">{t("jobDetail.similarJobs")}</Typography>
        <Box sx={{ width: 120, height: 5, backgroundColor: "#1976d2" }}></Box>
        <Box>
          <FilterJobPostCard
            params={{
              excludeSlug: jobPostDetail?.slug,
              // cityId: jobPostDetail?.location?.city,
              // careerId: jobPostDetail?.career
            }}
          />
        </Box>
      </Stack>
    </Card>
  );
};

export default JobDetailSidebar;
