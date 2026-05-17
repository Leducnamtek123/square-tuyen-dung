 'use client';
import React from 'react';
import { Container, Divider, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import CategoryCard from '../../components/defaults/CategoryCard';
import useSEO from '../../../hooks/useSEO';
import { useConfig } from '@/hooks/useConfig';



const JobsByCareerPage = () => {
  const { t } = useTranslation('public');

  useSEO({
    title: t('jobsByCategoryPage.careerTitle'),
    description: t('seo.jobsByCareer.description'),
    url: `${(typeof window !== 'undefined' ? window.location.origin : '')}/viec-lam-theo-nganh-nghe`,
    keywords: t('seo.jobsByCareer.keywords'),
  });

  const { allConfig } = useConfig();

  return (

    <Container maxWidth="lg" sx={{ py: 2 }}>

      <Typography variant="h4">{t('jobsByCategoryPage.careerTitle')}</Typography>

      <Divider sx={{ mt: 1, mb: 4 }} />

      <CategoryCard options={allConfig?.careerOptions || []} type="CAREER" />

    </Container>

  );

};

export default JobsByCareerPage;
