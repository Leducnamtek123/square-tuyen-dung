import React from "react";
import { useTranslation } from "react-i18next";

import FilterJobPostCard from "../../../components/defaults/FilterJobPostCard";

interface JobDetailSidebarProps {
  jobPostDetail: Record<string, unknown> | import('@/types/models').JobPost & { companyDict?: import('@/types/models').Company };
}

const JobDetailSidebar: React.FC<JobDetailSidebarProps> = ({ jobPostDetail }) => {
  const { t } = useTranslation(["public"]);
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t("jobDetail.similarJobs")}</h3>
        <div className="h-1 w-28 rounded bg-blue-600" />
        <div>
          <FilterJobPostCard
            params={{
              excludeSlug: jobPostDetail?.slug,
              // cityId: jobPostDetail?.location?.city,
              // careerId: jobPostDetail?.career
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default JobDetailSidebar;
