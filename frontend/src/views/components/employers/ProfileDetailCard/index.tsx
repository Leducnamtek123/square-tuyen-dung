'use client';
import React, { Suspense, lazy, useState } from "react";
import { useParams } from 'next/navigation';
import { Box, Card, Stack, Typography, Paper } from "@mui/material";
import { useTranslation } from 'react-i18next';
import BackdropLoading from "../../../../components/Common/Loading/BackdropLoading";
import { CV_TYPES } from "../../../../configs/constants";
import FormPopup from "../../../../components/Common/Controls/FormPopup";
import { useResumeDetail } from "../hooks/useEmployerQueries";
import { ResumeDetailResponse } from '@/types/models';

import PersonalInfoSection from './PersonalInfoSection';
import GeneralInfoSection from './GeneralInfoSection';
import CareerGoalsSection from './CareerGoalsSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import CertificateSection from './CertificateSection';
import LanguageSection from './LanguageSection';
import AdvancedSkillSection from './AdvancedSkillSection';

const LazyPdf = lazy(() => import("../../../../components/Common/Pdf"));

const ProfileDetailCard: React.FC = () => {
  const { t } = useTranslation('employer');
  const params = useParams();
  const slug = params?.slug as string;

  const { data: profileDetail, isLoading } = useResumeDetail(slug);
  const [openPopup, setOpenPopup] = useState(false);

  if (isLoading) return <BackdropLoading open={true} />;
  if (!profileDetail) return null;

  const isOnlineCv = profileDetail?.type === CV_TYPES.cvWebsite;

  return (
    <Stack spacing={4}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows?.z1
        }}
      >
        <Stack spacing={6}>
          <PersonalInfoSection profileDetail={profileDetail as ResumeDetailResponse} />
          <GeneralInfoSection profileDetail={profileDetail as import('../../../../types/models').ResumeDetailResponse} />
          <CareerGoalsSection profileDetail={profileDetail as ResumeDetailResponse} />
        </Stack>
      </Paper>

      {isOnlineCv ? (
        <Stack spacing={4}>
          <ExperienceSection profileDetail={profileDetail as ResumeDetailResponse} />
          <EducationSection profileDetail={profileDetail as ResumeDetailResponse} />
          <CertificateSection profileDetail={profileDetail as ResumeDetailResponse} />
          <LanguageSection profileDetail={profileDetail as ResumeDetailResponse} />
          <AdvancedSkillSection profileDetail={profileDetail as ResumeDetailResponse} />
        </Stack>
      ) : (
        <FormPopup
          title={t('sendEmailComponent.title.viewattachedresume', { defaultValue: t('common:labels.viewAttachedResume') })}
          openPopup={openPopup}
          setOpenPopup={setOpenPopup}
          showDialogAction={false}
        >
          <Suspense
            fallback={(
              <Box sx={{ p: 10, textAlign: "center" }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {t('profileDetailCard.messages.loadingPdf', { defaultValue: t('common:messages.loadingPdf') })}
                </Typography>
              </Box>
            )}
          >
            <LazyPdf
              fileUrl={profileDetail?.fileUrl || ''}
              title={profileDetail?.title || ''}
            />
          </Suspense>
        </FormPopup>
      )}
    </Stack>
  );
};

export default ProfileDetailCard;
