'use client';

import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { TabTitle } from '../../../utils/generalFunction';
import ProfileDetailCard from '../../components/employers/ProfileDetailCard';
import pc from '@/utils/muiColors';

const ProfileDetailPage = () => {
  const { t } = useTranslation(['employer', 'common']);
  const { back } = useRouter();

  TabTitle(t('profileDetailCard.title.profileDetail'));

  return (
    <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 1360, mx: 'auto' }}>
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => back()}
          sx={{
            px: 1.5,
            borderRadius: 2,
            color: 'text.secondary',
            fontWeight: 900,
            textTransform: 'none',
            '&:hover': {
              bgcolor: pc.primary(0.08),
              color: 'primary.main',
            },
          }}
        >
          {t('common:buttons.back', { defaultValue: t('common:labels.back') })}
        </Button>
      </Box>

      <ProfileDetailCard />
    </Stack>
  );
};

export default ProfileDetailPage;
