import React from 'react';
import { Box, Typography, Stack, Paper, Divider, alpha, useTheme } from '@mui/material';
import { Grid2 as Grid } from "@mui/material";
import { useTranslation } from 'react-i18next';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimeAgo from '../../../../components/Common/TimeAgo';

import { ResumeDetailResponse } from '@/types/models';
import pc from '@/utils/muiColors';

interface ExperienceSectionProps {
  profileDetail: ResumeDetailResponse;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ profileDetail }) => {
    const { t } = useTranslation(['employer', 'common']);
    const theme = useTheme();

    if (!(profileDetail?.experiencesDetails && profileDetail.experiencesDetails.length > 0)) return null;

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
                    <WorkHistoryIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('profileDetailCard.title.workExperience')}
                </Typography>
            </Stack>

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
                <Stack spacing={5}>
                    {(profileDetail.experiencesDetails || []).map((value, index: number) => (
                        <Box key={value.id || index}>
                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', mb: 1.5, lineHeight: 1.3 }}>
                                        {value?.jobName}
                                    </Typography>
                                    
                                    <Stack spacing={1.5}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary', opacity: 0.8 }} />
                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                                {value?.companyName}
                                            </Typography>
                                        </Stack>
                                        
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <CalendarMonthIcon sx={{ fontSize: 20, color: 'text.secondary', opacity: 0.8 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', opacity: 0.8 }}>
                                                {value?.startDate && <TimeAgo date={value.startDate} type="format" />} - {value?.endDate ? <TimeAgo date={value.endDate} type="format" /> : t('common:labels.present')}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Grid>
                                
                                <Grid size={{ xs: 12, md: 8 }}>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            color: value?.description ? 'text.secondary' : 'text.disabled',
                                            fontStyle: value?.description ? 'normal' : 'italic',
                                            lineHeight: 1.8,
                                            fontWeight: 600,
                                            whiteSpace: 'pre-line',
                                            opacity: value?.description ? 0.9 : 0.6
                                        }}
                                    >
                                        {value?.description || t('common:labels.notUpdated')}
                                    </Typography>
                                </Grid>
                            </Grid>
                            {index < (profileDetail.experiencesDetails?.length || 0) - 1 && (
                                <Divider sx={{ mt: 5, borderStyle: 'dashed', borderColor: pc.divider( 0.8) }} />
                            )}
                        </Box>
                    ))}
                </Stack>
            </Paper>
        </Box>
    );
};

export default ExperienceSection;
