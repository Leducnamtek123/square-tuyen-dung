'use client';

import React from 'react';
import { Stack, Typography, Paper, Box } from '@mui/material';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import CertificateSection from './CertificateSection';
import LanguageSection from './LanguageSection';
import type { ResumeDetailResponse } from '@/types/models';

interface CandidateExperienceTabProps {
  profileDetail: ResumeDetailResponse;
}

export const CandidateExperienceTab: React.FC<CandidateExperienceTabProps> = ({ profileDetail }) => {
  const hasExperience = profileDetail?.experiencesDetails && profileDetail.experiencesDetails.length > 0;
  const hasEducation = profileDetail?.educationDetails && profileDetail.educationDetails.length > 0;
  const hasCertificates = profileDetail?.certificates && profileDetail.certificates.length > 0;
  const hasLanguages = profileDetail?.languageSkills && profileDetail.languageSkills.length > 0;

  const hasAnyData = hasExperience || hasEducation || hasCertificates || hasLanguages;

  if (!hasAnyData) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          textAlign: 'center',
        }}
      >
        <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 600 }}>
          Ứng viên chưa cập nhật chi tiết kinh nghiệm, học vấn, bằng cấp và ngoại ngữ.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <ExperienceSection profileDetail={profileDetail} />
      <EducationSection profileDetail={profileDetail} />
      <CertificateSection profileDetail={profileDetail} />
      <LanguageSection profileDetail={profileDetail} />
    </Stack>
  );
};

export default CandidateExperienceTab;
