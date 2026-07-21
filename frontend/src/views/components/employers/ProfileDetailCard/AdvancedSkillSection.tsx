import React from 'react';
import { Box, Typography, Stack, Paper, Divider, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PsychologyIcon from '@mui/icons-material/Psychology';

import { ResumeDetailResponse } from '@/types/models';
import pc from '@/utils/muiColors';

interface AdvancedSkillSectionProps {
  profileDetail: ResumeDetailResponse;
}

const AdvancedSkillSection: React.FC<AdvancedSkillSectionProps> = ({ profileDetail }) => {
    const { t } = useTranslation(['employer', 'common']);

    if (!(profileDetail?.skillDetails && profileDetail.skillDetails.length > 0)) return null;

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
                    <PsychologyIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 1000, color: 'text.primary' }}>
                    {t('profileDetailCard.title.advancedSkills')}
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
                    {(profileDetail.skillDetails || []).map((value, index: number) => (
                        <Box key={value.id || index}>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', mb: 2 }}>
                                {value?.skillName}
                            </Typography>
                            
                            <LinearProgress 
                                variant="determinate" 
                                value={Number(value?.point || 0)} 
                                sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: pc.secondary( 0.08),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        backgroundImage: (theme) => `linear-gradient(to right, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`
                                    }
                                }} 
                            />
                            
                            {index < (profileDetail.skillDetails?.length || 0) - 1 && (
                                <Divider sx={{ mt: 4, borderStyle: 'dashed', borderColor: pc.divider( 0.8) }} />
                            )}
                        </Box>
                    ))}
                </Stack>
            </Paper>
        </Box>
    );
};

export default AdvancedSkillSection;
