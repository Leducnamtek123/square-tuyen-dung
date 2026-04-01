import React from 'react';
import { Box, Typography, Stack, Grid2 as Grid, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import InfoIcon from '@mui/icons-material/Info';
import PositionIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import HistoryIcon from '@mui/icons-material/History';
import CareerIcon from '@mui/icons-material/Explore';
import LocationIcon from '@mui/icons-material/LocationOn';
import SalaryIcon from '@mui/icons-material/MonetizationOn';
import BuildingIcon from '@mui/icons-material/Business';
import WorkerIcon from '@mui/icons-material/Engineering';
import { tConfig } from '../../../../utils/tConfig';
import { salaryString } from '../../../../utils/customData';
import InfoItem from './InfoItem';
import { useConfig } from '@/hooks/useConfig';
import { JobSeekerProfile } from '../../../../types/models';
import type { Career } from '../../../../types/models';
import type { City } from '../../../../types/models';

type ConfigDict = Record<string, string>;

export interface GeneralInfoProfileExt extends Partial<JobSeekerProfile> {
  title?: string;
  position?: string | number | null;
  academicLevel?: string | number | null;
  experience?: string | number | null;
  career?: Career | string | number | null;
  city?: City | string | number | null;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  typeOfWorkplace?: string | number | null;
  jobType?: string | number | null;
}

interface GeneralInfoSectionProps {
  profileDetail: GeneralInfoProfileExt;
}

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ profileDetail }) => {
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
                    <InfoIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('profileDetailCard.title.generalInfo')}
                </Typography>
            </Stack>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem 
                        label={t('profileDetailCard.label.desiredPosition')} 
                        value={profileDetail?.title as string} 
                        icon={<PositionIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.desiredLevel')}
                        value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.positionDict?.[profileDetail?.position as string])}
                        icon={<PositionIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.educationLevel')}
                        value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.academicLevelDict?.[profileDetail?.academicLevel as string])} 
                        icon={<SchoolIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.experience')}
                        value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.experienceDict?.[profileDetail?.experience as string])}
                        icon={<HistoryIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.career')}
                        value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.careerDict?.[profileDetail?.career as string])}
                        icon={<CareerIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.workLocation')}
                        value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.cityDict?.[profileDetail?.city as string])}
                        icon={<LocationIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.desiredSalary')}
                        value={salaryString(profileDetail?.salaryMin as number, profileDetail?.salaryMax as number)}
                        icon={<SalaryIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.workplaceType')}
                        value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.typeOfWorkplaceDict?.[profileDetail?.typeOfWorkplace as string])}
                        icon={<BuildingIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.jobType')}
                        value={tConfig((allConfig as unknown as Record<string, ConfigDict>)?.jobTypeDict?.[profileDetail?.jobType as string])}
                        icon={<WorkerIcon />}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default GeneralInfoSection;
