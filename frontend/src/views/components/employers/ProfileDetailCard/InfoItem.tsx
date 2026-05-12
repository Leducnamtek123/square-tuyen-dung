import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import pc from '@/utils/muiColors';

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => {
  const { t } = useTranslation('common');

  return (
    <Box
      sx={{
        height: '100%',
        p: 1.75,
        borderRadius: 2,
        border: '1px solid',
        borderColor: pc.divider(0.6),
        bgcolor: pc.bgDefault(0.28),
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1.25}>
        {icon && (
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              color: 'primary.main',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              bgcolor: pc.primary(0.08),
              '& svg': { fontSize: 18 },
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 18 } })}
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: 'text.secondary',
              fontWeight: 900,
              textTransform: 'uppercase',
              lineHeight: 1.25,
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: 'text.primary',
              fontWeight: 800,
              lineHeight: 1.45,
              overflowWrap: 'anywhere',
            }}
          >
            {value || t('labels.notUpdated')}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default InfoItem;
