import * as React from "react";
import { useAppSelector } from '@/redux/hooks';
import { useDispatch } from "react-redux";
import { useRouter } from 'next/navigation';
import { Box, Chip, Stack, Typography, Button, Divider, Tooltip, Skeleton, CircularProgress } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import dayjs from "dayjs";
import HelpIcon from "@mui/icons-material/Help";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import {
  faCalendar,
  faDollarSign,
  faMagicWandSparkles,
  faUser,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CV_TYPES, ROUTES, APP_NAME } from "../../../../configs/constants";
import BackdropLoading from "../../../../components/Common/Loading/BackdropLoading";
import toastMessages from "../../../../utils/toastMessages";
import errorHandling from "../../../../utils/errorHandling";
import MuiImageCustom from "../../../../components/Common/MuiImageCustom";
import toSlug, { salaryString } from "../../../../utils/customData";
import NoDataCard from "../../../../components/Common/NoDataCard";
import { PDFDownloadLink } from "@react-pdf/renderer";
const PDFDownloadLinkAny = PDFDownloadLink as React.ElementType;
import CVDoc from "../../../../components/Features/CVDoc";
import { reloadResume } from "../../../../redux/profileSlice";
import jobSeekerProfileService from "../../../../services/jobSeekerProfileService";
import resumeService from "../../../../services/resumeService";
import { formatRoute } from "../../../../utils/funcUtils";
import ColorPickerDialog from '../../../../components/Common/ColorPickerDialog';
import { useTranslation } from "react-i18next";
import { tConfig } from '../../../../utils/tConfig';
import { useConfig } from '@/hooks/useConfig';
import type { AxiosError } from "axios";

interface BoxProfileResume {
  slug: string;
  title: string;
  isActive: boolean;
  user?: { fullName?: string };
  experience?: number;
  position?: number;
  salaryMin?: number;
  salaryMax?: number;
  updateAt?: string;
  [key: string]: unknown;
}

const Loading = () => {
  return (
    <Grid container spacing={3}>
      <Grid>
        <Stack direction="row" alignItems="center" spacing={3}>
          <Skeleton width={130} height={130} variant="circular" />
          <Box sx={{ display: { xs: "none" } }}>
            <Typography variant="h6"><Skeleton /></Typography>
            <Typography variant="h6"><Skeleton /></Typography>
          </Box>
        </Stack>
      </Grid>
      <Grid flex={1}>
        <Grid container spacing={1}>
          <Grid size={12}><Skeleton /></Grid>
          <Grid size={12}><Skeleton /></Grid>
          <Grid size={12}><Skeleton /></Grid>
          <Grid size={12}><Skeleton /></Grid>
        </Grid>
      </Grid>
      <Grid size={12}>
        <Typography><Skeleton /></Typography>
      </Grid>
      <Grid size={12}>
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Skeleton width={120} height={60} />
        </Stack>
      </Grid>
    </Grid>
  );
};

interface BoxProfileProps {
  title: string;
}

const BoxProfile = ({ title }: BoxProfileProps) => {
  const { t } = useTranslation(["jobSeeker", "common"]);
  const dispatch = useDispatch();
  const nav = useRouter();

  const {
    resume: { reloadCounter },
  } = useAppSelector((state) => state.profile);

  const { currentUser } = useAppSelector((state) => state.user);
  const { allConfig } = useConfig();

  const [isLoadingResume, setIsLoadingResume] = React.useState(false);
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const [resume, setResume] = React.useState<BoxProfileResume | null>(null);
  const [openColorPicker, setOpenColorPicker] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState('#140861');
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const blobRef = React.useRef<Blob | null>(null);

  React.useEffect(() => {
    const getOnlineProfile = async (jobSeekerProfileId: string, params: Record<string, unknown>) => {
      setIsLoadingResume(true);
      try {
        const resData = await jobSeekerProfileService.getResumes(
          jobSeekerProfileId,
          params
        );
        const parsedResumes = ((resData as unknown as { results?: BoxProfileResume[] })?.results || []) as BoxProfileResume[];
        setResume(parsedResumes.length > 0 ? parsedResumes[0] : null);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingResume(false);
      }
    };
    
    const userPayload = currentUser as unknown as { jobSeekerProfile?: { id?: string }; jobSeekerProfileId?: string };
    if (userPayload?.jobSeekerProfile?.id) {
      getOnlineProfile(userPayload.jobSeekerProfile.id, {
        resumeType: CV_TYPES.cvWebsite,
      });
    } else if (userPayload?.jobSeekerProfileId) {
      getOnlineProfile(userPayload.jobSeekerProfileId, {
        resumeType: CV_TYPES.cvWebsite,
      });
    }
  }, [currentUser, reloadCounter]);

  const handleActive = (slug: string) => {
    const activeResume = async (resumeSlug: string) => {
      setIsFullScreenLoading(true);
      try {
        await resumeService.activeResume(resumeSlug);
        dispatch(reloadResume());
        toastMessages.success(t("jobSeeker:profile.messages.profileStatusUpdateSuccess"));
      } catch (error) {
        // Casting through any to satisfy errorHandling strict AxiosError<{errors: ApiError}> generic type requirements
        errorHandling(error as any);
      } finally {
        setIsFullScreenLoading(false);
      }
    };
    activeResume(slug);
  };

  const handleColorSelect = async (color: string) => {
    setSelectedColor(color);
    setIsGeneratingPDF(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsGeneratingPDF(false);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenColorPicker(true);
  };

  return (
    <>
      <Stack>
        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Typography variant="h5" textAlign="left" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {resume != null && (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Stack direction="row" spacing={0.5}>
                  {resume.isActive ? (
                    <Chip
                      size="small"
                      icon={<StarIcon sx={{ color: "warning.main" }} />}
                      color="success"
                      label={t("common:status.searchable")}
                      onClick={() => handleActive(resume.slug)}
                      sx={{
                        backgroundColor: "success.background",
                        color: "success.main",
                        "&:hover": { backgroundColor: "success.background", opacity: 0.8 },
                      }}
                    />
                  ) : (
                    <Chip
                      variant="outlined"
                      size="small"
                      icon={<StarOutlineIcon sx={{ color: "warning.main" }} />}
                      label={t("common:status.searchable")}
                      onClick={() => handleActive(resume.slug)}
                      sx={{
                        borderColor: "grey.300",
                        "&:hover": { backgroundColor: "grey.50" },
                      }}
                    />
                  )}
                  <Tooltip title={t("jobSeeker:profile.tooltips.searchable")} arrow>
                    <HelpIcon sx={{ color: "grey.400" }} />
                  </Tooltip>
                </Stack>
                {!isGeneratingPDF && (
                  <PDFDownloadLinkAny
                    document={<CVDoc resume={resume} user={currentUser} themeColor={selectedColor} />}
                    fileName={`${APP_NAME}_CV_${currentUser?.fullName}-${toSlug(resume?.title || "title")}.pdf`}
                    style={{ textDecoration: "none" }}
                  >
                    {({ loading, blob }: { loading: boolean, blob: Blob | null }) => {
                      if (blob) {
                        blobRef.current = blob;
                      }
                      return loading || isGeneratingPDF ? (
                        <Chip
                          size="small"
                          icon={<CircularProgress size={16} />}
                          color="secondary"
                          label={t("common:loading")}
                          sx={{ boxShadow: (theme) => theme.customShadows.medium }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          icon={<DownloadIcon />}
                          color="secondary"
                          label={t("common:actions.download")}
                          onClick={handleDownloadClick}
                          sx={{
                            boxShadow: (theme) => theme.customShadows.medium,
                            "&:hover": { transform: "scale(1.03)" },
                            transition: "all 0.2s ease-in-out",
                          }}
                        />
                      );
                    }}
                  </PDFDownloadLinkAny>
                )}
                {isGeneratingPDF && (
                  <Chip
                    size="small"
                    icon={<CircularProgress size={16} />}
                    color="secondary"
                    label={t("jobSeeker:profile.actions.generatingPdf")}
                    sx={{ boxShadow: (theme) => theme.customShadows.medium }}
                  />
                )}
              </Stack>
            )}
          </Stack>
        </Box>
        <Divider sx={{ my: 3, borderColor: "grey.500" }} />
        <Box>
          {isLoadingResume ? (
            <Loading />
          ) : resume === null ? (
            <NoDataCard />
          ) : (
            <Grid container spacing={4}>
              <Grid>
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Box
                    sx={{
                      position: "relative",
                      width: 130,
                      height: 130,
                      padding: "4px",
                      borderRadius: "50%",
                      background: (theme) => theme.palette.primary.main,
                      boxShadow: (theme) => theme.customShadows.medium,
                      transition: "transform 0.2s ease-in-out",
                      "&:hover": { transform: "scale(1.02)" },
                    }}
                  >
                    <MuiImageCustom
                      src={currentUser?.avatarUrl}
                      width="100%"
                      height="100%"
                      sx={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid white",
                      }}
                    />
                  </Box>
                  <Box sx={{ display: { xs: "block", md: "none" } }}>
                    <Typography variant="h5" sx={{ textTransform: "uppercase", fontWeight: "bold", color: "primary.main" }}>
                      {resume?.user?.fullName}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 0.5 }}>
                      {resume.title || <Typography component="span" sx={{ color: "grey.400", fontStyle: "italic", fontSize: "0.875rem" }}>{t("jobSeeker:notUpdated")}</Typography>}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Grid container spacing={2}>
                  <Grid sx={{ display: { xs: "none", md: "block" } }} size={12}>
                    <Box>
                      <Typography variant="h5" sx={{ textTransform: "uppercase", fontWeight: "bold", color: "primary.main" }}>
                        {resume?.user?.fullName}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 0.5 }}>
                        {resume.title || <Typography component="span" sx={{ color: "grey.400", fontStyle: "italic", fontSize: "0.875rem" }}>{t("jobSeeker:notUpdated")}</Typography>}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={12}>
                    <Stack spacing={2}>
                      {[
                        { icon: faMagicWandSparkles, label: t("jobSeeker:profile.summary.experience"), value: tConfig(((allConfig as unknown as Record<string, Record<string, string>>)?.experienceDict || {})[String(resume.experience)]) },
                        { icon: faUser, label: t("jobSeeker:profile.summary.position"), value: tConfig(((allConfig as unknown as Record<string, Record<string, string>>)?.positionDict || {})[String(resume.position)]) },
                        { icon: faDollarSign, label: t("jobSeeker:profile.summary.desiredSalary"), value: salaryString(resume.salaryMin, resume.salaryMax) },
                        { icon: faCalendar, label: t("jobSeeker:profile.summary.lastUpdated"), value: dayjs(resume.updateAt).format("DD/MM/YYYY HH:mm:ss") }
                      ].map((item, idx) => (
                        <Box key={idx} sx={{ display: "flex", alignItems: "center", color: "text.secondary", "& svg": { fontSize: "1.25rem", mr: 2, color: "primary.main" } }}>
                          <FontAwesomeIcon icon={item.icon} />
                          <Typography>
                            {item.label}:{" "}
                            <Typography component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                              {item.value || <Typography component="span" sx={{ color: "grey.400", fontStyle: "italic", fontSize: "0.875rem" }}>{t("jobSeeker:notUpdated")}</Typography>}
                            </Typography>
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={12}>
                <Box sx={{ display: "flex", alignItems: "center", p: 2, borderRadius: 2, backgroundColor: "warning.background", "& svg": { color: "warning.main", mr: 1 } }}>
                  <FontAwesomeIcon icon={faWarning} />
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {t("jobSeeker:profile.messages.profileCompletionWarning")}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={12}>
                <Stack direction="row" justifyContent="center">
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => nav.push(`/${formatRoute(ROUTES.JOB_SEEKER.STEP_PROFILE, resume.slug)}`)}
                    sx={{
                      px: 4, py: 1, fontSize: "1rem",
                      background: (theme) => theme.palette.primary.main,
                      "&:hover": { background: (theme) => theme.palette.primary.main, opacity: 0.9, boxShadow: (theme) => theme.customShadows.medium }
                    }}
                  >
                    {t("jobSeeker:profile.actions.editProfile")}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          )}
        </Box>
      </Stack>
      <ColorPickerDialog
        open={openColorPicker}
        onClose={() => setOpenColorPicker(false)}
        onColorSelect={async (color: string) => {
          await handleColorSelect(color);
          setTimeout(() => {
            if (blobRef.current) {
              const url = URL.createObjectURL(blobRef.current);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${APP_NAME}_CV-${toSlug(resume?.title || "title")}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
          }, 1000);
        }}
      />
      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default BoxProfile;
