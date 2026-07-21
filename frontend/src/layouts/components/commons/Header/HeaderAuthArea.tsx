'use client';

import * as React from "react";
import { Avatar, Box, Button, Card, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import UserMenu from "../UserMenu";

type HeaderAuthAreaProps = {
  isAuthenticated: boolean;
  currentUserName?: string;
  currentUserAvatarUrl?: string | null;
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
  anchorElUser,
  onOpenUserMenu,
  onCloseUserMenu,
  onLogin,
  onSignUp,
}: HeaderAuthAreaProps) => {
  const { t } = useTranslation('common');
  return isAuthenticated ? (
    <Box sx={{ flexGrow: 0, ml: 1 }}>
      <Card
        variant="outlined"
        onClick={onOpenUserMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenUserMenu(e as unknown as React.MouseEvent<HTMLElement>);
          }
        }}
          sx={{
            p: 0.5,
            borderRadius: 999,
            backgroundColor: '#ffffff',
            borderColor: 'rgba(226, 232, 240, 0.95)',
            cursor: "pointer",
            transition: "all 0.3s ease",
            backdropFilter: "blur(8px)",
            "&:hover": {
              backgroundColor: '#ffffff',
              borderColor: 'rgba(15, 23, 42, 0.16)',
              transform: "translateY(-1px)",
            },
          }}
        >
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Avatar
            alt="User Avatar"
            src={currentUserAvatarUrl ?? undefined}
            sx={{
              width: 36,
              height: 36,
              border: '2px solid rgba(148, 163, 184, 0.25)',
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{
              px: 1,
              color: '#0f172a',
              fontWeight: 600,
              display: {
                xs: "none",
                sm: "block",
              },
            }}
          >
            {currentUserName}
          </Typography>
        </Stack>
      </Card>

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
          sx={{
            color: '#0f172a',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(15, 23, 42, 0.16)',
            px: { xs: 1.5, sm: 2.5 },
            py: 0.75,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
            boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)',
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
              borderColor: 'rgba(15, 23, 42, 0.24)',
              boxShadow: '0 10px 22px rgba(15, 23, 42, 0.08)',
              transform: "translateY(-1px)",
            },
          }}
          onClick={onLogin}
        >
          {t('nav.login')}
        </Button>

        <Button
          variant="contained"
          size="small"
          sx={{
            color: '#ffffff',
            backgroundColor: '#0f172a',
            px: { xs: 1.5, sm: 2.5 },
            py: 0.75,
            fontSize: { xs: "0.72rem", sm: "0.85rem" },
            boxShadow: '0 10px 22px rgba(15, 23, 42, 0.18)',
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: '#111827',
              transform: "translateY(-1px)",
              boxShadow: '0 12px 24px rgba(15, 23, 42, 0.22)',
            },
          }}
          onClick={onSignUp}
        >
          {t('nav.register')}
        </Button>
      </Stack>
    </Box>
  );
};

export default HeaderAuthArea;
