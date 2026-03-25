import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {
  const { t } = useTranslation('common');
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: 1,
          display: 'block',
          mb: 0.5
        }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || t('notUpdated')}
      </Typography>
    </Box>
  );
};

export default InfoItem;
