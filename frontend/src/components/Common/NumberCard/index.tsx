import React from 'react';
import { Box, Card, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';

interface NumberCardProps {
  color?: string;
  backgroundColor?: string;
}

const NumberCard = ({ color, backgroundColor }: NumberCardProps) => {
  const { t } = useTranslation('common');

  return (

    <Card

      sx={{ p: 1.5, borderColor: color, backgroundColor: backgroundColor }}

      variant="outlined"

    >

      <Box sx={{ p: 1 }}>

        <Typography variant="h3" sx={{ fontWeight: 'bold', color: color }}>

          2

        </Typography>

      </Box>

      <Box>

        <Typography variant="button">{t('employerViewedProfile')}</Typography>

      </Box>

    </Card>

  );

};

export default NumberCard;
