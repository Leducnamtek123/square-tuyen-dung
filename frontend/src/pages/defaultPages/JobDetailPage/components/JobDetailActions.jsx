import React from "react";
import { Button, Stack } from "@mui/material";

import { LoadingButton } from "@mui/lab";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";

import { ROLES_NAME } from "../../../../configs/constants";

const JobDetailActions = ({
  isApplied,
  isSaved,
  isLoadingSave,
  handleSave,
  handleShowApplyForm,
  setOpenSharePopup,
  isAuthenticated,
  currentUser,
}) => (
  <Stack direction="row" spacing={2}>
    {isAuthenticated && currentUser?.roleName === ROLES_NAME.JOB_SEEKER && (
      <>
        <Button
          variant="contained"
          size="large"
          sx={{
            textTransform: "none",
            background: "linear-gradient(45deg, #FF9800 30%, #FF5722 90%)",
            color: "white",
            fontWeight: 600,
            "&:hover": {
              background: "linear-gradient(45deg, #FB8C00 30%, #F4511E 90%)",
            },
          }}
          disabled={isApplied}
          onClick={handleShowApplyForm}
        >
          {isApplied ? "Da ung tuyen" : "Nop ho so"}
        </Button>
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
                  backgroundColor: "#9c27b0",
                  "&:hover": {
                    backgroundColor: "#7b1fa2",
                  },
                }
              : {
                  borderColor: "#9c27b0",
                  color: "#9c27b0",
                  "&:hover": {
                    borderColor: "#7b1fa2",
                    backgroundColor: "rgba(156,39,176,0.04)",
                  },
                }),
          }}
        >
          <span>{isSaved ? "Da luu" : "Luu tin"}</span>
        </LoadingButton>
      </>
    )}
    <Button
      variant="outlined"
      size="large"
      startIcon={<ShareIcon />}
      sx={{
        textTransform: "none",
        borderColor: "#9c27b0",
        color: "#9c27b0",
        "&:hover": {
          borderColor: "#7b1fa2",
          backgroundColor: "rgba(156,39,176,0.04)",
        },
      }}
      onClick={() => setOpenSharePopup(true)}
    >
      Chia se
    </Button>
  </Stack>
);

export default JobDetailActions;
