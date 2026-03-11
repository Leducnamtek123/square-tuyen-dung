import React from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Box, Card, Divider, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faEye,
  faClockFour,
} from "@fortawesome/free-solid-svg-icons";

import QRCodeBox from "../../../../components/QRCodeBox";
import MuiImageCustom from "../../../../components/MuiImageCustom";
import { salaryString } from "../../../../utils/customData";
import { ROUTES } from "../../../../configs/constants";
import { formatRoute } from "../../../../utils/funcUtils";
import JobDetailActions from "./JobDetailActions";
import JobDetailInfoItem from "./JobDetailInfoItem";

const JobDetailHeaderCard = ({
  jobPostDetail,
  allConfig,
  isAuthenticated,
  currentUser,
  isLoadingSave,
  onSave,
  onShowApplyForm,
  onOpenSharePopup,
}) => {
  return (
    <Card
      sx={{
        py: 2,
        px: { xs: 1.5, sm: 1.5, md: 2, lg: 4, xl: 4 },
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <Stack>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box>
              <MuiImageCustom
                width={75}
                height={75}
                src={jobPostDetail?.companyDict?.companyImageUrl}
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  p: 0.5,
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                component={Link}
                to={`/${formatRoute(
                  ROUTES.JOB_SEEKER.COMPANY_DETAIL,
                  jobPostDetail?.companyDict?.slug
                )}`}
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                {jobPostDetail?.companyDict?.companyName}
              </Typography>
              <Typography variant="subtitle2" gutterBottom color="GrayText">
                {allConfig?.employeeSizeDict[
                  jobPostDetail?.companyDict?.employeeSize
                ] || (
                  <span
                    style={{
                      color: "#e0e0e0",
                      fontStyle: "italic",
                      fontSize: 13,
                    }}
                  >
                    ChÆ°a cáº­p nháº­t
                  </span>
                )}
              </Typography>
            </Box>
            <Box>
              <QRCodeBox value={window.location.href || "-"} size={75} />
            </Box>
          </Stack>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="h5" sx={{ fontSize: 26, mb: 2 }}>
            {jobPostDetail?.jobName}
          </Typography>

          <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <FontAwesomeIcon
                icon={faCalendarDay}
                style={{
                  marginRight: 6,
                  fontSize: 15,
                  color: "#9c27b0",
                }}
              />
              Háº¡n ná»™p: {dayjs(jobPostDetail?.deadline).format("DD/MM/YYYY")}
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <FontAwesomeIcon
                icon={faEye}
                style={{
                  marginRight: 6,
                  fontSize: 15,
                  color: "#9c27b0",
                }}
              />
              {jobPostDetail?.views} lÆ°á»£t xem
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <FontAwesomeIcon
                icon={faClockFour}
                style={{
                  marginRight: 6,
                  fontSize: 15,
                  color: "#9c27b0",
                }}
              />
              ÄÄƒng ngÃ y:{" "}
              {dayjs(jobPostDetail?.createAt).format("DD/MM/YYYY")}
            </Typography>
          </Stack>

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
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <JobDetailInfoItem
              title="Má»©c lÆ°Æ¡ng"
              value={salaryString(
                jobPostDetail?.salaryMin,
                jobPostDetail?.salaryMax
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <JobDetailInfoItem
              title="Kinh nghiá»‡m"
              value={allConfig?.experienceDict[jobPostDetail?.experience]}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <JobDetailInfoItem
              title="Cáº¥p báº­c"
              value={allConfig?.positionDict[jobPostDetail?.position]}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}>
            <JobDetailInfoItem
              title="HÃ¬nh thá»©c"
              value={allConfig?.jobTypeDict[jobPostDetail?.jobType]}
            />
          </Grid>
        </Grid>
      </Stack>
    </Card>
  );
};

export default JobDetailHeaderCard;
