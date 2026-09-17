'use client';

import * as React from "react";
import { Avatar, Box, Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { useTranslation } from "react-i18next";
import UserMenu from "../UserMenu";

type HeaderAuthAreaProps = {
  isAuthenticated: boolean;
  currentUserName?: string;
  currentUserAvatarUrl?: string | null;
  isVerified?: boolean;
  anchorElUser: HTMLElement | null;
  onOpenUserMenu: (event: React.MouseEvent<HTMLElement>) => void;
  onCloseUserMenu: () => void;
  onLogin: () => void;
  onSignUp: () => void;
};

const HeaderAuthArea = ({
  isAuthenticated,
  currentUserName,
  currentUserAvatarUrl,
  isVerified = true,
  anchorElUser,
  onOpenUserMenu,
  onCloseUserMenu,
  onLogin,
  onSignUp,
}: HeaderAuthAreaProps) => {
  const { t } = useTranslation('common');

  const avatarUrl = currentUserAvatarUrl || undefined;

  return isAuthenticated ? (
    <Box sx={{ flexGrow: 0, ml: 1 }}>
      <Tooltip
        arrow
        placement="bottom-end"
        title={
          <Box sx={{ p: 0.75, minWidth: 150 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem', lineHeight: 1.3 }}>
              {currentUserName || t('common.user', 'Ứng viên')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.5 }}>
              <VerifiedRoundedIcon sx={{ fontSize: 14, color: isVerified ? '#16a34a' : '#94a3b8' }} />
              <Typography variant="caption" sx={{ color: isVerified ? '#15803d' : '#64748b', fontWeight: 700, fontSize: '0.75rem' }}>
                {isVerified ? t('auth.verifiedAccount', 'Tài khoản đã xác thực') : t('auth.unverifiedAccount', 'Tài khoản chưa xác thực')}
              </Typography>
            </Box>
          </Box>
        }
        slotProps={{
          popper: {
            sx: {
              '& .MuiTooltip-tooltip': {
                backgroundColor: '#ffffff',
                color: '#0f172a',
                borderRadius: '14px',
                p: 1.25,
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
              },
              '& .MuiTooltip-arrow': {
                color: '#ffffff',
                '&::before': {
                  border: '1px solid #e2e8f0',
                },
              },
            },
          },
        }}
      >
        <IconButton aria-label={t('header.userMenu', 'Tài khoản người dùng')}
          onClick={onOpenUserMenu}
          sx={{
            p: 0.4,
            border: '2px solid rgba(226, 232, 240, 0.95)',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            '&:hover': {
              borderColor: '#2563eb',
              transform: 'scale(1.05)',
              boxShadow: '0 4px 14px rgba(37,99,235,0.18)',
            },
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <Avatar
              alt={currentUserName || 'User Avatar'}
              src={avatarUrl || currentUserAvatarUrl || undefined}
              sx={{
                width: 38,
                height: 38,
                bgcolor: '#2563eb',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              {currentUserName?.charAt(0)?.toUpperCase()}
            </Avatar>

            {/* Small Verified Badge Icon (Green if verified, Gray if unverified) */}
            <VerifiedRoundedIcon
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                fontSize: 15,
                color: isVerified ? '#16a34a' : '#94a3b8',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                p: '1px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            />
          </Box>
        </IconButton>
      </Tooltip>

      <UserMenu
        anchorElUser={anchorElUser}
        open={Boolean(anchorElUser)}
        handleCloseUserMenu={onCloseUserMenu}
      />
    </Box>
  ) : (
    <Box sx={{ ml: 1, display: "block" }}>
      <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onLogin}
          sx={{
            color: '#0f172a',
            borderColor: '#cbd5e1',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          {t('header.auth.login', { defaultValue: 'Đăng nhập' })}
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={onSignUp}
          sx={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
          }}
        >
          {t('header.auth.signUp', { defaultValue: 'Đăng ký' })}
        </Button>
      </Stack>
    </Box>
  );
};

export default HeaderAuthArea;
