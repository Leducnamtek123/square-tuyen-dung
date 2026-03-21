import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Card, CircularProgress, FormControlLabel, Link, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faFile, faFilePdf } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "react-i18next";
import { alpha, useTheme } from "@mui/material/styles";
import errorHandling from "../../utils/errorHandling";
import { CV_TYPES, REGEX_VALIDATE, ROUTES } from "../../configs/constants";
import TextFieldCustom from "../controls/TextFieldCustom";
import jobSeekerProfileService from "../../services/jobSeekerProfileService";
import { formatRoute } from "../../utils/funcUtils";
import { useAppSelector } from "../../hooks/useAppStore";
import type { Resume } from "../../types/models";

interface ApplyFormProps {
  handleApplyJob: (data: ApplyFormValues) => void;
}

interface ApplyFormValues {
  fullName: string;
  email: string;
  phone: string;
  resume: string;
}

const ApplyForm = ({ handleApplyJob }: ApplyFormProps) => {
  const { t } = useTranslation("public");
  const theme = useTheme();
  const nav = useNavigate();
  const { currentUser } = useAppSelector((state) => state.user);
  const [isLoadingResumes, setIsLoadingResumes] = React.useState(false);
  const [resumes, setResumes] = React.useState<Resume[]>([]);

  const schema = yup.object().shape({
    fullName: yup
      .string()
      .required(t("applyForm.validation.fullNameRequired", { defaultValue: "Họ và tên là bắt buộc." }))
      .max(100, t("applyForm.validation.fullNameMax", { defaultValue: "Họ và tên vượt quá độ dài cho phép." })),
    email: yup
      .string()
      .required(t("applyForm.validation.emailRequired", { defaultValue: "Email là bắt buộc." }))
      .email(t("applyForm.validation.emailInvalid", { defaultValue: "Email không hợp lệ." }))
      .max(100, t("applyForm.validation.emailMax", { defaultValue: "Email vượt quá độ dài cho phép." })),
    phone: yup
      .string()
      .required(t("applyForm.validation.phoneRequired", { defaultValue: "Số điện thoại là bắt buộc." }))
      .matches(REGEX_VALIDATE.phoneRegExp, t("applyForm.validation.phoneInvalid", { defaultValue: "Số điện thoại không hợp lệ." }))
      .max(15, t("applyForm.validation.phoneMax", { defaultValue: "Số điện thoại vượt quá độ dài cho phép." })),
    resume: yup.string().required(),
  });

  const { control, setValue, handleSubmit } = useForm<ApplyFormValues>({
    defaultValues: {
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
      phone: (currentUser as any)?.jobSeekerProfile?.phone || "",
      resume: "",
    },
    resolver: yupResolver(schema) as any,
  });

  React.useEffect(() => {
    const getOnlineProfile = async (jobSeekerProfileId: number | string | undefined) => {
      setIsLoadingResumes(true);
      try {
        const resData = await jobSeekerProfileService.getResumes(jobSeekerProfileId);
        const parsedResumes = Array.isArray(resData) ? resData : (resData.results || []);
        setResumes(parsedResumes);
      } catch (error: any) {
        errorHandling(error);
      } finally {
        setIsLoadingResumes(false);
      }
    };

    getOnlineProfile((currentUser as any)?.jobSeekerProfileId);
  }, [currentUser]);

  return (
    <>
      <form id="modal-form" onSubmit={handleSubmit(handleApplyJob)}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Stack spacing={1} justifyContent="center">
              {isLoadingResumes ? (
                <CircularProgress color="secondary" sx={{ margin: "0 auto" }} />
              ) : resumes.length === 0 ? (
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: "center",
                    borderStyle: "dashed",
                    borderColor: "error.main",
                    bgcolor: alpha(theme.palette.error.main, 0.02),
                  }}
                >
                  <Typography variant="body1" color="error" sx={{ fontWeight: 600, mb: 1 }}>
                    {t("applyForm.resume.empty", { defaultValue: "Bạn chưa có hồ sơ nào." })}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {t("applyForm.resume.pleaseUpload", { defaultValue: "Vui lòng tải lên hoặc tạo hồ sơ để ứng tuyển." })}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => nav(`/${ROUTES.JOB_SEEKER.DASHBOARD}/${ROUTES.JOB_SEEKER.PROFILE}`)}
                    sx={{ textTransform: "none" }}
                  >
                    {t("applyForm.resume.createNow", { defaultValue: "Tạo hồ sơ ngay" })}
                  </Button>
                </Card>
              ) : (
                <RadioGroup
                  aria-labelledby="resume"
                  defaultValue={() => {
                    const defaultResumes = resumes.filter((value) => value.type === CV_TYPES.cvWebsite);
                    if (defaultResumes.length > 0) {
                      setValue("resume", `${defaultResumes[0].id}`);
                      return defaultResumes[0].id;
                    }
                    if (resumes.length > 0) {
                      setValue("resume", `${resumes[0].id}`);
                      return resumes[0].id;
                    }
                    return "";
                  }}
                  name="resume"
                  onChange={(event) => setValue("resume", event.target.value)}
                >
                  <Stack spacing={1.5}>
                    {resumes.map((value) => (
                      <Card
                        sx={{
                          p: 1.5,
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                          },
                        }}
                        variant="outlined"
                        key={value.id}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
                          <FormControlLabel
                            value={value.id}
                            control={<Radio />}
                            label={
                              <Stack spacing={0.5}>
                                {value?.title && (
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                    {value.title}
                                  </Typography>
                                )}
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <FontAwesomeIcon
                                    icon={value.type === CV_TYPES.cvWebsite ? faFile : faFilePdf}
                                    color={value.type === CV_TYPES.cvWebsite ? theme.palette.primary.main : theme.palette.error.main}
                                    size="sm"
                                  />
                                  <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                                    {value.type === CV_TYPES.cvWebsite
                                      ? t("applyForm.resume.online")
                                      : t("applyForm.resume.attached")}
                                  </Typography>
                                </Stack>
                              </Stack>
                            }
                            sx={{
                              flex: 1,
                              ml: 0,
                              mr: 0,
                              "& .MuiFormControlLabel-label": {
                                flex: 1,
                              },
                            }}
                          />
                          <Link
                            target="_blank"
                            href={
                              value.type === CV_TYPES.cvWebsite
                                ? `/${ROUTES.JOB_SEEKER.DASHBOARD}/${formatRoute(ROUTES.JOB_SEEKER.STEP_PROFILE, value.slug)}`
                                : `/${ROUTES.JOB_SEEKER.DASHBOARD}/${formatRoute(ROUTES.JOB_SEEKER.ATTACHED_PROFILE, value.slug)}`
                            }
                            sx={{
                              textDecoration: "none",
                              color: "primary.main",
                              "&:hover": {
                                opacity: 0.8,
                              },
                            }}
                          >
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <FontAwesomeIcon icon={faEye} />
                              <Typography sx={{ fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>
                                {t("applyForm.resume.preview")}
                              </Typography>
                            </Stack>
                          </Link>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </RadioGroup>
              )}
            </Stack>
          </Grid>

          <Grid size={12}>
            <TextFieldCustom
              name="fullName"
              title={t("applyForm.fields.fullName", { defaultValue: "Họ và tên" })}
              showRequired={true}
              placeholder={t("applyForm.placeholders.fullName", { defaultValue: "Nhập họ và tên" })}
              control={control}
            />
          </Grid>

          <Grid size={12}>
            <TextFieldCustom
              name="email"
              title={t("applyForm.fields.email", { defaultValue: "Email" })}
              showRequired={true}
              placeholder={t("applyForm.placeholders.email", { defaultValue: "Nhập email" })}
              control={control}
            />
          </Grid>

          <Grid size={12}>
            <TextFieldCustom
              name="phone"
              title={t("applyForm.fields.phone", { defaultValue: "Số điện thoại" })}
              showRequired={true}
              placeholder={t("applyForm.placeholders.phone", { defaultValue: "Nhập số điện thoại" })}
              control={control}
            />
          </Grid>

          <Grid size={12}>
            <Typography color="GrayText" variant="caption">
              {t("applyForm.note", {
                defaultValue: "Lưu ý: Họ tên, email và số điện thoại cần chính xác để nhà tuyển dụng liên hệ với bạn.",
              })}
            </Typography>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default ApplyForm;
