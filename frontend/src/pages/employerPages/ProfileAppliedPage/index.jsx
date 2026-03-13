import React from 'react';

import { Card } from "@mui/material";

import { useTranslation } from "react-i18next";

import { TabTitle } from '../../../utils/generalFunction';

import AppliedResumeCard from '../../components/employers/AppliedResumeCard';

const ProfileAppliedPage = () => {

  const { t } = useTranslation('employer');

  TabTitle(t('appliedResume.title'));

  return (

    <Card sx={{ p: 3 }}>

      {/* Start: Applied Resume Card */}

      <AppliedResumeCard title={t('appliedResume.title')}/>

      {/* End: Applied Resume Card */}

    </Card>

  );

};

export default ProfileAppliedPage;
