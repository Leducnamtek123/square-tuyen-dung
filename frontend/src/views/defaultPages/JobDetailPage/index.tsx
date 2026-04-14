import React from "react";
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { JobPost } from "@/types/models";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types/api";

import JobDetailLoading from "./components/JobDetailLoading";
import JobDetailHeaderCard from "./components/JobDetailHeaderCard";
import JobDetailDescriptionCard from "./components/JobDetailDescriptionCard";
import JobDetailContactCard from "./components/JobDetailContactCard";
import JobDetailSidebar from "./components/JobDetailSidebar";

import toastMessages from "../../../utils/toastMessages";
import errorHandling from "../../../utils/errorHandling";
import NoDataCard from "../../../components/Common/NoDataCard";
import jobService from "../../../services/jobService";
import companyService from "../../../services/companyService";
import ApplyCard from "../../../components/Features/ApplyCard";
import SocialNetworkSharingPopup from "../../../components/Common/SocialNetworkSharingPopup/SocialNetworkSharingPopup";
import { ROLES_NAME, ROUTES } from "../../../configs/constants";
import { useAppSelector } from "../../../hooks/useAppStore";
import useSEO from "../../../hooks/useSEO";
import useStructuredData from "../../../hooks/useStructuredData";
import { useConfig } from '@/hooks/useConfig';
import type { Location } from '@/types/models';
import type { Company } from '@/types/models';

const JobDetailPage = () => {
  const { slug } = useParams();
  const nav = useRouter();
  const { t } = useTranslation(["public"]);
  const { allConfig } = useConfig();
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.user);

  const [openSharePopup, setOpenSharePopup] = React.useState(false);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [isApplySucces, setIsApplySuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingSave, setIsLoadingSave] = React.useState(false);

  interface ExtendedJobPost extends JobPost {
    companyName?: string;
    companyImageUrl?: string;
    companySlug?: string;
    locationName?: string;
    jobTypeName?: string;
    createdAt?: string;
    isSaved?: boolean;
    isApplied?: boolean;
    companyDict?: Company;
    [key: string]: unknown;
  }

  const [jobPostDetail, setJobPostDetail] = React.useState<ExtendedJobPost | null>(null);
  const canApply =
    !isAuthenticated ||
    currentUser?.roleName === ROLES_NAME.JOB_SEEKER;

  React.useEffect(() => {
    const getJobPostDetail = async (jobPostSlug: string | undefined) => {

      if (!jobPostSlug) return;
      try {
        const resData = await jobService.getJobPostDetailById(jobPostSlug);
        const data = resData;
        setJobPostDetail(data as ExtendedJobPost);
      } catch (error) {
        const slugValue = String(jobPostSlug || '');
        const isNumericId = /^\d+$/.test(slugValue);
        if (isNumericId) {
          try {
            const fallbackData = await companyService.getCompanyJobPostDetailById(
              Number(slugValue)
            );
            setJobPostDetail(fallbackData as ExtendedJobPost);
            return;
          } catch (fallbackError) {
            errorHandling(fallbackError as AxiosError<{ errors?: ApiError }>);
          }
        } else {
          errorHandling(error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    getJobPostDetail(slug as string);
  }, [slug]);

  // --- Dynamic SEO ---
  const jobDescription = jobPostDetail?.jobDescription || '';
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').slice(0, 160);

  useSEO({
    title: jobPostDetail?.jobName,
    description: jobPostDetail
      ? `Tuyển dụng: ${jobPostDetail.jobName} tại ${jobPostDetail.companyName || 'công ty uy tín'}. ${stripHtml(jobDescription)}`
      : undefined,
    image: jobPostDetail?.companyImageUrl || undefined,
    url: (typeof window !== 'undefined' ? window.location.href : ''),
    type: 'article',
    keywords: jobPostDetail
      ? `${jobPostDetail.jobName}, ${jobPostDetail.companyName || ''}, tuyển dụng, việc làm`
      : undefined,
  });

  useStructuredData(
    jobPostDetail
      ? [
          {
            type: 'JobPosting' as const,
            title: jobPostDetail.jobName,
            description: jobDescription,
            companyName: jobPostDetail.companyName,
            companyUrl: jobPostDetail.companySlug
              ? `${(typeof window !== 'undefined' ? window.location.origin : '')}/cong-ty/${jobPostDetail.companySlug}`
              : undefined,
            companyLogoUrl: jobPostDetail.companyImageUrl as string | undefined,
            location: (jobPostDetail.locationName || (typeof jobPostDetail.location === 'object' ? jobPostDetail.location?.address : jobPostDetail.location)) as string,
            salary: {
              min: jobPostDetail.salaryMin,
              max: jobPostDetail.salaryMax,
              currency: 'VND',
            },
            jobType: (jobPostDetail.jobTypeName || jobPostDetail.jobType)?.toString(),
            datePosted: jobPostDetail.createAt || jobPostDetail.createdAt,
            validThrough: jobPostDetail.deadline,
            url: (typeof window !== 'undefined' ? window.location.href : ''),
          },
          {
            type: 'BreadcrumbList' as const,
            items: [
              { name: 'Trang chủ', url: (typeof window !== 'undefined' ? window.location.origin : '') },
              { name: 'Việc làm', url: `${(typeof window !== 'undefined' ? window.location.origin : '')}/viec-lam` },
              { name: jobPostDetail.jobName, url: (typeof window !== 'undefined' ? window.location.href : '') },
            ],
          },
        ]
      : []
  );

  React.useEffect(() => {
    if (isApplySucces) {
      setJobPostDetail((prev) =>
        prev ? { ...prev, isApplied: true } as ExtendedJobPost : prev
      );
    }
  }, [isApplySucces]);

  const handleSave = () => {
    const saveJobPost = async () => {
      setIsLoadingSave(true);
      try {
        const resData = await jobService.saveJobPost(slug as string) as { isSaved: boolean };
        const isSaved = resData.isSaved;
        setJobPostDetail({ ...jobPostDetail, isSaved: isSaved } as ExtendedJobPost);
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
      nav.push(`/${ROUTES.AUTH.LOGIN}`);
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
              <JobDetailContactCard jobPostDetail={jobPostDetail as JobPost & { companyDict?: Company; location?: Location & { lat?: number; lng?: number; } }} />
            </div>
            <div>
              <JobDetailSidebar jobPostDetail={jobPostDetail as JobPost & { companyDict?: Company }} />
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
        jobPostId={jobPostDetail?.id as number}
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
        setIsApplySuccess={setIsApplySuccess}
      />

      <SocialNetworkSharingPopup
        {...({
          setOpenPopup: setOpenSharePopup,
          open: openSharePopup,
          facebook: {
            url: (typeof window !== 'undefined' ? window.location.href : ''),
            quote: jobPostDetail?.jobName,
            hashtag: "#Project",
          },
          facebookMessenger: {
            url: (typeof window !== 'undefined' ? window.location.href : ''),
          },
          linkedin: {
            url: (typeof window !== 'undefined' ? window.location.href : ''),
            title: jobPostDetail?.jobName,
            summary: jobPostDetail?.jobDescription,
            source: "Project",
          },
          twitter: {
            url: (typeof window !== 'undefined' ? window.location.href : ''),
            title: jobPostDetail?.jobName,
            hashtags: ["Project", "tuyendung"],
          },
          email: {
            url: (typeof window !== 'undefined' ? window.location.href : ''),
            subject: jobPostDetail?.jobName,
            body: jobPostDetail?.jobDescription,
          },
        } as React.ComponentProps<typeof SocialNetworkSharingPopup>)}
      />
    </>
  );
};

export default JobDetailPage;

