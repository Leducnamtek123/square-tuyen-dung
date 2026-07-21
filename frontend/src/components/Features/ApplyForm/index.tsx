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
import type { TFunction } from "i18next";
import pc from "@/utils/muiColors";
import errorHandling from "@/utils/errorHandling";
import { CV_TYPES, REGEX_VALIDATE, ROUTES } from "@/configs/constants";
import TextFieldCustom from "@/components/Common/Controls/TextFieldCustom";
import jobSeekerProfileService from "@/services/jobSeekerProfileService";
import { localizeRoutePath } from "@/configs/routeLocalization";
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

const isPositiveIntegerIdString = (value?: string | null) => {
  if (!value) return false;
  if (!/^\d+$/.test(value)) return false;
  return Number(value) > 0;
};

export const createApplyFormSchema = (t: TFunction<"public", undefined>) =>
  yup.object().shape({
    fullName: yup
      .string()
      .required(t("applyForm.validation.fullNameRequired"))
      .max(100, t("applyForm.validation.fullNameMax")),
    email: yup
      .string()
      .required(t("applyForm.validation.emailRequired"))
      .email(t("applyForm.validation.emailInvalid"))
      .max(100, t("applyForm.validation.emailMax")),
    phone: yup
      .string()
      .required(t("applyForm.validation.phoneRequired"))
      .matches(REGEX_VALIDATE.phoneRegExp, t("applyForm.validation.phoneInvalid"))
      .max(15, t("applyForm.validation.phoneMax")),
    resume: yup
      .string()
      .required(t("applyForm.validation.resumeRequired"))
      .test(
        "resume-positive-integer-id",
        t("applyForm.validation.resumeRequired"),
        isPositiveIntegerIdString,
      ),
  });

type ApplyFormState = {
  isLoadingResumes: boolean;
  resumes: Resume[];
};

type ApplyFormAction =
  | { type: "resumesLoading" }
  | { type: "resumesLoaded"; resumes: Resume[] }
  | { type: "resumesLoadFailed" };

const initialState: ApplyFormState = {
  isLoadingResumes: true,
  resumes: [],
};

const applyFormReducer = (state: ApplyFormState, action: ApplyFormAction): ApplyFormState => {
  switch (action.type) {
    case "resumesLoading":
      return { ...state, isLoadingResumes: true };
    case "resumesLoaded":
      return { resumes: action.resumes, isLoadingResumes: false };
    case "resumesLoadFailed":
      return { ...state, isLoadingResumes: false };
    default:
      return state;
  }
};

const ApplyForm = ({ handleApplyJob, formId = 'modal-form' }: ApplyFormProps) => {
  const { t, i18n } = useTranslation("public");
  const theme = useTheme();
  const { push } = useRouter();
  const { currentUser } = useAppSelector((state) => state.user);
  const [state, dispatch] = React.useReducer(applyFormReducer, initialState);
  const jobSeekerProfileId = (currentUser as { jobSeekerProfileId?: number | string })?.jobSeekerProfileId;

  const schema = React.useMemo(() => createApplyFormSchema(t), [t]);

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
    let isActive = true;

    const getOnlineProfile = async (jobSeekerProfileId?: number | string) => {
      dispatch({ type: "resumesLoading" });
      try {
        const resData = await jobSeekerProfileService.getResumes(jobSeekerProfileId);
        if (isActive) {
          dispatch({ type: "resumesLoaded", resumes: resData.results || [] });
        }
      } catch (error) {
        if (isActive) {
          errorHandling(error);
          dispatch({ type: "resumesLoadFailed" });
        }
      }
    };

    getOnlineProfile(jobSeekerProfileId);

    return () => {
      isActive = false;
    };
  }, [jobSeekerProfileId]);

  const selectedResumeId = watch("resume");
  const profileHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.PROFILE}`, i18n.language);
  const getResumePreviewHref = (resume: Resume) => localizeRoutePath(
    `/${formatRoute(
      resume.type === CV_TYPES.cvWebsite
        ? ROUTES.JOB_SEEKER.STEP_PROFILE
        : ROUTES.JOB_SEEKER.ATTACHED_PROFILE,
      resume.slug,
    )}`,
    i18n.language,
  );

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
                    {t("applyForm.resume.empty")}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {t("applyForm.resume.pleaseUpload")}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => push(profileHref)}
                    sx={{ textTransform: "none" }}
                  >
                    {t("applyForm.resume.createNow")}
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
                            rel="noopener noreferrer"
                            href={getResumePreviewHref(value)}
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
              title={t("applyForm.fields.fullName")}
              showRequired={true}
              placeholder={t("applyForm.placeholders.fullName")}
              control={control}
            />
          </Grid>

          <Grid size={12}>
            <TextFieldCustom
              name="email"
              title={t("applyForm.fields.email")}
              showRequired={true}
              placeholder={t("applyForm.placeholders.email")}
              control={control}
            />
          </Grid>

          <Grid size={12}>
            <TextFieldCustom
              name="phone"
              title={t("applyForm.fields.phone")}
              showRequired={true}
              placeholder={t("applyForm.placeholders.phone")}
              control={control}
            />
          </Grid>

          <Grid size={12}>
            <Typography color="GrayText" variant="caption">
              {t("applyForm.note")}
            </Typography>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default ApplyForm;
