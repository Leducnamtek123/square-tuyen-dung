import React from 'react';
import { Box, Button, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import type { TFunction } from 'i18next';
import pc from '@/utils/muiColors';
import InterviewDetailSectionHeader from './InterviewDetailSectionHeader';
import { interviewDetailCardSx, interviewDetailPanelSx } from './sectionStyles';
import { getSafeResourceUrl } from '@/utils/safeExternalUrl';

interface InterviewRecordingCardProps {
  recordingUrl: string | null;
  isCompleted?: boolean;
  t: TFunction;
}

const InterviewRecordingCard: React.FC<InterviewRecordingCardProps> = ({ recordingUrl, isCompleted = false, t }) => {
  const theme = useTheme();
  const safeRecordingUrl = getSafeResourceUrl(recordingUrl);
  if (!safeRecordingUrl && !isCompleted) return null;

  return (
    <Paper elevation={0} sx={interviewDetailCardSx}>
      <InterviewDetailSectionHeader icon={<VideoLibraryOutlinedIcon />} title={t('interviewDetail.subtitle.recording')} />

      <Stack spacing={2.5}>
        {safeRecordingUrl ? (
          <>
            <Box
              sx={{
                width: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: '#0B0F19',
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Box
                component="video"
                src={safeRecordingUrl}
                controls
                preload="metadata"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Button
              variant="outlined"
              component="a"
              href={safeRecordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon sx={{ fontSize: 18 }} />}
              sx={{
                alignSelf: 'flex-start',
                borderRadius: 2.5,
                fontWeight: 750,
                py: 1,
                px: 2.5,
                textTransform: 'none',
                fontSize: '0.875rem',
                borderColor: 'divider',
                color: 'text.primary',
                bgcolor: '#FFFFFF',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: pc.primary(0.04),
                  boxShadow: 'none',
                },
              }}
            >
              {t('interviewDetail.actions.openRecording')}
            </Button>
          </>
        ) : (
          <Box
            sx={{
              ...interviewDetailPanelSx,
              py: 5,
              px: 3,
              bgcolor: '#F8FAFC',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 3,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <VideocamOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.75, letterSpacing: '-0.01em' }}>
              {t('interview:interviewDetail.messages.recordingPending')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: 440, mx: 'auto', lineHeight: 1.65, fontSize: '0.84rem' }}>
              {t('interview:interviewDetail.messages.recordingPendingDesc')}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default InterviewRecordingCard;

