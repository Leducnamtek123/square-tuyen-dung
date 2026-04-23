import React from 'react';
import { Box, Button, Divider, Paper, Typography, Stack, alpha, useTheme } from '@mui/material';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { TFunction } from 'i18next';

interface InterviewRecordingCardProps {
  recordingUrl: string | null;
  isCompleted?: boolean;
  t: TFunction;
}

const InterviewRecordingCard: React.FC<InterviewRecordingCardProps> = ({ recordingUrl, isCompleted = false, t }) => {
    const theme = useTheme();
    if (!recordingUrl && !isCompleted) return null;

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme) => theme.customShadows?.z1,
                bgcolor: 'background.paper',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <VideoLibraryIcon color="primary" sx={{ fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('interviewDetail.subtitle.recording')}
                </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />
            
            <Stack spacing={4}>
                {recordingUrl ? (
                    <>
                        <Box
                            sx={{
                                width: '100%',
                                borderRadius: 3,
                                overflow: 'hidden',
                                bgcolor: 'common.black',
                                aspectRatio: '16/9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: (theme) => theme.customShadows?.z12,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.common.white, 0.1)
                            }}
                        >
                            <Box
                                component="video"
                                src={recordingUrl}
                                controls
                                preload="metadata"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>
                        <Button
                            variant="outlined"
                            color="primary"
                            component="a"
                            href={recordingUrl}
                            target="_blank"
                            rel="noreferrer"
                            startIcon={<OpenInNewIcon />}
                            sx={{ 
                                borderRadius: 3, 
                                fontWeight: 900,
                                py: 1.5,
                                borderStyle: 'dashed',
                                textTransform: 'none',
                                borderWidth: '1.5px',
                                fontSize: '1rem',
                                '&:hover': {
                                    borderWidth: '1.5px',
                                    bgcolor: alpha(theme.palette.primary.main, 0.04)
                                }
                            }}
                        >
                            {t('interviewDetail.actions.openRecording')}
                        </Button>
                    </>
                ) : (
                    <Box
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            border: '1px dashed',
                            borderColor: alpha(theme.palette.primary.main, 0.18),
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
                            {t('interviewDetail.messages.recordingPending', { defaultValue: 'Video đang được xử lý' })}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.9 }}>
                            {t('interviewDetail.messages.recordingPendingDesc', {
                                defaultValue: 'Buổi phỏng vấn đã kết thúc, hệ thống đang chờ video ghi hình đồng bộ về để hiển thị tại đây.',
                            })}
                        </Typography>
                    </Box>
                )}
            </Stack>
        </Paper>
    );
};

export default InterviewRecordingCard;
