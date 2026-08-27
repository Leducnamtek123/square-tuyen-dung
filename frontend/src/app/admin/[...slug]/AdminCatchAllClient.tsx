'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Button, Paper } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useTranslation } from 'react-i18next';
import ProfileDetailPage from '@/views/adminPages/ProfileDetailPage';
import { getPreferredLanguage, getPortalPrefix } from '@/configs/portalRouting';

export default function AdminCatchAllClient() {
  const params = useParams<{ slug?: string | string[] }>();
  const router = useRouter();
  const { t } = useTranslation('common');
  const lang = getPreferredLanguage();
  const adminPrefix = getPortalPrefix('admin', lang);

  const rawSlug = params?.slug;
  const slugArray = Array.isArray(rawSlug) ? rawSlug : typeof rawSlug === 'string' ? [rawSlug] : [];
  const singleSlug = slugArray[0] || '';

  // 1. If single slug is a numeric candidate profile ID (e.g., '11231211')
  if (slugArray.length === 1 && /^\d+$/.test(singleSlug)) {
    return <ProfileDetailPage id={singleSlug} />;
  }

  // 2. If path is /profiles/:id or /quan-ly-ho-so-ung-vien/:id
  if (
    slugArray.length === 2 &&
    (slugArray[0] === 'profiles' ||
      slugArray[0] === 'quan-ly-ho-so-ung-vien' ||
      slugArray[0] === 'ho-so')
  ) {
    return <ProfileDetailPage id={slugArray[1]} />;
  }

  // 3. Otherwise render an Admin NotFound state within the Admin layout
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          maxWidth: 540,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <SearchOffIcon sx={{ fontSize: 72, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: 'text.primary' }}>
          404
        </Typography>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
          {t('notFound.title', { defaultValue: 'Trang quản trị không tồn tại' })}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 420 }}>
          {t('notFound.message', {
            defaultValue:
              'Đường dẫn trong khu vực Quản trị có thể đã bị thay đổi hoặc không tồn tại. Vui lòng kiểm tra lại URL.',
          })}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            startIcon={<DashboardIcon />}
            onClick={() => router.push(`${adminPrefix}/bang-dieu-khien`)}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            Bảng điều khiển Quản trị
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
