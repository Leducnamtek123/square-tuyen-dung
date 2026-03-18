// @ts-nocheck
import React from 'react';
import { Box, Typography } from "@mui/material";

import { useTranslation } from 'react-i18next';

interface Props {
  [key: string]: any;
}



const ForbiddenPage = () => {
  const { t } = useTranslation('errors');
  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        {t('forbiddenTitle')}
      </Typography>
    </Box>
  );
};

export default ForbiddenPage;
