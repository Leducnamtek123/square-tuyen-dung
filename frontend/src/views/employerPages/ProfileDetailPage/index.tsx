'use client';
import React from 'react';
import { Box, Paper, Stack, Button, useTheme, alpha, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TabTitle } from '../../../utils/generalFunction';
import ProfileDetailCard from '../../components/employers/ProfileDetailCard';
import pc from '@/utils/muiColors';

const ProfileDetailPage = () => {
  const { t } = useTranslation('employer');
  const router = useRouter();
  const theme = useTheme();
  TabTitle(t('profileDetailCard.title.profileDetail'));

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            fontWeight: 800,
            color: 'text.secondary',
            '&:hover': {
              bgcolor: pc.primary( 0.08),
              color: 'primary.main',
            },
            transition: 'all 0.2s ease-in-out',
            px: 2,
            borderRadius: 2
          }}
        >
          {t('common:buttons.back', { defaultValue: t('common:labels.back') })}
        </Button>
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: (theme as Theme).customShadows?.z1
        }}
      >
        <ProfileDetailCard />
      </Paper>
    </Stack>
  );
};

export default ProfileDetailPage;