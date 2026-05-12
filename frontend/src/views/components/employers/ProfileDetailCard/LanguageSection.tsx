import React from 'react';
import { Box, Typography, Stack, Paper, Divider, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TranslateIcon from '@mui/icons-material/Translate';

import { ResumeDetailResponse } from '@/types/models';
import pc from '@/utils/muiColors';

interface LanguageSectionProps {
  profileDetail: ResumeDetailResponse;
}

const LanguageSection: React.FC<LanguageSectionProps> = ({ profileDetail }) => {
    const { t } = useTranslation(['employer', 'common']);

    if (!(profileDetail?.languageDetails && profileDetail.languageDetails.length > 0)) return null;

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
                    <TranslateIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 1000, color: 'text.primary' }}>
                    {t('profileDetailCard.title.languages')}
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
                    {(profileDetail.languageDetails || []).map((value, index: number) => (
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
                                        bgcolor: pc.primary( 0.1), 
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
                                value={Number(value?.point || 0)} 
                                sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: pc.primary( 0.08),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        backgroundImage: (theme) => `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`
                                    }
                                }} 
                            />
                            
                            {index < (profileDetail.languageDetails?.length || 0) - 1 && (
                                <Divider sx={{ mt: 4, borderStyle: 'dashed', borderColor: pc.divider( 0.8) }} />
                            )}
                        </Box>
                    ))}
                </Stack>
            </Paper>
        </Box>
    );
};

export default LanguageSection;
