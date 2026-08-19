'use client';

import React from 'react';
import { Box, Typography, Container, Paper } from "@mui/material";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'react-i18next';
import CompanySearch from '../../components/defaults/CompanySearch';
import Companies from '../../../components/Features/Companies';
import useSEO from '../../../hooks/useSEO';

const CompanyPage = () => {
  const { t } = useTranslation('public');

  useSEO({
    title: t('companySearch.tabTitle'),
    description: t('seo.companySearch.description'),
    url: `${(typeof window !== 'undefined' ? window.location.origin : '')}/cong-ty`,
    keywords: t('seo.companySearch.keywords'),
  });

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f0f7ff 0%, #f8fafc 40%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 3, md: 5 },
        pb: 8,
      }}
    >
      {/* Decorative City / Building SVG Background Illustration on Top Right */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: { xs: '-100px', md: '5%', lg: '8%' },
          width: { xs: '320px', md: '480px', lg: '560px' },
          height: '380px',
          opacity: 0.15,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cpath fill='%232563eb' d='M500 200h80v400h-80zM600 120h100v480h-100zM420 300h60v300h-60zM320 250h80v350h-80zM220 380h80v220h-80zM680 80h80v520h-80z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              color: '#0f172a',
              letterSpacing: '-0.02em',
              mb: 1.5,
              display: 'inline-flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box
              component="span"
              sx={{
                color: '#0f172a',
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {t('companySearch.exploreHeading')}
              <AutoAwesomeIcon
                sx={{
                  color: '#3b82f6',
                  fontSize: '0.7em',
                  ml: 1,
                  transform: 'rotate(15deg)',
                }}
              />
            </Box>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#64748b',
              fontWeight: 500,
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              maxWidth: '700px',
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            {t('companySearch.exploreSubtitle')}
          </Typography>

          {/* Floating Search Bar */}
          <Box sx={{ my: { xs: 3, md: 4 } }}>
            <CompanySearch />
          </Box>
        </Box>

        {/* Company Listing Container */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: '24px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            background: '#ffffff',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.03)',
          }}
        >
          <Companies />
        </Paper>
      </Container>
    </Box>
  );
};

export default CompanyPage;
