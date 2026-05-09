import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useRouter } from 'next/navigation';

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import FlagIcon from "@mui/icons-material/Flag";

import { ROLES_NAME, ROUTES } from "../../../../configs/constants";
import type { User } from '@/types/models';

interface JobDetailActionsProps {
  applicationState: "applied" | "available";
  saveState: "idle" | "saved" | "saving";
  handleSave: () => void;
  handleShowApplyForm: () => void;
  setOpenSharePopup: (open: boolean) => void;
  onOpenReport: () => void;
  viewer: {
    isAuthenticated: boolean;
    currentUser: User | null;
  };
}

const JobDetailActions: React.FC<JobDetailActionsProps> = ({
  applicationState,
  saveState,
  handleSave,
  handleShowApplyForm,
  setOpenSharePopup,
  onOpenReport,
  viewer,
}) => {
  const { t } = useTranslation(["public"]);
  const { push } = useRouter();
  const isApplied = applicationState === "applied";
  const isSaved = saveState === "saved";
  const isLoadingSave = saveState === "saving";
  const canApply =
    !viewer.isAuthenticated ||
    viewer.currentUser?.roleName === ROLES_NAME.JOB_SEEKER;

  const handleApplyClick = () => {
    if (!viewer.isAuthenticated) {
      push(`/${ROUTES.AUTH.LOGIN}`);
      return;
    }
    handleShowApplyForm();
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {canApply && (
        <>
          <Button
            variant="default"
            size="lg"
            className="bg-primary font-semibold text-white"
            disabled={isApplied}
            onClick={handleApplyClick}
          >
            {isApplied ? t("jobDetail.actions.applied") : t("jobDetail.actions.apply")}
          </Button>
          {viewer.isAuthenticated && (
            <Button
              onClick={handleSave}
              variant={isSaved ? "default" : "outline"}
              size="lg"
              disabled={isLoadingSave}
              className={
                isSaved
                  ? "bg-secondary text-white"
                  : "border-primary/25 text-primary hover:bg-primary/5"
              }
            >
              {isLoadingSave ? (
                <span className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : isSaved ? (
                <FavoriteIcon fontSize="small" className="mr-2" />
              ) : (
                <FavoriteBorderIcon fontSize="small" className="mr-2" />
              )}
              <span>{isSaved ? t("jobDetail.actions.saved") : t("jobDetail.actions.save")}</span>
            </Button>
          )}
        </>
      )}
      <Button
        variant="outline"
        size="lg"
        onClick={() => setOpenSharePopup(true)}
        className="border-primary/25 text-primary hover:bg-primary/5"
      >
        <ShareIcon fontSize="small" className="mr-2" />
        {t("jobDetail.actions.share")}
      </Button>
      {viewer.isAuthenticated && (
        <Button
          variant="outline"
          size="lg"
          onClick={onOpenReport}
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          <FlagIcon fontSize="small" className="mr-2" />
          {t("jobDetail.actions.report", "Report")}
        </Button>
      )}
    </div>
  );
};

export default JobDetailActions;
