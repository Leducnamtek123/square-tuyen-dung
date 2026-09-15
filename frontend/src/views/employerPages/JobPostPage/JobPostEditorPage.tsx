'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  LinearProgress,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  Slider,
  CircularProgress,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SaveIcon from '@mui/icons-material/Save';

import { typedYupResolver } from '@/utils/formHelpers';
import {
  convertEditorStateToHTMLString,
  createEditorStateFromHTMLString,
} from '@/utils/editorUtils';
import toastMessages from '@/utils/toastMessages';
import errorHandling from '@/utils/errorHandling';
import { confirmModal } from '@/utils/sweetalert2Modal';
import usePreventUnsavedChanges from '@/hooks/usePreventUnsavedChanges';
import useDebounce from '@/hooks/useDebounce';
import { useConfig } from '@/hooks/useConfig';
import { ROUTES, DATE_OPTIONS } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import commonService from '@/services/commonService';
import goongService, { type PlacePrediction } from '@/services/goongService';
import jobService, { type JobPostInput } from '@/services/jobService';
import {
  useCompanyProfile,
  useJobPostMutations,
  useQuestionGroups,
} from '@/views/components/employers/hooks/useEmployerQueries';
import {
  type JobPostFormValues,
  getJobPostSchema,
} from '@/views/components/employers/JobPostForm/JobPostSchema';
import { shouldResetChildLocationValue } from '@/utils/locationForm';
import TextFieldCustom from '@/components/Common/Controls/TextFieldCustom';
import SingleSelectCustom from '@/components/Common/Controls/SingleSelectCustom';
import DatePickerCustom from '@/components/Common/Controls/DatePickerCustom';
import CheckboxCustom from '@/components/Common/Controls/CheckboxCustom';
import RichTextEditorCustom from '@/components/Common/Controls/RichTextEditorCustom';
import LocationPicker, { type LocationValue } from '@/components/Common/LocationPicker';
import TypedController from '@/components/Common/Controls/TypedController';
import ValidationError from '@/components/Common/Controls/ValidationError';
import pc from '@/utils/muiColors';
import type { SelectOption } from '@/types/models';

interface PlaceOption extends SelectOption {
  place_id: string;
}

interface JobPostEditorPageProps {
  mode?: 'create' | 'edit';
  id?: string;
}

const getSelectId = (
  value: number | string | { id?: number | string | null } | null | undefined,
) => (value && typeof value === 'object' ? value.id ?? '' : value ?? '');

const toNullableNumber = (value: number | string | null | undefined) =>
  value === undefined || value === null || value === '' ? null : Number(value);

const buildDefaultFormValues = (
  editData?: Partial<JobPostFormValues> | null,
): JobPostFormValues => {
  const baseValues: JobPostFormValues = {
    jobName: '',
    career: '',
    position: '',
    experience: '',
    typeOfWorkplace: '',
    jobType: '',
    quantity: 1,
    genderRequired: '',
    salaryMin: '',
    salaryMax: '',
    academicLevel: '',
    deadline: '',
    interviewTemplate: null,
    autoInterviewEnabled: true,
    minScreeningScore: 70,
    jobDescription: createEditorStateFromHTMLString(''),
    jobRequirement: createEditorStateFromHTMLString(''),
    benefitsEnjoyed: createEditorStateFromHTMLString(''),
    location: { city: '', district: '', address: '', lat: '', lng: '' },
    contactPersonName: '',
    contactPersonPhone: '',
    contactPersonEmail: '',
    isUrgent: false,
    isHot: false,
  };

  return {
    ...baseValues,
    ...editData,
    location: {
      ...baseValues.location,
      ...editData?.location,
    },
  };
};

const SectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) => (
  <Box sx={{ mb: 2.5 }}>
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          color: 'primary.main',
          bgcolor: pc.primary(0.08),
          p: 0.75,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: 0.2 }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  </Box>
);

const JobPostEditorPage = ({ mode = 'create', id: propId }: JobPostEditorPageProps) => {
  const { t, i18n } = useTranslation('employer');
  const router = useRouter();
  const routeParams = useParams();
  const jobId = propId || (routeParams?.id as string | undefined);
  const isEdit = mode === 'edit' || Boolean(jobId && mode !== 'create');

  const { allConfig } = useConfig();
  const { data: companyProfile } = useCompanyProfile();
  const isCompanyVerified = Boolean(companyProfile?.isVerified);
  const isCreateBlocked = Boolean(companyProfile) && !isCompanyVerified && !isEdit;

  const { data: groupData } = useQuestionGroups({ page: 1, pageSize: 100 });
  const questionGroupOptions = useMemo(() => {
    if (!groupData?.results) return [];
    return groupData.results.map((g) => ({ id: g.id, name: g.name }));
  }, [groupData]);

  const { addJobPost, updateJobPost, isMutating } = useJobPostMutations();

  const [isLoadingDetail, setIsLoadingDetail] = useState(isEdit);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>([]);
  const [, setLocationOptions] = useState<PlaceOption[]>([]);

  const schema = useMemo(() => getJobPostSchema(t), [t]);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isDirty, errors },
  } = useForm<JobPostFormValues>({
    resolver: typedYupResolver(schema),
    defaultValues: buildDefaultFormValues(),
  });

  usePreventUnsavedChanges(isDirty);

  // Watch fields for progress and dependencies
  const watchedValues = useWatch({ control });
  const cityId = watchedValues.location?.city;
  const address = watchedValues.location?.address;
  const addressDebounce = useDebounce(address, 500);
  const prevCityIdRef = useRef<number | string | null>(null);

  // Load existing data in Edit mode
  useEffect(() => {
    if (!isEdit || !jobId) return;

    let isMounted = true;
    const fetchJobDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const resData = await jobService.getEmployerJobPostDetailById(jobId);
        if (!isMounted) return;

        const editValues: Partial<JobPostFormValues> = {
          jobName: resData.jobName || '',
          career: getSelectId(resData.career),
          position: resData.position ?? '',
          experience: resData.experience ?? '',
          typeOfWorkplace: resData.typeOfWorkplace ?? '',
          jobType: resData.jobType ?? '',
          quantity: resData.quantity ?? 1,
          genderRequired: resData.genderRequired ?? '',
          salaryMin: resData.salaryMin ?? '',
          salaryMax: resData.salaryMax ?? '',
          academicLevel: resData.academicLevel ?? '',
          deadline: resData.deadline ? new Date(resData.deadline) : '',
          interviewTemplate: resData.interviewTemplate ?? null,
          autoInterviewEnabled:
            resData.autoInterviewEnabled !== undefined
              ? Boolean(resData.autoInterviewEnabled)
              : true,
          minScreeningScore:
            resData.minScreeningScore !== undefined && resData.minScreeningScore !== null
              ? Number(resData.minScreeningScore)
              : 70,
          jobDescription: createEditorStateFromHTMLString(resData.jobDescription || ''),
          jobRequirement: createEditorStateFromHTMLString(resData.jobRequirement || ''),
          benefitsEnjoyed: createEditorStateFromHTMLString(resData.benefitsEnjoyed || ''),
          location: {
            city: getSelectId(resData.location?.city),
            district: getSelectId(resData.location?.district),
            address: resData.location?.address || '',
            lat: resData.location?.lat ?? '',
            lng: resData.location?.lng ?? '',
          },
          contactPersonName: resData.contactPersonName || '',
          contactPersonPhone: resData.contactPersonPhone || '',
          contactPersonEmail: resData.contactPersonEmail || '',
          isUrgent: Boolean(resData.isUrgent),
          isHot: Boolean(resData.isHot),
        };

        reset(buildDefaultFormValues(editValues));
      } catch (error) {
        if (isMounted) errorHandling(error);
      } finally {
        if (isMounted) setIsLoadingDetail(false);
      }
    };

    void fetchJobDetail();
    return () => {
      isMounted = false;
    };
  }, [isEdit, jobId, reset]);

  // Load districts on City change
  useEffect(() => {
    let isMounted = true;
    const loadDistricts = async (id: number | string) => {
      try {
        const resData = await commonService.getDistrictsByCityId(id);
        if (!isMounted) return;
        const results = (Array.isArray(resData?.data) ? resData.data : []).map(
          (district) => ({
            id: district.id,
            name: district.name,
          }),
        );

        if (shouldResetChildLocationValue(prevCityIdRef.current, id)) {
          setValue('location.district', '');
        }
        setDistrictOptions(results);
        prevCityIdRef.current = id;
      } catch (error) {
        if (isMounted) errorHandling(error);
      }
    };

    if (cityId) void loadDistricts(cityId);
    else {
      if (shouldResetChildLocationValue(prevCityIdRef.current, cityId)) {
        setValue('location.district', '');
      }
      setDistrictOptions([]);
      prevCityIdRef.current = null;
    }

    return () => {
      isMounted = false;
    };
  }, [cityId, setValue]);

  // Load Goong autocomplete for address
  useEffect(() => {
    let isMounted = true;
    const loadLocation = async (input: string) => {
      if (!input || input.trim().length < 3) {
        if (isMounted) setLocationOptions([]);
        return;
      }
      try {
        const resData = await goongService.getPlaces(input);
        if (!isMounted) return;
        const predictions = Array.isArray(resData?.predictions) ? resData.predictions : [];
        setLocationOptions(
          predictions.map((prediction: PlacePrediction) => ({
            id: prediction.place_id,
            name: prediction.description,
            place_id: prediction.place_id,
          })),
        );
      } catch {
        // Silent fail for autocomplete
      }
    };
    void loadLocation(addressDebounce || '');
    return () => {
      isMounted = false;
    };
  }, [addressDebounce]);

  const handleLocationChange = (val: {
    address?: string;
    lat?: number | string | null;
    lng?: number | string | null;
  }) => {
    if (val.address)
      setValue('location.address', val.address, {
        shouldDirty: true,
        shouldValidate: true,
      });
    if (val.lat !== null && val.lat !== undefined)
      setValue('location.lat', val.lat, { shouldDirty: true });
    if (val.lng !== null && val.lng !== undefined)
      setValue('location.lng', val.lng, { shouldDirty: true });
  };

  const listRoute = localizeRoutePath(`/${ROUTES.EMPLOYER.JOB_POST}`, i18n.language);
  const verificationRoute = localizeRoutePath(`/${ROUTES.EMPLOYER.VERIFICATION}`, i18n.language);

  const handleBackSafe = useCallback(() => {
    if (isDirty) {
      confirmModal(
        () => {
          router.push(listRoute);
        },
        t('jobPost.editor.confirmCancelTitle'),
        t('jobPost.editor.confirmCancelMessage'),
        'warning',
        true,
        t('jobPost.editor.confirmCancelButton'),
        t('jobPost.editor.continueEditingButton'),
      );
    } else {
      router.push(listRoute);
    }
  }, [isDirty, listRoute, router, t]);

  const onSubmit = async (formData: JobPostFormValues) => {
    setServerErrors(null);
    const payload: JobPostInput = {
      jobName: formData.jobName || '',
      deadline: formData.deadline
        ? typeof formData.deadline === 'string'
          ? formData.deadline
          : (formData.deadline as any).toISOString()
        : '',
      quantity: Number(formData.quantity),
      salaryMin: Number(formData.salaryMin),
      salaryMax: Number(formData.salaryMax),
      isHot: formData.isHot,
      isUrgent: formData.isUrgent,
      career: Number(formData.career),
      position: Number(formData.position),
      experience: Number(formData.experience),
      academicLevel: Number(formData.academicLevel),
      jobType: Number(formData.jobType),
      interviewTemplate: formData.interviewTemplate
        ? Number(formData.interviewTemplate)
        : null,
      autoInterviewEnabled:
        formData.autoInterviewEnabled !== undefined
          ? Boolean(formData.autoInterviewEnabled)
          : true,
      minScreeningScore:
        formData.minScreeningScore !== undefined && formData.minScreeningScore !== null
          ? Number(formData.minScreeningScore)
          : 70,
      typeOfWorkplace: Number(formData.typeOfWorkplace),
      genderRequired: formData.genderRequired,
      jobDescription: convertEditorStateToHTMLString(
        formData.jobDescription as ReturnType<typeof createEditorStateFromHTMLString>,
      ),
      jobRequirement: convertEditorStateToHTMLString(
        formData.jobRequirement as ReturnType<typeof createEditorStateFromHTMLString>,
      ),
      benefitsEnjoyed: convertEditorStateToHTMLString(
        formData.benefitsEnjoyed as ReturnType<typeof createEditorStateFromHTMLString>,
      ),
      contactPersonName: formData.contactPersonName,
      contactPersonPhone: formData.contactPersonPhone,
      contactPersonEmail: formData.contactPersonEmail,
      location: {
        city: Number(formData.location.city),
        district: Number(formData.location.district),
        address: formData.location.address,
        lat: toNullableNumber(formData.location.lat),
        lng: toNullableNumber(formData.location.lng),
      },
    };

    try {
      if (isEdit && jobId) {
        await updateJobPost({ id: jobId, data: payload });
        toastMessages.success(t('jobPost.messages.updateSuccess'));
      } else {
        await addJobPost(payload);
        toastMessages.success(t('jobPost.messages.addSuccess'));
      }
      router.push(listRoute);
    } catch (error) {
      errorHandling(error, (errs) =>
        setServerErrors(errs as Record<string, string[]>),
      );
    }
  };

  const onError = (formErrors: Record<string, any>) => {
    toastMessages.error(
      'Vui lòng kiểm tra lại các mục thông tin còn thiếu hoặc chưa hợp lệ.',
    );

    const errorFieldKeys = Object.keys(formErrors);
    if (errorFieldKeys.length > 0) {
      const firstKey = errorFieldKeys[0];
      // Target elements matching name attribute or specific id
      const targetElement =
        document.querySelector(`[name="${firstKey}"]`) ||
        document.querySelector(`[name="location.${firstKey}"]`) ||
        document.getElementById(`field-${firstKey}`);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if ('focus' in targetElement && typeof (targetElement as any).focus === 'function') {
          (targetElement as any).focus();
        }
      }
    }
  };

  // Section completion check for progress card
  const completionStats = useMemo(() => {
    const checks = [
      {
        id: 'basic',
        label: t('jobPost.editor.sectionBasic'),
        isComplete: Boolean(
          watchedValues.jobName &&
            watchedValues.career &&
            watchedValues.position &&
            watchedValues.quantity,
        ),
      },
      {
        id: 'salary',
        label: t('jobPost.editor.sectionSalary'),
        isComplete: Boolean(
          watchedValues.salaryMin &&
            watchedValues.salaryMax &&
            watchedValues.deadline,
        ),
      },
      {
        id: 'ai',
        label: t('jobPost.editor.sectionAi'),
        isComplete: Boolean(
          watchedValues.autoInterviewEnabled !== undefined &&
            watchedValues.minScreeningScore !== null,
        ),
      },
      {
        id: 'content',
        label: t('jobPost.editor.sectionContent'),
        isComplete: Boolean(
          (watchedValues.jobDescription as any)?.getCurrentContent?.()?.hasText?.() &&
            (watchedValues.jobRequirement as any)?.getCurrentContent?.()?.hasText?.() &&
            (watchedValues.benefitsEnjoyed as any)?.getCurrentContent?.()?.hasText?.(),
        ),
      },
      {
        id: 'location',
        label: t('jobPost.editor.sectionLocation'),
        isComplete: Boolean(
          watchedValues.location?.city &&
            watchedValues.location?.district &&
            watchedValues.location?.address,
        ),
      },
      {
        id: 'contact',
        label: t('jobPost.editor.sectionContact'),
        isComplete: Boolean(
          watchedValues.contactPersonName &&
            watchedValues.contactPersonPhone &&
            watchedValues.contactPersonEmail,
        ),
      },
    ];

    const completedCount = checks.filter((c) => c.isComplete).length;
    const percent = Math.round((completedCount / checks.length) * 100);

    return { checks, percent, completedCount, total: checks.length };
  }, [watchedValues, t]);

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      backgroundColor: pc.actionDisabled(0.03),
      '&:hover': { bgcolor: pc.actionDisabled(0.06) },
      '& fieldset': { borderColor: pc.divider(0.8) },
    },
  };

  const autoInterviewEnabled = watchedValues.autoInterviewEnabled ?? true;
  const serverErrorText = serverErrors
    ? Object.values(serverErrors).flat().join(' ')
    : '';

  if (isLoadingDetail) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Stack spacing={3} alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
          <CircularProgress size={48} />
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Đang tải dữ liệu tin tuyển dụng...
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Box
      component="form"
      id="job-post-editor-form"
      onSubmit={handleSubmit(onSubmit, onError)}
      sx={{
        width: '100%',
        bgcolor: '#F8FAFC',
        minHeight: '100vh',
        pb: 14,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 3, pb: 4 }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <MuiLink
            underline="hover"
            color="inherit"
            href={listRoute}
            onClick={(e) => {
              e.preventDefault();
              handleBackSafe();
            }}
            sx={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
          >
            {t('jobPost.title')}
          </MuiLink>
          <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
            {isEdit ? t('jobPost.editor.editTitle') : t('jobPost.editor.createTitle')}
          </Typography>
        </Breadcrumbs>

        {/* Page Title & Back Button */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleBackSafe}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 2.5,
                bgcolor: '#FFFFFF',
                borderColor: '#E2E8F0',
                color: '#334155',
                px: 2,
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
              }}
            >
              {t('jobPost.editor.backToList')}
            </Button>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: 'text.primary',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2,
                }}
              >
                {isEdit ? t('jobPost.editor.editTitle') : t('jobPost.editor.createTitle')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
                {isEdit ? t('jobPost.editor.editSubtitle') : t('jobPost.editor.createSubtitle')}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {isCreateBlocked && (
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2.5, fontWeight: 700 }}
            action={
              <Button color="inherit" size="small" href={verificationRoute}>
                {t('jobPost.verificationRequired.action')}
              </Button>
            }
          >
            {t('jobPost.verificationRequired.message')}
          </Alert>
        )}

        {serverErrorText && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5, fontWeight: 700 }}>
            {serverErrorText}
          </Alert>
        )}

        {/* Main 2-Column Form Layout */}
        <Grid container spacing={3.5}>
          {/* Left Column: Form Section Cards */}
          <Grid size={{ xs: 12, lg: 8.5 }}>
            <Stack spacing={3}>
              {/* Card 1: Basic Information */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                }}
              >
                <SectionHeader
                  icon={<BusinessCenterIcon sx={{ fontSize: 22 }} />}
                  title="1. THÔNG TIN VỊ TRÍ TUYỂN DỤNG"
                  subtitle="Các thông tin cốt lõi giúp hệ thống phân loại và đề xuất tin đến đúng đối tượng ứng viên"
                />
                <Grid container spacing={2.5}>
                  <Grid size={12}>
                    <TextFieldCustom
                      name="jobName"
                      title={t('jobPostForm.title.jobtitle')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.enterjobtitle')}
                      control={control}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SingleSelectCustom
                      name="career"
                      control={control}
                      options={(allConfig?.careerOptions || []) as SelectOption[]}
                      title={t('jobPostForm.title.career')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.selectcareer')}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SingleSelectCustom
                      name="position"
                      control={control}
                      options={(allConfig?.positionOptions || []) as SelectOption[]}
                      title={t('jobPostForm.title.position')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.selectposition')}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SingleSelectCustom
                      name="experience"
                      control={control}
                      options={(allConfig?.experienceOptions || []) as SelectOption[]}
                      title={t('jobPostForm.title.experience')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.selectrequiredexperience')}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SingleSelectCustom
                      name="typeOfWorkplace"
                      control={control}
                      options={(allConfig?.typeOfWorkplaceOptions || []) as SelectOption[]}
                      title={t('jobPostForm.title.workplace')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.selectworkplace')}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SingleSelectCustom
                      name="jobType"
                      control={control}
                      options={(allConfig?.jobTypeOptions || []) as SelectOption[]}
                      title={t('jobPostForm.title.jobtype')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.selectjobtype')}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextFieldCustom
                      name="quantity"
                      title={t('jobPostForm.title.numberofvacancies')}
                      placeholder={t('jobPostForm.placeholder.enternumberofvacancies')}
                      showRequired={true}
                      control={control}
                      type="number"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SingleSelectCustom
                      name="genderRequired"
                      control={control}
                      options={(allConfig?.genderOptions || []) as SelectOption[]}
                      title={t('jobPostForm.title.genderrequirement')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.selectgenderrequirement')}
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Card 2: Compensation & Deadline */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                }}
              >
                <SectionHeader
                  icon={<MonetizationOnOutlinedIcon sx={{ fontSize: 22 }} />}
                  title="2. MỨC LƯƠNG & THỜI HẠN TUYỂN DỤNG"
                  subtitle="Khoảng lương dự kiến và ngày hết hạn nhận hồ sơ ứng tuyển"
                />
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextFieldCustom
                      name="salaryMin"
                      title={t('jobPostForm.title.minimumsalary')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.enterminimumsalary')}
                      control={control}
                      type="number"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextFieldCustom
                      name="salaryMax"
                      title={t('jobPostForm.title.maximumsalary')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.entermaximumsalary')}
                      control={control}
                      type="number"
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SingleSelectCustom
                      name="academicLevel"
                      control={control}
                      options={(allConfig?.academicLevelOptions || []) as SelectOption[]}
                      title={t('jobPostForm.title.academiclevel')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.selectacademiclevel')}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePickerCustom
                      name="deadline"
                      control={control}
                      showRequired={true}
                      title={t('jobPostForm.title.applicationdeadline')}
                      minDate={DATE_OPTIONS.today()}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: pc.primary(0.04),
                        border: '1px solid',
                        borderColor: pc.primary(0.12),
                      }}
                    >
                      <CheckboxCustom
                        name="isUrgent"
                        control={control}
                        title={t('jobPostForm.label.isUrgent')}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Card 3: AI Interview Pipeline */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                }}
              >
                <SectionHeader
                  icon={<SmartToyOutlinedIcon sx={{ fontSize: 22 }} />}
                  title="3. THIẾT LẬP PHỎNG VẤN AI & TỰ ĐỘNG HÓA"
                  subtitle="Tự động hóa bước đầu đánh giá năng lực ứng viên bằng Trợ lý AI AILA"
                />
                <Grid container spacing={2.5}>
                  <Grid size={12}>
                    <SingleSelectCustom
                      name="interviewTemplate"
                      control={control}
                      options={questionGroupOptions}
                      title={t('jobPostForm.title.interviewtemplate')}
                      showRequired={false}
                      placeholder={t('jobPostForm.placeholder.selectinterviewtemplate')}
                      sx={inputSx}
                    />
                  </Grid>

                  <Grid size={12}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <TypedController
                        name="autoInterviewEnabled"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
                            control={
                              <Switch
                                checked={field.value !== false}
                                onChange={(e) => field.onChange(e.target.checked)}
                                color="primary"
                                sx={{ mr: 1, mt: 0.25 }}
                              />
                            }
                            label={
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 700, color: '#1E293B' }}
                                >
                                  {t('jobPostForm.title.autointerview')}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: '#64748B', display: 'block', mt: 0.25 }}
                                >
                                  {t('jobPostForm.title.autointerviewdesc')}
                                </Typography>
                              </Box>
                            }
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  {autoInterviewEnabled && (
                    <Grid size={12}>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 2.5,
                          bgcolor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={0.75} mb={1.5}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: '#1E293B' }}
                          >
                            {t('jobPostForm.title.minscreeningscore')}
                          </Typography>
                          <Tooltip
                            title={t('jobPostForm.tooltip.minscreeningscore')}
                            arrow
                            placement="top"
                          >
                            <HelpOutlineIcon
                              sx={{ fontSize: 16, color: 'text.secondary', cursor: 'pointer' }}
                            />
                          </Tooltip>
                        </Stack>
                        <Grid container spacing={2.5} alignItems="center">
                          <Grid size={{ xs: 12, sm: 8 }}>
                            <TypedController
                              name="minScreeningScore"
                              control={control}
                              render={({ field, fieldState }) => (
                                <Box sx={{ px: 1 }}>
                                  <Slider
                                    value={
                                      typeof field.value === 'number' ? field.value : 70
                                    }
                                    onChange={(_, val) => field.onChange(val)}
                                    min={0}
                                    max={100}
                                    step={5}
                                    marks={[
                                      { value: 50, label: '50' },
                                      { value: 70, label: '70' },
                                      { value: 85, label: '85' },
                                      { value: 100, label: '100' },
                                    ]}
                                    valueLabelDisplay="auto"
                                    sx={{
                                      color: '#2563EB',
                                      '& .MuiSlider-thumb': {
                                        width: 18,
                                        height: 18,
                                      },
                                    }}
                                  />
                                  {fieldState.invalid && (
                                    <ValidationError message={fieldState.error?.message} />
                                  )}
                                </Box>
                              )}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextFieldCustom
                              name="minScreeningScore"
                              control={control}
                              type="number"
                              placeholder={t('jobPostForm.placeholder.enterminscreeningscore')}
                              sx={inputSx}
                            />
                          </Grid>
                        </Grid>

                        <Alert
                          severity="info"
                          icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />}
                          sx={{
                            mt: 2,
                            fontSize: '0.8125rem',
                            py: 1,
                            px: 1.5,
                            bgcolor: pc.primary(0.04),
                            color: '#1E40AF',
                            border: '1px solid',
                            borderColor: pc.primary(0.15),
                            borderRadius: 2,
                          }}
                        >
                          {t('jobPostForm.title.aiPipelineHelp')}
                        </Alert>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* Card 4: Detailed Content & Requirements */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                }}
              >
                <SectionHeader
                  icon={<ArticleOutlinedIcon sx={{ fontSize: 22 }} />}
                  title="4. CHI TIẾT CÔNG VIỆC & ĐÃI NGỘ"
                  subtitle="Trình soạn thảo văn bản phong phú toàn diện chiều rộng kết hợp gợi ý từ Trợ lý AI"
                />
                <Stack spacing={3}>
                  <Box>
                    <RichTextEditorCustom
                      name="jobDescription"
                      control={control}
                      title={t('jobPostForm.title.jobdescription')}
                      showRequired={true}
                      contextType="job_desc"
                      jobTitle={watchedValues.jobName}
                    />
                  </Box>
                  <Box>
                    <RichTextEditorCustom
                      name="jobRequirement"
                      control={control}
                      title={t('jobPostForm.title.jobrequirement')}
                      showRequired={true}
                      contextType="job_req"
                      jobTitle={watchedValues.jobName}
                    />
                  </Box>
                  <Box>
                    <RichTextEditorCustom
                      name="benefitsEnjoyed"
                      control={control}
                      title={t('jobPostForm.title.benefits')}
                      showRequired={true}
                      contextType="benefits"
                      jobTitle={watchedValues.jobName}
                    />
                  </Box>
                </Stack>
              </Paper>

              {/* Card 5: Workplace Location */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                }}
              >
                <SectionHeader
                  icon={<LocationOnIcon sx={{ fontSize: 22 }} />}
                  title="5. ĐỊA ĐIỂM LÀM VIỆC"
                  subtitle="Vị trí làm việc thực tế và tọa độ hiển thị trên bản đồ để ứng viên dễ tìm kiếm"
                />
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SingleSelectCustom
                      name="location.city"
                      control={control}
                      options={(allConfig?.cityOptions || []) as SelectOption[]}
                      title={t('jobPostForm.title.cityprovince')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.selectcityprovince')}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SingleSelectCustom
                      name="location.district"
                      control={control}
                      disabled={!cityId}
                      disabledPlaceholder={t('jobPostForm.placeholder.selectCityFirst')}
                      options={districtOptions}
                      title={t('jobPostForm.title.district')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.selectdistrict')}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextFieldCustom
                      name="location.address"
                      title={t('jobPostForm.title.address')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.enteraddress')}
                      control={control}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={12}>
                    <LocationPicker
                      value={watchedValues.location as LocationValue}
                      onChange={handleLocationChange}
                      label="Định vị địa điểm làm việc trên bản đồ"
                      height="360px"
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Card 6: Contact Information */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                }}
              >
                <SectionHeader
                  icon={<ContactPhoneIcon sx={{ fontSize: 22 }} />}
                  title="6. THÔNG TIN LIÊN HỆ"
                  subtitle="Thông tin chuyên viên tuyển dụng phụ trách tiếp nhận hồ sơ"
                />
                <Grid container spacing={2.5}>
                  <Grid size={12}>
                    <TextFieldCustom
                      name="contactPersonName"
                      title={t('jobPostForm.title.contactpersonname')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.entercontactpersonname')}
                      control={control}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextFieldCustom
                      name="contactPersonPhone"
                      title={t('jobPostForm.title.contactpersonphone')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.entercontactpersonphone')}
                      control={control}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextFieldCustom
                      name="contactPersonEmail"
                      title={t('jobPostForm.title.contactpersonemail')}
                      showRequired={true}
                      placeholder={t('jobPostForm.placeholder.entercontactpersonemail')}
                      control={control}
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>

          {/* Right Column: Sticky Sidebar with Progress & Tips */}
          <Grid size={{ xs: 12, lg: 3.5 }}>
            <Box
              sx={{
                position: { xs: 'static', lg: 'sticky' },
                top: 88,
                zIndex: 2,
              }}
            >
              <Stack spacing={3}>
                {/* Form Completion Progress Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: '#E2E8F0',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                    {t('jobPost.editor.progressTitle')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                    {t('jobPost.editor.progressSubtitle')}
                  </Typography>

                  <Box sx={{ mb: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Hoàn thiện {completionStats.completedCount}/{completionStats.total} mục
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                        {completionStats.percent}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={completionStats.percent}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: completionStats.percent === 100 ? '#10B981' : '#2563EB',
                        },
                      }}
                    />
                  </Box>

                  <Stack spacing={1.25}>
                    {completionStats.checks.map((item) => (
                      <Stack
                        key={item.id}
                        direction="row"
                        alignItems="center"
                        spacing={1.25}
                        sx={{
                          py: 0.5,
                          color: item.isComplete ? 'text.primary' : 'text.disabled',
                        }}
                      >
                        {item.isComplete ? (
                          <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: '#CBD5E1' }} />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: item.isComplete ? 600 : 500,
                            fontSize: '0.85rem',
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>

                {/* Recruiting Tips Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: '#E2E8F0',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center" mb={1.5}>
                    <LightbulbOutlinedIcon sx={{ fontSize: 22, color: '#F59E0B' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {t('jobPost.editor.tipsTitle')}
                    </Typography>
                  </Stack>

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.25 }}>
                        {t('jobPost.editor.tip1Title')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
                        {t('jobPost.editor.tip1Desc')}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.25 }}>
                        {t('jobPost.editor.tip2Title')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
                        {t('jobPost.editor.tip2Desc')}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.25 }}>
                        {t('jobPost.editor.tip3Title')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
                        {t('jobPost.editor.tip3Desc')}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {/* Moderation Policy Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: '#E2E8F0',
                    bgcolor: '#F8FAFC',
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <VerifiedUserOutlinedIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.25 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                        {t('jobPost.editor.policyTitle')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4 }}>
                        {t('jobPost.editor.policyDesc')}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Sticky Bottom Action Bar */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 16,
            zIndex: 100,
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 24px rgba(15, 23, 42, 0.12)',
            py: 1.75,
            px: { xs: 2, sm: 3.5 },
            mt: 4,
            borderRadius: 3,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleBackSafe}
                disabled={isMutating}
                sx={{
                  minWidth: 110,
                  py: 1,
                  px: 2.5,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  borderColor: '#E2E8F0',
                  color: '#475569',
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
                }}
              >
                {t('jobPost.editor.cancelButton')}
              </Button>

              {Object.keys(errors).length > 0 && (
                <Typography
                  variant="caption"
                  sx={{ color: 'error.main', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}
                >
                  Có {Object.keys(errors).length} trường chưa hợp lệ, vui lòng kiểm tra lại
                </Typography>
              )}
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <LoadingButton
                type="submit"
                form="job-post-editor-form"
                variant="contained"
                color="primary"
                loading={isMutating}
                loadingPosition="start"
                startIcon={<SaveIcon />}
                disabled={isCreateBlocked || isMutating}
                sx={{
                  minWidth: 180,
                  py: 1.25,
                  px: 3.5,
                  borderRadius: 2.5,
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.38)',
                  },
                }}
              >
                {isEdit ? t('jobPost.editor.updateButton') : t('jobPost.editor.saveButton')}
              </LoadingButton>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default JobPostEditorPage;
