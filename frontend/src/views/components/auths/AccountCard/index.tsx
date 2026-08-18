'use client';

import React from "react";
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid2 as Grid,
  Paper,
  Stack,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { ROUTES } from "../../../../configs/constants";
import toastMessages from "../../../../utils/toastMessages";
import errorHandling from "../../../../utils/errorHandling";
import BackdropLoading from "../../../../components/Common/Loading/BackdropLoading";
import FormPopup from "../../../../components/Common/Controls/FormPopup";
import AccountForm from "../AccountForm";
import UpdatePasswordForm, { UpdatePasswordFormData } from "../UpdatePasswordForm";
import { updateUserInfo, removeUserInfo } from "../../../../redux/userSlice";
import authService from "../../../../services/authService";
import tokenService from "../../../../services/tokenService";
import AvatarCard from "../AvatarCard";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import type { RootState } from "../../../../redux/store";

interface AccountCardProps {
  title?: React.ReactNode;
  sx?: SxProps<Theme>;
}

const AccountCard = ({ title, sx }: AccountCardProps) => {
  const { t } = useTranslation('auth');
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const { currentUser } = useAppSelector((state: RootState) => state.user);

  const [openPopup, setOpenPopup] = React.useState(false);
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [serverErrors, setServerErrors] = React.useState<Record<string, string[]> | null>(null);

  const handleUpdateAccount = (data: { fullName: string }) => {
    setIsUpdating(true);
    const payload = {
      fullName: data.fullName,
    };

    dispatch(updateUserInfo(payload))
      .unwrap()
      .then(() => toastMessages.success(t('account.updateSuccess')))
      .catch((error: unknown) => {
        errorHandling(error, (errs) => setServerErrors(errs as Record<string, string[]>));
      })
      .finally(() => setIsUpdating(false));
  };

  const handleUpdatePassword = (data: UpdatePasswordFormData) => {
    const update = async (data: UpdatePasswordFormData) => {
      setIsFullScreenLoading(true);
      try {
        await authService.changePassword(data);
        setOpenPopup(false);
        toastMessages.success(t('account.passwordChangeSuccess'));
        let path = ROUTES.AUTH.LOGIN;
        const accessToken = tokenService.getAccessTokenFromCookie() as string;
        const backend = tokenService.getProviderFromCookie() as string | undefined;
        dispatch(removeUserInfo({ accessToken, backend }))
          .unwrap()
          .then(() => {
            push(path);
          })
          .catch(() => {
            toastMessages.error(t('messages.genericError'));
          });
      } catch (error: unknown) {
        errorHandling(error, (errs) => setServerErrors(errs as Record<string, string[]>));
      } finally {
        setIsFullScreenLoading(false);
      }
    };
    update(data);
  };

  return (
    <>
      <Box
        sx={{
          bgcolor: "#ffffff",
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme: Theme) => theme.customShadows?.z1,
          p: { xs: 2.5, sm: 3.5 },
          ...sx,
        }}
      >
        <Stack spacing={3.5}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonOutlineOutlinedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: '#0f172a',
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    letterSpacing: '-0.02em',
                  }}
                >
                  {title || t('account.info')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>
                  Quản lý thông tin hồ sơ cá nhân và cấu hình bảo mật tài khoản
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: '#f1f5f9' }} />

          {/* Profile Split Layout (2 Columns) */}
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Left Column: Avatar & User Summary (approx 35%) */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  bgcolor: '#f8fafc',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <AvatarCard />

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.0625rem' }}>
                    {currentUser?.fullName || 'Tài khoản người dùng'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, display: 'block', mt: 0.25 }}>
                    {currentUser?.email || ''}
                  </Typography>

                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1.5 }}>
                    <Chip
                      label="Nhà tuyển dụng"
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        bgcolor: '#eff6ff',
                        color: '#2563eb',
                        borderRadius: 2,
                      }}
                    />
                    <Chip
                      icon={<CheckCircleOutlineIcon sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
                      label="Đã xác thực"
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        bgcolor: '#f0fdf4',
                        color: '#16a34a',
                        borderRadius: 2,
                      }}
                    />
                  </Stack>
                </Box>
              </Paper>
            </Grid>

            {/* Right Column: Account Details & Security Cards (approx 65%) */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={3}>
                {/* 1. Thông tin cá nhân Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem', mb: 2 }}>
                    Thông tin hiển thị
                  </Typography>

                  <AccountForm
                    handleUpdate={handleUpdateAccount}
                    serverErrors={serverErrors}
                  />

                  <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveOutlinedIcon />}
                      type="submit"
                      form="account-form"
                      disabled={isUpdating}
                      sx={{
                        minHeight: 40,
                        px: 3.5,
                        borderRadius: 2.5,
                        fontWeight: 800,
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        bgcolor: '#2563eb',
                        boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.2)',
                        '&:hover': {
                          bgcolor: '#1d4ed8',
                        },
                      }}
                    >
                      {isUpdating ? 'Đang lưu...' : t('account.update')}
                    </Button>
                  </Box>
                </Paper>

                {/* 2. Bảo mật & Đổi mật khẩu Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                  }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          bgcolor: '#fffbeb',
                          color: '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <LockOutlinedIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9375rem' }}>
                          Mật khẩu & Bảo mật đăng nhập
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.775rem' }}>
                          Nên định kỳ cập nhật mật khẩu để bảo vệ tài khoản doanh nghiệp
                        </Typography>
                      </Box>
                    </Stack>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<KeyOutlinedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => setOpenPopup(true)}
                      sx={{
                        borderRadius: 2,
                        borderColor: '#cbd5e1',
                        color: '#0f172a',
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '0.8125rem',
                        px: 2,
                        minHeight: 36,
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          borderColor: '#94a3b8',
                          bgcolor: '#f8fafc',
                        },
                      }}
                    >
                      {t('account.changePassword')}
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Box>

      {/* Change Password Dialog */}
      <FormPopup
        title={t('account.updatePassword')}
        openPopup={openPopup}
        setOpenPopup={setOpenPopup}
      >
        <UpdatePasswordForm
          handleUpdatePassword={handleUpdatePassword}
          serverErrors={serverErrors ?? {}}
        />
      </FormPopup>

      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default AccountCard;
