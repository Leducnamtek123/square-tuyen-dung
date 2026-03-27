import React from 'react';
import { Box, Card, Stack, Typography, Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faUsers, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ShareIcon from "@mui/icons-material/Share";
import dayjs from "dayjs";

import { IMAGES, ROLES_NAME } from "../../../configs/constants";
import QRCodeBox from "../../../components/Common/QRCodeBox";
import MuiImageCustom from "../../../components/Common/MuiImageCustom";
import { tConfig } from '../../../utils/tConfig';

interface CompanyHeaderProps {
  companyDetail: any;
  allConfig: any;
  isAuthenticated: boolean;
  currentUser: any;
  isLoadingFollow: boolean;
  handleFollow: () => void;
  setOpenSharePopup: (val: boolean) => void;
  t: any;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  companyDetail,
  allConfig,
  isAuthenticated,
  currentUser,
  isLoadingFollow,
  handleFollow,
  setOpenSharePopup,
  t
}) => {
  return (
    <Card sx={{ overflow: "visible", boxShadow: (theme: any) => theme.customShadows?.medium || 2, mt: 3 }}>
      <Box>
        <MuiImageCustom
          src={companyDetail?.companyCoverImageUrl || IMAGES.companyCoverDefault || IMAGES.coverImageDefault}
          sx={{ maxHeight: 250, minHeight: 200 }}
          duration={1500}
          width="100%"
          fit="cover"
        />
      </Box>
      <Box sx={{ p: 3, pt: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "column", md: "row", lg: "row", xl: "row" }}
          spacing={3}
          alignItems="center"
        >
          <Box>
            <MuiImageCustom
              src={companyDetail.companyImageUrl || IMAGES.companyLogoDefault}
              sx={{
                borderRadius: 2,
                mt: -7,
                p: 1,
                bgcolor: "white",
                boxShadow: (theme: any) => theme.customShadows?.small || 1,
                border: "2px solid #fff",
              }}
              duration={1500}
              width={120}
              height={120}
            />
          </Box>
          <Box flex={1}>
            <Box>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  textAlign: { xs: "center", sm: "center", md: "left" },
                  color: "primary.main",
                  fontWeight: 600,
                }}
              >
                {companyDetail.companyName}
              </Typography>
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              sx={{
                "& .MuiTypography-root": {
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "& svg": { color: "primary.main", fontSize: "1.2rem" },
                },
              }}
            >
              <Typography variant="subtitle1">
                <FontAwesomeIcon icon={faBriefcase} />
                {companyDetail.fieldOperation}
              </Typography>
              <Typography variant="subtitle1">
                <FontAwesomeIcon icon={faUsers} />
                {tConfig((allConfig as any)?.employeeSizeDict?.[companyDetail.employeeSize]) || (
                  <span style={{ color: "#e0e0e0", fontStyle: "italic", fontSize: 13 }}>
                    {t("companyDetail.notUpdated")}
                  </span>
                )}
              </Typography>
              <Typography variant="subtitle1">
                <FontAwesomeIcon icon={faCalendarDays} />
                {t("companyDetail.since", { year: dayjs(companyDetail?.since).format("YYYY") })}
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ pt: 1 }}>
            <QRCodeBox value={(typeof window !== 'undefined' ? window.location.href : '') || "-"} size={80} label={t("companyDetail.shareWithQr")} />
          </Box>
          <Stack spacing={1.5} justifyContent="center">
            {isAuthenticated && currentUser?.roleName === ROLES_NAME.JOB_SEEKER && (
              <LoadingButton
                onClick={handleFollow}
                startIcon={companyDetail.isFollowed ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                loading={isLoadingFollow}
                loadingPosition="start"
                variant={companyDetail.isFollowed ? "contained" : "outlined"}
                color="primary"
                sx={{ minWidth: 160, borderRadius: 2, boxShadow: "none" }}
              >
                <span>
                  {companyDetail.isFollowed ? t("companyDetail.followed") : t("companyDetail.follow")}{" "}
                  ({companyDetail.followNumber})
                </span>
              </LoadingButton>
            )}
            <Button
              variant="contained"
              color="secondary"
              startIcon={<ShareIcon />}
              onClick={() => setOpenSharePopup(true)}
              sx={{ minWidth: 160, borderRadius: 2, boxShadow: "none" }}
            >
              {t("companyDetail.share")}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};
export default CompanyHeader;
