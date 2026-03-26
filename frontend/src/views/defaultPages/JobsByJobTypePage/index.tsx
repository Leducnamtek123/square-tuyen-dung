import React from 'react';
import { Container, Divider, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import CategoryCard from '../../components/defaults/CategoryCard';
import { useAppSelector } from '../../../hooks/useAppStore';
import useSEO from '../../../hooks/useSEO';



const JobsByJobTypePage = () => {
  const { t } = useTranslation('public');

  useSEO({
    title: t('jobsByCategoryPage.jobTypeTitle'),
    description: 'Tìm kiếm việc làm theo hình thức: toàn thời gian, bán thời gian, thực tập, hợp đồng. Nhiều cơ hội việc làm chất lượng tại Square.',
    url: `${(typeof window !== 'undefined' ? window.location.origin : '')}/viec-lam-theo-hinh-thuc-lam-viec`,
    keywords: 'việc làm toàn thời gian, việc làm bán thời gian, thực tập, hợp đồng, remote',
  });

  const { allConfig } = useAppSelector((state) => state.config);

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
