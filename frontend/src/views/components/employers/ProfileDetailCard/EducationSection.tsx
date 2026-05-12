import React from 'react';
import { Box, Typography, Stack, Paper, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimeAgo from '../../../../components/Common/TimeAgo';

import { ResumeDetailResponse } from '@/types/models';
import pc from '@/utils/muiColors';

interface EducationSectionProps {
  profileDetail: ResumeDetailResponse;
}

const EducationSection: React.FC<EducationSectionProps> = ({ profileDetail }) => {
    const { t } = useTranslation(['employer', 'common']);

    if (!(profileDetail?.educationDetails && profileDetail.educationDetails.length > 0)) return null;

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
                    <SchoolIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 1000, color: 'text.primary' }}>
                    {t('profileDetailCard.title.education')}
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
                                <Divider sx={{ mt: 4, borderStyle: 'dashed', borderColor: pc.divider( 0.8) }} />
                            )}
                        </Box>
                    ))}
                </Stack>
            </Paper>
        </Box>
    );
};

export default EducationSection;
