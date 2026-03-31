import React from 'react';
import { Box, Typography, Stack, Paper, Divider, LinearProgress, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PsychologyIcon from '@mui/icons-material/Psychology';

interface AdvancedSkillSectionProps {
  profileDetail: any;
}

const AdvancedSkillSection: React.FC<AdvancedSkillSectionProps> = ({ profileDetail }) => {
    const { t } = useTranslation(['employer', 'common']);
    const theme = useTheme();

    if (!(profileDetail?.skillDetails?.length > 0)) return null;

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
                    <PsychologyIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('profileDetailCard.title.advancedSkills')}
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
                    boxShadow: (theme: any) => theme.customShadows?.z1
                }}
            >
                <Stack spacing={4}>
                    {profileDetail.skillDetails.map((value: any, index: number) => (
                        <Box key={value.id || index}>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', mb: 2 }}>
                                {value?.skillName}
                            </Typography>
                            
                            <LinearProgress 
                                variant="determinate" 
                                value={value?.point || 0} 
                                sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        backgroundImage: (theme) => `linear-gradient(to right, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`
                                    }
                                }} 
                            />
                            
                            {index < profileDetail.skillDetails.length - 1 && (
                                <Divider sx={{ mt: 4, borderStyle: 'dashed', borderColor: alpha(theme.palette.divider, 0.8) }} />
                            )}
                        </Box>
                    ))}
                </Stack>
            </Paper>
        </Box>
    );
};

export default AdvancedSkillSection;
