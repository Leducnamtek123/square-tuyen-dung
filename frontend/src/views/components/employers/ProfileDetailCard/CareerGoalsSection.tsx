import React from 'react';
import { Box, Typography, Paper, Stack, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

import { ResumeDetailResponse } from '@/types/models';
import pc from '@/utils/muiColors';

interface CareerGoalsSectionProps {
  profileDetail: ResumeDetailResponse;
}

const CareerGoalsSection: React.FC<CareerGoalsSectionProps> = ({ profileDetail }) => {
    const { t } = useTranslation(['employer', 'common']);
    const theme = useTheme();

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                <Box 
                    sx={{ 
                        p: 1.25, 
                        borderRadius: 2, 
                        bgcolor: pc.primary( 0.1),
                        color: 'primary.main',
                        display: 'flex'
                    }}
                >
                    <TrackChangesIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('profileDetailCard.title.careerGoals')}
                </Typography>
            </Stack>
            
            <Paper
                variant="outlined"
                sx={{
                    p: 4,
                    bgcolor: pc.actionDisabled( 0.04),
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    boxShadow: 'none',
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
            </Paper>
        </Box>
    );
};

export default CareerGoalsSection;
