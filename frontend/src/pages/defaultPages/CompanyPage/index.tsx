// @ts-nocheck
import React from 'react';

import { Box, Card, Typography, Container } from "@mui/material";

import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import CompanySearch from '../../components/defaults/CompanySearch';
import Companies from '../../../components/Companies';

interface Props {
  [key: string]: any;
}



const CompanyPage = () => {
  const { t } = useTranslation('public');

  TabTitle(t('companySearch.tabTitle'))

  return (

    <Container maxWidth="xl">

      <Box 

        sx={{ 

          mt: 4,

          mb: 6,

        }}

      >

        <Typography 

          variant="h3" 

          gutterBottom

          sx={{

            fontWeight: 700,

            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',

            backgroundClip: 'text',

            WebkitBackgroundClip: 'text',

            color: 'transparent',

            mb: 1
          }}
        >
          {t('companySearch.exploreHeading')}
        </Typography>

        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.secondary',
            maxWidth: '800px',
            mb: 4
          }}
        >
          {t('companySearch.exploreSubtitle')}
        </Typography>

        <Box sx={{ mt: 2, mb: 6 }}>

          <CompanySearch />

        </Box>

        <Card 

          sx={{ 

            px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },

            py: 4,

            boxShadow: (theme) => theme.customShadows.large,

            bgcolor: 'background.paper',

            borderRadius: '16px',

          }} 

          variant="outlined"

        >

          <Companies />

        </Card>

      </Box>

    </Container>

  );

};

export default CompanyPage;
