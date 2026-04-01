import React from "react";
import { useTranslation } from "react-i18next";

import JobDetailInfoItem from "./JobDetailInfoItem";

import type { JobPost, SystemConfig } from '../../../../types/models';
import type { Company } from '@/types/models';

interface JobDetailDescriptionCardProps {
  jobPostDetail: JobPost & { companyDict?: Company };
  allConfig: SystemConfig | null;
}

const JobDetailDescriptionCard: React.FC<JobDetailDescriptionCardProps> = ({ jobPostDetail, allConfig }) => {
  const { t } = useTranslation(["public"]);
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold">
            {t("jobDetail.description")}
          </h3>
          <div className="mt-1 h-1 w-12 rounded bg-purple-600" />
          <div
            className="mt-6 text-sm leading-6"
            dangerouslySetInnerHTML={{
              __html: jobPostDetail?.jobDescription || '',
            }}
          />
        </div>

        {/* Job Requirements */}
        <div>
          <h3 className="text-lg font-bold">
            {t("jobDetail.requirements")}
          </h3>
          <div className="mt-1 h-1 w-12 rounded bg-purple-600" />
          <div
            className="mt-6 text-sm leading-6"
            dangerouslySetInnerHTML={{
              __html: jobPostDetail?.jobRequirement || '',
            }}
          />
        </div>

        {/* Benefits */}
        <div>
          <h3 className="text-lg font-bold">
            {t("jobDetail.benefits")}
          </h3>
          <div className="mt-1 h-1 w-12 rounded bg-purple-600" />
          <div
            className="mt-6 text-sm leading-6"
            dangerouslySetInnerHTML={{
              __html: jobPostDetail?.benefitsEnjoyed || '',
            }}
          />
        </div>

        {/* Additional Info */}
        <div className="pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <JobDetailInfoItem
              title={t("jobDetail.career")}
              value={allConfig?.careerDict?.[String(jobPostDetail?.career)]}
            />
            <JobDetailInfoItem
              title={t("jobDetail.workplaceType")}
              value={
                allConfig?.typeOfWorkplaceDict?.[
                  String(jobPostDetail?.typeOfWorkplace)
                ]
              }
            />
            <JobDetailInfoItem
              title={t("jobDetail.academicLevel")}
              value={
                allConfig?.academicLevelDict?.[String(jobPostDetail?.academicLevel)]
              }
            />
            <JobDetailInfoItem
              title={t("jobDetail.quantity")}
              value={jobPostDetail?.quantity}
            />
            <JobDetailInfoItem
              title={t("jobDetail.location")}
              value={allConfig?.cityDict?.[String(jobPostDetail?.location?.city)]}
            />
            <JobDetailInfoItem
              title={t("jobDetail.genderRequired")}
              value={allConfig?.genderDict?.[String(jobPostDetail?.genderRequired)]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailDescriptionCard;
