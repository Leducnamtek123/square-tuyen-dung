import React from "react";
import { useTranslation } from "react-i18next";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import Map from "../../../../components/Common/Map";
import type { Location } from '@/types/models';
import type { Company } from '@/types/models';
import type { JobPost } from '@/types/models';

interface JobDetailContactCardProps {
  jobPostDetail: JobPost & { companyDict?: Company; location?: Location & { lat?: number; lng?: number; } };
}

const JobDetailContactCard: React.FC<JobDetailContactCardProps> = ({ jobPostDetail }) => {
  const { t } = useTranslation(["public"]);
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold">
            {t("jobDetail.contactInfo")}
          </h3>
          <div className="mt-1 h-1 w-12 rounded bg-primary" />

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3 transition hover:translate-x-2 hover:bg-primary/10">
              <PersonIcon className="text-primary" fontSize="medium" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("jobDetail.contactPerson")}
                </p>
                <p className="text-sm font-medium">
                  {jobPostDetail?.contactPersonName || t("jobDetail.notUpdated")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3 transition hover:translate-x-2 hover:bg-primary/10">
              <EmailIcon className="text-primary" fontSize="medium" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("jobDetail.contactEmail")}
                </p>
                <p className="text-sm font-medium">
                  {jobPostDetail?.contactPersonEmail || t("jobDetail.notUpdated")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3 transition hover:translate-x-2 hover:bg-primary/10">
              <PhoneIcon className="text-primary" fontSize="medium" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("jobDetail.contactPhone")}
                </p>
                <p className="text-sm font-medium">
                  {jobPostDetail?.contactPersonPhone || t("jobDetail.notUpdated")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3 transition hover:translate-x-2 hover:bg-primary/10">
              <LocationOnIcon className="text-primary" fontSize="medium" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("jobDetail.address")}
                </p>
                <p className="text-sm font-medium">
                  {jobPostDetail?.location?.address || t("jobDetail.notUpdated")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">
            {t("jobDetail.map")}
          </h3>
          <div className="mt-1 h-1 w-12 rounded bg-primary" />
          <div className="mt-6 overflow-hidden rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <Map
              title={jobPostDetail?.jobName}
              subTitle={jobPostDetail?.location?.address}
              latitude={jobPostDetail?.location?.lat}
              longitude={jobPostDetail?.location?.lng}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailContactCard;
