'use client';

import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import * as yup from "yup";
import { Box, Button, Card, CircularProgress, FormControlLabel, Link, Radio, RadioGroup, Stack, Typography } from "@mui/material";
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

import CandidateResumePreviewModal from "@/views/components/jobSeekers/CandidateProfile/CandidateResumePreviewModal";

const ApplyForm = ({ handleApplyJob, formId = 'modal-form' }: ApplyFormProps) => {
  const { t, i18n } = useTranslation("public");
  const theme = useTheme();
  const { push } = useRouter();
  const { currentUser } = useAppSelector((state) => state.user);
  const [state, dispatch] = React.useReducer(applyFormReducer, initialState);
  const [previewResume, setPreviewResume] = React.useState<Resume | null>(null);
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
                    p: 2.5,
                    textAlign: "center",
                    border: "1px solid #FECACA",
                    bgcolor: "#FEF2F2",
                    borderRadius: 3,
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
                    {state.resumes.map((value) => {
                      const isSelected = String(selectedResumeId) === String(value.id);
                      return (
                        <Card
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            cursor: 'pointer',
                            border: '1.5px solid',
                            borderColor: isSelected ? 'primary.main' : '#E2E8F0',
                            bgcolor: isSelected ? 'rgba(37, 99, 235, 0.04)' : '#FFFFFF',
                            boxShadow: isSelected ? '0 2px 10px rgba(37, 99, 235, 0.08)' : 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: isSelected ? 'primary.main' : '#CBD5E1',
                              bgcolor: isSelected ? 'rgba(37, 99, 235, 0.06)' : '#F8FAFC',
                            },
                          }}
                          onClick={() => setValue("resume", String(value.id), { shouldValidate: true })}
                          key={value.id}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                              <Radio
                                checked={isSelected}
                                value={value.id}
                                size="small"
                                sx={{ p: 0.5, color: isSelected ? 'primary.main' : '#94A3B8' }}
                              />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.9375rem',
                                    color: '#0F172A',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {value.title || 'Hồ sơ ứng viên'}
                                </Typography>
                                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                                  <FontAwesomeIcon
                                    icon={value.type === CV_TYPES.cvWebsite ? faFile : faFilePdf}
                                    color={value.type === CV_TYPES.cvWebsite ? '#2563EB' : '#EF4444'}
                                    size="xs"
                                  />
                                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, fontSize: '0.8125rem' }}>
                                    {value.type === CV_TYPES.cvWebsite
                                      ? t("applyForm.resume.online")
                                      : t("applyForm.resume.attached")}
                                  </Typography>
                                </Stack>
                              </Box>
                            </Stack>

                            <Box
                              onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPreviewResume(value);
                              }}
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.75,
                                cursor: 'pointer',
                                color: 'primary.main',
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                px: 1.25,
                                py: 0.5,
                                borderRadius: '8px',
                                bgcolor: 'rgba(37, 99, 235, 0.08)',
                                transition: 'all 0.15s ease',
                                '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.16)' },
                              }}
                            >
                              <FontAwesomeIcon icon={faEye} size="xs" />
                              <Typography component="span" sx={{ fontWeight: 600, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                                {t("applyForm.resume.preview")}
                              </Typography>
                            </Box>
                          </Stack>
                        </Card>
                      );
                    })}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  transition: 'all 0.2s ease',
                  '&:hover': { backgroundColor: '#FFFFFF' },
                  '&.Mui-focused': { backgroundColor: '#FFFFFF' },
                },
              }}
            />
          </Grid>

          <Grid size={12}>
            <TextFieldCustom
              name="email"
              title={t("applyForm.fields.email")}
              showRequired={true}
              placeholder={t("applyForm.placeholders.email")}
              control={control}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  transition: 'all 0.2s ease',
                  '&:hover': { backgroundColor: '#FFFFFF' },
                  '&.Mui-focused': { backgroundColor: '#FFFFFF' },
                },
              }}
            />
          </Grid>

          <Grid size={12}>
            <TextFieldCustom
              name="phone"
              title={t("applyForm.fields.phone")}
              showRequired={true}
              placeholder={t("applyForm.placeholders.phone")}
              control={control}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  transition: 'all 0.2s ease',
                  '&:hover': { backgroundColor: '#FFFFFF' },
                  '&.Mui-focused': { backgroundColor: '#FFFFFF' },
                },
              }}
            />
          </Grid>

          <Grid size={12}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                textAlign: 'left',
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem', lineHeight: 1.6, display: 'block' }}>
                {t('applyForm.consentNotice.text', 'Bằng việc nhấn nút nộp hồ sơ, tôi đồng ý chia sẻ thông tin cá nhân của mình với nhà tuyển dụng theo các')}{' '}
                <Box
                  component="a"
                  href="/thoa-thuan-su-dung.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {t('applyForm.consentNotice.terms', 'Điều khoản sử dụng')}
                </Box>
                ,{' '}
                <Box
                  component="a"
                  href="/quy-dinh-bao-mat.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {t('applyForm.consentNotice.privacy', 'Chính sách bảo mật')}
                </Box>{' '}
                {t('applyForm.consentNotice.and', 'và')}{' '}
                <Box
                  component="a"
                  href="/tuan-thu-va-su-dong-y-cua-khach-hang.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {t('applyForm.consentNotice.dataPolicy', 'Chính sách dữ liệu cá nhân')}
                </Box>{' '}
                {t('applyForm.consentNotice.ofInfoHR', 'của InfoHR.')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </form>

      <CandidateResumePreviewModal
        open={Boolean(previewResume)}
        onClose={() => setPreviewResume(null)}
        resume={previewResume as any}
        candidateName={currentUser?.fullName || undefined}
        candidateEmail={currentUser?.email || undefined}
        candidatePhone={(currentUser as any)?.phone || (currentUser as any)?.phoneNumber || undefined}
      />
    </>
  );
};

export default ApplyForm;
