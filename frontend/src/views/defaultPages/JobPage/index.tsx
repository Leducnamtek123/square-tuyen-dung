import React from "react";
import { Box, Typography } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import JobPostSearch from "../../components/defaults/JobPostSearch";
import SuggestedJobPostCard from "../../components/defaults/SuggestedJobPostCard";
import MainJobPostCard from "../../components/defaults/MainJobPostCard";
import MainJobRightBanner from "../../../components/Features/MainJobRightBanner";
import { ROLES_NAME } from "../../../configs/constants";
import { useAppSelector } from "../../../hooks/useAppStore";
import useSEO from "../../../hooks/useSEO";



const JobPage = () => {

  const { t } = useTranslation(["public"]);
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.user);
  const isJobSeekerLoggedIn =
    isAuthenticated &&
    currentUser?.roleName === ROLES_NAME.JOB_SEEKER;

  useSEO({
    title: t("jobSearch.tabTitle"),
    description: t('seo.jobList.description'),
    url: `${(typeof window !== 'undefined' ? window.location.origin : '')}/viec-lam`,
    keywords: t('seo.jobList.keywords'),
  });

  return (

    <>

      <Box sx={{ mt: 2 }}>

        <Box>

          {/* Start: JobPostSearch */}

          <JobPostSearch />

          {/* End: JobPostSearch */}

        </Box>

        <Box sx={{ mt: 4 }}>

          <Grid container spacing={3}>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 12,

                lg: 8,

                xl: 8

              }}>

              {/* Start: MainJobPostCard */}

              <MainJobPostCard />

              {/* End: MainJobPostCard */}

            </Grid>

            <Grid

              size={{

                xs: 12,

                sm: 12,

                md: 12,

                lg: 4,

                xl: 4

              }}>

              {isJobSeekerLoggedIn && (
                <>
                  <Box sx={{ pt: 2, pb: 3 }}>

                    <Typography variant="h5">{t("jobSearch.recommendedJobs")}</Typography>

                  </Box>

                  {/* Start: SuggestedJobPostCard */}

                  <SuggestedJobPostCard fullWidth={true} />

                  {/* End: SuggestedJobPostCard */}
                </>
              )}

              <Box

                sx={{

                  mt: 2,

                  display: { xs: "none", sm: "none", md: "none", lg: "block" },

                }}

              >

                {/* Start: MainJobRightBanner */}

                <MainJobRightBanner />

                {/* End: MainJobRightBanner */}

              </Box>

            </Grid>

          </Grid>

        </Box>


      </Box>

    </>

  );

};

export default JobPage;
