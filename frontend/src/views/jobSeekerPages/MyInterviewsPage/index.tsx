'use client';
import React from 'react';
import { Box, Card, Typography, Button, Avatar, Chip, CircularProgress, useTheme, type Theme } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";

import { TabTitle } from '../../../utils/generalFunction';
import { useMyInterviews } from './hooks/useMyInterviews';
import { transformInterviewSession } from '../../../utils/transformers';
import type { InterviewSession } from '../../../types/models';
import { ROUTES } from '../../../configs/constants';
import { useRouter } from 'next/navigation';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import dayjs from '../../../configs/dayjs-config';
import { useTranslation } from 'react-i18next';

const MyInterviewsPage = () => {
    const { t } = useTranslation(['jobSeeker', 'common', 'errors', 'interview']);
    const theme = useTheme();
    TabTitle(t('jobSeeker:myInterviewsTitle'));
    const navigate = useRouter();
    const { data: interviewsData, isLoading, isError } = useMyInterviews({ pageSize: 50 });

    const interviews = (interviewsData?.results || [])
        .map((session) => transformInterviewSession(session))
        .filter((s): s is InterviewSession => s !== null);

    const handleJoin = (inviteToken: string) => {
        navigate.push(`/${ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM.replace(':id', inviteToken)}`);
    };

    const getStatusChip = (status: string) => {
        let color: "success" | "primary" | "info" | "error" | "warning" | "default" = "default";
        switch (status) {
            case 'completed': color = 'success'; break;
            case 'in_progress': color = 'primary'; break;
            case 'processing': color = 'warning'; break;
            case 'scheduled': color = 'info'; break;
            case 'cancelled': color = 'error'; break;
        }
        return <Chip 
            label={t(`interview:interviewListCard.statuses.${status}`, { defaultValue: status.replaceAll('_', ' ').toUpperCase() })} 
            color={color} 
            size="small" 
        />;
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                {t('jobSeeker:myInterviewsTitle')}
            </Typography>
            <Card sx={{ p: 2, borderRadius: '12px', boxShadow: (theme as Theme & { customShadows?: Record<string, string> }).customShadows?.card }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
                        {t('errors:systemErrorTitle')}
                    </Box>
                ) : interviews.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <EventAvailableIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                            {t('jobSeeker:noInterviewsTitle')}
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {interviews.map((interview: InterviewSession) => (
                            <Grid key={interview.id} size={12}>
                                <Card variant="outlined" sx={{ p: 2, borderRadius: '8px', '&:hover': { borderColor: 'primary.main' } }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid>
                                            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                                <VideoCameraFrontIcon fontSize="large" />
                                            </Avatar>
                                        </Grid>
                                        <Grid size="grow">
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {interview.roomName || t('jobSeeker:myInterviews.defaultRoomName')}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {t('common:labels.time')}: {dayjs(interview.scheduledAt).format('HH:mm - DD/MM/YYYY')}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                {getStatusChip(interview.status)}
                                                <Chip
                                                    label={interview.type === 'ai' ? t('jobSeeker:myInterviews.aiInterview') : t('jobSeeker:myInterviews.liveInterview')}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                                {interview.jobName && (
                                                    <Typography variant="body2" component="span" sx={{ ml: 1, fontWeight: 'medium' }}>
                                                        {t('common:labels.job')}: {interview.jobName}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Grid>
                                        <Grid>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                disabled={interview.status === 'completed' || interview.status === 'cancelled' || !interview.inviteToken}
                                                onClick={() => handleJoin(interview.inviteToken!)}
                                                startIcon={<VideoCameraFrontIcon />}
                                                sx={{ borderRadius: '8px', textTransform: 'none' }}
                                            >
                                                {t('common:actions.joinNow')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Card>
        </Box>
    );
};

export default MyInterviewsPage;

