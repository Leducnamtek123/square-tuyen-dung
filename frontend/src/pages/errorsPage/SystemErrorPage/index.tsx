// @ts-nocheck
import React from 'react';
import { Box, Typography } from "@mui/material";

import { useTranslation } from 'react-i18next';

interface Props {
  [key: string]: any;
}



const SystemErrorPage = () => {
  const { t } = useTranslation('errors');
  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        {t('systemErrorTitle')}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t('systemErrorBody')}
      </Typography>
    </Box>
  );
};

export default SystemErrorPage;
