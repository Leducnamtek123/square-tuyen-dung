'use client';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { typedYupResolver } from '@/utils/formHelpers';
import * as yup from 'yup';
import { Box, Button, Stack, styled } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessIcon from '@mui/icons-material/Business';
import { useTranslation } from 'react-i18next';
import useDebounce from '@/hooks/useDebounce';
import { DATE_OPTIONS, REGEX_VALIDATE } from '@/configs/constants';
import errorHandling from '@/utils/errorHandling';
import commonService from '@/services/commonService';
import goongService from '@/services/goongService';
import { useAppSelector } from '@/hooks/useAppStore';
import type { RoleName, EmployerSignUpFormData } from '@/types/auth';
import type { RootState } from '@/redux/store';
import type { SelectOption } from '@/types/models';
import { shouldResetChildLocationValue } from '@/utils/locationForm';

import AccountInfoStep from './AccountInfoStep';
import CompanyInfoStep from './CompanyInfoStep';
import type { FieldErrors } from 'react-hook-form';
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
    email: yup.string().required(t('validation.requiredEmail')).email(t('validation.invalidEmail')).max(100, t('validation.maxEmail')),
    password: yup.string().required(t('validation.requiredPassword')).min(8, t('validation.passwordMin')).max(128, t('validation.passwordMax')).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/, t('validation.passwordRule')),
    confirmPassword: yup.string().required(t('validation.requiredConfirmPassword')).oneOf([yup.ref('password')], t('validation.confirmPasswordMatch')),
    company: yup.object().shape({
      companyName: yup.string().required(t('validation.requiredCompanyName')).max(255, t('validation.maxCompanyName')),
      companyEmail: yup.string().required(t('validation.requiredCompanyEmail')).email(t('validation.invalidCompanyEmail')).max(100, t('validation.maxCompanyEmail')),
      companyPhone: yup.string().required(t('validation.requiredCompanyPhone')).matches(REGEX_VALIDATE.phoneRegExp, t('validation.invalidCompanyPhone')).max(15, t('validation.maxCompanyPhone')),
      taxCode: yup.string().required(t('validation.requiredTaxCode')).max(30, t('validation.maxTaxCode')),
      since: yup
        .date()
        .nullable()
        .typeError(t('validation.invalidDate') || '')
        .max(DATE_OPTIONS.today(), t('validation.foundedDateInFuture')),
      fieldOperation: yup.string().max(255, t('validation.maxFieldOperation')),
      employeeSize: yup
        .number()
        .required(t('validation.requiredEmployeeSize'))
        .typeError(t('validation.requiredEmployeeSize'))
        .oneOf([1, 2, 3, 4], t('validation.employeeSizeInvalid')),
      websiteUrl: yup
        .string()
        .transform((value, originalValue) => (typeof originalValue === 'string' && originalValue.trim() === '' ? null : value?.trim() || value))
        .nullable()
        .notRequired()
        .url(t('common:validation.invalidUrl'))
        .max(300, t('validation.maxWebsite')),
      location: yup.object().shape({
        city: yup.number().required(t('validation.requiredCity')).integer(t('validation.requiredCity')).moreThan(0, t('validation.requiredCity')).typeError(t('validation.requiredCity')),
        district: yup.number().required(t('validation.requiredDistrict')).integer(t('validation.requiredDistrict')).moreThan(0, t('validation.requiredDistrict')).typeError(t('validation.requiredDistrict')),
        address: yup.string().required(t('validation.requiredAddress')).max(255, t('validation.maxAddress')),
        lat: yup.number().nullable().transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : value)).typeError(t('validation.invalidLatitude')),
        lng: yup.number().nullable().transform((value, originalValue) => (originalValue === '' || originalValue === null ? null : value)).typeError(t('validation.invalidLongitude')),
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

const syncLocationOptions = async (
  input: string,
  setLocationOptions: React.Dispatch<React.SetStateAction<SelectOption[]>>
) => {
  if (!input || input.trim().length < 3) {
    setLocationOptions([]);
    return;
  }

  try {
    const resData = await goongService.getPlaces(input);
    if (resData.predictions) {
      const mappedOptions: SelectOption[] = resData.predictions.map((p) => ({
        id: p.place_id,
        name: p.description,
        place_id: p.place_id,
      }));
      setLocationOptions(mappedOptions);
    }
  } catch {
    setLocationOptions([]);
  }
};

const StyledButton = styled(Button)(({ theme }) => ({
  minHeight: '48px',
  padding: '10px 24px',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 700,
  textTransform: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  '& .MuiButton-startIcon, & .MuiButton-endIcon': {
    margin: 0,
    display: 'inline-flex',
    alignItems: 'center',
  },
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  '&.MuiButton-contained': {
    color: '#ffffff',
    background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
      transform: 'translateY(-1px)',
      boxShadow: '0 12px 24px rgba(37, 99, 235, 0.32)',
    },
  },
  '&.MuiButton-outlined': {
    borderColor: '#E2E8F0',
    color: '#475569',
    backgroundColor: '#FFFFFF',
    '&:hover': {
      borderColor: '#CBD5E1',
      backgroundColor: '#F8FAFC',
      transform: 'translateY(-1px)',
    },
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const EmployerSignUpForm = ({ onSignUp, serverErrors = EMPTY_SERVER_ERRORS, checkCreds }: EmployerSignUpFormProps) => {
  const { t } = useTranslation('auth');
  const [activeStep, setActiveStep] = React.useState(0);
  const { allConfig } = useAppSelector((state: RootState & { config?: { allConfig?: { employeeSizeOptions?: SelectOption[]; cityOptions?: SelectOption[] } } }) => state.config || {});
  const [districtOptions, setDistrictOptions] = React.useState<SelectOption[]>([]);
  const [locationOptions, setLocationOptions] = React.useState<SelectOption[]>([]);

  const schema = React.useMemo(() => createEmployerSignUpSchema(t), [t]);

  const { control, setError, clearErrors, setValue, getValues, handleSubmit } = useForm<EmployerSignUpFormData>({
    defaultValues: {
      fullName: '',
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
        employeeSize: 0,
        websiteUrl: '',
        location: {
          city: '',
          district: '',
          address: '',
          lat: '',
          lng: '',
        },
      },
    },
    resolver: typedYupResolver<EmployerSignUpFormData>(schema),
  });

  const cityId = useWatch({ control, name: 'company.location.city' });
  const address = useWatch({ control, name: 'company.location.address' });
  const addressDebounce = useDebounce(address, 500);

  React.useEffect(() => {
    applyEmployerServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  React.useEffect(() => {
    void syncLocationOptions(addressDebounce, setLocationOptions);
  }, [addressDebounce]);

  const handleSelectLocation = async (e: React.SyntheticEvent, value: string | SelectOption | null) => {
    if (!value || typeof value !== 'object' || !value.place_id) return;
    try {
      const resData = await goongService.getPlaceDetailByPlaceId(value.place_id as string);
      if (!resData?.result?.geometry?.location) return;
      setValue('company.location.lat', resData.result.geometry.location.lat.toString() || '');
      setValue('company.location.lng', resData.result.geometry.location.lng.toString() || '');
    } catch (error) {
      console.warn('Could not fetch place coordinates:', error);
    }
  };

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

  const handleSubmtNextSuccess = (data: EmployerSignUpFormData) => handleNext(data.email);

  const handleSubmitNextError = async (errors: FieldErrors<EmployerSignUpFormData>) => {
    if (!('fullName' in errors) && !('email' in errors) && !('password' in errors) && !('confirmPassword' in errors)) {
      const email = getValues('email');
      handleNext(email);
    }
  };

  const handleNext = async (email: string) => {
    const checkCredsResult = await checkCreds(email, 'EMPLOYER');
    if (checkCredsResult === true) {
      clearErrors();
      setActiveStep((currentStep) => currentStep + 1);
    }
  };

  const handleBack = () => setActiveStep((currentStep) => currentStep - 1);

  const companyLocationValue = useWatch({ control, name: 'company.location' });
  const handleSignUpLocationChange = (val: { address?: string; lat?: number | string | null; lng?: number | string | null }) => {
    if (val.address) setValue('company.location.address', val.address, { shouldDirty: true, shouldValidate: true });
    if (val.lat !== null && val.lat !== undefined) setValue('company.location.lat', val.lat?.toString() || '', { shouldDirty: true });
    if (val.lng !== null && val.lng !== undefined) setValue('company.location.lng', val.lng?.toString() || '', { shouldDirty: true });
  };

  return (
    <Box
      component="form"
      onSubmit={activeStep === 1 ? handleSubmit(onSignUp) : handleSubmit(handleSubmtNextSuccess, handleSubmitNextError)}
      sx={{ width: '100%', '& .MuiTextField-root': { borderRadius: '12px' } }}
    >
      {/* Modern Segmented Step Indicator */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1.5,
          p: 0.75,
          backgroundColor: '#F1F5F9',
          borderRadius: '16px',
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            py: 1.25,
            px: 2,
            borderRadius: '12px',
            backgroundColor: activeStep === 0 ? '#FFFFFF' : 'transparent',
            boxShadow: activeStep === 0 ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            color: activeStep === 0 ? '#1E40AF' : activeStep > 0 ? '#10B981' : '#64748B',
            fontWeight: 600,
            fontSize: '13.5px',
            transition: 'all 0.2s ease',
          }}
        >
          {activeStep > 0 ? (
            <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />
          ) : (
            <PersonOutlineIcon sx={{ fontSize: 18 }} />
          )}
          <span>1. {t('steps.loginInfo')}</span>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            py: 1.25,
            px: 2,
            borderRadius: '12px',
            backgroundColor: activeStep === 1 ? '#FFFFFF' : 'transparent',
            boxShadow: activeStep === 1 ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
            color: activeStep === 1 ? '#1E40AF' : '#64748B',
            fontWeight: 600,
            fontSize: '13.5px',
            transition: 'all 0.2s ease',
          }}
        >
          <BusinessIcon sx={{ fontSize: 18 }} />
          <span>2. {t('steps.companyInfo')}</span>
        </Box>
      </Box>

      {/* Step Form Content */}
      <Box>
        <AccountInfoStep control={control} t={t} show={activeStep === 0} />
        <CompanyInfoStep
          control={control}
          t={t}
          show={activeStep !== 0}
          allConfig={allConfig as { employeeSizeOptions?: SelectOption[]; cityOptions?: SelectOption[] } | null}
          districtOptions={districtOptions}
          locationOptions={locationOptions}
          handleSelectLocation={handleSelectLocation}
          locationValue={companyLocationValue}
          onLocationChange={handleSignUpLocationChange}
        />
      </Box>

      {/* Action Buttons */}
      <Stack
        sx={{ mt: 4 }}
        spacing={2}
        direction={{ xs: 'column-reverse', sm: 'row' }}
        justifyContent="space-between"
      >
        {activeStep !== 0 ? (
          <StyledButton
            variant="outlined"
            onClick={handleBack}
            startIcon={<NavigateBeforeIcon />}
            sx={{ flex: { xs: 1, sm: '0 0 auto' } }}
          >
            {t('actions.back')}
          </StyledButton>
        ) : (
          <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
        )}

        {activeStep === 1 ? (
          <StyledButton
            variant="contained"
            type="submit"
            startIcon={<HowToRegIcon />}
            sx={{ flex: { xs: 1, sm: '0 0 auto' }, minWidth: { sm: 160 } }}
          >
            {t('actions.signUp')}
          </StyledButton>
        ) : (
          <StyledButton
            variant="contained"
            type="submit"
            endIcon={<NavigateNextIcon />}
            sx={{ flex: { xs: 1, sm: '0 0 auto' }, minWidth: { sm: 160 } }}
          >
            {t('actions.next')}
          </StyledButton>
        )}
      </Stack>
    </Box>
  );
};

export default EmployerSignUpForm;
