'use client';

import * as React from "react";
import { Avatar, Box, Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
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
          <Box sx={{ p: 0.5, minWidth: 140 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '0.875rem' }}>
              {currentUserName || 'Ứng viên'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <VerifiedIcon sx={{ fontSize: 13, color: isVerified ? '#4ade80' : '#94a3b8' }} />
              <Typography variant="caption" sx={{ color: isVerified ? '#4ade80' : '#cbd5e1', fontWeight: 700, fontSize: '0.725rem' }}>
                {isVerified ? 'Tài khoản đã xác thực' : 'Tài khoản chưa xác thực'}
              </Typography>
            </Box>
          </Box>
        }
        slotProps={{
          popper: {
            sx: {
              '& .MuiTooltip-tooltip': {
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                p: 1.25,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25)',
              },
              '& .MuiTooltip-arrow': {
                color: '#0f172a',
              },
            },
          },
        }}
      >
        <IconButton
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
            <VerifiedIcon
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
