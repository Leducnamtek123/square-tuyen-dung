'use client';
import React from "react";
import { useForm } from "react-hook-form";
import { typedYupResolver } from '@/utils/formHelpers';
import * as yup from "yup";
import { Box, Button, Stack, styled, Divider } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from 'react-i18next';
import TextFieldCustom from "@/components/Common/Controls/TextFieldCustom";
import PasswordTextFieldCustom from "@/components/Common/Controls/PasswordTextFieldCustom";
import { GoogleColoredIcon } from "@/components/Common/SocialIcons";
import type { CodeResponse } from '@react-oauth/google';

export interface EmployerLoginFormData {
  email?: string;
  password?: string;
}
type FacebookAuthResult = { data?: { accessToken?: string } };

interface EmployerLoginFormProps {
  onLogin: (data: EmployerLoginFormData) => void;
  onFacebookLogin?: (result: FacebookAuthResult) => void;
  onGoogleLogin: (result: Omit<CodeResponse, "error" | "error_description" | "error_uri">) => void;
}
type EmployerLoginT = ReturnType<typeof useTranslation>['t'];

export const createEmployerLoginSchema = (t: EmployerLoginT) =>
  yup.object().shape({
    email: yup
      .string()
      .required(t('validation.requiredEmail'))
      .email(t('validation.invalidEmail'))
      .max(100, t('validation.maxEmail')),
    password: yup
      .string()
      .required(t('validation.requiredPassword'))
      .max(128, t('validation.passwordMax')),
  });

const StyledButton = styled(Button)(({ theme }) => ({
  minHeight: "48px",
  padding: "12px 24px",
  borderRadius: "14px",
  fontSize: "15px",
  fontWeight: 700,
  textTransform: "none",
  color: "#ffffff",
  background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #0284C7 100%)",
  boxShadow: "0 8px 20px rgba(37, 99, 235, 0.28)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  "& .MuiButton-startIcon": {
    margin: 0,
    display: "inline-flex",
    alignItems: "center",
  },
  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  "&:hover": {
    background: "linear-gradient(135deg, #172554 0%, #1D4ED8 50%, #0369A1 100%)",
    transform: "translateY(-1px)",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.35)",
  },
  "&:active": {
    transform: "scale(0.98)",
  },
}));

const StyledSocialButton = styled(Button)(({ theme }) => ({
  minHeight: "46px",
  padding: "10px 20px",
  borderRadius: "14px",
  fontSize: "14.5px",
  fontWeight: 600,
  textTransform: "none",
  backgroundColor: "#FFFFFF",
  borderColor: "#E2E8F0",
  color: "#1E293B",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  "& .MuiButton-startIcon": {
    margin: 0,
    display: "inline-flex",
    alignItems: "center",
  },
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  "&:active": {
    transform: "scale(0.98)",
  },
}));

const StyledDivider = styled(Divider)({
  margin: "20px 0",
  "&::before, &::after": {
    borderColor: "#E2E8F0",
  },
  "& .MuiDivider-wrapper": {
    padding: "0 16px",
    fontSize: "13px",
    fontWeight: 500,
    color: "#64748B",
  },
});

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    backgroundColor: "#F8FAFC",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#F1F5F9",
    },
    "&.Mui-focused": {
      backgroundColor: "#FFFFFF",
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px #F8FAFC inset !important",
      WebkitTextFillColor: "#0F172A !important",
      borderRadius: "inherit",
    },
    "&.Mui-focused input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px #FFFFFF inset !important",
    },
  },
};

const EmployerLoginForm = ({ onLogin, onFacebookLogin, onGoogleLogin }: EmployerLoginFormProps) => {
  const { t } = useTranslation('auth');

  const schema = React.useMemo(() => createEmployerLoginSchema(t), [t]);

  const { control, handleSubmit } = useForm<EmployerLoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: typedYupResolver<EmployerLoginFormData>(schema),
  });

  const googleLogin = useGoogleLogin({
    onSuccess: onGoogleLogin,
    flow: "auth-code",
    ux_mode: "popup",
    redirect_uri: (typeof window !== 'undefined' ? window.location.origin : ''),
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onLogin)}
      sx={{
        width: "100%",
        "& .MuiTextField-root": {
          borderRadius: "14px",
        },
      }}
    >
      <Stack spacing={2} sx={{ mb: 2.5 }}>
        <TextFieldCustom
          name="email"
          control={control}
          title={t('form.email')}
          placeholder={t('form.emailPlaceholder')}
          showRequired={true}
          sx={inputSx}
        />

        <PasswordTextFieldCustom
          name="password"
          control={control}
          title={t('form.password')}
          placeholder={t('form.passwordPlaceholder')}
          showRequired={true}
          sx={inputSx}
        />
      </Stack>

      <StyledButton fullWidth variant="contained" type="submit" startIcon={<LoginIcon />}>
        {t('actions.login', 'Đăng nhập')}
      </StyledButton>

      <StyledDivider>{t('social.orLoginWith', 'Hoặc')}</StyledDivider>

      <Stack spacing={1.5} sx={{ width: "100%" }}>
        <StyledSocialButton
          fullWidth
          variant="outlined"
          onClick={() => googleLogin()}
          startIcon={<GoogleColoredIcon size={20} />}
        >
          Đăng nhập bằng Google
        </StyledSocialButton>
      </Stack>
    </Box>
  );
};

export default EmployerLoginForm;
