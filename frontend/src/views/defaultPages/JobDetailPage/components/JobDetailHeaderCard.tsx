import React from "react";
import { useTranslation } from "react-i18next";
import Link from 'next/link';
import dayjs from "dayjs";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faEye,
  faClockFour,
} from "@fortawesome/free-solid-svg-icons";

import QRCodeBox from "../../../../components/Common/QRCodeBox";
import MuiImageCustom from "../../../../components/Common/MuiImageCustom";
import { salaryString } from "../../../../utils/customData";
import { ROUTES } from "../../../../configs/constants";
import { formatRoute } from "../../../../utils/funcUtils";
import JobDetailActions from "./JobDetailActions";
import JobDetailInfoItem from "./JobDetailInfoItem";
import type { JobPost, SystemConfig, User } from '../../../../types/models';

interface JobDetailHeaderCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jobPostDetail: JobPost | any;
  allConfig: SystemConfig | null;
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoadingSave: boolean;
  onSave: () => void;
  onShowApplyForm: () => void;
  onOpenSharePopup: (open: boolean) => void;
}

const JobDetailHeaderCard: React.FC<JobDetailHeaderCardProps> = ({
  jobPostDetail,
  allConfig,
  isAuthenticated,
  currentUser,
  isLoadingSave,
  onSave,
  onShowApplyForm,
  onOpenSharePopup,
}) => {
  const { t } = useTranslation(["public"]);
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <MuiImageCustom
            width={75}
            height={75}
            src={jobPostDetail?.companyDict?.companyImageUrl}
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              padding: 4,
            }}
          />
          <div className="min-w-0 flex-1">
            <Link
              href={`/${formatRoute(
                ROUTES.JOB_SEEKER.COMPANY_DETAIL,
                jobPostDetail?.companyDict?.slug
              )}`}
              className="text-lg font-semibold text-foreground hover:underline"
            >
              {jobPostDetail?.companyDict?.companyName}
            </Link>
            <p className="text-sm text-muted-foreground">
              {(allConfig?.employeeSizeDict as any)?.[
                jobPostDetail?.companyDict?.employeeSize
              ] || (
                <span className="text-xs italic text-gray-300">
                  {t("jobDetail.notUpdated")}
                </span>
              )}
            </p>
          </div>
          <div className="hidden sm:block">
            <QRCodeBox value={(typeof window !== 'undefined' ? window.location.href : '') || "-"} size={75} />
          </div>
        </div>

        <div className="h-px w-full bg-border" />

        <div>
          <h2 className="text-2xl font-semibold">
            {jobPostDetail?.jobName}
          </h2>

          <div className="mt-4 flex flex-wrap gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faCalendarDay} className="text-purple-600" />
              <span>
                {t("jobDetail.deadline")}: {dayjs(jobPostDetail?.deadline).format("DD/MM/YYYY")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faEye} className="text-purple-600" />
              <span>
                {jobPostDetail?.views} {t("jobDetail.views")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faClockFour} className="text-purple-600" />
              <span>
                {t("jobDetail.postedDate")}: {dayjs(jobPostDetail?.createAt).format("DD/MM/YYYY")}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <JobDetailActions
            isApplied={jobPostDetail.isApplied}
            isSaved={jobPostDetail.isSaved}
            isLoadingSave={isLoadingSave}
            handleSave={onSave}
            handleShowApplyForm={onShowApplyForm}
            setOpenSharePopup={onOpenSharePopup}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            />
          </div>
        </div>

        <div className="h-px w-full bg-border" />

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <JobDetailInfoItem
            title={t("jobDetail.salary")}
            value={salaryString(
              jobPostDetail?.salaryMin,
              jobPostDetail?.salaryMax
            )}
          />
          <JobDetailInfoItem
            title={t("jobDetail.experience")}
            value={(allConfig?.experienceDict as any)?.[jobPostDetail?.experience]}
          />
          <JobDetailInfoItem
            title={t("jobDetail.position")}
            value={(allConfig?.positionDict as any)?.[jobPostDetail?.position]}
          />
          <JobDetailInfoItem
            title={t("jobDetail.jobType")}
            value={(allConfig?.jobTypeDict as any)?.[jobPostDetail?.jobType]}
          />
        </div>
      </div>
    </div>
  );
};

export default JobDetailHeaderCard;
