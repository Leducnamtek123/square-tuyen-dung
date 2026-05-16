'use client';

import React from 'react';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTranslation } from 'react-i18next';
import type { MaintenanceModeDetail } from '@/utils/maintenanceMode';

type MaintenanceModeScreenProps = {
  detail?: MaintenanceModeDetail | null;
};

const MaintenanceModeScreen = ({ detail }: MaintenanceModeScreenProps) => {
  const { t } = useTranslation('common');

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Box
      role="alert"
      aria-live="assertive"
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#f6f8fb',
        color: '#111827',
        px: 2,
        py: { xs: 8, md: 10 },
      }}
    >
      <Container maxWidth="md">
        <Stack
          spacing={3}
          sx={{
            alignItems: 'center',
            textAlign: 'center',
            mx: 'auto',
            maxWidth: 720,
          }}
        >
          <Box
            sx={{
              width: 76,
              height: 76,
              borderRadius: '20px',
              display: 'grid',
              placeItems: 'center',
              bgcolor: '#fff7ed',
              border: '1px solid #fed7aa',
              color: '#c2410c',
            }}
          >
            <ConstructionIcon sx={{ fontSize: 42 }} />
          </Box>

          <Chip
            label={t('maintenanceMode.badge', 'Đang bảo trì')}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 700, bgcolor: '#fff' }}
          />

          <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 32, sm: 42, md: 48 },
                lineHeight: 1.12,
                fontWeight: 800,
                letterSpacing: 0,
              }}
            >
              {t('maintenanceMode.title', 'Hệ thống đang bảo trì')}
            </Typography>
            <Typography
              sx={{
                maxWidth: 620,
                color: '#4b5563',
                fontSize: { xs: 16, sm: 18 },
                lineHeight: 1.7,
              }}
            >
              {t(
                'maintenanceMode.message',
                'Square Tuyển Dụng đang nâng cấp hệ thống để phục vụ bạn tốt hơn. Vui lòng quay lại sau ít phút.',
              )}
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: 'center', justifyContent: 'center' }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={handleReload}
              sx={{ px: 3, py: 1.25, fontWeight: 700 }}
            >
              {t('maintenanceMode.reload', 'Tải lại trang')}
            </Button>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                color: '#6b7280',
                fontSize: 14,
                px: { xs: 0, sm: 1 },
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">
                {t('maintenanceMode.retryHint', 'Bạn có thể thử lại sau ít phút.')}
              </Typography>
            </Stack>
          </Stack>

          {detail?.status && (
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              {t('maintenanceMode.statusCode', 'Mã trạng thái')}: {detail.status}
            </Typography>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default MaintenanceModeScreen;
