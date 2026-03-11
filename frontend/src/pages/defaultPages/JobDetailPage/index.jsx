/*

MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy

Email: khuy220@gmail.com

Copyright (c) 2023 Bui Khanh Huy

License: MIT License

See the LICENSE file in the project root for full license information.

*/

import React from "react";

import { useSelector } from "react-redux";

import { useParams } from "react-router-dom";

import { Box } from "@mui/material";
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

const JobDetailPage = () => {

  const { slug } = useParams();

  const { allConfig } = useSelector((state) => state.config);

  const { isAuthenticated, currentUser } = useSelector((state) => state.user);

  const [openSharePopup, setOpenSharePopup] = React.useState(false);

  const [openPopup, setOpenPopup] = React.useState(false);

  const [isApplySucces, setIsApplySuccess] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(true);

  const [isLoadingSave, setIsLoadingSave] = React.useState(false);

  const [jobPostDetail, setJobPostDetail] = React.useState(null);

  React.useEffect(() => {

    const getJobPostDetail = async (jobPostSlug) => {

      try {

        const resData = await jobService.getJobPostDetailById(jobPostSlug);

        const data = resData;

        setJobPostDetail(data);

        TabTitle(data?.jobName);

      } catch (error) {

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

          isSaved ? "Saved successfully." : "Unsaved successfully."

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

  return (
    <>
      {isLoading ? (

        <JobDetailLoading />

      ) : jobPostDetail === null ? (

        <NoDataCard />

      ) : (

        <Box sx={{ mt: 2 }}>

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

      )}{/* Start: ApplyCard */}
      <ApplyCard

        title={jobPostDetail?.jobName}

        jobPostId={jobPostDetail?.id}

        openPopup={openPopup}

        setOpenPopup={setOpenPopup}

        setIsApplySuccess={setIsApplySuccess}

      />
      {/* End: ApplyCard */}
      {/* Start: SocialNetworkSharingPopup */}
      <SocialNetworkSharingPopup

        setOpenPopup={setOpenSharePopup}

        open={openSharePopup}

        facebook={{

          url: window.location.href,

          quote: jobPostDetail?.jobName,

          hashtag: "#myjob",

        }}

        facebookMessenger={{

          url: window.location.href,

        }}

        linkedin={{

          url: window.location.href,

          title: jobPostDetail?.jobName,

          summary: jobPostDetail?.jobDescription,

          source: "MyJob",

        }}

        twitter={{

          url: window.location.href,

          title: jobPostDetail?.jobName,

          hashtags: ["myjob", "tuyendung"],

        }}

        email={{

          url: window.location.href,

          subject: jobPostDetail?.jobName,

          body: jobPostDetail?.jobDescription,

        }}

      />
      {/* End: SocialNetworkSharingPopup */}
    </>
  );

};

export default JobDetailPage;

