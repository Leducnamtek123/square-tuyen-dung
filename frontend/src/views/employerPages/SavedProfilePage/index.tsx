import React from 'react';
import { Card } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TabTitle } from '../../../utils/generalFunction';
import SavedResumeCard from '../../components/employers/SavedResumeCard';

const SavedProfilePage = () => {
  const { t } = useTranslation('employer');
  TabTitle(t('savedResume.title'));

  return <SavedResumeCard title={t('savedResume.title')} />;
};

export default SavedProfilePage;
