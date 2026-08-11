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
  const { i18n } = useTranslation('common');
  const profilePath = localizeRoutePath('/profile', i18n.language);
  const progressValue = viewedCount > 0 ? Math.min(viewedCount * 20, 100) : 0;

  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
        CV của bạn đã đủ tốt chưa?
      </Typography>

      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem', display: 'block', mb: 2 }}>
        Có bao nhiêu nhà tuyển dụng quan tâm hồ sơ của bạn?
      </Typography>

      {/* Circle Score Donut */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={90}
            thickness={5}
            sx={{ color: '#e2e8f0' }}
          />
          <CircularProgress
            variant="determinate"
            value={progressValue}
            size={90}
            thickness={5}
            sx={{
              color: '#2563eb',
              position: 'absolute',
              left: 0,
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
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {viewedCount}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.825rem', textAlign: 'center', mb: 2.5, lineHeight: 1.5 }}>
        Mỗi lượt xem CV từ nhà tuyển dụng đều là một cơ hội để bạn tiến gần hơn tới công việc phù hợp.
      </Typography>

      <Button
        component={Link}
        href={profilePath}
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        fullWidth
        sx={{
          borderRadius: '10px',
          backgroundColor: '#2563eb',
          fontWeight: 700,
          py: 1.2,
          textTransform: 'none',
          boxShadow: 'none',
          mt: 'auto',
          '&:hover': {
            backgroundColor: '#1d4ed8',
            boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
          },
        }}
      >
        Khám phá ngay
      </Button>
    </Card>
  );
};

export default CandidateCvScoreCard;
