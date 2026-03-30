import React from 'react';
import { Box, Typography } from '@mui/material';
import { Grid2 as Grid } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/redux/hooks';
import { tConfig } from '../../../../utils/tConfig';
import { salaryString } from '../../../../utils/customData';
import InfoItem from './InfoItem';
import { useConfig } from '@/hooks/useConfig';
import { JobSeekerProfile } from '../../../../types/models';
import { Theme } from '@mui/material';

type ConfigDict = Record<string, string>;

export interface GeneralInfoProfileExt extends Partial<JobSeekerProfile> {
  title?: string;
  position?: string;
  academicLevel?: string;
  experience?: string;
  career?: string;
  city?: string;
  salaryMin?: number;
  salaryMax?: number;
  typeOfWorkplace?: string;
  jobType?: string;
}

interface GeneralInfoSectionProps {
  profileDetail: GeneralInfoProfileExt;
}

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ profileDetail }) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          color: (theme: Theme) => theme.palette.primary.main,
          borderBottom: "2px solid",
          borderColor: (theme: Theme) => theme.palette.primary.light,
          pb: 1,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        {t('profileDetailCard.title.generalInfo')}
      </Typography>
      <Grid container>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem label={t('profileDetailCard.label.desiredPosition')} value={profileDetail?.title as string} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem
            label={t('profileDetailCard.label.desiredLevel')}
            value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.positionDict?.[profileDetail?.position as string])}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem
            label={t('profileDetailCard.label.educationLevel')}
            value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.academicLevelDict?.[profileDetail?.academicLevel as string])} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem
            label={t('profileDetailCard.label.experience')}
            value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.experienceDict?.[profileDetail?.experience as string])}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem
            label={t('profileDetailCard.label.career')}
            value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.careerDict?.[profileDetail?.career as string])}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem
            label={t('profileDetailCard.label.workLocation')}
            value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.cityDict?.[profileDetail?.city as string])}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem
            label={t('profileDetailCard.label.desiredSalary')}
            value={salaryString(profileDetail?.salaryMin as number, profileDetail?.salaryMax as number)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem
            label={t('profileDetailCard.label.workplaceType')}
            value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.typeOfWorkplaceDict?.[profileDetail?.typeOfWorkplace as string])}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem
            label={t('profileDetailCard.label.jobType')}
            value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.jobTypeDict?.[profileDetail?.jobType as string])}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeneralInfoSection;
