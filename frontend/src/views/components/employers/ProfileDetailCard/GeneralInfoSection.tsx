import React from 'react';
import { Box, Typography, Stack, Grid2 as Grid } from '@mui/material';
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
import pc from '@/utils/muiColors';

type ConfigDict = Record<string, string>;
type ConfigValue = string | number | null | undefined | { id?: string | number; name?: string | null };

interface GeneralInfoProfileExt extends Partial<JobSeekerProfile> {
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

const resolveConfigText = (dict: ConfigDict | undefined, value: ConfigValue): string => {
    if (value === undefined || value === null || value === '') return '';
    if (typeof value === 'object') {
        return value.name || tConfig(dict?.[String(value.id ?? '')]);
    }
    return tConfig(dict?.[String(value)]);
};

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ profileDetail }) => {
    const { t } = useTranslation(['employer', 'common']);
    const { allConfig } = useConfig();

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <Box 
                    sx={{ 
                        width: 40,
                        height: 40,
                        borderRadius: 2, 
                        bgcolor: pc.primary( 0.1),
                        color: 'primary.main',
                        display: 'grid',
                        placeItems: 'center',
                    }}
                >
                    <InfoIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 1000, color: 'text.primary' }}>
                    {t('profileDetailCard.title.generalInfo')}
                </Typography>
            </Stack>

            <Grid container spacing={1.5}>
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
                        value={resolveConfigText(allConfig?.positionDict, profileDetail?.position)}
                        icon={<PositionIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.educationLevel')}
                        value={resolveConfigText(allConfig?.academicLevelDict, profileDetail?.academicLevel)}
                        icon={<SchoolIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.experience')}
                        value={resolveConfigText(allConfig?.experienceDict, profileDetail?.experience)}
                        icon={<HistoryIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.career')}
                        value={resolveConfigText(allConfig?.careerDict, profileDetail?.career as ConfigValue)}
                        icon={<CareerIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.workLocation')}
                        value={resolveConfigText(allConfig?.cityDict, profileDetail?.city as ConfigValue)}
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
                        value={resolveConfigText(allConfig?.typeOfWorkplaceDict, profileDetail?.typeOfWorkplace)}
                        icon={<BuildingIcon />}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <InfoItem
                        label={t('profileDetailCard.label.jobType')}
                        value={resolveConfigText(allConfig?.jobTypeDict, profileDetail?.jobType)}
                        icon={<WorkerIcon />}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default GeneralInfoSection;
