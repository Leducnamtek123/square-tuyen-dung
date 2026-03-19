import React from 'react';
import { Container, Divider, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import CategoryCard from '../../components/defaults/CategoryCard';
import { TabTitle } from '../../../utils/generalFunction';
import { useAppSelector } from '../../../hooks/useAppStore';



const JobsByCareerPage = () => {
  const { t } = useTranslation('public');

  TabTitle(t('jobsByCategoryPage.careerTitle'));

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
