import React from 'react';
import { Container, Divider, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import CategoryCard from '../../components/defaults/CategoryCard';
import { useAppSelector } from '../../../hooks/useAppStore';



const JobsByCityPage = () => {
  const { t } = useTranslation('public');

  TabTitle(t("jobsByCategoryPage.cityTitle"))

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
