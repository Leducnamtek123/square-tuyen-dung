 'use client';
import React from 'react';
import { Container, Divider, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import CategoryCard from '../../components/defaults/CategoryCard';
import { useAppSelector } from '../../../hooks/useAppStore';
import useSEO from '../../../hooks/useSEO';
import { useConfig } from '@/hooks/useConfig';



const JobsByJobTypePage = () => {
  const { t } = useTranslation('public');

  useSEO({
    title: t('jobsByCategoryPage.jobTypeTitle'),
    description: t('seo.jobsByJobType.description'),
    url: `${(typeof window !== 'undefined' ? window.location.origin : '')}/viec-lam-theo-hinh-thuc-lam-viec`,
    keywords: t('seo.jobsByJobType.keywords'),
  });

  const { allConfig } = useConfig();

  return (

    <Container maxWidth="lg" sx={{ py: 2 }}>

      <Typography variant="h4">{t("jobsByCategoryPage.jobTypeTitle")}</Typography>

      <Divider sx={{ mt: 1, mb: 4 }} />

      <CategoryCard

        options={allConfig?.jobTypeOptions || []}

        type={'JOB_TYPE'}

      />

    </Container>

  );

};

export default JobsByJobTypePage;
