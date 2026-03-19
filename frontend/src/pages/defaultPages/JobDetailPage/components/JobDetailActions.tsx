import React from "react";
import { Button, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { alpha, useTheme } from "@mui/material/styles";

import { LoadingButton } from "@mui/lab";
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
  const nav = useNavigate();
  const theme = useTheme();
  const canApply =
    !isAuthenticated ||
    (currentUser?.roleName || currentUser?.role_name) === ROLES_NAME.JOB_SEEKER;

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      nav(`/${ROUTES.AUTH.LOGIN}`);
      return;
    }
    handleShowApplyForm();
  };

  return (
    <Stack direction="row" spacing={2}>
    {canApply && (
      <>
        <Button
          variant="contained"
          size="large"
          sx={{
            textTransform: "none",
            backgroundColor: "warning.main",
            color: "warning.contrastText",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "warning.dark",
            },
          }}
          disabled={isApplied}
          onClick={handleApplyClick}
        >
          {isApplied ? t("jobDetail.actions.applied") : t("jobDetail.actions.apply")}
        </Button>
        {isAuthenticated && (
          <LoadingButton
            onClick={handleSave}
            startIcon={isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            loading={isLoadingSave}
            loadingPosition="start"
            variant={isSaved ? "contained" : "outlined"}
            sx={{
              textTransform: "none",
              ...(isSaved
                ? {
                    backgroundColor: "secondary.main",
                    "&:hover": {
                      backgroundColor: "secondary.dark",
                    },
                  }
                : {
                    borderColor: "secondary.main",
                    color: "secondary.main",
                    "&:hover": {
                      borderColor: "secondary.dark",
                      backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                    },
                  }),
            }}
          >
            <span>{isSaved ? t("jobDetail.actions.saved") : t("jobDetail.actions.save")}</span>
          </LoadingButton>
        )}
      </>
    )}
    <Button
      variant="outlined"
      size="large"
      startIcon={<ShareIcon />}
      sx={{
        textTransform: "none",
        borderColor: "secondary.main",
        color: "secondary.main",
        "&:hover": {
          borderColor: "secondary.dark",
          backgroundColor: alpha(theme.palette.secondary.main, 0.08),
        },
      }}
      onClick={() => setOpenSharePopup(true)}
    >
      {t("jobDetail.actions.share")}
    </Button>
    </Stack>
  );
};

export default JobDetailActions;
