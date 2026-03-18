// @ts-nocheck
import React from 'react';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';

interface Props {
  [key: string]: any;
}



const InterviewRecordingCard = ({ recordingUrl, t }) => {
    if (!recordingUrl) return null;

    return (
        <Paper sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) => theme.shadows[1]
        }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                {t('interviewDetail.subtitle.recording')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                    component="video"
                    src={recordingUrl}
                    controls
                    preload="metadata"
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        backgroundColor: 'grey.900'
                    }}
                />
                <Button
                    variant="outlined"
                    component="a"
                    href={recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ borderRadius: 2 }}
                >
                    {t('interviewDetail.actions.openRecording')}
                </Button>
            </Box>
        </Paper>
    );
};

export default InterviewRecordingCard;
