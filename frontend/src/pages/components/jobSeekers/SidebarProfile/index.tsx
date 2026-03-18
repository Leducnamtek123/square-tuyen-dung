// @ts-nocheck
import React from "react";

import { useSelector } from "react-redux";

import { useTranslation } from 'react-i18next';

import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";

import ClearIcon from "@mui/icons-material/Clear";

import MuiImageCustom from "../../../../components/MuiImageCustom";

interface Props {
  [key: string]: any;
}



const SidebarProfile = () => {

  const { t } = useTranslation('auth');

  const { currentUser } = useSelector((state) => state.user);

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

            background: `linear-gradient(45deg, #441da0, #6b4fd1)`,

            boxShadow: "0 4px 14px 0 rgba(68, 29, 160, 0.15)",

            "&:hover .avatar-actions": {

              opacity: 1,

            },

          }}

        >

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
