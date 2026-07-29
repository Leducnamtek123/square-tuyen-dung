import React from "react";
import { useAppSelector } from '@/redux/hooks';
import { useTranslation } from 'react-i18next';
import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import MuiImageCustom from "../../../../components/Common/MuiImageCustom";

const SidebarProfile = () => {
  const { t } = useTranslation('auth');
  const { currentUser } = useAppSelector((state) => state.user);

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <Box
          sx={{
            position: "relative",
            width: 90,
            height: 90,
            padding: "4px",
            borderRadius: "50%",
            background: `linear-gradient(45deg, #0f172a, #2563eb)`,
            boxShadow: "0 4px 14px 0 rgba(15, 23, 42, 0.15)",
            "&:hover .avatar-actions": {
              opacity: 1,
            },
          }}
        >
          {currentUser?.avatarUrl ? (
            <MuiImageCustom
              src={currentUser?.avatarUrl}
              width="100%"
              height="100%"
              sx={{
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid white',
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: 'primary.main',
                color: 'common.white',
                fontSize: '1.75rem',
                fontWeight: 700,
                border: '2px solid white',
              }}
            >
              {currentUser?.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
          )}
        </Box>
        <Box flex={1}>
          <Typography variant="caption">{t('account.welcomeBack')}</Typography>
          <Typography variant="h6" gutterBottom>
            {currentUser?.fullName}
          </Typography>
          {currentUser?.isVerifyEmail ? (
            <Chip
              icon={<CheckIcon />}
              label={t('account.verifiedAccount')}
              color="success"
              size="small"
              variant="filled"
            />
          ) : (
            <Chip
              icon={<ClearIcon />}
              label={t('account.unverifiedAccount')}
              color="error"
              size="small"
              variant="filled"
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default SidebarProfile;
