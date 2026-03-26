import React from 'react';
import { Card } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TabTitle } from '../../../utils/generalFunction';
import { APP_NAME } from '../../../configs/constants';
import JobPostCard from '../../components/employers/JobPostCard';

const JobPostPage = () => {

  const { t } = useTranslation('employer');

  TabTitle(`${t('jobPost.title')} - ${APP_NAME}`);

  return (

    <Card sx={{ p: 3 }}>

      <JobPostCard />

    </Card>

  );

};

export default JobPostPage;
