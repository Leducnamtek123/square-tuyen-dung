import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CategoryIcon from '@mui/icons-material/Category';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import { InterviewSession } from '@/types/models';
import type { i18n, TFunction } from 'i18next';
import pc from '@/utils/muiColors';
import InterviewDetailSectionHeader from './InterviewDetailSectionHeader';
import { interviewDetailCardSx, interviewDetailPanelSx } from './sectionStyles';

interface InterviewInfoCardProps {
  session: InterviewSession;
  t: TFunction;
  i18n: i18n;
}

type InfoRowProps = {
  icon: React.ReactNode;
  label: React.ReactNode;
  children: React.ReactNode;
};

const InfoRow = ({ icon, label, children }: InfoRowProps) => (
  <Stack
    direction="row"
    spacing={1.5}
    sx={{
      ...interviewDetailPanelSx,
      p: 1.75,
      alignItems: 'flex-start',
      bgcolor: pc.primary(0.025),
    }}
  >
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'primary.main',
        bgcolor: pc.primary(0.08),
        flexShrink: 0,
        '& svg': { fontSize: 18 },
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 800, mb: 0.5, letterSpacing: 0 }}>
        {label}
      </Typography>
      {children}
    </Box>
  </Stack>
);

const InterviewInfoCard: React.FC<InterviewInfoCardProps> = ({ session, t, i18n }) => {
  const schedule = session.scheduledAt || session.scheduled_at;
  const type = session.type || session.interview_type || 'N/A';

  return (
    <Paper elevation={0} sx={interviewDetailCardSx}>
      <InterviewDetailSectionHeader icon={<AssignmentIcon />} title={t('interviewDetail.subtitle.info')} />

      <Stack spacing={1.5}>
        <InfoRow icon={<PersonIcon />} label={t('interviewDetail.label.candidate')}>
          <Typography variant="subtitle2" sx={{ fontWeight: 850, color: 'text.primary', lineHeight: 1.35, letterSpacing: 0 }}>
            {session.candidateName || '---'}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.75} mt={0.75}>
            <EmailIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650, overflowWrap: 'anywhere' }}>
              {session.candidateEmail || session.candidate_email || '---'}
            </Typography>
          </Stack>
        </InfoRow>

        <InfoRow icon={<WorkIcon />} label={t('interviewDetail.label.position')}>
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.5 }}>
            {session.jobName || 'N/A'}
          </Typography>
        </InfoRow>

        <InfoRow icon={<CategoryIcon />} label={t('interviewDetail.label.type')}>
          <Chip
            label={String(type).toUpperCase()}
            size="small"
            sx={{
              height: 24,
              fontWeight: 800,
              borderRadius: 1.5,
              bgcolor: pc.info(0.08),
              color: 'info.main',
              fontSize: '0.72rem',
              border: '1px solid',
              borderColor: pc.info(0.16),
              letterSpacing: 0,
            }}
          />
        </InfoRow>

        <InfoRow icon={<EventIcon />} label={t('interviewDetail.label.schedule')}>
          <Typography variant="body2" sx={{ fontWeight: 750, color: 'text.primary', lineHeight: 1.55 }} suppressHydrationWarning>
            {schedule
              ? new Date(schedule as string).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '---'}
          </Typography>
        </InfoRow>
      </Stack>
    </Paper>
  );
};

export default InterviewInfoCard;
