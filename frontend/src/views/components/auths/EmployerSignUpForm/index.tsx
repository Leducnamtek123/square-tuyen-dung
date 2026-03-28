import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Button, Stack, Step, StepLabel, Stepper, styled } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { useTranslation } from 'react-i18next';
import useDebounce from '../../../../hooks/useDebounce';
import { REGEX_VALIDATE } from '../../../../configs/constants';
import errorHandling from '../../../../utils/errorHandling';
import commonService from '../../../../services/commonService';
import goongService from '../../../../services/goongService';
import authService from '../../../../services/authService';
import { useAppSelector } from '../../../../hooks/useAppStore';
import type { AxiosError } from 'axios';

import AccountInfoStep from './AccountInfoStep';
import CompanyInfoStep from './CompanyInfoStep';

interface EmployerSignUpFormData {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  company: {
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    taxCode: string;
    since?: any;
    fieldOperation: string;
    employeeSize: string | number;
    websiteUrl: string;
    location: {
      city: string | number;
      district: string | number;
      address: string;
      lat: string;
      lng: string;
    };
  };
}

interface EmployerSignUpFormProps {
  onSignUp: (data: EmployerSignUpFormData) => void;
  serverErrors?: Record<string, any>;
  checkCreds: (email: string, roleName: any) => Promise<boolean>;
}

const StyledButton = styled(Button)(({ theme }) => ({
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepLabel-root .Mui-completed': {
    color: theme.palette.primary.main,
  },
  '& .MuiStepLabel-root .Mui-active': {
    color: theme.palette.primary.main,
  },
  '& .MuiStepLabel-label': {
    fontSize: '14px',
    fontWeight: 500,
  },
}));

const EmployerSignUpForm = ({ onSignUp, serverErrors = {}, checkCreds }: EmployerSignUpFormProps) => {
  const { t } = useTranslation('auth');
  const steps = [t('steps.loginInfo'), t('steps.companyInfo')];
  const [activeStep, setActiveStep] = React.useState(0);
  const { allConfig } = useAppSelector((state: any) => state.config);
  const [districtOptions, setDistrictOptions] = React.useState([]);
  const [locationOptions, setLocationOptions] = React.useState([]);

  const schema = yup.object().shape({
    fullName: yup.string().required(t('validation.requiredFullName')).max(100, t('validation.maxCompanyName')),
    email: yup.string().required(t('validation.requiredEmail')).email(t('validation.invalidEmail')).max(100, t('validation.maxEmail')),
    password: yup.string().required(t('validation.requiredPassword')).min(8, t('validation.passwordMin')).max(128, t('validation.passwordMax')).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/, t('validation.passwordRule')),
    confirmPassword: yup.string().required(t('validation.requiredConfirmPassword')).oneOf([yup.ref('password')], t('validation.confirmPasswordMatch')),
    company: yup.object().shape({
      companyName: yup.string().required(t('validation.requiredCompanyName')).max(255, t('validation.maxCompanyName')),
      companyEmail: yup.string().required(t('validation.requiredCompanyEmail')).email(t('validation.invalidCompanyEmail')).max(100, t('validation.maxCompanyEmail')),
      companyPhone: yup.string().required(t('validation.requiredCompanyPhone')).matches(REGEX_VALIDATE.phoneRegExp, t('validation.invalidCompanyPhone')).max(15, t('validation.maxCompanyPhone')),
      taxCode: yup.string().required(t('validation.requiredTaxCode')).max(30, t('validation.maxTaxCode')),
      since: yup.date().nullable().typeError(t('validation.invalidDate') as any),
      fieldOperation: yup.string().max(255, t('validation.maxFieldOperation')),
      employeeSize: yup.number().required(t('validation.requiredEmployeeSize')).typeError(t('validation.requiredEmployeeSize')),
      websiteUrl: yup.string().max(300, t('validation.maxWebsite')),
      location: yup.object().shape({
        city: yup.number().required(t('validation.requiredCity')).typeError(t('validation.requiredCity')),
        district: yup.number().required(t('validation.requiredDistrict')).typeError(t('validation.requiredDistrict')),
        address: yup.string().required(t('validation.requiredAddress')).max(255, t('validation.maxAddress')),
        lat: yup.string().optional(),
        lng: yup.string().optional(),
      }),
    }),
  });

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
        employeeSize: '',
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
    resolver: yupResolver(schema) as any,
  });

  const cityId = useWatch({ control, name: 'company.location.city' });
  const email = useWatch({ control, name: 'email' });
  const address = useWatch({ control, name: 'company.location.address' });
  const emailDebounce = useDebounce(email, 500);
  const addressDebounce = useDebounce(address, 500);

  const [emailExistsError, setEmailExistsError] = React.useState(false);

  React.useEffect(() => {
    for (const err in serverErrors) {
      if (err === 'company' && typeof serverErrors[err] === 'object') {
        const companyErrors = serverErrors[err];
        for (const companyErr in companyErrors) {
          if (companyErr === 'location' && typeof companyErrors[companyErr] === 'object') {
            const locationErrors = companyErrors[companyErr];
            for (const locationErr in locationErrors) {
              setError(`company.location.${locationErr}` as any, { type: 'manual', message: locationErrors[locationErr]?.join(' ') });
            }
          } else {
            setError(`company.${companyErr}` as any, { type: 'manual', message: companyErrors[companyErr]?.join(' ') });
          }
        }
      } else {
        setError(err as any, { type: 'manual', message: serverErrors[err]?.join(' ') });
      }
    }
  }, [serverErrors, setError]);

  React.useEffect(() => {
    const loadLocation = async (input: string) => {
      if (!input || input.trim().length < 3) {
        setLocationOptions([]);
        return;
      }
      try {
        const resData = await goongService.getPlaces(input) as any;
        if (resData.predictions) setLocationOptions(resData.predictions);
      } catch (error) { }
    };
    loadLocation(addressDebounce);
  }, [addressDebounce]);

  React.useEffect(() => {
    const normalizedEmail = String(emailDebounce || '').trim();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      if (emailExistsError) {
        clearErrors('email');
        setEmailExistsError(false);
      }
      return;
    }
    const checkEmail = async () => {
      try {
        const resData = (await authService.emailExists(normalizedEmail)) as any;
        if (resData?.exists === true) {
          setError('email', { type: 'manual', message: t('validation.emailExists') });
          setEmailExistsError(true);
        } else if (emailExistsError) {
          clearErrors('email');
          setEmailExistsError(false);
        }
      } catch {
        /* ignore */
      }
    };
    checkEmail();
  }, [emailDebounce, clearErrors, emailExistsError, setError, t]);

  const handleSelectLocation = async (e: any, value: any) => {
    if (!value || typeof value !== 'object' || !value.place_id) return;
    try {
      const resData = await goongService.getPlaceDetailByPlaceId(value.place_id) as any;
      if (!resData?.result?.geometry?.location) return;
      setValue('company.location.lat', resData?.result?.geometry.location.lat?.toString() || '');
      setValue('company.location.lng', resData?.result?.geometry.location.lng?.toString() || '');
    } catch (error) { }
  };

  const prevCityIdRef = React.useRef<any>(null);
  React.useEffect(() => {
    const loadDistricts = async (cityId: number) => {
      try {
        const resData = await commonService.getDistrictsByCityId(cityId) as any;
        // Only clear district if the cityId has actually changed (user interaction)
        // and it's not the initial load (prevCityIdRef.current is not null).
        if (prevCityIdRef.current !== null && prevCityIdRef.current !== cityId) {
          setValue('company.location.district', '' as any);
        }
        setDistrictOptions(resData);
        prevCityIdRef.current = cityId;
      } catch (error) {
        errorHandling(error as AxiosError<any>, undefined);
      }
    };
    if (cityId) loadDistricts(cityId as unknown as number);
  }, [cityId, setValue]);

  const handleSubmtNextSuccess = (data: any) => handleNext(data.email);

  const handleSubmitNextError = async (errors: any) => {
    if (!('fullName' in errors) && !('email' in errors) && !('password' in errors) && !('confirmPassword' in errors)) {
      const email = getValues('email');
      handleNext(email);
    }
  };

  const handleNext = async (email: string) => {
    const checkCredsResult = await checkCreds(email, null);
    if (checkCredsResult === true) {
      clearErrors();
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => setActiveStep(activeStep - 1);

  return (
    <Box
      component="form"
      onSubmit={activeStep === steps.length - 1 ? handleSubmit(onSignUp as any) : handleSubmit(handleSubmtNextSuccess, handleSubmitNextError)}
      sx={{ width: '100%', '& .MuiTextField-root': { borderRadius: '10px' } }}
    >
      <StyledStepper activeStep={activeStep} sx={{ pb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </StyledStepper>
      <>
        <Box>
          <AccountInfoStep control={control} t={t} show={activeStep === 0} />
          <CompanyInfoStep
            control={control}
            t={t}
            show={activeStep !== 0}
            allConfig={allConfig}
            districtOptions={districtOptions}
            locationOptions={locationOptions}
            handleSelectLocation={handleSelectLocation}
          />
        </Box>
        <Stack sx={{ mt: 4 }} spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end">
          {activeStep !== 0 && (
            <StyledButton variant="outlined" onClick={handleBack} startIcon={<NavigateBeforeIcon />}>
              {t('actions.back')}
            </StyledButton>
          )}
          {activeStep === steps.length - 1 ? (
            <StyledButton variant="contained" type="submit" startIcon={<HowToRegIcon />}>
              {t('actions.signUp')}
            </StyledButton>
          ) : (
            <StyledButton variant="contained" type="submit" endIcon={<NavigateNextIcon />}>
              {t('actions.next')}
            </StyledButton>
          )}
        </Stack>
      </>
    </Box>
  );
};

export default EmployerSignUpForm;
