import React from 'react';
import { Box, Typography } from '@mui/material';
import { Grid2 as Grid } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/redux/hooks';
import TimeAgo from '../../../../components/Common/TimeAgo';
import { tConfig } from '../../../../utils/tConfig';
import InfoItem from './InfoItem';
import { useConfig } from '@/hooks/useConfig';

interface PersonalInfoSectionProps {
  profileDetail: any;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ profileDetail }) => {
  const { t } = useTranslation('employer');
  const { allConfig } = useConfig();

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
        {t('profileDetailCard.title.personalInfo')}
      </Typography>
      <Grid container>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem label="Email" value={profileDetail?.user?.email} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem label={t('profileDetailCard.label.phone')} value={profileDetail?.jobSeekerProfile?.phone} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.gender')} 
            value={tConfig((allConfig as any)?.genderDict?.[profileDetail?.jobSeekerProfile?.gender])} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.dob')} 
            value={<TimeAgo date={profileDetail?.jobSeekerProfile?.birthday} type="format" />} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.maritalStatus')} 
            value={tConfig((allConfig as any)?.maritalStatusDict?.[profileDetail?.jobSeekerProfile?.maritalStatus])} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.cityProvince')} 
            value={tConfig((allConfig as any)?.cityDict?.[profileDetail?.jobSeekerProfile?.location?.city])} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.district')} 
            value={profileDetail?.jobSeekerProfile?.location?.districtDict?.name} 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <InfoItem 
            label={t('profileDetailCard.label.address')} 
            value={profileDetail?.jobSeekerProfile?.location?.address} 
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PersonalInfoSection;
