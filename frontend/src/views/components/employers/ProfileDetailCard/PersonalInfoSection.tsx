import React from 'react';
import { Box, Typography, Grid2 as Grid, Stack, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import GenderIcon from '@mui/icons-material/Transgender';
import CakeIcon from '@mui/icons-material/Cake';
import FamilyIcon from '@mui/icons-material/FamilyRestroom';
import LocationIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import TimeAgo from '../../../../components/Common/TimeAgo';
import { tConfig } from '../../../../utils/tConfig';
import InfoItem from './InfoItem';
import { useConfig } from '@/hooks/useConfig';

import { ResumeDetailResponse } from '@/types/models';

interface PersonalInfoSectionProps {
  profileDetail: ResumeDetailResponse;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ profileDetail }) => {
    const { t } = useTranslation(['employer', 'common']);
    const theme = useTheme();
    const { allConfig } = useConfig();

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                <Box 
                    sx={{ 
                        p: 1.25, 
                        borderRadius: 2, 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        display: 'flex'
                    }}
                >
                    <PersonIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('profileDetailCard.title.personalInfo')}
                </Typography>
            </Stack>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem 
                        label={t('common:labels.email')} 
                        value={profileDetail?.user?.email} 
                        icon={<EmailIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem 
                        label={t('profileDetailCard.label.phone')} 
                        value={profileDetail?.jobSeekerProfile?.phone as string} 
                        icon={<PhoneIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem 
                        label={t('profileDetailCard.label.gender')} 
                        value={tConfig(allConfig?.genderDict?.[profileDetail?.jobSeekerProfile?.gender as string | number])} 
                        icon={<GenderIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem 
                        label={t('profileDetailCard.label.dob')} 
                        value={profileDetail?.jobSeekerProfile?.birthday ? <TimeAgo date={profileDetail.jobSeekerProfile.birthday} type="format" /> : ''} 
                        icon={<CakeIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem 
                        label={t('profileDetailCard.label.maritalStatus')} 
                        value={tConfig(allConfig?.maritalStatusDict?.[profileDetail?.jobSeekerProfile?.maritalStatus as string | number])} 
                        icon={<FamilyIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem 
                        label={t('profileDetailCard.label.cityProvince')} 
                        value={tConfig(allConfig?.cityDict?.[String(profileDetail?.jobSeekerProfile?.location?.city)])} 
                        icon={<LocationIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem 
                        label={t('profileDetailCard.label.district')} 
                        value={profileDetail?.jobSeekerProfile?.location?.districtDict?.name}
                        icon={<LocationIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem 
                        label={t('profileDetailCard.label.address')} 
                        value={profileDetail?.jobSeekerProfile?.location?.address} 
                        icon={<HomeIcon />}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default PersonalInfoSection;
