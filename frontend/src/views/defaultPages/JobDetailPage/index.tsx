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
import JobSalaryInsightCard from "../../../components/Features/JobSalaryInsightCard";
import TrustReportDialog from "../../../components/Features/TrustReportDialog";
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
  const { push } = useRouter();
  const { t } = useTranslation(["public"]);
  const { allConfig } = useConfig();
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.user);
  const [openReportPopup, setOpenReportPopup] = React.useState(false);

  type ExtendedJobPost = JobPost & {
    companyName?: string;
    companyImageUrl?: string;
    companySlug?: string;
    locationName?: string;
    jobTypeName?: string;
    createdAt?: string;
    isSaved?: boolean;
    isApplied?: boolean;
    companyDict?: Company;
  };

  type JobDetailState = {
    openSharePopup: boolean;
    openPopup: boolean;
    isLoading: boolean;
    isLoadingSave: boolean;
    jobPostDetail: ExtendedJobPost | null;
  };

  type JobDetailAction =
    | { type: 'set-loading'; value: boolean }
    | { type: 'set-loading-save'; value: boolean }
    | { type: 'set-job-post-detail'; value: ExtendedJobPost | null }
    | { type: 'open-popup' }
    | { type: 'close-popup' }
    | { type: 'open-share-popup'; value: boolean }
    | { type: 'mark-applied' }
    | { type: 'mark-saved'; value: boolean };

  const [state, dispatch] = React.useReducer(
    (current: JobDetailState, action: JobDetailAction): JobDetailState => {
      switch (action.type) {
        case 'set-loading':
          return { ...current, isLoading: action.value };
        case 'set-loading-save':
          return { ...current, isLoadingSave: action.value };
        case 'set-job-post-detail':
          return { ...current, jobPostDetail: action.value };
        case 'open-popup':
          return { ...current, openPopup: true };
        case 'close-popup':
          return { ...current, openPopup: false };
        case 'open-share-popup':
          return { ...current, openSharePopup: action.value };
        case 'mark-applied':
          return {
            ...current,
            jobPostDetail: current.jobPostDetail
              ? ({ ...current.jobPostDetail, isApplied: true } as ExtendedJobPost)
              : current.jobPostDetail,
          };
        case 'mark-saved':
          return {
            ...current,
            jobPostDetail: current.jobPostDetail
              ? ({ ...current.jobPostDetail, isSaved: action.value } as ExtendedJobPost)
              : current.jobPostDetail,
          };
        default:
          return current;
      }
    },
    {
      openSharePopup: false,
      openPopup: false,
      isLoading: true,
      isLoadingSave: false,
      jobPostDetail: null,
    }
  );
  const canApply =
    !isAuthenticated ||
    currentUser?.roleName === ROLES_NAME.JOB_SEEKER;

  React.useEffect(() => {
    let isActive = true;
    const getJobPostDetail = async (jobPostSlug: string | undefined) => {

      if (!jobPostSlug) return;
      try {
        const resData = await jobService.getJobPostDetailById(jobPostSlug);
        const data = resData;
        if (isActive) {
          dispatch({ type: 'set-job-post-detail', value: data as ExtendedJobPost });
        }
      } catch (error) {
        const slugValue = String(jobPostSlug || '');
        const isNumericId = /^\d+$/.test(slugValue);
        if (isNumericId) {
          try {
            const fallbackData = await companyService.getCompanyJobPostDetailById(
              Number(slugValue)
            );
            if (isActive) {
              dispatch({ type: 'set-job-post-detail', value: fallbackData as ExtendedJobPost });
            }
            return;
          } catch (fallbackError) {
            errorHandling(fallbackError as AxiosError<{ errors?: ApiError }>);
          }
        } else {
          errorHandling(error);
        }
      } finally {
        if (isActive) {
          dispatch({ type: 'set-loading', value: false });
        }
      }
    };
    getJobPostDetail(slug as string);
    return () => {
      isActive = false;
    };
  }, [slug]);

  // --- Dynamic SEO ---
  const jobDescription = state.jobPostDetail?.jobDescription || '';
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').slice(0, 160);

  useSEO({
    title: state.jobPostDetail?.jobName,
    description: state.jobPostDetail
      ? `${t('seo.jobDetail.titlePrefix')}: ${state.jobPostDetail.jobName} ${t('seo.jobDetail.at')} ${state.jobPostDetail.companyName || t('seo.jobDetail.reputableCompany')}. ${stripHtml(jobDescription)}`
      : undefined,
    image: state.jobPostDetail?.companyImageUrl || undefined,
    url: (typeof window !== 'undefined' ? window.location.href : ''),
    type: 'article',
    keywords: state.jobPostDetail
      ? `${state.jobPostDetail.jobName}, ${state.jobPostDetail.companyName || ''}, ${t('seo.jobDetail.keywordsSuffix')}`
      : undefined,
  });

  useStructuredData(
    state.jobPostDetail
      ? [
          {
            type: 'JobPosting' as const,
            title: state.jobPostDetail.jobName,
            description: jobDescription,
            companyName: state.jobPostDetail.companyName,
            companyUrl: state.jobPostDetail.companySlug
              ? `${(typeof window !== 'undefined' ? window.location.origin : '')}/cong-ty/${state.jobPostDetail.companySlug}`
              : undefined,
            companyLogoUrl: state.jobPostDetail.companyImageUrl as string | undefined,
            location: (state.jobPostDetail.locationName || (typeof state.jobPostDetail.location === 'object' ? state.jobPostDetail.location?.address : state.jobPostDetail.location)) as string,
            salary: {
              min: state.jobPostDetail.salaryMin,
              max: state.jobPostDetail.salaryMax,
              currency: 'VND',
            },
            jobType: (state.jobPostDetail.jobTypeName || state.jobPostDetail.jobType)?.toString(),
            datePosted: state.jobPostDetail.createAt || state.jobPostDetail.createdAt,
            validThrough: state.jobPostDetail.deadline,
            url: (typeof window !== 'undefined' ? window.location.href : ''),
          },
          {
            type: 'BreadcrumbList' as const,
            items: [
              { name: t('seo.jobDetail.breadcrumb.home'), url: (typeof window !== 'undefined' ? window.location.origin : '') },
              { name: t('seo.jobDetail.breadcrumb.jobs'), url: `${(typeof window !== 'undefined' ? window.location.origin : '')}/viec-lam` },
              { name: state.jobPostDetail.jobName, url: (typeof window !== 'undefined' ? window.location.href : '') },
            ],
          },
        ]
      : []
  );

  const handleSave = () => {
    const saveJobPost = async () => {
      dispatch({ type: 'set-loading-save', value: true });
      try {
        const resData = await jobService.saveJobPost(slug as string) as { isSaved: boolean };
        const isSaved = resData.isSaved;
        dispatch({ type: 'mark-saved', value: isSaved });
        toastMessages.success(
          isSaved ? t("jobDetail.savedSuccess") : t("jobDetail.unsavedSuccess")
        );
      } catch (error) {
        errorHandling(error);
      } finally {
        dispatch({ type: 'set-loading-save', value: false });
      }
    };
    saveJobPost();
  };

  const handleShowApplyForm = () => {
    dispatch({ type: 'open-popup' });
  };

  const handleMobileApplyClick = () => {
    if (!isAuthenticated) {
      push(`/${ROUTES.AUTH.LOGIN}`);
      return;
    }
    handleShowApplyForm();
  };

  return (
    <>
      {state.isLoading ? (
        <JobDetailLoading />
      ) : state.jobPostDetail === null ? (
        <NoDataCard title={t("jobDetail.noData")} />
      ) : (
        <div className={cn("mt-2", canApply ? "pb-20 md:pb-0" : "")}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-8">
              <JobDetailHeaderCard
                jobPostDetail={state.jobPostDetail}
                allConfig={allConfig}
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                isLoadingSave={state.isLoadingSave}
                onSave={handleSave}
                onShowApplyForm={handleShowApplyForm}
                onOpenSharePopup={(open) => dispatch({ type: 'open-share-popup', value: open })}
                onOpenReport={() => setOpenReportPopup(true)}
              />
              <JobSalaryInsightCard slug={slug as string} />
              <JobDetailDescriptionCard
                jobPostDetail={state.jobPostDetail}
                allConfig={allConfig}
              />
              <JobDetailContactCard jobPostDetail={state.jobPostDetail as JobPost & { companyDict?: Company; location?: Location & { lat?: number; lng?: number; } }} />
            </div>
            <div>
              <JobDetailSidebar jobPostDetail={state.jobPostDetail as JobPost & { companyDict?: Company }} />
            </div>
          </div>
        </div>
      )}

      {!state.isLoading && state.jobPostDetail && canApply && (
        <div className="fixed inset-x-0 bottom-0 z-50 block border-t border-border bg-background p-4 md:hidden">
          <Button
            className="w-full bg-primary text-white hover:bg-primary/90"
            size="lg"
            disabled={state.jobPostDetail?.isApplied}
            onClick={handleMobileApplyClick}
          >
            {state.jobPostDetail?.isApplied
              ? t("jobDetail.actions.applied")
              : t("jobDetail.actions.apply")}
          </Button>
        </div>
      )}

      <ApplyCard
        title={state.jobPostDetail?.jobName}
        jobPostId={state.jobPostDetail?.id as number}
        openPopup={state.openPopup}
        setOpenPopup={(open) => dispatch({ type: open ? 'open-popup' : 'close-popup' })}
        setIsApplySuccess={() => dispatch({ type: 'mark-applied' })}
        onApplySuccess={() => dispatch({ type: 'mark-applied' })}
      />

      <SocialNetworkSharingPopup
        {...({
          setOpenPopup: (open: boolean) => dispatch({ type: 'open-share-popup', value: open }),
          open: state.openSharePopup,
          facebook: {
            url: (typeof window !== 'undefined' ? window.location.href : ''),
            quote: state.jobPostDetail?.jobName,
            hashtag: "#Project",
          },
          facebookMessenger: {
            url: (typeof window !== 'undefined' ? window.location.href : ''),
          },
          linkedin: {
            url: (typeof window !== 'undefined' ? window.location.href : ''),
            title: state.jobPostDetail?.jobName,
            summary: state.jobPostDetail?.jobDescription,
            source: "Project",
          },
          twitter: {
            url: (typeof window !== 'undefined' ? window.location.href : ''),
            title: state.jobPostDetail?.jobName,
            hashtags: ["Project", "tuyendung"],
          },
          email: {
            url: (typeof window !== 'undefined' ? window.location.href : ''),
            subject: state.jobPostDetail?.jobName,
            body: state.jobPostDetail?.jobDescription,
          },
        } as React.ComponentProps<typeof SocialNetworkSharingPopup>)}
      />

      <TrustReportDialog
        openPopup={openReportPopup}
        setOpenPopup={setOpenReportPopup}
        targetType="job"
        jobPostId={state.jobPostDetail?.id ?? null}
        targetName={state.jobPostDetail?.jobName}
      />
    </>
  );
};

export default JobDetailPage;
