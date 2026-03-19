import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Button, Stack, Step, StepLabel, Stepper, styled } from "@mui/material";
import Grid from "@mui/material/Grid2";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { useTranslation } from 'react-i18next';
import useDebounce from '../../../../hooks/useDebounce';
import { REGEX_VALIDATE } from '../../../../configs/constants';
import errorHandling from '../../../../utils/errorHandling';
import TextFieldCustom from '../../../../components/controls/TextFieldCustom';
import PasswordTextFieldCustom from '../../../../components/controls/PasswordTextFieldCustom';
import SingleSelectCustom from '../../../../components/controls/SingleSelectCustom';
import DatePickerCustom from '../../../../components/controls/DatePickerCustom';
import TextFieldAutoCompleteCustom from '../../../../components/controls/TextFieldAutoCompleteCustom';
import commonService from '../../../../services/commonService';
import goongService from '../../../../services/goongService';
import { useAppSelector } from '../../../../hooks/useAppStore';
import type { AxiosError } from 'axios';

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

    fullName: yup

      .string()

      .required(t('validation.requiredFullName'))

      .max(100, t('validation.maxCompanyName')),

    email: yup

      .string()

      .required(t('validation.requiredEmail'))

      .email(t('validation.invalidEmail'))

      .max(100, t('validation.maxEmail')),

    password: yup

      .string()

      .required(t('validation.requiredPassword'))

      .min(8, t('validation.passwordMin'))

      .max(128, t('validation.passwordMax'))

      .matches(

        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,

        t('validation.passwordRule')

      ),

    confirmPassword: yup

      .string()

      .required(t('validation.requiredConfirmPassword'))

      .oneOf([yup.ref('password')], t('validation.confirmPasswordMatch')),

    company: yup.object().shape({

      companyName: yup

        .string()

        .required(t('validation.requiredCompanyName'))

        .max(255, t('validation.maxCompanyName')),

      companyEmail: yup

        .string()

        .required(t('validation.requiredCompanyEmail'))

        .email(t('validation.invalidCompanyEmail'))

        .max(100, t('validation.maxCompanyEmail')),

      companyPhone: yup

        .string()

        .required(t('validation.requiredCompanyPhone'))

        .matches(REGEX_VALIDATE.phoneRegExp, t('validation.invalidCompanyPhone'))

        .max(15, t('validation.maxCompanyPhone')),

      taxCode: yup

        .string()

        .required(t('validation.requiredTaxCode'))

        .max(30, t('validation.maxTaxCode')),

      since: yup.date().nullable().typeError(t('validation.invalidDate') as any),

      fieldOperation: yup

        .string()

        .max(255, t('validation.maxFieldOperation')),

      employeeSize: yup

        .number()

        .required(t('validation.requiredEmployeeSize'))

        .typeError(t('validation.requiredEmployeeSize')),

      websiteUrl: yup

        .string()

        .max(300, t('validation.maxWebsite')),

      location: yup.object().shape({

        city: yup

          .number()

          .required(t('validation.requiredCity'))

          .typeError(t('validation.requiredCity')),

        district: yup

          .number()

          .required(t('validation.requiredDistrict'))

          .typeError(t('validation.requiredDistrict')),

        address: yup
          .string()
          .required(t('validation.requiredAddress'))
          .max(255, t('validation.maxAddress')),
        lat: yup.string().optional(),
        lng: yup.string().optional(),
      }),

    }),

  });

  const { control, setError, clearErrors, setValue, getValues, handleSubmit } =
    useForm<EmployerSignUpFormData>({
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

  const cityId = useWatch({

    control,

    name: 'company.location.city',

  });

  const address = useWatch({

    control,

    name: 'company.location.address',

  });

  const addressDebounce = useDebounce(address, 500);

  React.useEffect(() => {
    for (const err in serverErrors) {
      if (err === 'company' && typeof serverErrors[err] === 'object') {
        const companyErrors = serverErrors[err];
        for (const companyErr in companyErrors) {
          if (companyErr === 'location' && typeof companyErrors[companyErr] === 'object') {
            const locationErrors = companyErrors[companyErr];
            for (const locationErr in locationErrors) {
              setError(`company.location.${locationErr}` as any, {
                type: 'manual',
                message: locationErrors[locationErr]?.join(' '),
              });
            }
          } else {
            setError(`company.${companyErr}` as any, {
              type: 'manual',
              message: companyErrors[companyErr]?.join(' '),
            });
          }
        }
      } else {
        setError(err as any, {
          type: 'manual',
          message: serverErrors[err]?.join(' '),
        });
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
      } catch (error) {}
    };

    loadLocation(addressDebounce);
  }, [addressDebounce]);

  const handleSelectLocation = async (e: any, value: any) => {
    if (!value || typeof value !== 'object' || !value.place_id) {
      return;
    }

    try {
      const resData = await goongService.getPlaceDetailByPlaceId(
        value.place_id
      ) as any;

      if (!resData?.result?.geometry?.location) {
        return;
      }

      setValue(
        'company.location.lat',
        resData?.result?.geometry.location.lat?.toString() || ''
      );

      setValue(
        'company.location.lng',
        resData?.result?.geometry.location.lng?.toString() || ''
      );
    } catch (error) {}
  };

  React.useEffect(() => {
    const loadDistricts = async (cityId: number) => {
      try {
        const resData = await commonService.getDistrictsByCityId(cityId) as any;
        if (districtOptions.length > 0)
          setValue('company.location.district', '' as any);
        setDistrictOptions(resData.data);
      } catch (error) {
        errorHandling(error as AxiosError<any>, undefined);
      }
    };

    if (cityId) {
      loadDistricts(cityId as unknown as number);
    }
  }, [cityId, setValue, districtOptions.length]);

  const handleSubmtNextSuccess = (data: any) => {
    handleNext(data.email);
  };

  const handleSubmitNextError = async (errors: any) => {
    if (
      !('fullName' in errors) &&
      !('email' in errors) &&
      !('password' in errors) &&
      !('confirmPassword' in errors)
    ) {
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

  const handleBack = () => {

    setActiveStep(activeStep - 1);

  };

  const formContent = (actStep: number) => (

    <Box>

      <Stack

        spacing={2.5}

        sx={{ mb: 2, display: actStep === 0 ? 'block' : 'none' }}

      >

        <TextFieldCustom

          name="fullName"

          control={control}

          title={t('form.fullName')}

          placeholder={t('form.fullNamePlaceholder')}

          showRequired={true}

          sx={{

            '& .MuiOutlinedInput-root': {

              borderRadius: '10px',

              backgroundColor: 'rgba(255, 255, 255, 0.8)',

            }

          }}

        />

        <TextFieldCustom

          name="email"

          control={control}

          title={t('form.email')}

          placeholder={t('form.emailPlaceholder')}

          showRequired={true}

          sx={{

            '& .MuiOutlinedInput-root': {

              borderRadius: '10px',

              backgroundColor: 'rgba(255, 255, 255, 0.8)',

            }

          }}

        />

        <PasswordTextFieldCustom

          name="password"

          control={control}

          title={t('form.password')}

          placeholder={t('form.passwordPlaceholder')}

          showRequired={true}

          sx={{

            '& .MuiOutlinedInput-root': {

              borderRadius: '10px',

              backgroundColor: 'rgba(255, 255, 255, 0.8)',

            }

          }}

        />

        <PasswordTextFieldCustom

          name="confirmPassword"

          control={control}

          title={t('form.confirmPassword')}

          placeholder={t('form.confirmPasswordPlaceholder')}

          showRequired={true}

          sx={{

            '& .MuiOutlinedInput-root': {

              borderRadius: '10px',

              backgroundColor: 'rgba(255, 255, 255, 0.8)',

            }

          }}

        />

      </Stack>

      <Box sx={{ mb: 2, display: actStep !== 0 ? 'block' : 'none' }}>

        <Grid container spacing={2.5}>

          <Grid size={12}>

            <TextFieldCustom

              name="company.companyName"

              control={control}

              title={t('form.companyName')}

              placeholder={t('form.companyNamePlaceholder')}

              showRequired={true}

              sx={{

                '& .MuiOutlinedInput-root': {

                  borderRadius: '10px',

                  backgroundColor: 'rgba(255, 255, 255, 0.8)',

                }

              }}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 12,

              lg: 12,

              xl: 12

            }}>

            <TextFieldCustom

              name="company.companyEmail"

              control={control}

              title={t('form.companyEmail')}

              placeholder={t('form.companyEmailPlaceholder')}

              showRequired={true}

              sx={{

                '& .MuiOutlinedInput-root': {

                  borderRadius: '10px',

                  backgroundColor: 'rgba(255, 255, 255, 0.8)',

                }

              }}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <TextFieldCustom

              name="company.companyPhone"

              control={control}

              title={t('form.companyPhone')}

              placeholder={t('form.companyPhonePlaceholder')}

              showRequired={true}

              sx={{

                '& .MuiOutlinedInput-root': {

                  borderRadius: '10px',

                  backgroundColor: 'rgba(255, 255, 255, 0.8)',

                }

              }}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 6,

              lg: 6,

              xl: 6

            }}>

            <TextFieldCustom

              name="company.taxCode"

              control={control}

              title={t('form.taxCode')}

              placeholder={t('form.taxCodePlaceholder')}

              showRequired={true}

              sx={{

                '& .MuiOutlinedInput-root': {

                  borderRadius: '10px',

                  backgroundColor: 'rgba(255, 255, 255, 0.8)',

                }

              }}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 4,

              lg: 4,

              xl: 4

            }}>

            <DatePickerCustom

              name="company.since"

              control={control}

              title={t('form.foundedDate')}

              sx={{

                '& .MuiOutlinedInput-root': {

                  borderRadius: '10px',

                  backgroundColor: 'rgba(255, 255, 255, 0.8)',

                }

              }}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 8,

              lg: 8,

              xl: 8

            }}>

            <TextFieldCustom

              name="company.fieldOperation"

              control={control}

              title={t('form.fieldOperation')}

              placeholder={t('form.fieldOperationPlaceholder')}

              sx={{

                '& .MuiOutlinedInput-root': {

                  borderRadius: '10px',

                  backgroundColor: 'rgba(255, 255, 255, 0.8)',

                }

              }}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 4,

              lg: 4,

              xl: 4

            }}>

            <SingleSelectCustom

              options={allConfig?.employeeSizeOptions || []}

              name="company.employeeSize"

              control={control}

              title={t('form.employeeSize')}

              placeholder={t('form.employeeSizePlaceholder')}

              showRequired={true}

              sx={{

                '& .MuiOutlinedInput-root': {

                  borderRadius: '10px',

                  backgroundColor: 'rgba(255, 255, 255, 0.8)',

                }

              }}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 8,

              lg: 8,

              xl: 8

            }}>

            <TextFieldCustom

              name="company.websiteUrl"

              control={control}

              title={t('form.website')}

              placeholder={t('form.websitePlaceholder')}

              sx={{

                '& .MuiOutlinedInput-root': {

                  borderRadius: '10px',

                  backgroundColor: 'rgba(255, 255, 255, 0.8)',

                }

              }}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 8,

              lg: 8,

              xl: 8

            }}>

            <SingleSelectCustom

              options={allConfig?.cityOptions || []}

              name="company.location.city"

              control={control}

              title={t('form.city')}

              placeholder={t('form.cityPlaceholder')}

              showRequired={true}

              sx={{

                '& .MuiOutlinedInput-root': {

                  borderRadius: '10px',

                  backgroundColor: 'rgba(255, 255, 255, 0.8)',

                }

              }}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 4,

              lg: 4,

              xl: 4

            }}>

            <SingleSelectCustom

              options={districtOptions}

              name="company.location.district"

              control={control}

              title={t('form.district', 'Ward/Commune')}

              placeholder={t('form.districtPlaceholder', 'Select ward/commune')}

              showRequired={true}

              sx={{

                '& .MuiOutlinedInput-root': {

                  borderRadius: '10px',

                  backgroundColor: 'rgba(255, 255, 255, 0.8)',

                }

              }}

            />

          </Grid>

          <Grid

            size={{

              xs: 12,

              sm: 12,

              md: 12,

              lg: 12,

              xl: 12

            }}>

            <TextFieldAutoCompleteCustom

              name="company.location.address"

              title={t('form.address')}

              showRequired={true}

              placeholder={t('form.addressPlaceholder')}

              control={control}

              options={locationOptions}

              loading={true}

              handleSelect={handleSelectLocation}

              helperText={t('form.addressHelper')}

              sx={{

                '& .MuiOutlinedInput-root': {

                  borderRadius: '10px',

                  backgroundColor: 'rgba(255, 255, 255, 0.8)',

                }

              }}

            />

          </Grid>

        </Grid>

      </Box>

    </Box>

  );

  return (

    <Box

      component="form"

      onSubmit={

        activeStep === steps.length - 1

          ? handleSubmit(onSignUp as any)

          : handleSubmit(handleSubmtNextSuccess, handleSubmitNextError)

      }

      sx={{

        width: '100%',

        '& .MuiTextField-root': {

          borderRadius: '10px',

        },

      }}

    >

      <StyledStepper activeStep={activeStep} sx={{ pb: 4 }}>

        {steps.map((label) => (

          <Step key={label}>

            <StepLabel>{label}</StepLabel>

          </Step>

        ))}

      </StyledStepper>

      <>

        {formContent(activeStep)}

        <Stack

          sx={{ mt: 4 }}

          spacing={2}

          direction={{ xs: 'column', sm: 'row' }}

          justifyContent="flex-end"

        >

          {activeStep !== 0 && (

            <StyledButton

              variant="outlined"

              onClick={handleBack}

              startIcon={<NavigateBeforeIcon />}

            >

              {t('actions.back')}

            </StyledButton>

          )}

          {activeStep === steps.length - 1 ? (

            <StyledButton

              variant="contained"

              type="submit"

              startIcon={<HowToRegIcon />}

            >

              {t('actions.signUp')}

            </StyledButton>

          ) : (

            <StyledButton

              variant="contained"

              type="submit"

              endIcon={<NavigateNextIcon />}

            >

              {t('actions.next')}

            </StyledButton>

          )}

        </Stack>

      </>

    </Box>

  );

};

export default EmployerSignUpForm;

