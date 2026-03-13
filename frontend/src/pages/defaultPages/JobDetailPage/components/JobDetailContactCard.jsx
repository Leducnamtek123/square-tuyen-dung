import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Card, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import Map from "../../../../components/Map";

const JobDetailContactCard = ({ jobPostDetail }) => {
  const { t } = useTranslation(["public"]);
  return (
    <Card
      sx={{
        py: 4,
        mt: 3,
        px: { xs: 1.5, sm: 1.5, md: 2, lg: 4, xl: 4 },
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Grid container spacing={4}>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 6,
            lg: 6,
            xl: 6
          }}>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontSize: "1.3rem",
                fontWeight: 700,
                mb: 3,
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
              {t("jobDetail.contactInfo")}
            </Typography>

            <Stack spacing={2.5}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(156,39,176,0.04)",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(156,39,176,0.08)",
                    transform: "translateX(8px)",
                  },
                }}
              >
                <PersonIcon sx={{ color: "#9c27b0", fontSize: 24 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t("jobDetail.contactPerson")}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {jobPostDetail?.contactPersonName || t("jobDetail.notUpdated")}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(156,39,176,0.04)",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(156,39,176,0.08)",
                    transform: "translateX(8px)",
                  },
                }}
              >
                <EmailIcon sx={{ color: "#9c27b0", fontSize: 24 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t("jobDetail.contactEmail")}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {jobPostDetail?.contactPersonEmail || t("jobDetail.notUpdated")}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(156,39,176,0.04)",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(156,39,176,0.08)",
                    transform: "translateX(8px)",
                  },
                }}
              >
                <PhoneIcon sx={{ color: "#9c27b0", fontSize: 24 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t("jobDetail.contactPhone")}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {jobPostDetail?.contactPersonPhone || t("jobDetail.notUpdated")}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(156,39,176,0.04)",
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "rgba(156,39,176,0.08)",
                    transform: "translateX(8px)",
                  },
                }}
              >
                <LocationOnIcon sx={{ color: "#9c27b0", fontSize: 24 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t("jobDetail.address")}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {jobPostDetail?.location?.address || t("jobDetail.notUpdated")}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 6,
            lg: 6,
            xl: 6
          }}>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontSize: "1.3rem",
                fontWeight: 700,
                mb: 3,
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
              {t("jobDetail.map")}
            </Typography>
            <Box
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Map
                title={jobPostDetail?.jobName}
                subTitle={jobPostDetail?.location?.address}
                latitude={jobPostDetail?.location?.lat}
                longitude={jobPostDetail?.location?.lng}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
};

export default JobDetailContactCard;
