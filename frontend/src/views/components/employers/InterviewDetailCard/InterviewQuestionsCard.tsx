import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import type { TFunction } from 'i18next';
import { InterviewSession } from '@/types/models';
import pc from '@/utils/muiColors';
import InterviewDetailSectionHeader from './InterviewDetailSectionHeader';
import { interviewDetailCardSx, interviewDetailPanelSx } from './sectionStyles';

interface InterviewQuestionsCardProps {
  session: InterviewSession;
  t: TFunction;
}

const InterviewQuestionsCard: React.FC<InterviewQuestionsCardProps> = ({ session, t }) => {
  const questions = session.questions || [];

  return (
    <Paper elevation={0} sx={interviewDetailCardSx}>
      <InterviewDetailSectionHeader
        icon={<QuizIcon />}
        title={t('interviewDetail.subtitle.questions')}
        action={
          <Chip
            label={questions.length}
            size="small"
            sx={{
              height: 24,
              minWidth: 28,
              fontWeight: 850,
              bgcolor: pc.primary(0.08),
              color: 'primary.main',
              border: '1px solid',
              borderColor: pc.primary(0.14),
              letterSpacing: 0,
            }}
          />
        }
      />

      <Stack spacing={1.25}>
        {questions.length > 0 ? (
          questions.map((q, idx) => (
            <Box
              key={q.id}
              sx={{
                ...interviewDetailPanelSx,
                p: 1.75,
                bgcolor: pc.actionDisabled(0.025),
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                '&:hover': {
                  bgcolor: pc.primary(0.025),
                  borderColor: pc.primary(0.18),
                },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: pc.primary(0.08),
                    color: 'primary.main',
                    fontWeight: 850,
                    fontSize: '0.8rem',
                    border: '1px solid',
                    borderColor: pc.primary(0.14),
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 650, color: 'text.primary', lineHeight: 1.65, pt: 0.25 }}>
                  {q.text || q.questionText || q.content}
                </Typography>
              </Stack>
            </Box>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 5, ...interviewDetailPanelSx, borderStyle: 'dashed', bgcolor: pc.actionDisabled(0.025) }}>
            <HelpOutlineIcon sx={{ fontSize: 38, color: 'text.disabled', mb: 1.5, opacity: 0.35 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 750 }}>
              {t('interviewDetail.messages.noQuestions')}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default InterviewQuestionsCard;
