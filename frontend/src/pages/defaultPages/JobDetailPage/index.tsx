import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/ui/button";

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
import companyService from "../../../services/companyService";
import ApplyCard from "../../../components/ApplyCard";
import SocialNetworkSharingPopup from "../../../components/SocialNetworkSharingPopup/SocialNetworkSharingPopup";
import { ROLES_NAME, ROUTES } from "../../../configs/constants";
import { useAppSelector } from "../../../hooks/useAppStore";

const JobDetailPage = () => {
  const { slug } = useParams();
  const nav = useNavigate();
  const { t } = useTranslation(["public"]);
  const { allConfig } = useAppSelector((state) => state.config);
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.user);

  const [openSharePopup, setOpenSharePopup] = React.useState(false);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [isApplySucces, setIsApplySuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingSave, setIsLoadingSave] = React.useState(false);
  const [jobPostDetail, setJobPostDetail] = React.useState<any>(null);
  const canApply =
    !isAuthenticated ||
    (currentUser?.roleName || currentUser?.role_name) === ROLES_NAME.JOB_SEEKER;

  React.useEffect(() => {
    const getJobPostDetail = async (jobPostSlug: string | undefined) => {

      if (!jobPostSlug) return;
      try {
        const resData = await jobService.getJobPostDetailById(jobPostSlug);
        const data = resData;
        setJobPostDetail(data);
        TabTitle(data?.jobName);
      } catch (error) {
        const slugValue = String(jobPostSlug || '');
        const isNumericId = /^\d+$/.test(slugValue);
        if (isNumericId) {
          try {
            const fallbackData = await companyService.getCompanyJobPostDetailById(
              Number(slugValue)
            );
            setJobPostDetail(fallbackData);
            TabTitle((fallbackData as any)?.jobName);
            return;
          } catch (fallbackError) {
            errorHandling(fallbackError as any);
          }
        } else {
          errorHandling(error as any);
        }
      } finally {
        setIsLoading(false);
      }
    };
    getJobPostDetail(slug);
  }, [slug]);

  React.useEffect(() => {
    if (isApplySucces) {
      setJobPostDetail((prev: any) =>
        prev ? { ...prev, isApplied: true } : prev
      );
    }
  }, [isApplySucces]);

  const handleSave = () => {
    const saveJobPost = async () => {
      setIsLoadingSave(true);
      try {
        const resData = await jobService.saveJobPost(slug as string);
        const isSaved = resData.isSaved;
        setJobPostDetail({ ...jobPostDetail, isSaved: isSaved });
        toastMessages.success(
          isSaved ? t("jobDetail.savedSuccess") : t("jobDetail.unsavedSuccess")
        );
      } catch (error) {
        errorHandling(error as any);
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
        <div className={cn("mt-2", canApply ? "pb-20 md:pb-0" : "")}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-8">
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
            </div>
            <div>
              <JobDetailSidebar jobPostDetail={jobPostDetail} />
            </div>
          </div>
        </div>
      )}

      {!isLoading && jobPostDetail && canApply && (
        <div className="fixed inset-x-0 bottom-0 z-50 block border-t border-border bg-background p-4 md:hidden">
          <Button
            className="w-full bg-amber-500 text-white hover:bg-amber-600"
            size="lg"
            disabled={jobPostDetail?.isApplied}
            onClick={handleMobileApplyClick}
          >
            {jobPostDetail?.isApplied
              ? t("jobDetail.actions.applied")
              : t("jobDetail.actions.apply")}
          </Button>
        </div>
      )}

      <ApplyCard
        title={jobPostDetail?.jobName}
        jobPostId={jobPostDetail?.id}
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        setIsApplySuccess={setIsApplySuccess}
      />

      <SocialNetworkSharingPopup
        {...({
          setOpenPopup: setOpenSharePopup,
          open: openSharePopup,
          facebook: {
            url: window.location.href,
            quote: jobPostDetail?.jobName,
            hashtag: "#Project",
          },
          facebookMessenger: {
            url: window.location.href,
          },
          linkedin: {
            url: window.location.href,
            title: jobPostDetail?.jobName,
            summary: jobPostDetail?.jobDescription,
            source: "Project",
          },
          twitter: {
            url: window.location.href,
            title: jobPostDetail?.jobName,
            hashtags: ["Project", "tuyendung"],
          },
          email: {
            url: window.location.href,
            subject: jobPostDetail?.jobName,
            body: jobPostDetail?.jobDescription,
          },
        } as any)}
      />
    </>
  );
};

export default JobDetailPage;

