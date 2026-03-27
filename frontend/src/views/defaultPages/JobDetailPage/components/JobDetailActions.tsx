import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useRouter } from 'next/navigation';

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";

import { ROLES_NAME, ROUTES } from "../../../../configs/constants";

interface JobDetailActionsProps {
  isApplied: boolean;
  isSaved: boolean;
  isLoadingSave: boolean;
  handleSave: () => void;
  handleShowApplyForm: () => void;
  setOpenSharePopup: (open: boolean) => void;
  isAuthenticated: boolean;
  currentUser: any;
}

const JobDetailActions: React.FC<JobDetailActionsProps> = ({
  isApplied,
  isSaved,
  isLoadingSave,
  handleSave,
  handleShowApplyForm,
  setOpenSharePopup,
  isAuthenticated,
  currentUser,
}) => {
  const { t } = useTranslation(["public"]);
  const nav = useRouter();
  const canApply =
    !isAuthenticated ||
    currentUser?.roleName === ROLES_NAME.JOB_SEEKER;

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      nav.push(`/${ROUTES.AUTH.LOGIN}`);
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
            className="bg-amber-500 font-semibold text-white hover:bg-amber-600"
            disabled={isApplied}
            onClick={handleApplyClick}
          >
            {isApplied ? t("jobDetail.actions.applied") : t("jobDetail.actions.apply")}
          </Button>
          {isAuthenticated && (
            <Button
              onClick={handleSave}
              variant={isSaved ? "default" : "outline"}
              size="lg"
              disabled={isLoadingSave}
              className={
                isSaved
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "border-purple-600 text-purple-600 hover:bg-purple-50"
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
        className="border-purple-600 text-purple-600 hover:bg-purple-50"
      >
        <ShareIcon fontSize="small" className="mr-2" />
        {t("jobDetail.actions.share")}
      </Button>
    </div>
  );
};

export default JobDetailActions;
