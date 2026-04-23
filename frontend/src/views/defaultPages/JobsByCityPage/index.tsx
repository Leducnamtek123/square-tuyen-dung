import React from 'react';
import { Container, Divider, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import CategoryCard from '../../components/defaults/CategoryCard';
import { useAppSelector } from '../../../hooks/useAppStore';
import useSEO from '../../../hooks/useSEO';
import { useConfig } from '@/hooks/useConfig';



const JobsByCityPage = () => {
  const { t } = useTranslation('public');

  useSEO({
    title: t('jobsByCategoryPage.cityTitle'),
    description: t('seo.jobsByCity.description'),
    url: `${(typeof window !== 'undefined' ? window.location.origin : '')}/viec-lam-theo-tinh-thanh`,
    keywords: t('seo.jobsByCity.keywords'),
  });

  const { allConfig } = useConfig();

  return (

    <Container maxWidth="lg" sx={{ py: 2 }}>

      <Typography variant="h4">{t("jobsByCategoryPage.cityTitle")}</Typography>

      <Divider sx={{ mt: 1, mb: 4 }} />

      <CategoryCard options={allConfig?.cityOptions || []}  type={"CITY"}/>

    </Container>

  );

};

export default JobsByCityPage;
