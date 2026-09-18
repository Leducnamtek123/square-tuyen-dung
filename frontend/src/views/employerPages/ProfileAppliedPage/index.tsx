 'use client';
import React from 'react';
import { Card } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TabTitle } from '@/utils/generalFunction';
import AppliedResumeCard from '@/views/components/employers/AppliedResumeCard';

const ProfileAppliedPage = () => {
  const { t } = useTranslation('employer');
  TabTitle(t('appliedResume.title'));

  return <AppliedResumeCard title={t('appliedResume.title')} />;
};

export default ProfileAppliedPage;
