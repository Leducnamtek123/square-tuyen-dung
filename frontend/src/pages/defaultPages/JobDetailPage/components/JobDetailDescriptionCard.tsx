// @ts-nocheck
import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Card, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

import JobDetailInfoItem from "./JobDetailInfoItem";

interface Props {
  [key: string]: any;
}



const JobDetailDescriptionCard = ({ jobPostDetail, allConfig }) => {
  const { t } = useTranslation(["public"]);
  return (
    <Card
      sx={{
        p: 4,
        mt: 3,
        px: { xs: 1.5, sm: 1.5, md: 2, lg: 4, xl: 4 },
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Stack spacing={4}>
        {/* Job Description */}
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontSize: "1.3rem",
              fontWeight: 700,
              mb: 2,
              "&::after": {
                content: '""',
                display: "block",
                width: "50px",
                height: "3px",
                background: "#9c27b0",
                borderRadius: "2px",
                mt: 1,
              },
            }}
          >
            {t("jobDetail.description")}
          </Typography>
          <div
            dangerouslySetInnerHTML={{
              __html: jobPostDetail?.jobDescription,
            }}
          />
        </Box>

        {/* Job Requirements */}
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontSize: "1.3rem",
              fontWeight: 700,
              mb: 2,
              "&::after": {
                content: '""',
                display: "block",
                width: "50px",
                height: "3px",
                background: "#9c27b0",
                borderRadius: "2px",
                mt: 1,
              },
            }}
          >
            {t("jobDetail.requirements")}
          </Typography>
          <div
            dangerouslySetInnerHTML={{
              __html: jobPostDetail?.jobRequirement,
            }}
          />
        </Box>

        {/* Benefits */}
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontSize: "1.3rem",
              fontWeight: 700,
              mb: 2,
              "&::after": {
                content: '""',
                display: "block",
                width: "50px",
                height: "3px",
                background: "#9c27b0",
                borderRadius: "2px",
                mt: 1,
              },
            }}
          >
            {t("jobDetail.benefits")}
          </Typography>
          <div
            dangerouslySetInnerHTML={{
              __html: jobPostDetail?.benefitsEnjoyed,
            }}
          />
        </Box>

        {/* Additional Info */}
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <JobDetailInfoItem
                title={t("jobDetail.career")}
                value={allConfig.careerDict[jobPostDetail?.career]}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <JobDetailInfoItem
                title={t("jobDetail.workplaceType")}
                value={
                  allConfig.typeOfWorkplaceDict[
                    jobPostDetail?.typeOfWorkplace
                  ]
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <JobDetailInfoItem
                title={t("jobDetail.academicLevel")}
                value={
                  allConfig.academicLevelDict[jobPostDetail?.academicLevel]
                }
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <JobDetailInfoItem
                title={t("jobDetail.quantity")}
                value={jobPostDetail?.quantity}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <JobDetailInfoItem
                title={t("jobDetail.location")}
                value={allConfig.cityDict[jobPostDetail?.location?.city]}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <JobDetailInfoItem
                title={t("jobDetail.genderRequired")}
                value={allConfig.genderDict[jobPostDetail?.genderRequired]}
              />
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Card>
  );
};

export default JobDetailDescriptionCard;
