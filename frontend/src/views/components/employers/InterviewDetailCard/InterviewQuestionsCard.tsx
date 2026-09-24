import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
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
  const questions = Array.isArray(session?.questions) ? session.questions : [];

  return (
    <Paper elevation={0} sx={interviewDetailCardSx}>
      <InterviewDetailSectionHeader
        icon={<QuizOutlinedIcon />}
        title={t('interviewDetail.subtitle.questions')}
        action={
          <Chip
            label={`${questions.length} câu`}
            size="small"
            sx={{
              height: 24,
              fontWeight: 800,
              bgcolor: 'rgba(37, 99, 235, 0.08)',
              color: 'primary.main',
              border: '1px solid rgba(37, 99, 235, 0.18)',
              borderRadius: 1.5,
              fontSize: '0.72rem',
            }}
          />
        }
      />

      <Stack spacing={1.5}>
        {questions.length > 0 ? (
          questions.map((q, idx) => (
            <Box
              key={q?.id ?? idx}
              sx={{
                ...interviewDetailPanelSx,
                p: 2,
                bgcolor: '#FFFFFF',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: pc.primary(0.25),
                  boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)',
                },
              }}
            >
              <Stack direction="row" spacing={1.75} alignItems="flex-start">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(37, 99, 235, 0.08)',
                    color: 'primary.main',
                    fontWeight: 850,
                    fontSize: '0.8125rem',
                    border: '1px solid rgba(37, 99, 235, 0.18)',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.6, fontSize: '0.875rem' }}>
                    {q?.text || q?.questionText || q?.content || 'Câu hỏi'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 5,
              px: 3,
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: '#F8FAFC',
            }}
          >
            <HelpOutlineIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1.5, opacity: 0.4 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.84rem' }}>
              {t('interviewDetail.messages.noQuestions')}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default InterviewQuestionsCard;

