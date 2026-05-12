import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

import { ResumeDetailResponse } from '@/types/models';
import pc from '@/utils/muiColors';

interface CareerGoalsSectionProps {
  profileDetail: ResumeDetailResponse;
}

const CareerGoalsSection: React.FC<CareerGoalsSectionProps> = ({ profileDetail }) => {
    const { t } = useTranslation(['employer', 'common']);

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
                    <TrackChangesIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 1000, color: 'text.primary' }}>
                    {t('profileDetailCard.title.careerGoals')}
                </Typography>
            </Stack>
            
            <Box
                sx={{
                    p: { xs: 2, md: 2.5 },
                    bgcolor: pc.bgDefault(0.35),
                    border: '1px solid',
                    borderColor: pc.divider(0.65),
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="body1"
                    sx={{
                        color: profileDetail?.description ? 'text.primary' : 'text.disabled',
                        fontStyle: profileDetail?.description ? 'normal' : 'italic',
                        lineHeight: 1.8,
                        fontWeight: 600,
                        whiteSpace: 'pre-line',
                        opacity: profileDetail?.description ? 0.9 : 0.6
                    }}
                >
                    {profileDetail?.description || t('common:labels.notUpdated')}
                </Typography>
            </Box>
        </Box>
    );
};

export default CareerGoalsSection;
