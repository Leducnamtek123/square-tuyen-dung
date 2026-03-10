import React from 'react';
import { Box, Card, Typography, Grid, Button, Avatar, Chip, CircularProgress } from '@mui/material';
import { TabTitle } from '../../../utils/generalFunction';
import { useMyInterviews } from './hooks/useMyInterviews';
import { transformInterviewSession } from '../../../utils/transformers';
import { ROUTES } from '../../../configs/constants';
import { useNavigate } from 'react-router-dom';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const MyInterviewsPage = () => {
    const { t } = useTranslation(['jobSeeker', 'common']);
    TabTitle(t('jobSeeker:myInterviewsTitle'));
    const navigate = useNavigate();
    const { data: interviewsData, isLoading, isError } = useMyInterviews({ pageSize: 50 });

    const interviews = (interviewsData?.results || []).map(transformInterviewSession);

    const handleJoin = (inviteToken) => {
        navigate(`/${ROUTES.CANDIDATE.INTERVIEW_ROOM.replace(':id', inviteToken)}`);
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'scheduled':
                return <Chip label={t('common:status.scheduled')} color="info" size="small" />;
            case 'in_progress':
                return <Chip label={t('common:status.inProgress')} color="warning" size="small" />;
            case 'completed':
                return <Chip label={t('common:status.completed')} color="success" size="small" />;
            case 'cancelled':
                return <Chip label={t('common:status.cancelled')} color="error" size="small" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                {t('jobSeeker:myInterviewsTitle')}
            </Typography>

            <Card sx={{ p: 2, borderRadius: '12px', boxShadow: (theme) => theme.customShadows?.card }}>
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
                        {interviews.map((interview) => (
                            <Grid item xs={12} key={interview.id}>
                                <Card variant="outlined" sx={{ p: 2, borderRadius: '8px', '&:hover': { borderColor: 'primary.main' } }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                                <VideoCameraFrontIcon fontSize="large" />
                                            </Avatar>
                                        </Grid>
                                        <Grid item xs>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {interview.room_name || interview.roomName || 'Interview room'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {t('common:labels.time')}: {moment(interview.scheduledAt || interview.scheduled_at).format('HH:mm - DD/MM/YYYY')}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                {getStatusChip(interview.status)}
                                                <Chip
                                                    label={interview.type === 'ai' ? 'AI Interview' : 'Live Interview'}
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
                                        <Grid item>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                disabled={interview.status === 'completed' || interview.status === 'cancelled' || !interview.inviteToken}
                                                onClick={() => handleJoin(interview.invite_token || interview.inviteToken)}
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
