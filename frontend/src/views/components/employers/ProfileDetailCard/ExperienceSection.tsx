import React from 'react';
import { Box, Typography, Stack, Paper, Divider } from '@mui/material';
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

    if (!(profileDetail?.experiencesDetails && profileDetail.experiencesDetails.length > 0)) return null;

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
                    <WorkHistoryIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 1000, color: 'text.primary' }}>
                    {t('profileDetailCard.title.workExperience')}
                </Typography>
            </Stack>

            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2.5, md: 4 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: pc.divider(0.7),
                    bgcolor: 'background.paper',
                    boxShadow: '0 14px 34px rgba(15, 23, 42, 0.06)',
                }}
            >
                <Stack spacing={4}>
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
                                <Divider sx={{ mt: 4, borderStyle: 'dashed', borderColor: pc.divider( 0.8) }} />
                            )}
                        </Box>
                    ))}
                </Stack>
            </Paper>
        </Box>
    );
};

export default ExperienceSection;
