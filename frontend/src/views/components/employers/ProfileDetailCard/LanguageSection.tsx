import React from 'react';
import { Box, Typography, Stack, Paper, Divider, LinearProgress, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TranslateIcon from '@mui/icons-material/Translate';

interface LanguageSectionProps {
  profileDetail: any;
}

const LanguageSection: React.FC<LanguageSectionProps> = ({ profileDetail }) => {
    const { t } = useTranslation(['employer', 'common']);
    const theme = useTheme();

    if (!(profileDetail?.languageDetails?.length > 0)) return null;

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
                    <TranslateIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('profileDetailCard.title.languages')}
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
                    {profileDetail.languageDetails.map((value: any, index: number) => (
                        <Box key={value.id || index}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                    {value?.languageName}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        fontWeight: 800, 
                                        color: 'primary.main', 
                                        bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                        px: 1.5, 
                                        py: 0.75, 
                                        borderRadius: 1.5,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    {value?.levelName}
                                </Typography>
                            </Stack>
                            
                            <LinearProgress 
                                variant="determinate" 
                                value={value?.point || 0} 
                                sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        backgroundImage: (theme) => `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`
                                    }
                                }} 
                            />
                            
                            {index < profileDetail.languageDetails.length - 1 && (
                                <Divider sx={{ mt: 4, borderStyle: 'dashed', borderColor: alpha(theme.palette.divider, 0.8) }} />
                            )}
                        </Box>
                    ))}
                </Stack>
            </Paper>
        </Box>
    );
};

export default LanguageSection;
