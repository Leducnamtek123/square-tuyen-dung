import React from 'react';
import { Box, Divider, Paper, Typography, Stack, Chip, alpha, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EmailIcon from '@mui/icons-material/Email';
import { InterviewSession } from '@/types/models';

interface InterviewInfoCardProps {
  session: InterviewSession;
  t: (key: string, options?: any) => string;
  i18n: any;
}

const InterviewInfoCard: React.FC<InterviewInfoCardProps> = ({ session, t, i18n }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme: any) => theme.customShadows?.z1,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: 'background.paper'
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                <AssignmentIcon color="primary" sx={{ fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.5px' }}>
                    {t('interviewDetail.subtitle.info')}
                </Typography>
            </Stack>
            
            <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />
            
            <Stack spacing={4}>
                <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1.25} mb={0.5}>
                        <PersonIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            {t('interviewDetail.label.candidate')}
                        </Typography>
                    </Stack>
                    <Box sx={{ ml: 4 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'text.primary', lineHeight: 1.2, fontSize: '1.05rem' }}>
                            {session.candidateName}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                            <EmailIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                                {session.candidateEmail || session.candidate_email || '---'}
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>

                <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1.25} mb={0.5}>
                        <WorkIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            {t('interviewDetail.label.position')}
                        </Typography>
                    </Stack>
                    <Box sx={{ ml: 4 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'secondary.main', lineHeight: 1.2 }}>
                            {session.jobName || 'N/A'}
                        </Typography>
                    </Box>
                </Stack>

                <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1.25} mb={0.5}>
                        <CategoryIcon sx={{ fontSize: 16, color: 'info.main' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            {t('interviewDetail.label.type')}
                        </Typography>
                    </Stack>
                    <Box sx={{ ml: 4 }}>
                        <Chip
                            label={(session.type || (session as any).interview_type || 'N/A')?.toUpperCase()}
                            size="small"
                            sx={{ 
                                fontWeight: 900, 
                                borderRadius: 1.5, 
                                bgcolor: alpha(theme.palette.info.main, 0.08),
                                color: 'info.main',
                                fontSize: '0.7rem',
                                letterSpacing: '0.5px',
                                border: '1px solid',
                                borderColor: alpha(theme.palette.info.main, 0.1)
                            }}
                        />
                    </Box>
                </Stack>

                <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1.25} mb={0.5}>
                        <EventIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            {t('interviewDetail.label.schedule')}
                        </Typography>
                    </Stack>
                    <Box sx={{ ml: 4 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.5 }}>
                            {session.scheduledAt || session.scheduled_at ? new Date((session.scheduledAt || session.scheduled_at) as string).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : '---'}
                        </Typography>
                    </Box>
                </Stack>
            </Stack>
        </Paper>
    );
};

export default InterviewInfoCard;
