import React from "react";
import { Box, Card, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

import JobDetailInfoItem from "./JobDetailInfoItem";

const JobDetailDescriptionCard = ({ jobPostDetail, allConfig }) => {
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
        {/* MÃ´ táº£ cÃ´ng viá»‡c */}
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
            MÃ´ táº£ cÃ´ng viá»‡c
          </Typography>
          <div
            dangerouslySetInnerHTML={{
              __html: jobPostDetail?.jobDescription,
            }}
          />
        </Box>

        {/* YÃªu cáº§u cÃ´ng viá»‡c */}
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
            YÃªu cáº§u cÃ´ng viá»‡c
          </Typography>
          <div
            dangerouslySetInnerHTML={{
              __html: jobPostDetail?.jobRequirement,
            }}
          />
        </Box>

        {/* Quyá»n lá»£i */}
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
            Quyá»n lá»£i
          </Typography>
          <div
            dangerouslySetInnerHTML={{
              __html: jobPostDetail?.benefitsEnjoyed,
            }}
          />
        </Box>

        {/* ThÃ´ng tin bá»• sung */}
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <JobDetailInfoItem
                title="Nghá» nghiá»‡p"
                value={allConfig.careerDict[jobPostDetail?.career]}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <JobDetailInfoItem
                title="NÆ¡i lÃ m viá»‡c"
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
                title="Há»c váº¥n"
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
                title="Sá»‘ lÆ°á»£ng tuyá»ƒn"
                value={jobPostDetail?.quantity}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <JobDetailInfoItem
                title="Khu vá»±c tuyá»ƒn"
                value={allConfig.cityDict[jobPostDetail?.location?.city]}
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6
              }}>
              <JobDetailInfoItem
                title="YÃªu cáº§u giá»›i tÃ­nh"
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
