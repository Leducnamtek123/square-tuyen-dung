// @ts-nocheck
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Box, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";

import JobDetailLoading from "./components/JobDetailLoading";
import JobDetailHeaderCard from "./components/JobDetailHeaderCard";
import JobDetailDescriptionCard from "./components/JobDetailDescriptionCard";
import JobDetailContactCard from "./components/JobDetailContactCard";
import JobDetailSidebar from "./components/JobDetailSidebar";

import { TabTitle } from "../../../utils/generalFunction";
import toastMessages from "../../../utils/toastMessages";
import errorHandling from "../../../utils/errorHandling";
import NoDataCard from "../../../components/NoDataCard";
import jobService from "../../../services/jobService";
import ApplyCard from "../../../components/ApplyCard";
import SocialNetworkSharingPopup from "../../../components/SocialNetworkSharingPopup/SocialNetworkSharingPopup";
import { ROLES_NAME, ROUTES } from "../../../configs/constants";

interface Props {
  [key: string]: any;
}



const JobDetailPage = () => {
  const { slug } = useParams();
  const nav = useNavigate();
  const { t } = useTranslation(["public"]);
  const { allConfig } = useSelector((state) => state.config);
  const { isAuthenticated, currentUser } = useSelector((state) => state.user);

  const [openSharePopup, setOpenSharePopup] = React.useState(false);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [isApplySucces, setIsApplySuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingSave, setIsLoadingSave] = React.useState(false);
  const [jobPostDetail, setJobPostDetail] = React.useState(null);
  const canApply =
    !isAuthenticated ||
    (currentUser?.roleName || currentUser?.role_name) === ROLES_NAME.JOB_SEEKER;

  React.useEffect(() => {
    const getJobPostDetail = async (jobPostSlug) => {
      try {
        const resData = await jobService.getJobPostDetailById(jobPostSlug);
        const data = resData;
        setJobPostDetail(data);
        TabTitle(data?.jobName);
      } catch (error) {
        // Error handled by caller or silent
      } finally {
        setIsLoading(false);
      }
    };
    getJobPostDetail(slug);
  }, [slug]);

  React.useEffect(() => {
    if (isApplySucces) {
      setJobPostDetail((prev) =>
        prev ? { ...prev, isApplied: true } : prev
      );
    }
  }, [isApplySucces]);

  const handleSave = () => {
    const saveJobPost = async () => {
      setIsLoadingSave(true);
      try {
        const resData = await jobService.saveJobPost(slug);
        const isSaved = resData.isSaved;
        setJobPostDetail({ ...jobPostDetail, isSaved: isSaved });
        toastMessages.success(
          isSaved ? t("jobDetail.savedSuccess") : t("jobDetail.unsavedSuccess")
        );
      } catch (error) {
        errorHandling(error);
      } finally {
        setIsLoadingSave(false);
      }
    };
    saveJobPost();
  };

  const handleShowApplyForm = () => {
    setOpenPopup(true);
  };

  const handleMobileApplyClick = () => {
    if (!isAuthenticated) {
      nav(`/${ROUTES.AUTH.LOGIN}`);
      return;
    }
    handleShowApplyForm();
  };

  return (
    <>
      {isLoading ? (
        <JobDetailLoading />
      ) : jobPostDetail === null ? (
        <NoDataCard title={t("jobDetail.noData")} />
      ) : (
        <Box sx={{ mt: 2, pb: { xs: canApply ? 10 : 0, md: 0 } }}>
          <Grid container spacing={3}>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: 8,
                lg: 8,
                xl: 8
              }}>
              <JobDetailHeaderCard
                jobPostDetail={jobPostDetail}
                allConfig={allConfig}
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                isLoadingSave={isLoadingSave}
                onSave={handleSave}
                onShowApplyForm={handleShowApplyForm}
                onOpenSharePopup={setOpenSharePopup}
              />
              <JobDetailDescriptionCard
                jobPostDetail={jobPostDetail}
                allConfig={allConfig}
              />
              <JobDetailContactCard jobPostDetail={jobPostDetail} />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: 4,
                lg: 4,
                xl: 4
              }}>
              <JobDetailSidebar jobPostDetail={jobPostDetail} />
            </Grid>
          </Grid>
        </Box>
      )}

      {!isLoading && jobPostDetail && canApply && (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            display: { xs: "block", md: "none" },
            p: 1.5,
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="warning"
            size="large"
            disabled={jobPostDetail?.isApplied}
            onClick={handleMobileApplyClick}
          >
            {jobPostDetail?.isApplied
              ? t("jobDetail.actions.applied")
              : t("jobDetail.actions.apply")}
          </Button>
        </Box>
      )}

      <ApplyCard
        title={jobPostDetail?.jobName}
        jobPostId={jobPostDetail?.id}
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        setIsApplySuccess={setIsApplySuccess}
      />

      <SocialNetworkSharingPopup
        setOpenPopup={setOpenSharePopup}
        open={openSharePopup}
        facebook={{
          url: window.location.href,
          quote: jobPostDetail?.jobName,
          hashtag: "#Project",
        }}
        facebookMessenger={{
          url: window.location.href,
        }}
        linkedin={{
          url: window.location.href,
          title: jobPostDetail?.jobName,
          summary: jobPostDetail?.jobDescription,
          source: "Project",
        }}
        twitter={{
          url: window.location.href,
          title: jobPostDetail?.jobName,
          hashtags: ["Project", "tuyendung"],
        }}
        email={{
          url: window.location.href,
          subject: jobPostDetail?.jobName,
          body: jobPostDetail?.jobDescription,
        }}
      />
    </>
  );
};

export default JobDetailPage;

