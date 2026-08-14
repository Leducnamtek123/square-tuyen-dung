'use client';

import React from 'react';
import { Stack } from '@mui/material';
import PersonalInformation from './PersonalInformation';
import GeneralInformation from './GeneralInformation';
import CareerObjective from './CareerObjective';
import AttachedDocumentRow from './AttachedDocumentRow';
import type { ResumeDetailResponse } from '@/types/models';

interface CandidateOverviewProps {
  profileDetail: ResumeDetailResponse;
  onOpenDocumentTab?: () => void;
}

export const CandidateOverview: React.FC<CandidateOverviewProps> = ({
  profileDetail,
  onOpenDocumentTab,
}) => {
  return (
    <Stack spacing={3}>
      <PersonalInformation profileDetail={profileDetail} />
      <GeneralInformation profileDetail={profileDetail} />
      <CareerObjective profileDetail={profileDetail} />
      <AttachedDocumentRow profileDetail={profileDetail} onOpenViewer={onOpenDocumentTab} />
    </Stack>
  );
};

export default CandidateOverview;
