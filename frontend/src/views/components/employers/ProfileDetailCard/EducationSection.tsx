import React from 'react';
import { Box, Typography, Stack, Paper, Divider, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimeAgo from '../../../../components/Common/TimeAgo';

import { ResumeDetailResponse } from '@/types/models';

interface EducationSectionProps {
  profileDetail: ResumeDetailResponse;
}

const EducationSection: React.FC<EducationSectionProps> = ({ profileDetail }) => {
    const { t } = useTranslation(['employer', 'common']);
    const theme = useTheme();

    if (!(profileDetail?.educationDetails && profileDetail.educationDetails.length > 0)) return null;

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
                    <SchoolIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('profileDetailCard.title.education')}
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
                    {(profileDetail.educationDetails || []).map((value, index: number) => (
                        <Box key={value.id || index}>
                            <Stack spacing={2}>
                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1.3 }}>
                                    {value?.degreeName} - {t('profileDetailCard.label.major')}: {value?.major}
                                </Typography>
                                
                                <Stack spacing={1.5}>
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <LocationOnIcon sx={{ fontSize: 20, color: 'text.secondary', opacity: 0.8 }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                            {value?.trainingPlaceName}
                                        </Typography>
                                    </Stack>
                                    
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <CalendarMonthIcon sx={{ fontSize: 20, color: 'text.secondary', opacity: 0.8 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', opacity: 0.8 }}>
                                            {value?.startDate && <TimeAgo date={value.startDate} type="format" />} -{" "}
                                            {value.completedDate ? (
                                                <TimeAgo date={value.completedDate} type="format" />
                                            ) : (
                                                t('common:labels.present')
                                            )}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                            {index < (profileDetail.educationDetails?.length || 0) - 1 && (
                                <Divider sx={{ mt: 5, borderStyle: 'dashed', borderColor: alpha(theme.palette.divider, 0.8) }} />
                            )}
                        </Box>
                    ))}
                </Stack>
            </Paper>
        </Box>
    );
};

export default EducationSection;
