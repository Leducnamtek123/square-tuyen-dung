// @ts-nocheck
import React from 'react';

import { Card } from "@mui/material";

import { useTranslation } from "react-i18next";

import { TabTitle } from '../../../utils/generalFunction';

import SavedResumeCard from '../../components/employers/SavedResumeCard';

interface Props {
  [key: string]: any;
}



const SavedProfilePage = () => {

  const { t } = useTranslation('employer');

  TabTitle(t('savedResume.title'));

  return (

    <Card sx={{ p: 3 }}>

      {/* Start: Saved Resume Card */}

      <SavedResumeCard title={t('savedResume.title')}/>

      {/* End: Saved Resume Card */}

    </Card>

  );

};

export default SavedProfilePage;
