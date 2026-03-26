import React from 'react';
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/redux/hooks';
import { tConfig } from '../../../../utils/tConfig';
import { salaryString } from '../../../../utils/customData';
import InfoItem from './InfoItem';

interface GeneralInfoSectionProps {
  profileDetail: any;
}

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ profileDetail }) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useAppSelector((state) => state.config);

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          color: (theme: any) => theme.palette.primary.main,
          borderBottom: "2px solid",
          borderColor: (theme: any) => theme.palette.primary.light,
          pb: 1,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        {t('profileDetailCard.title.generalInfo')}
      </Typography>
      <Grid container>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem label={t('profileDetailCard.label.desiredPosition')} value={profileDetail?.title} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.desiredLevel')} 
            value={tConfig(allConfig?.positionDict[profileDetail?.position])} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.educationLevel')} 
            value={tConfig(allConfig?.academicLevelDict[profileDetail?.academicLevel])} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.experience')} 
            value={tConfig(allConfig?.experienceDict[profileDetail?.experience])} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.career')} 
            value={tConfig(allConfig?.careerDict[profileDetail?.career])} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.workLocation')} 
            value={tConfig(allConfig?.cityDict[profileDetail?.city])} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.desiredSalary')} 
            value={salaryString(profileDetail?.salaryMin, profileDetail?.salaryMax)} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.workplaceType')} 
            value={tConfig(allConfig?.typeOfWorkplaceDict[profileDetail?.typeOfWorkplace])} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.jobType')} 
            value={tConfig(allConfig?.jobTypeDict[profileDetail?.jobType])} 
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeneralInfoSection;
