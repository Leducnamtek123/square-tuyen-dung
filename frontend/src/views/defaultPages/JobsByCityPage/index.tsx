import React from 'react';
import { Container, Divider, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import CategoryCard from '../../components/defaults/CategoryCard';
import { useAppSelector } from '../../../hooks/useAppStore';
import useSEO from '../../../hooks/useSEO';



const JobsByCityPage = () => {
  const { t } = useTranslation('public');

  useSEO({
    title: t('jobsByCategoryPage.cityTitle'),
    description: 'Tìm kiếm việc làm theo tỉnh thành trên toàn quốc tại Square. Việc làm tại Hà Nội, TP.HCM và các tỉnh thành khác.',
    url: `${(typeof window !== 'undefined' ? window.location.origin : '')}/viec-lam-theo-tinh-thanh`,
    keywords: 'việc làm Hà Nội, việc làm TP.HCM, việc làm theo tỉnh thành, tuyển dụng địa phương',
  });

  const { allConfig } = useAppSelector((state) => state.config);

  return (

    <Container maxWidth="lg" sx={{ py: 2 }}>

      <Typography variant="h4">{t("jobsByCategoryPage.cityTitle")}</Typography>

      <Divider sx={{ mt: 1, mb: 4 }} />

      <CategoryCard options={allConfig?.cityOptions || []}  type={"CITY"}/>

    </Container>

  );

};

export default JobsByCityPage;
