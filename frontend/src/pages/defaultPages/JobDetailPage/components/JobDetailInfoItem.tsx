import React from "react";
import { useTranslation } from "react-i18next";

interface JobDetailInfoItemProps {
  title: string;
  value: React.ReactNode;
}

const JobDetailInfoItem: React.FC<JobDetailInfoItemProps> = ({ title, value }) => {
  const { t } = useTranslation(["public", "common"]);
  return (
    <div>
      <p className="pb-1 text-sm font-normal text-muted-foreground">
        {title}
      </p>
      <p className="text-sm leading-6 text-foreground">
        {value ? (
          <span className="font-semibold">
            {typeof value === "string" ? t([`choices.${value}`, value]) : value}
          </span>
        ) : (
          <span className="text-xs italic text-gray-300">
            {t("jobDetail.notUpdated")}
          </span>
        )}
      </p>
    </div>
  );
};

export default JobDetailInfoItem;
