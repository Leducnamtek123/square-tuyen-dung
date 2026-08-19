'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  Typography,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Grid2 as Grid } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import { TabTitle } from '../../../utils/generalFunction';
import { useMyInterviews } from './hooks/useMyInterviews';
import { transformInterviewSession } from '../../../utils/transformers';
import type { InterviewSession } from '../../../types/models';
import { ROUTES } from '../../../configs/constants';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { localizeRoutePath } from '../../../configs/routeLocalization';

const MyInterviewsPage = () => {
  const { t, i18n } = useTranslation(['jobSeeker', 'common', 'errors', 'interview', 'employer']);
  TabTitle(t('jobSeeker:myInterviewsTitle'));

  const { push } = useRouter();
  const { data: interviewsData, isLoading, isError } = useMyInterviews({ pageSize: 50 });

  const interviews = (interviewsData?.results || []).flatMap((session) => {
    const interview = transformInterviewSession(session);
    return interview ? [interview] : [];
  });

  const handleJoin = (inviteToken: string) => {
    push(`/${ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM.replace(':id', inviteToken)}`);
  };

  const jobsPath = localizeRoutePath('/jobs', i18n.language);

  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
          minHeight: 480,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {isLoading ? (
          <CircularProgress size={36} />
        ) : isError ? (
          <Typography variant="body2" color="error">
            {t('errors:systemErrorTitle')}
          </Typography>
        ) : interviews.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: 420,
              mx: 'auto',
            }}
          >
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: '24px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
              }}
            >
              <CalendarMonthOutlinedIcon sx={{ fontSize: 48 }} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
              {t('jobSeeker:myInterviews.emptyTitle')}
            </Typography>

            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem', mb: 3, lineHeight: 1.5 }}>
              {t('jobSeeker:myInterviews.emptySubtitle')}
            </Typography>

            <Button
              component={Link}
              href={jobsPath}
              variant="contained"
              sx={{
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                fontWeight: 700,
                px: 3.5,
                py: 1.1,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                  boxShadow: 'none',
                },
              }}
            >
              {t('jobSeeker:myInterviews.findJobs')}
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ width: '100%', textAlign: 'left' }}>
            {interviews.map((interview: InterviewSession) => (
              <Grid key={interview.id} size={12}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    '&:hover': { borderColor: '#2563eb' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#2563eb', width: 48, height: 48 }}>
                        <VideoCameraFrontIcon />
                      </Avatar>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {interview.jobName || t('jobSeeker:myInterviews.jobNameFallback')}
                          </Typography>
                          {interview.status && (
                            <Chip
                              size="small"
                              label={t(`employer:interviewListCard.statuses.${interview.status}`)}
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {interview.companyName || t('jobSeeker:myInterviews.companyNameFallback')}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => handleJoin(interview.inviteToken || '')}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                    >
                      {t('jobSeeker:myInterviews.join')}
                    </Button>
                  </Box>
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
