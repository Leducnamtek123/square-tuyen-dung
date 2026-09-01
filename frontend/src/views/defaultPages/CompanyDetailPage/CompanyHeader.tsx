import React from 'react';
import { Box, Card, Stack, Typography, Button, Chip } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faUsers, faCalendarDays } from "@fortawesome/free-solid-svg-icons";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ShareIcon from "@mui/icons-material/Share";
import FlagIcon from "@mui/icons-material/Flag";
import VerifiedIcon from "@mui/icons-material/Verified";
import dayjs from "dayjs";

import { IMAGES, ROLES_NAME } from "@/configs/constants";
import QRCodeBox from "@/components/Common/QRCodeBox";
import MuiImageCustom from "@/components/Common/MuiImageCustom";
import { tConfig } from '@/utils/tConfig';
import { Theme } from "@mui/material/styles";
import type { TFunction } from "i18next";
import type { CompanyDetailProps } from "./types";
import type { SystemConfig, User } from '@/types/models';

interface CompanyHeaderProps {
  companyDetail: CompanyDetailProps;
  allConfig: SystemConfig | null;
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoadingFollow: boolean;
  handleFollow: () => void;
  setOpenSharePopup: (val: boolean) => void;
  setOpenReportPopup: (val: boolean) => void;
  t: TFunction;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  companyDetail,
  allConfig,
  isAuthenticated,
  currentUser,
  isLoadingFollow,
  handleFollow,
  setOpenSharePopup,
  setOpenReportPopup,
  t
}) => {
  return (
    <Card sx={{ overflow: "visible", borderRadius: { xs: 2.5, md: 3 }, boxShadow: (theme: Theme) => (theme as Theme & { customShadows?: { medium?: number } }).customShadows?.medium || 2, mt: { xs: 1.5, sm: 3, md: 4 } }}>
      <Box sx={{ width: '100%', height: { xs: 150, sm: 200, md: 250 }, overflow: 'hidden', bgcolor: '#0f172a' }}>
        <MuiImageCustom
          src={(companyDetail?.companyCoverImageUrl || IMAGES.companyCoverDefault || IMAGES.coverImageDefault) as string}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          duration={1500}
        />
      </Box>
      <Box sx={{ p: { xs: 2, sm: 3 }, pt: 0.5 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2, md: 3 }}
          alignItems="center"
        >
          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <Box
              sx={{
                width: { xs: 84, sm: 104, md: 120 },
                height: { xs: 84, sm: 104, md: 120 },
                mt: { xs: -5.5, sm: -6.5, md: -7.5 },
                borderRadius: { xs: 2.5, md: 3 },
                p: 0.75,
                bgcolor: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '3px solid #ffffff',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <MuiImageCustom
                src={(companyDetail?.companyImageUrl || IMAGES.companyLogoDefault) as string}
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }}
                duration={1500}
              />
            </Box>
          </Box>
          <Box flex={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  textAlign: { xs: "center", md: "left" },
                  color: "#0f172a",
                  fontWeight: 800,
                  fontSize: { xs: '1.25rem', sm: '1.6rem', md: '1.95rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                {companyDetail.companyName}
              </Typography>
              {companyDetail.isVerified && (
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                    label={t("companyDetail.verified")}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ ml: { xs: 0, md: 1 }, mb: 1, fontWeight: 600 }}
                  />
                </Box>
              )}
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1.25, sm: 2.5 }}
              sx={{
                justifyContent: { xs: 'center', md: 'flex-start' },
                alignItems: { xs: 'center', md: 'flex-start' },
                "& .MuiTypography-root": {
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: { xs: '0.85rem', sm: '0.925rem' },
                  "& svg": { color: "#2563eb", fontSize: "1.1rem" },
                },
              }}
            >
              <Typography variant="subtitle1">
                <FontAwesomeIcon icon={faBriefcase} />
                {companyDetail.fieldOperation}
              </Typography>
              <Typography variant="subtitle1">
                <FontAwesomeIcon icon={faUsers} />
                {tConfig(allConfig?.employeeSizeDict?.[String(companyDetail.employeeSize)]) || (
                  <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: 13 }}>
                    0
                  </span>
                )}
              </Typography>
              <Typography variant="subtitle1">
                <FontAwesomeIcon icon={faCalendarDays} />
                {t("companyDetail.since", { year: dayjs(companyDetail?.since).format("YYYY") })}
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ pt: 1, display: { xs: 'none', md: 'block' } }}>
            <QRCodeBox value={(typeof window !== 'undefined' ? window.location.href : '') || "-"} size={80} label={t("companyDetail.shareWithQr")} />
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row", md: "column" }}
            spacing={1.25}
            justifyContent="center"
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            {(!isAuthenticated || currentUser?.roleName === ROLES_NAME.JOB_SEEKER) && (
              <LoadingButton
                onClick={handleFollow}
                startIcon={companyDetail.isFollowed ? <BookmarkIcon sx={{ color: companyDetail.isFollowed ? '#2563eb' : 'inherit' }} /> : <BookmarkBorderIcon />}
                loading={isLoadingFollow}
                loadingPosition="start"
                variant={companyDetail.isFollowed ? "outlined" : "contained"}
                fullWidth
                sx={{
                  minWidth: { xs: '100%', md: 160 },
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  py: 1,
                  ...(companyDetail.isFollowed
                    ? {
                        bgcolor: '#eff6ff',
                        color: '#2563eb',
                        borderColor: '#bfdbfe',
                        '&:hover': { bgcolor: '#dbeafe', borderColor: '#93c5fd' },
                      }
                    : {
                        bgcolor: '#2563eb',
                        color: '#ffffff',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                        '&:hover': { bgcolor: '#1d4ed8' },
                      }),
                }}
              >
                <span>
                  {companyDetail.isFollowed ? t("companyDetail.followed") : t("companyDetail.follow")}{" "}
                  ({companyDetail.followNumber})
                </span>
              </LoadingButton>
            )}

            {/* Secondary Actions row on mobile, stacked on desktop */}
            <Stack direction="row" spacing={1.25} sx={{ width: '100%' }}>
              <Button
                variant="outlined"
                startIcon={<ShareIcon sx={{ fontSize: 18, color: '#64748b' }} />}
                onClick={() => setOpenSharePopup(true)}
                fullWidth
                sx={{
                  minWidth: { xs: 0, md: 160 },
                  flex: 1,
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  py: 0.85,
                  bgcolor: '#ffffff',
                  color: '#334155',
                  borderColor: '#e2e8f0',
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                }}
              >
                {t("companyDetail.share")}
              </Button>
              {(!isAuthenticated || currentUser?.roleName === ROLES_NAME.JOB_SEEKER) && (
                <Button
                  variant="outlined"
                  startIcon={<FlagIcon sx={{ fontSize: 18, color: '#64748b' }} />}
                  onClick={() => setOpenReportPopup(true)}
                  fullWidth
                  sx={{
                    minWidth: { xs: 0, md: 160 },
                    flex: 1,
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    py: 0.85,
                    bgcolor: '#ffffff',
                    color: '#64748b',
                    borderColor: '#e2e8f0',
                    '&:hover': { bgcolor: '#fef2f2', color: '#ef4444', borderColor: '#fca5a5', '& svg': { color: '#ef4444' } },
                  }}
                >
                  {t("companyDetail.report")}
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};
export default CompanyHeader;
