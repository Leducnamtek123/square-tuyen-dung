import React from 'react';
import { Box, Typography, Stack, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import pc from '@/utils/muiColors';

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => {
  const { t } = useTranslation('common');
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={0.75}>
        {icon && (
          <Box 
            sx={{ 
              color: 'primary.main', 
              display: 'flex',
              bgcolor: pc.primary( 0.08),
              p: 0.5,
              borderRadius: 1,
              fontSize: 18
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 18 } })}
          </Box>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            display: 'block',
            fontSize: '0.65rem',
            opacity: 0.8
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography 
        variant="body2" 
        sx={{ 
            fontWeight: 700, 
            color: 'text.primary', 
            pl: icon ? 4.25 : 0,
            fontSize: '0.9rem',
            lineHeight: 1.4
        }}
      >
        {value || t('common:labels.notUpdated')}
      </Typography>
    </Box>
  );
};

export default InfoItem;
