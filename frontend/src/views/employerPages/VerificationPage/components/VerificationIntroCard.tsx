'use client';
import React from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { ROUTES } from '../../../../configs/constants';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { ChipProps } from '@mui/material';
import { localizeRoutePath } from '../../../../configs/routeLocalization';

interface Props {
  statusLabel: string;
  statusColor: ChipProps['color'];
  completion: number;
  missingCount: number;
  canPost: boolean;
  legalReady: boolean;
}

const VerificationIntroCard = ({
  statusLabel,
  statusColor,
  completion,
  missingCount,
  canPost,
  legalReady,
}: Props) => {
  const { push } = useRouter();
  const { t, i18n } = useTranslation('employer');
  const companyHref = localizeRoutePath(`/${ROUTES.EMPLOYER.COMPANY}`, i18n.language);

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        mb: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#ffffff',
        boxShadow: (theme) => theme.customShadows?.z1,
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: canPost ? '#f0fdf4' : '#eff6ff',
              color: canPost ? '#16a34a' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <VerifiedUserOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.125rem', md: '1.25rem' } }}>
              {t('verification.step1.title')}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mt: 0.25 }}>
              {t('verification.step1.description')}
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={statusLabel}
          color={statusColor}
          sx={{
            fontWeight: 800,
            fontSize: '0.8125rem',
            px: 1,
            height: 32,
            borderRadius: 2,
          }}
        />
      </Stack>

      {/* Progress Metric */}
      <Box sx={{ mt: 3, p: 2, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {t('verification.summary.progress')}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 800, color: completion === 100 ? '#16a34a' : '#2563eb' }}>
            {completion}% hoàn tất
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={completion}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: '#e2e8f0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              bgcolor: completion === 100 ? '#16a34a' : '#2563eb',
            },
          }}
        />
      </Box>

      {/* Verification Steps Indicator */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: '#bbf7d0',
            bgcolor: '#f0fdf4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <BusinessOutlinedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#15803d', fontSize: '0.85rem' }}>
              1. {t('verification.summary.companyProfile')}
            </Typography>
          </Stack>
          <Chip label="Đã hoàn tất" size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 800, bgcolor: '#dcfce7', color: '#16a34a' }} />
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: legalReady ? '#bbf7d0' : '#fed7aa',
            bgcolor: legalReady ? '#f0fdf4' : '#fff7ed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <AssignmentTurnedInOutlinedIcon sx={{ color: legalReady ? '#16a34a' : '#c2410c', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: legalReady ? '#15803d' : '#9a3412', fontSize: '0.85rem' }}>
              2. {t('verification.summary.legalProfile')}
            </Typography>
          </Stack>
          <Chip
            label={legalReady ? "Đã sẵn sàng" : "Cần bổ sung"}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 800,
              bgcolor: legalReady ? '#dcfce7' : '#ffedd5',
              color: legalReady ? '#16a34a' : '#c2410c',
            }}
          />
        </Paper>
      </Stack>

      {/* Verification Notice Banner */}
      <Paper
        elevation={0}
        sx={{
          mt: 2.5,
          p: 2,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: canPost ? '#bbf7d0' : '#fed7aa',
          bgcolor: canPost ? '#f6fef9' : '#fffbf5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          {canPost ? (
            <CheckCircleOutlineIcon sx={{ color: '#16a34a', fontSize: 22 }} />
          ) : (
            <ErrorOutlineOutlinedIcon sx={{ color: '#ea580c', fontSize: 22 }} />
          )}
          <Typography variant="body2" sx={{ fontWeight: 600, color: canPost ? '#15803d' : '#9a3412', fontSize: '0.875rem' }}>
            {canPost
              ? t('verification.summary.canPost')
              : t('verification.summary.cannotPost', { count: missingCount })}
          </Typography>
        </Stack>

        <Button
          size="small"
          variant="outlined"
          endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />}
          onClick={() => push(companyHref)}
          sx={{
            borderRadius: 2,
            borderColor: '#cbd5e1',
            color: '#0f172a',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.8125rem',
            bgcolor: '#ffffff',
            '&:hover': {
              bgcolor: '#f8fafc',
            },
          }}
        >
          {t('verification.step1.openBtn')}
        </Button>
      </Paper>
    </Card>
  );
};

export default VerificationIntroCard;
