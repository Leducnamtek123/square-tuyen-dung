import React from 'react';

import { useSelector } from 'react-redux';

import { Container, Divider, Typography } from "@mui/material";

import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import CategoryCard from '../../components/defaults/CategoryCard';

const JobsByJobTypePage = () => {
  const { t } = useTranslation('public');

  TabTitle(t("jobsByCategoryPage.jobTypeTitle"))

  const { allConfig } = useSelector((state) => state.config);

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
