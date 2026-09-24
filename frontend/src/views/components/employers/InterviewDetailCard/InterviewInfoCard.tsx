import React from 'react';
import { Box, Paper, Stack, Typography, Link as MuiLink } from '@mui/material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
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
  children: any;
};

const InfoRow = ({ icon, label, children }: InfoRowProps) => (
  <Stack
    direction="row"
    spacing={1.5}
    sx={{
      ...interviewDetailPanelSx,
      p: 1.75,
      alignItems: 'flex-start',
      bgcolor: '#FFFFFF',
      transition: 'all 0.15s ease-in-out',
      '&:hover': {
        borderColor: pc.primary(0.25),
        bgcolor: '#F8FAFC',
      },
    }}
  >
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'primary.main',
        bgcolor: 'rgba(37, 99, 235, 0.08)',
        border: '1px solid rgba(37, 99, 235, 0.15)',
        flexShrink: 0,
        '& svg': { fontSize: 18 },
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontWeight: 800,
          mb: 0.25,
          color: 'text.secondary',
          textTransform: 'uppercase',
          fontSize: '0.6875rem',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  </Stack>
);

const InterviewInfoCard: React.FC<InterviewInfoCardProps> = ({ session, t, i18n }) => {
  const schedule = session?.scheduledAt || session?.scheduled_at;
  const email = session?.candidateEmail || session?.candidate_email;
  const language = session?.interviewLanguageDisplay || session?.interview_language_display || (session?.interviewLanguage === 'en' ? 'Tiếng Anh' : 'Tiếng Việt');
  const proctoringCount = Number(session?.proctoringViolationCount ?? session?.proctoring_violation_count ?? (Array.isArray(session?.proctoringEvents) ? session.proctoringEvents.length : 0));

  return (
    <Paper elevation={0} sx={interviewDetailCardSx}>
      <InterviewDetailSectionHeader icon={<AssignmentOutlinedIcon />} title={t('interviewDetail.subtitle.info')} />

      <Stack spacing={1.5}>
        <InfoRow icon={<PersonOutlineOutlinedIcon />} label={t('interviewDetail.label.candidate')}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.35, fontSize: '0.9375rem' }}>
            {session?.candidateName || '---'}
          </Typography>
          {email && (
            <Stack direction="row" alignItems="center" spacing={0.75} mt={0.5}>
              <EmailOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <MuiLink
                href={`mailto:${email}`}
                underline="hover"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 650,
                  fontSize: '0.8125rem',
                  overflowWrap: 'anywhere',
                }}
              >
                {email}
              </MuiLink>
            </Stack>
          )}
        </InfoRow>

        <InfoRow icon={<WorkOutlineOutlinedIcon />} label={t('interviewDetail.label.position')}>
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.5, fontSize: '0.875rem' }}>
            {session?.jobName || 'N/A'}
          </Typography>
        </InfoRow>

        <InfoRow icon={<EventOutlinedIcon />} label={t('interviewDetail.label.schedule')}>
          <Typography variant="body2" sx={{ fontWeight: 750, color: 'text.primary', lineHeight: 1.55, fontSize: '0.875rem' }} suppressHydrationWarning>
            {schedule && !isNaN(new Date(schedule as string).getTime())
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

        {language && (
          <InfoRow icon={<TranslateOutlinedIcon />} label="Ngôn ngữ phỏng vấn">
            <Typography variant="body2" sx={{ fontWeight: 750, color: 'text.primary', lineHeight: 1.5, fontSize: '0.875rem' }}>
              {language}
            </Typography>
          </InfoRow>
        )}

        <InfoRow icon={<SecurityOutlinedIcon />} label="Giám sát / Chống gian lận">
          {proctoringCount > 0 ? (
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#dc2626', lineHeight: 1.5, fontSize: '0.875rem' }}>
              {proctoringCount} cảnh báo rời màn hình
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ fontWeight: 750, color: '#16a34a', lineHeight: 1.5, fontSize: '0.875rem' }}>
              Hoàn hảo (0 cảnh báo)
            </Typography>
          )}
        </InfoRow>
      </Stack>
    </Paper>
  );
};

export default InterviewInfoCard;

