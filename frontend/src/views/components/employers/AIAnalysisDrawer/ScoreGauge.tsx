import React from 'react';
import { Box, CircularProgress, Typography, useTheme, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const { t } = useTranslation('employer');
  const theme = useTheme();

  const getColor = () => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.info.main;
    if (score >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getLabel = () => {
    if (score >= 80) return t('scoreGauge.excellent');
    if (score >= 60) return t('scoreGauge.good');
    if (score >= 40) return t('scoreGauge.fair');
    return t('scoreGauge.poor');
  };

  const mainColor = getColor();

  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          width: 140,
          height: 140,
        }}
      >
        <CircularProgress
          variant="determinate"
          value={100}
          size={140}
          thickness={5}
          sx={{ color: alpha(theme.palette.divider, 0.4), position: 'absolute' }}
        />
        <CircularProgress
          variant="determinate"
          value={score}
          size={140}
          thickness={5}
          sx={{ 
            color: mainColor,
            strokeLinecap: 'round',
            filter: `drop-shadow(0 0 8px ${alpha(mainColor, 0.3)})`
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0, bottom: 0, right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 1000, color: mainColor, lineHeight: 1 }}>
            {score}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, fontSize: '0.75rem', mt: 0.5 }}>
            / 100
          </Typography>
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 900, color: mainColor, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}
        >
          {getLabel()}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          AI Matching Score
        </Typography>
      </Box>
    </Box>
  );
};
