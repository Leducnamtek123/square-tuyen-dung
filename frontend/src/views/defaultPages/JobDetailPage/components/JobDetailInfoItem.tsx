import React from "react";
import { useTranslation } from "react-i18next";

interface JobDetailInfoItemProps {
  title: string;
  value: React.ReactNode;
}

const JobDetailInfoItem: React.FC<JobDetailInfoItemProps> = ({ title, value }) => {
  const { t } = useTranslation(["public", "common"]);
  const displayValue = typeof value === "string"
    ? t(`choices.${value}`, { ns: "common", defaultValue: value })
    : value;

  return (
    <div>
      <p className="pb-1 text-sm font-normal text-muted-foreground">
        {title}
      </p>
      <p className="text-sm leading-6 text-foreground">
        {value ? (
          <span className="font-semibold">
            {displayValue}
          </span>
        ) : (
          <span className="text-xs italic text-zinc-300">
            {t("jobDetail.notUpdated")}
          </span>
        )}
      </p>
    </div>
  );
};

export default JobDetailInfoItem;
