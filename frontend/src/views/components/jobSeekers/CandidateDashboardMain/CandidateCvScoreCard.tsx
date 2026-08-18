'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { localizeRoutePath } from '@/configs/routeLocalization';

interface CandidateCvScoreCardProps {
  viewedCount?: number;
}

const CandidateCvScoreCard: React.FC<CandidateCvScoreCardProps> = ({ viewedCount = 0 }) => {
  const { t, i18n } = useTranslation(['jobSeeker', 'common']);
  const profilePath = localizeRoutePath('/profile', i18n.language);
  const progressValue = viewedCount > 0 ? Math.min(viewedCount * 20, 100) : 0;

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '24px',
        border: '1px solid rgba(226, 232, 240, 0.85)',
        backgroundColor: '#ffffff',
        boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 25px 45px -10px rgba(15, 57, 127, 0.10)',
        },
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, fontSize: '1.05rem' }}>
        {t('jobSeeker:candidateDashboard.cvHealth.title', { defaultValue: 'Sức khỏe hồ sơ & Lượt xem' })}
      </Typography>

      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem', display: 'block', mb: 2 }}>
        {t('jobSeeker:candidateDashboard.cvHealth.subtitle', { defaultValue: 'Đo lường mức độ quan tâm của nhà tuyển dụng tới CV' })}
      </Typography>

      {/* Circle Score Donut */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={96}
            thickness={4.5}
            sx={{ color: '#f1f5f9' }}
          />
          <CircularProgress
            variant="determinate"
            value={progressValue}
            size={96}
            thickness={4.5}
            sx={{
              color: '#2563eb',
              position: 'absolute',
              left: 0,
              strokeLinecap: 'round',
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' }}>
              {viewedCount}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.825rem', textAlign: 'center', mb: 2.5, lineHeight: 1.5 }}>
        {t('jobSeeker:candidateDashboard.cvHealth.description', { defaultValue: 'Mỗi lượt xem CV từ nhà tuyển dụng đều là cơ hội tốt để bạn kết nối và phỏng vấn trực tiếp.' })}
      </Typography>

      <Button
        component={Link}
        href={profilePath}
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        fullWidth
        sx={{
          mt: 'auto',
          borderRadius: '12px',
          backgroundColor: '#2563eb',
          fontWeight: 700,
          py: 1.2,
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
          transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 120ms ease',
          '&:hover': {
            backgroundColor: '#1d4ed8',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        }}
      >
        {t('jobSeeker:candidateDashboard.cvHealth.optimizeButton', { defaultValue: 'Tối ưu hồ sơ ngay' })}
      </Button>
    </Card>
  );
};

export default CandidateCvScoreCard;
