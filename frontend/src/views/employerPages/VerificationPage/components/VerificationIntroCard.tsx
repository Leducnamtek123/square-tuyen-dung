'use client';
import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
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
  const steps = [
    {
      icon: BusinessOutlinedIcon,
      label: t('verification.summary.companyProfile'),
      done: true,
    },
    {
      icon: AssignmentTurnedInOutlinedIcon,
      label: t('verification.summary.legalProfile'),
      done: legalReady,
    },
  ];

  return (
    <Card elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t('verification.step1.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('verification.step1.description')}
          </Typography>
        </Box>
        <Chip label={statusLabel} color={statusColor} sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }} />
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t('verification.summary.progress')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {completion}%
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={completion} sx={{ height: 8, borderRadius: 1 }} />
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
        {steps.map(({ icon: Icon, label, done }) => (
          <Chip
            key={label}
            icon={<Icon />}
            label={label}
            color={done ? 'success' : 'default'}
            variant={done ? 'filled' : 'outlined'}
            sx={{ justifyContent: 'flex-start' }}
          />
        ))}
      </Stack>

      <Alert severity={canPost ? 'success' : 'warning'} sx={{ mt: 3 }}>
        {canPost
          ? t('verification.summary.canPost')
          : t('verification.summary.cannotPost', { count: missingCount })}
      </Alert>

      <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => push(companyHref)}>
          {t('verification.step1.openBtn')}
        </Button>
      </Box>
    </Card>
  );
};

export default VerificationIntroCard;
