import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Box, Button, Stack, styled, Divider } from "@mui/material";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import GoogleIcon from "@mui/icons-material/Google";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from 'react-i18next';
import TextFieldCustom from "../../../../components/Common/Controls/TextFieldCustom";
import PasswordTextFieldCustom from "../../../../components/Common/Controls/PasswordTextFieldCustom";
import useDebounce from "../../../../hooks/useDebounce";
import authService from "../../../../services/authService";
import type { RoleName } from "../../../../types/auth";
import type { CodeResponse } from '@react-oauth/google';
import type { Resolver as ReactHookFormResolver } from 'react-hook-form';

export interface JobSeekerSignUpFormData {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

interface JobSeekerSignUpFormProps {
  onRegister: (data: JobSeekerSignUpFormData) => void;
  onFacebookRegister: (result: Record<string, unknown>) => void;
  onGoogleRegister: (result: Omit<CodeResponse, "error" | "error_description" | "error_uri">) => void;
  serverErrors?: Record<string, string[]>;
  checkCreds?: (email: string, roleName: RoleName) => Promise<boolean>;
}



const StyledButton = styled(Button)(({ theme }) => ({

  padding: "8px 16px",

  borderRadius: "8px",

  fontSize: "14px",

  fontWeight: 500,

  textTransform: "none",

  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",

  transition: "all 0.2s ease",

  "&:hover": {

    transform: "translateY(-1px)",

    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",

  },

}));

const StyledSocialButton = styled(Button)(({ theme }) => ({

  padding: "8px 16px",

  borderRadius: "8px",

  fontSize: "14px",

  fontWeight: 500,

  textTransform: "none",

  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",

  transition: "all 0.2s ease",

  "&:hover": {

    transform: "translateY(-1px)",

    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",

  },

}));

const StyledDivider = styled(Divider)({

  margin: "20px 0",

  "&::before, &::after": {

    borderColor: "rgba(0, 0, 0, 0.2)",

  },

  "& .MuiDivider-wrapper": {

    padding: "0 16px",

    fontSize: "13px",

    color: "rgba(0, 0, 0, 0.6)",

  },

});

const JobSeekerSignUpForm = ({
  onRegister,
  onFacebookRegister,
  onGoogleRegister,
  serverErrors = {},
}: JobSeekerSignUpFormProps) => {

  const { t } = useTranslation('auth');

  const schema = yup.object().shape({

    fullName: yup.string().required(t('validation.requiredFullName')),

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

      .oneOf([yup.ref("password")], t('validation.confirmPasswordMatch')),

  });

  const { control, setError, clearErrors, handleSubmit } = useForm<JobSeekerSignUpFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(schema) as unknown as ReactHookFormResolver<JobSeekerSignUpFormData>,
  });

  const email = useWatch({
    control,
    name: 'email',
  });

  const emailDebounce = useDebounce(email, 500);
  const [emailExistsError, setEmailExistsError] = React.useState(false);

  React.useEffect(() => {
    for (const err in serverErrors) {
      setError(err as keyof JobSeekerSignUpFormData, { type: 'manual', message: serverErrors[err]?.join(" ") });
    }
  }, [serverErrors, setError]);

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
        const resData = (await authService.emailExists(normalizedEmail)) as { exists: boolean };
        if (resData?.exists === true) {
          setError('email', {
            type: 'manual',
            message: t('validation.emailExists'),
          });
          setEmailExistsError(true);
        } else if (emailExistsError) {
          clearErrors('email');
          setEmailExistsError(false);
        }
      } catch {
        // ignore email existence errors
      }
    };

    checkEmail();
  }, [emailDebounce, emailExistsError, clearErrors, setError, t]);

  const googleRegister = useGoogleLogin({

    onSuccess: onGoogleRegister,

    flow: "auth-code",
    ux_mode: "popup",
    redirect_uri: (typeof window !== 'undefined' ? window.location.origin : ''),

  });

  return (

    <Box

      component="form"

      onSubmit={handleSubmit(onRegister)}

      sx={{

        width: "100%",

        "& .MuiTextField-root": {

          borderRadius: "10px",

        },

      }}

    >

      <Stack spacing={2.5} sx={{ mb: 3 }}>

        <TextFieldCustom

          name="fullName"

          control={control}

          title={t('form.fullName')}

          placeholder={t('form.fullNamePlaceholder')}

          showRequired={true}

          sx={{

            "& .MuiOutlinedInput-root": {

              borderRadius: "10px",

              backgroundColor: "rgba(255, 255, 255, 0.8)",

            },

          }}

        />

        <TextFieldCustom

          name="email"

          control={control}

          title={t('form.email')}

          placeholder={t('form.emailPlaceholder')}

          showRequired={true}

          sx={{

            "& .MuiOutlinedInput-root": {

              borderRadius: "10px",

              backgroundColor: "rgba(255, 255, 255, 0.8)",

            },

          }}

        />

        <PasswordTextFieldCustom

          name="password"

          control={control}

          title={t('form.password')}

          placeholder={t('form.passwordPlaceholder')}

          showRequired={true}

          sx={{

            "& .MuiOutlinedInput-root": {

              borderRadius: "10px",

              backgroundColor: "rgba(255, 255, 255, 0.8)",

            },

          }}

        />

        <PasswordTextFieldCustom

          name="confirmPassword"

          control={control}

          title={t('form.confirmPassword')}

          placeholder={t('form.confirmPasswordPlaceholder')}

          showRequired={true}

          sx={{

            "& .MuiOutlinedInput-root": {

              borderRadius: "10px",

              backgroundColor: "rgba(255, 255, 255, 0.8)",

            },

          }}

        />

      </Stack>

      <StyledButton fullWidth variant="contained" type="submit" endIcon={<HowToRegIcon />}>

        {t('actions.signUp')}

      </StyledButton>

      <StyledDivider>{t('social.orSignUpWith')}</StyledDivider>

      <Stack

        direction="row"

        spacing={2}

        sx={{

          width: "100%",

          "& > *": {

            flex: 1,

          },

        }}

      >

{/* <LoginSocialFacebook

          appId={AUTH_CONFIG.FACEBOOK_CLIENT_ID}

          fieldsProfile={"id"}

          isOnlyGetToken={true}

          ux_mode="popup"

          onResolve={onFacebookRegister}

          onReject={(err) => {

            // Auth error handled by toast

          }}

        >

          <StyledSocialButton

            fullWidth

            variant="outlined"

            onClick={onFacebookRegister}

            startIcon={<FacebookIcon />}

            sx={{

              borderColor: "#4267B2",

              color: "#4267B2",

              "&:hover": {

                borderColor: "#4267B2",

                backgroundColor: "rgba(66, 103, 178, 0.04)",

              },

            }}

          >

            Facebook

          </StyledSocialButton>

        </LoginSocialFacebook> */}

        <StyledSocialButton

          fullWidth

          variant="outlined"

          onClick={() => googleRegister()}

          startIcon={<GoogleIcon />}

          sx={{

            borderColor: "#DB4437",

            color: "#DB4437",

            "&:hover": {

              borderColor: "#DB4437",

              backgroundColor: "rgba(219, 68, 55, 0.04)",

            },

          }}

        >

          Google

        </StyledSocialButton>

      </Stack>

    </Box>

  );

};

export default JobSeekerSignUpForm;
