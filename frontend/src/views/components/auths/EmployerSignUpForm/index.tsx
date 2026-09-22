'use client';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { typedYupResolver } from '@/utils/formHelpers';
import * as yup from 'yup';
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';
import { REGEX_VALIDATE } from '@/configs/constants';
import errorHandling from '@/utils/errorHandling';
import commonService from '@/services/commonService';
import { useAppSelector } from '@/hooks/useAppStore';
import type { RoleName, EmployerSignUpFormData } from '@/types/auth';
import type { RootState } from '@/redux/store';
import type { SelectOption } from '@/types/models';
import { shouldResetChildLocationValue } from '@/utils/locationForm';
import TextFieldCustom from '@/components/Common/Controls/TextFieldCustom';
import PasswordTextFieldCustom from '@/components/Common/Controls/PasswordTextFieldCustom';
import SingleSelectCustom from '@/components/Common/Controls/SingleSelectCustom';
import type { UseFormSetError } from 'react-hook-form';

export type { EmployerSignUpFormData };

interface EmployerSignUpFormProps {
  onSignUp: (data: EmployerSignUpFormData) => void;
  serverErrors?: Record<string, string[] | NestedServerErrors>;
  checkCreds: (email: string, roleName: RoleName) => Promise<boolean>;
}
type NestedServerErrors = Record<string, string[] | Record<string, string[]>>;

const EMPTY_SERVER_ERRORS: Record<string, string[] | NestedServerErrors> = {};
type EmployerSignUpT = ReturnType<typeof useTranslation>['t'];

export const createEmployerSignUpSchema = (t: EmployerSignUpT) =>
  yup.object().shape({
    fullName: yup.string().required(t('validation.requiredFullName')).max(100, t('validation.maxFullName')),
    phone: yup
      .string()
      .required(t('validation.requiredPhone'))
      .matches(REGEX_VALIDATE.phoneRegExp, t('validation.invalidPhone'))
      .max(15, t('validation.invalidPhone')),
    email: yup.string().required(t('validation.requiredEmail')).email(t('validation.invalidEmail')).max(100, t('validation.maxEmail')),
    password: yup.string().required(t('validation.requiredPassword')).min(8, t('validation.passwordMin')).max(128, t('validation.passwordMax')).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/, t('validation.passwordRule')),
    confirmPassword: yup.string().required(t('validation.requiredConfirmPassword')).oneOf([yup.ref('password')], t('validation.confirmPasswordMatch')),
    company: yup.object().shape({
      companyName: yup.string().required(t('validation.requiredCompanyName')).max(255, t('validation.maxCompanyName')),
      location: yup.object().shape({
        city: yup.number().required(t('validation.requiredCity')).integer(t('validation.requiredCity')).moreThan(0, t('validation.requiredCity')).typeError(t('validation.requiredCity')),
      }),
    }),
  });

const applyEmployerServerErrors = (
  serverErrors: Record<string, string[] | NestedServerErrors>,
  setError: UseFormSetError<EmployerSignUpFormData>
) => {
  for (const err in serverErrors) {
    const errValue = serverErrors[err];
    if (err === 'company' && errValue && typeof errValue === 'object' && !Array.isArray(errValue)) {
      const companyErrors = errValue as NestedServerErrors;
      for (const companyErr in companyErrors) {
        if (companyErr === 'location' && typeof companyErrors[companyErr] === 'object') {
          const locationErrors = companyErrors[companyErr] as Record<string, string[]>;
          for (const locationErr in locationErrors) {
            setError(`company.location.${locationErr}` as keyof EmployerSignUpFormData, {
              type: 'manual',
              message: locationErrors[locationErr]?.join(' '),
            });
          }
        } else {
          setError(`company.${companyErr}` as keyof EmployerSignUpFormData, {
            type: 'manual',
            message: (companyErrors[companyErr] as string[])?.join(' '),
          });
        }
      }
    } else {
      const plainErrors = Array.isArray(errValue) ? errValue : [];
      setError(err as keyof EmployerSignUpFormData, {
        type: 'manual',
        message: plainErrors.join(' '),
      });
    }
  }
};

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px !important',
    backgroundColor: '#FFFFFF',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    '& .MuiOutlinedInput-notchedOutline': {
      borderRadius: '10px !important',
      borderColor: '#E2E8F0',
      transition: 'border-color 0.2s ease',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#94A3B8',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#2563EB',
      borderWidth: '1.5px',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
    },
    '& input': {
      fontSize: '0.875rem',
      py: 1.2,
    },
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
      WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
      WebkitTextFillColor: '#0F172A !important',
      caretColor: '#0F172A',
      transition: 'background-color 5000s ease-in-out 0s',
      borderRadius: '8px !important',
    },
  },
};

const EmployerSignUpForm = ({ onSignUp, serverErrors = EMPTY_SERVER_ERRORS, checkCreds }: EmployerSignUpFormProps) => {
  const { t } = useTranslation('auth');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { allConfig } = useAppSelector((state: RootState & { config?: { allConfig?: { employeeSizeOptions?: SelectOption[]; cityOptions?: SelectOption[] } } }) => state.config || {});
  const [cityOptions, setCityOptions] = React.useState<SelectOption[]>(allConfig?.cityOptions || []);
  const [districtOptions, setDistrictOptions] = React.useState<SelectOption[]>([]);

  React.useEffect(() => {
    if (allConfig?.cityOptions && allConfig.cityOptions.length > 0) {
      setCityOptions(allConfig.cityOptions);
    } else {
      let isMounted = true;
      commonService
        .getAllCitiesSimple()
        .then((res) => {
          if (isMounted && Array.isArray(res) && res.length > 0) {
            setCityOptions(res.map((c) => ({ id: Number(c.id), name: c.name })));
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [allConfig?.cityOptions]);

  const schema = React.useMemo(() => createEmployerSignUpSchema(t), [t]);

  const { control, setError, clearErrors, setValue, handleSubmit } = useForm<EmployerSignUpFormData>({
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      company: {
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        taxCode: '',
        since: null,
        fieldOperation: '',
        employeeSize: 2,
        websiteUrl: '',
        location: {
          city: '',
          district: '',
          address: '',
          lat: null,
          lng: null,
        },
      },
    },
    resolver: typedYupResolver<EmployerSignUpFormData>(schema),
  });

  const cityId = useWatch({ control, name: 'company.location.city' });

  React.useEffect(() => {
    applyEmployerServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  const prevCityIdRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    let isMounted = true;
    const loadDistricts = async (cityId: number) => {
      try {
        const resData = await commonService.getDistrictsByCityId(cityId);
        if (!isMounted) return;
        const nextDistrictOptions = resData.data?.map((d) => ({ id: d.id, name: d.name })) || [];
        if (shouldResetChildLocationValue(prevCityIdRef.current, cityId)) {
          setValue('company.location.district', '');
        }
        setDistrictOptions(nextDistrictOptions);
        prevCityIdRef.current = cityId;
      } catch (error) {
        if (isMounted) errorHandling(error);
      }
    };
    if (cityId) {
      loadDistricts(Number(cityId));
    } else {
      if (shouldResetChildLocationValue(prevCityIdRef.current, cityId)) {
        setValue('company.location.district', '');
      }
      setDistrictOptions([]);
      prevCityIdRef.current = null;
    }
    return () => {
      isMounted = false;
    };
  }, [cityId, setValue]);

  const onSubmit = async (data: EmployerSignUpFormData) => {
    setIsSubmitting(true);
    try {
      const checkCredsResult = await checkCreds(data.email, 'EMPLOYER');
      if (checkCredsResult === true) {
        clearErrors();
        const selectedCityId = data.company?.location?.city;
        const selectedDistrictId = data.company?.location?.district;
        const selectedCity = allConfig?.cityOptions?.find((c) => String(c.id) === String(selectedCityId));
        const cityName = selectedCity?.name || 'Việt Nam';

        const finalData: EmployerSignUpFormData = {
          ...data,
          company: {
            ...data.company,
            companyName: data.company.companyName,
            companyEmail: data.email,
            companyPhone: data.phone || '',
            employeeSize: 2,
            taxCode: `DRAFT_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            fieldOperation: '',
            websiteUrl: '',
            since: null,
            location: {
              city: selectedCityId,
              district: selectedDistrictId || (districtOptions[0]?.id ?? ''),
              address: cityName,
              lat: null,
              lng: null,
            },
          },
        };
        onSignUp(finalData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%' }}
    >
      <Grid container spacing={1.5}>
        {/* Họ và tên */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldCustom
            name="fullName"
            control={control}
            title={t('form.fullName')}
            placeholder={t('form.fullNamePlaceholder')}
            showRequired={true}
            sx={inputStyle}
          />
        </Grid>

        {/* Số điện thoại liên hệ */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldCustom
            name="phone"
            control={control}
            title={t('form.phone')}
            placeholder={t('form.phonePlaceholder')}
            showRequired={true}
            sx={inputStyle}
          />
        </Grid>

        {/* Email công việc */}
        <Grid size={12}>
          <TextFieldCustom
            name="email"
            control={control}
            title={t('form.email')}
            placeholder={t('form.emailPlaceholder')}
            showRequired={true}
            sx={inputStyle}
          />
        </Grid>

        {/* Mật khẩu */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <PasswordTextFieldCustom
            name="password"
            control={control}
            title={t('form.password')}
            placeholder={t('form.passwordPlaceholder')}
            showRequired={true}
            sx={inputStyle}
          />
        </Grid>

        {/* Xác nhận mật khẩu */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <PasswordTextFieldCustom
            name="confirmPassword"
            control={control}
            title={t('form.confirmPassword')}
            placeholder={t('form.confirmPasswordPlaceholder')}
            showRequired={true}
            sx={inputStyle}
          />
        </Grid>

        {/* Tên công ty / Doanh nghiệp */}
        <Grid size={12}>
          <TextFieldCustom
            name="company.companyName"
            control={control}
            title={t('form.companyName')}
            placeholder={t('form.companyNamePlaceholder')}
            showRequired={true}
            sx={inputStyle}
          />
        </Grid>

        {/* Tỉnh / Thành phố làm việc */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <SingleSelectCustom
            options={cityOptions}
            name="company.location.city"
            control={control}
            title={t('form.city')}
            placeholder={t('form.cityPlaceholder')}
            showRequired={true}
            sx={inputStyle}
          />
        </Grid>

        {/* Quận / Huyện (tuỳ chọn) */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <SingleSelectCustom
            options={districtOptions}
            name="company.location.district"
            control={control}
            disabled={!cityId}
            disabledPlaceholder={t('form.selectCityFirst', { defaultValue: 'Chọn Tỉnh/Thành trước' })}
            title={t('form.district')}
            placeholder={t('form.districtPlaceholder')}
            sx={inputStyle}
          />
        </Grid>
      </Grid>

      {/* Trust note */}
      <Box
        sx={{
          mt: 1.5,
          p: 1.25,
          px: 1.5,
          borderRadius: '8px',
          backgroundColor: '#F0FDF4',
          border: '1px solid #DCFCE7',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 16, color: '#16A34A', flexShrink: 0 }} />
        <Typography sx={{ fontSize: '12px', color: '#15803D', lineHeight: 1.4, fontWeight: 500 }}>
          Mã số thuế &amp; Giấy phép kinh doanh sẽ được bổ sung tại bước Xác thực sau khi tạo tài khoản.
        </Typography>
      </Box>

      {/* Action Button */}
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          type="submit"
          fullWidth
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          endIcon={!isSubmitting ? <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} /> : null}
          sx={{
            height: '46px',
            borderRadius: '10px',
            fontSize: '0.925rem',
            fontWeight: 700,
            textTransform: 'none',
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
            },
            '&:active': {
              transform: 'scale(0.99)',
            },
          }}
        >
          {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản tuyển dụng'}
        </Button>
      </Box>
    </Box>
  );
};

export default EmployerSignUpForm;
