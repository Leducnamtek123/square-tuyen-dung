'use client';

import * as React from 'react';
import { Box, Container, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Loading() {
  const { t } = useTranslation('common');

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        bgcolor: '#f8f9ff',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        component="span"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {t('loading')}
      </Typography>

      {/* Top Navbar Skeleton */}
      <Box
        component="header"
        sx={{
          height: { xs: 60, md: 68 },
          bgcolor: '#ffffff',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
        }}
      >
        <Container
          maxWidth="xl"
          disableGutters
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Logo Skeleton */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '10px' }} />
            <Skeleton variant="rounded" width={110} height={28} sx={{ borderRadius: 1 }} />
          </Stack>

          {/* Navigation Links Skeleton (Desktop) */}
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            <Skeleton variant="text" width={80} height={24} />
            <Skeleton variant="text" width={95} height={24} />
            <Skeleton variant="text" width={110} height={24} />
            <Skeleton variant="text" width={85} height={24} />
          </Stack>

          {/* Action / Auth Buttons Skeleton */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Skeleton
              variant="rounded"
              width={90}
              height={38}
              sx={{ borderRadius: 2, display: { xs: 'none', sm: 'inline-flex' } }}
            />
            <Skeleton
              variant="rounded"
              width={110}
              height={38}
              sx={{ borderRadius: 2 }}
            />
          </Stack>
        </Container>
      </Box>

      {/* Hero Banner & Search Section Skeleton */}
      <Box
        sx={{
          py: { xs: 4, md: 6 },
          bgcolor: '#ffffff',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
          <Box sx={{ maxWidth: 840, mx: 'auto', textAlign: 'center', mb: 3 }}>
            <Skeleton
              variant="text"
              width="60%"
              height={44}
              sx={{ mx: 'auto', mb: 1, borderRadius: 1 }}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={24}
              sx={{ mx: 'auto', mb: 3, borderRadius: 1 }}
            />

            {/* Main Search Bar Box */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 4,
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              <Skeleton variant="rounded" height={44} sx={{ flex: 1, width: '100%', borderRadius: 2 }} />
              <Skeleton
                variant="rounded"
                height={44}
                sx={{
                  width: { xs: '100%', md: 160 },
                  borderRadius: 2,
                  display: { xs: 'none', sm: 'block' },
                }}
              />
              <Skeleton
                variant="rounded"
                height={44}
                sx={{ width: { xs: '100%', md: 130 }, borderRadius: 2 }}
              />
            </Paper>

            {/* Quick search tags */}
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 2.5 }}
            >
              <Skeleton variant="text" width={70} height={24} />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width={80 + (i % 2) * 20}
                  height={26}
                  sx={{ borderRadius: 999 }}
                />
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Main Content Area Skeleton */}
      <Container
        component="main"
        maxWidth="xl"
        sx={{
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          py: 4,
          flex: 1,
        }}
      >
        {/* Section Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="text" width={280} height={20} />
          </Box>
          <Skeleton
            variant="rounded"
            width={100}
            height={32}
            sx={{ borderRadius: 2, display: { xs: 'none', sm: 'block' } }}
          />
        </Stack>

        {/* Job Cards Grid Skeleton */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 2.5,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Skeleton
                  variant="rounded"
                  width={52}
                  height={52}
                  sx={{ borderRadius: 2, flexShrink: 0 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton variant="text" width="85%" height={24} />
                  <Skeleton variant="text" width="55%" height={18} />
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rounded" width={95} height={24} sx={{ borderRadius: 1 }} />
              </Stack>

              <Box sx={{ pt: 1, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="text" width={70} height={20} />
                <Skeleton variant="text" width={90} height={20} />
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
