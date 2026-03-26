import React from 'react';
import { Container, Divider, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import CategoryCard from '../../components/defaults/CategoryCard';
import { useAppSelector } from '../../../hooks/useAppStore';
import useSEO from '../../../hooks/useSEO';



const JobsByCareerPage = () => {
  const { t } = useTranslation('public');

  useSEO({
    title: t('jobsByCategoryPage.careerTitle'),
    description: 'Khám phá việc làm theo ngành nghề tại Square. Chọn ngành nghề bạn yêu thích và tìm công việc phù hợp ngay hôm nay.',
    url: `${(typeof window !== 'undefined' ? window.location.origin : '')}/viec-lam-theo-nganh-nghe`,
    keywords: 'việc làm theo ngành nghề, ngành IT, ngành kế toán, ngành marketing, tuyển dụng',
  });

  const { allConfig } = useAppSelector((state) => state.config);

  return (

    <Container maxWidth="lg" sx={{ py: 2 }}>

      <Typography variant="h4">{t('jobsByCategoryPage.careerTitle')}</Typography>

      <Divider sx={{ mt: 1, mb: 4 }} />

      <CategoryCard options={allConfig?.careerOptions || []} type={'CARRER'} />

    </Container>

  );

};

export default JobsByCareerPage;
