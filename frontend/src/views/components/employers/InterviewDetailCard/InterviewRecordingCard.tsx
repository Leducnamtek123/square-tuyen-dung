import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import type { TFunction } from 'i18next';
import pc from '@/utils/muiColors';
import InterviewDetailSectionHeader from './InterviewDetailSectionHeader';
import { interviewDetailCardSx, interviewDetailPanelSx } from './sectionStyles';

interface InterviewRecordingCardProps {
  recordingUrl: string | null;
  isCompleted?: boolean;
  t: TFunction;
}

const InterviewRecordingCard: React.FC<InterviewRecordingCardProps> = ({ recordingUrl, isCompleted = false, t }) => {
  if (!recordingUrl && !isCompleted) return null;

  return (
    <Paper elevation={0} sx={interviewDetailCardSx}>
      <InterviewDetailSectionHeader icon={<VideoLibraryIcon />} title={t('interviewDetail.subtitle.recording')} />

      <Stack spacing={2}>
        {recordingUrl ? (
          <>
            <Box
              sx={{
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'common.black',
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid',
                borderColor: 'divider',
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
                  objectFit: 'contain',
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
                alignSelf: 'flex-start',
                
                fontWeight: 800,
                py: 1,
                px: 2,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none', bgcolor: pc.primary(0.04) },
              }}
            >
              {t('interviewDetail.actions.openRecording')}
            </Button>
          </>
        ) : (
          <Box
            sx={{
              ...interviewDetailPanelSx,
              p: 2.5,
              borderStyle: 'dashed',
              borderColor: pc.primary(0.18),
              bgcolor: pc.primary(0.025),
              textAlign: 'center',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 850, color: 'primary.main', mb: 0.75, letterSpacing: 0 }}>
              {t('interviewDetail.messages.recordingPending', { defaultValue: 'Recording is being processed' })}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.7 }}>
              {t('interviewDetail.messages.recordingPendingDesc', {
                defaultValue: t('common:interview.recordingWaiting'),
              })}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default InterviewRecordingCard;
