import React, { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import { Box, Card, Stack, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import BackdropLoading from "../../../../components/loading/BackdropLoading";
import { CV_TYPES } from "../../../../configs/constants";
import FormPopup from "../../../../components/controls/FormPopup";
import { useQuery } from '@tanstack/react-query';
import resumeService from "../../../../services/resumeService";

import PersonalInfoSection from './PersonalInfoSection';
import GeneralInfoSection from './GeneralInfoSection';
import CareerGoalsSection from './CareerGoalsSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import CertificateSection from './CertificateSection';
import LanguageSection from './LanguageSection';
import AdvancedSkillSection from './AdvancedSkillSection';

const LazyPdf = lazy(() => import("../../../../components/Pdf"));

const ProfileDetailCard: React.FC = () => {
  const { t } = useTranslation('employer');
  const { slug } = useParams<{ slug: string }>();
  
  const { data: profileDetail, isLoading } = useQuery({
    queryKey: ['resumeDetail', slug],
    queryFn: async () => {
      const resData = await resumeService.getResumeDetail(slug as string) as any;
      return resData.data;
    },
    enabled: !!slug,
  });
  const [openPopup, setOpenPopup] = React.useState(false);

  if (isLoading) return <BackdropLoading open={true} />;
  if (!profileDetail) return null;

  return (
    <>
      <Stack spacing={3}>
        <Card
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            boxShadow: (theme: any) => theme.customShadows?.medium || 2,
          }}
        >
          <Stack spacing={4}>
            <PersonalInfoSection profileDetail={profileDetail} />
            <GeneralInfoSection profileDetail={profileDetail} />
            <CareerGoalsSection profileDetail={profileDetail} />
          </Stack>
        </Card>

        {profileDetail?.type && profileDetail.type === CV_TYPES.cvWebsite ? (
          <>
            <ExperienceSection profileDetail={profileDetail} />
            <EducationSection profileDetail={profileDetail} />
            <CertificateSection profileDetail={profileDetail} />
            <LanguageSection profileDetail={profileDetail} />
            <AdvancedSkillSection profileDetail={profileDetail} />
          </>
        ) : (
          <>
            <FormPopup
              title={t('sendEmailComponent.title.viewattachedresume', { defaultValue: 'Xem CV đính kèm' })}
              openPopup={openPopup}
              setOpenPopup={setOpenPopup}
              showDialogAction={false}
            >
              <Suspense
                fallback={(
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {t('profileDetailCard.messages.loadingPdf', { defaultValue: 'Đang tải PDF...' })}
                    </Typography>
                  </Box>
                )}
              >
                <LazyPdf
                  fileUrl={profileDetail?.fileUrl}
                  title={profileDetail?.title}
                />
              </Suspense>
            </FormPopup>
          </>
        )}
      </Stack>
    </>
  );
};

export default ProfileDetailCard;
