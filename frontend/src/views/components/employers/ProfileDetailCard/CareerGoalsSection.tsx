import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import { useTranslation } from 'react-i18next';
import defaultTheme from '../../../../themeConfigs/defaultTheme';

interface CareerGoalsSectionProps {
  profileDetail: any;
}

const CareerGoalsSection: React.FC<CareerGoalsSectionProps> = ({ profileDetail }) => {
  const { t } = useTranslation(['employer', 'common']);

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          color: (theme: any) => theme.palette.primary.main,
          borderBottom: "2px solid",
          borderColor: (theme: any) => theme.palette.primary.light,
          pb: 1,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        {t('profileDetailCard.title.careerGoals', { ns: 'employer' })}
      </Typography>
      <Card
        variant="outlined"
        sx={{
          p: 3,
          background: (theme: any) => theme.palette.grey[50],
          border: "1px solid",
          borderColor: (theme: any) => theme.palette.grey[200],
          boxShadow: 0,
        }}
      >
        <Typography
          sx={{
            color: profileDetail?.description
              ? defaultTheme.palette.text.primary
              : defaultTheme.palette.text.disabled,
            fontStyle: profileDetail?.description
              ? "normal"
              : "italic",
            fontSize: profileDetail?.description
              ? "0.95rem"
              : (defaultTheme.palette.text as any).disabled?.fontSize || '0.875rem',
            lineHeight: 1.6,
          }}
        >
          {profileDetail?.description || t('common.notUpdated', { ns: 'common' })}
        </Typography>
      </Card>
    </Box>
  );
};

export default CareerGoalsSection;
