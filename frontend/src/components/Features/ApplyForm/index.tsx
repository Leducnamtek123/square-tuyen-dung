'use client';

import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import * as yup from "yup";
import { Button, Card, CircularProgress, FormControlLabel, Link, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faFile, faFilePdf } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import pc from "@/utils/muiColors";
import errorHandling from "@/utils/errorHandling";
import { CV_TYPES, REGEX_VALIDATE, ROUTES } from "@/configs/constants";
import TextFieldCustom from "@/components/Common/Controls/TextFieldCustom";
import jobSeekerProfileService from "@/services/jobSeekerProfileService";
import { formatRoute } from "@/utils/funcUtils";
import { useAppSelector } from "@/hooks/useAppStore";
import type { Resume } from "@/types/models";
import { typedYupResolver } from "@/utils/formHelpers";

interface ApplyFormProps {
  handleApplyJob: (data: ApplyFormValues) => void;
  formId?: string;
}

export interface ApplyFormValues {
  fullName: string;
  email: string;
  phone: string;
  resume: string;
}

type ApplyFormState = {
  isLoadingResumes: boolean;
  resumes: Resume[];
};

const initialState: ApplyFormState = {
  isLoadingResumes: true,
  resumes: [],
};

const ApplyForm = ({ handleApplyJob, formId = 'modal-form' }: ApplyFormProps) => {
  const { t } = useTranslation("public");
  const theme = useTheme();
  const nav = useRouter();
  const { currentUser } = useAppSelector((state) => state.user);
  const [state, setState] = React.useState<ApplyFormState>(initialState);

  const schema = yup.object().shape({
    fullName: yup
      .string()
      .required(t("applyForm.validation.fullNameRequired", { defaultValue: "Ho va ten la bat buoc." }))
      .max(100, t("applyForm.validation.fullNameMax", { defaultValue: "Ho va ten vuot qua do dai cho phep." })),
    email: yup
      .string()
      .required(t("applyForm.validation.emailRequired", { defaultValue: "Email la bat buoc." }))
      .email(t("applyForm.validation.emailInvalid", { defaultValue: "Email khong hop le." }))
      .max(100, t("applyForm.validation.emailMax", { defaultValue: "Email vuot qua do dai cho phep." })),
    phone: yup
      .string()
      .required(t("applyForm.validation.phoneRequired", { defaultValue: "So dien thoai la bat buoc." }))
      .matches(REGEX_VALIDATE.phoneRegExp, t("applyForm.validation.phoneInvalid", { defaultValue: "So dien thoai khong hop le." })),
    resume: yup
      .string()
      .required(t("applyForm.validation.resumeRequired", { defaultValue: "Vui long chon ho so." })),
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
  } = useForm<ApplyFormValues>({
    resolver: typedYupResolver(schema),
    defaultValues: { fullName: "", email: "", phone: "", resume: "" },
  });

  React.useEffect(() => {
    const getOnlineProfile = async (jobSeekerProfileId?: number | string) => {
      try {
        setState((prev) => ({ ...prev, isLoadingResumes: true }));
        const resData = await jobSeekerProfileService.getResumes(jobSeekerProfileId);
        setState((prev) => ({ ...prev, resumes: resData.results || [], isLoadingResumes: false }));
      } catch (error) {
        errorHandling(error);
        setState((prev) => ({ ...prev, isLoadingResumes: false }));
      }
    };

    getOnlineProfile((currentUser as { jobSeekerProfileId?: number | string })?.jobSeekerProfileId);
  }, [currentUser]);

  const selectedResumeId = watch("resume");

  React.useEffect(() => {
    if (state.resumes.length === 0) return;
    const currentResume = getValues("resume");
    if (currentResume) return;
    const defaultResume =
      state.resumes.find((value) => value.type === CV_TYPES.cvWebsite) || state.resumes[0];
    if (defaultResume?.id) {
      setValue("resume", String(defaultResume.id), { shouldValidate: true });
    }
  }, [state.resumes, getValues, setValue]);

  return (
    <>
      <form id={formId} onSubmit={handleSubmit(handleApplyJob)}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <Stack spacing={1} justifyContent="center">
              {state.isLoadingResumes ? (
                <CircularProgress color="secondary" sx={{ margin: "0 auto" }} />
              ) : state.resumes.length === 0 ? (
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: "center",
                    borderStyle: "dashed",
                    borderColor: "error.main",
                    bgcolor: pc.error( 0.02),
                  }}
                >
                  <Typography variant="body1" color="error" sx={{ fontWeight: 600, mb: 1 }}>
                    {t("applyForm.resume.empty", { defaultValue: "Ban chua co ho so nao." })}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {t("applyForm.resume.pleaseUpload", { defaultValue: "Vui long tai len hoac tao ho so de ung tuyen." })}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => nav.push(`/${ROUTES.JOB_SEEKER.PROFILE}`)}
                    sx={{ textTransform: "none" }}
                  >
                    {t("applyForm.resume.createNow", { defaultValue: "Tao ho so ngay" })}
                  </Button>
                </Card>
              ) : (
                <RadioGroup
                  aria-labelledby="resume"
                  value={selectedResumeId || ""}
                  name="resume"
                  onChange={(event) => setValue("resume", event.target.value, { shouldValidate: true })}
                >
                  <Stack spacing={1.5}>
                    {state.resumes.map((value) => (
                      <Card
                        sx={{
                          p: 1.5,
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: pc.primary( 0.02),
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
                              "& .MuiFormControlLabel-label": { flex: 1 },
                            }}
                          />
                          <Link
                            target="_blank"
                            href={
                              value.type === CV_TYPES.cvWebsite
                                ? `/${formatRoute(ROUTES.JOB_SEEKER.STEP_PROFILE, value.slug)}`
                                : `/${formatRoute(ROUTES.JOB_SEEKER.ATTACHED_PROFILE, value.slug)}`
                            }
                            sx={{
                              textDecoration: "none",
                              color: "primary.main",
                              "&:hover": { opacity: 0.8 },
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
              title={t("applyForm.fields.fullName", { defaultValue: "Ho va ten" })}
              showRequired={true}
              placeholder={t("applyForm.placeholders.fullName", { defaultValue: "Nhap ho va ten" })}
              control={control}
            />
          </Grid>

          <Grid size={12}>
            <TextFieldCustom
              name="email"
              title={t("applyForm.fields.email", { defaultValue: "Email" })}
              showRequired={true}
              placeholder={t("applyForm.placeholders.email", { defaultValue: "Nhap email" })}
              control={control}
            />
          </Grid>

          <Grid size={12}>
            <TextFieldCustom
              name="phone"
              title={t("applyForm.fields.phone", { defaultValue: "So dien thoai" })}
              showRequired={true}
              placeholder={t("applyForm.placeholders.phone", { defaultValue: "Nhap so dien thoai" })}
              control={control}
            />
          </Grid>

          <Grid size={12}>
            <Typography color="GrayText" variant="caption">
              {t("applyForm.note", {
                defaultValue: "Luu y: Ho ten, email va so dien thoai can chinh xac de nha tuyen dung lien he voi ban.",
              })}
            </Typography>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default ApplyForm;