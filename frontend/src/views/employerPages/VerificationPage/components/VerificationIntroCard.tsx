'use client';
import React from 'react';
import { Box, Button, Card, Chip, Typography } from '@mui/material';
import { ROUTES } from '../../../../configs/constants';
import { useRouter } from 'next/navigation';

interface Props {
  t: (key: string) => string;
}

const VerificationIntroCard = ({ t }: Props) => {
  const navigate = useRouter();

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {t('verification.step1.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {t('verification.step1.description')}
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={() => navigate.push(`/${ROUTES.EMPLOYER.COMPANY}`)}>
          {t('verification.step1.openBtn')}
        </Button>
        <Chip label={t('verification.step1.statusRequired')} color="warning" />
      </Box>
    </Card>
  );
};

export default VerificationIntroCard;
