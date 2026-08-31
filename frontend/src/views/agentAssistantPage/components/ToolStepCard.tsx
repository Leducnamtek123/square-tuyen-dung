'use client';

import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useTranslation } from 'react-i18next';
import { type AgentToolCall } from '@/services/agentAssistantService';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';

export const toolDisplayNameKeys: Record<string, string> = {
  create_manual_candidate: 'common:agentAssistant.tools.create_manual_candidate',
  search_candidates: 'common:agentAssistant.tools.search_candidates',
  update_application_status: 'common:agentAssistant.tools.update_application_status',
  list_job_posts: 'common:agentAssistant.tools.list_job_posts',
  list_applications: 'common:agentAssistant.tools.list_applications',
  list_companies: 'common:agentAssistant.tools.list_companies',
  review_job_post: 'common:agentAssistant.tools.review_job_post',
  create_interview_for_candidate: 'common:agentAssistant.tools.createInterviewForCandidate',
  create_interview_for_application: 'common:agentAssistant.tools.createInterviewForApplication',
  generate_interview_questions: 'common:agentAssistant.tools.generateInterviewQuestions',
  create_interview_question_group: 'common:agentAssistant.tools.createInterviewQuestionGroup',
  search_candidate_profiles: 'common:agentAssistant.tools.searchCandidateProfiles',
  search_job_post_applications: 'common:agentAssistant.tools.searchJobPostApplications',
  search_job_posts: 'common:agentAssistant.tools.searchJobPosts',
  query_notebook_knowledge: 'common:agentAssistant.tools.queryNotebookKnowledge',
  evaluate_cv_with_notebook: 'common:agentAssistant.tools.evaluateCvWithNotebook',
};

const statusLabelKeys: Record<string, string> = {
  pending: 'common:agentAssistant.status.pending',
  running: 'common:agentAssistant.status.running',
  succeeded: 'common:agentAssistant.status.succeeded',
  failed: 'common:agentAssistant.status.failed',
};

const businessRowLabelKeys: Record<string, string> = {
  candidate: 'common:agentAssistant.rows.candidate',
  email: 'common:agentAssistant.rows.email',
  phone: 'common:agentAssistant.rows.phone',
  jobPost: 'common:agentAssistant.rows.jobPost',
  company: 'common:agentAssistant.rows.company',
  status: 'common:agentAssistant.rows.status',
  question: 'common:agentAssistant.rows.question',
  questionGroup: 'common:agentAssistant.rows.questionGroup',
  questionsCount: 'common:agentAssistant.rows.questionsCount',
  interviewId: 'common:agentAssistant.rows.interviewId',
  applicationId: 'common:agentAssistant.rows.applicationId',
  jobPostId: 'common:agentAssistant.rows.jobPostId',
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const asString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const firstString = (...values: unknown[]) => values.map(asString).find(Boolean) || '';

const resultTitle = (value: unknown) => {
  const item = asRecord(value);
  return firstString(
    item.candidateName,
    item.fullName,
    item.jobPostName,
    item.companyName,
    item.questionText,
    item.text,
    item.name,
    item.title,
    item.email,
  );
};

const resultSubtitle = (value: unknown) => {
  const item = asRecord(value);
  return firstString(item.jobPostName, item.companyName, item.statusLabel, item.category, item.email, item.phone);
};

const resultUrl = (value: unknown) => {
  const item = asRecord(value);
  return firstString(item.url, item.profileUrl, item.href);
};

const businessRows = (toolCall: AgentToolCall) => {
  const output = asRecord(toolCall.output);
  const record = asRecord(output.record);
  return [
    ['candidate', firstString(record.candidateName, record.fullName, record.name)],
    ['email', record.email],
    ['phone', record.phone],
    ['jobPost', record.jobPostName],
    ['company', record.companyName],
    ['status', record.statusLabel],
    ['question', firstString(record.questionText, record.text)],
    ['questionGroup', record.name],
    ['questionsCount', record.questionsCount],
    ['interviewId', record.interviewId],
    ['applicationId', record.applicationId],
    ['jobPostId', record.jobPostId],
  ]
    .map(([key, value]) => ({ key: String(key), value: value == null ? '' : String(value) }))
    .filter((row) => row.value.trim());
};

const ToolStatusIcon = ({ status }: { status: AgentToolCall['status'] }) => {
  if (status === 'succeeded') return <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />;
  if (status === 'failed') return <ErrorOutlineIcon sx={{ fontSize: 16 }} />;
  return <PlayCircleOutlineIcon sx={{ fontSize: 16 }} />;
};

export const ToolStepCard = ({ toolCall }: { toolCall: AgentToolCall }) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const output = asRecord(toolCall.output);
  const record = asRecord(output.record);
  const recordUrl = typeof record.url === 'string' ? record.url : '';
  const safeRecordUrl = getSafeExternalOpenUrl(recordUrl);
  const isNotebookTool =
    toolCall.toolName === 'query_notebook_knowledge' || toolCall.toolName === 'evaluate_cv_with_notebook';
  const message = isNotebookTool ? '' : asString(output.message) || toolCall.errorMessage;
  const rows = businessRows(toolCall);
  const results = Array.isArray(output.results) ? output.results : [];
  const hasDetails = Boolean(toolCall.errorMessage || safeRecordUrl || rows.length || results.length);
  const [expanded, setExpanded] = useState(false);

  const isSuccess = toolCall.status === 'succeeded';
  const isFailed = toolCall.status === 'failed';

  const borderColor = isSuccess ? '#bbf7d0' : isFailed ? '#fecdd3' : '#bae6fd';
  const bgColor = isSuccess ? '#f0fdf4' : isFailed ? '#fff1f2' : '#f0f9ff';
  const textColor = isSuccess ? '#15803d' : isFailed ? '#b91c1c' : '#0369a1';
  const chipBg = isSuccess ? '#dcfce7' : isFailed ? '#fee2e2' : '#e0f2fe';

  const getToolTitle = () => {
    const key = toolDisplayNameKeys[toolCall.toolName];
    if (key) {
      const translated = t(key);
      if (translated && !translated.startsWith('agentAssistant.tools.')) {
        return translated;
      }
    }
    return toolCall.displayName || toolCall.toolName;
  };

  const getStatusText = () => {
    const key = statusLabelKeys[toolCall.status];
    if (key) {
      const translated = t(key);
      if (translated && !translated.startsWith('agentAssistant.status.')) {
        return translated;
      }
    }
    return toolCall.status;
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor,
        borderRadius: 2,
        bgcolor: bgColor,
        overflow: 'hidden',
        transition: 'all 0.15s ease',
      }}
    >
      <Button
        fullWidth
        onClick={() => {
          if (hasDetails) setExpanded((value) => !value);
        }}
        sx={{
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.75,
          color: 'text.primary',
          textTransform: 'none',
          borderRadius: 0,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Box sx={{ color: textColor, display: 'flex', alignItems: 'center' }}>
            <ToolStatusIcon status={toolCall.status} />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: textColor, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {getToolTitle()}
          </Typography>
          <Chip
            size="small"
            label={getStatusText()}
            sx={{
              height: 20,
              fontSize: '0.7rem',
              fontWeight: 700,
              bgcolor: chipBg,
              color: textColor,
              border: 'none',
            }}
          />
        </Stack>
        {hasDetails ? (
          expanded ? (
            <KeyboardArrowUpRoundedIcon sx={{ fontSize: 18, color: textColor }} />
          ) : (
            <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: textColor }} />
          )
        ) : null}
      </Button>

      {message ? (
        <Typography variant="body2" sx={{ px: 1.5, pb: expanded && hasDetails ? 1 : 1.25, color: 'text.secondary', fontSize: '0.8125rem' }}>
          {message}
        </Typography>
      ) : null}

      {expanded && hasDetails ? (
        <Stack spacing={1.25} sx={{ p: 1.5, pt: 0 }}>
          {toolCall.errorMessage ? (
            <Alert severity="error" sx={{ py: 0.5, fontSize: '0.8125rem' }}>
              {toolCall.errorMessage}
            </Alert>
          ) : null}

          {rows.length ? (
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#ffffff', borderColor: '#E2E8F0' }}>
              <Stack spacing={0.65}>
                {rows.map((row, rIdx) => (
                  <Stack
                    key={`${row.key}-${row.value}-${rIdx}`}
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {businessRowLabelKeys[row.key] ? t(businessRowLabelKeys[row.key]) : row.key}:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, textAlign: 'right', color: '#0F172A' }}>
                      {row.value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          ) : null}

          {results.length ? (
            <Stack spacing={0.75}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {t('common:agentAssistant.results.title')} ({results.length})
              </Typography>
              {results.slice(0, 4).map((item, index) => {
                const title = resultTitle(item) || t('common:agentAssistant.results.fallback', { index: index + 1 });
                const subtitle = resultSubtitle(item);
                const itemUrl = resultUrl(item);
                const safeUrl = getSafeExternalOpenUrl(itemUrl);

                return (
                  <Paper
                    key={(item as any)?.id != null ? String((item as any).id) : `${title}-${index}`}
                    variant="outlined"
                    sx={{ p: 1, borderRadius: 1.25, bgcolor: '#ffffff', borderColor: '#E2E8F0' }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: '#0F172A' }}>
                          {title}
                        </Typography>
                        {subtitle ? (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {subtitle}
                          </Typography>
                        ) : null}
                      </Box>
                      {safeUrl ? (
                        <Button
                          size="small"
                          variant="text"
                          href={safeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          endIcon={<OpenInNewIcon fontSize="inherit" />}
                          sx={{ fontSize: '0.725rem', py: 0.25, px: 0.75, minWidth: 0 }}
                        >
                          {t('common:agentAssistant.results.openRecord')}
                        </Button>
                      ) : null}
                    </Stack>
                  </Paper>
                );
              })}
              {results.length > 4 ? (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t('common:agentAssistant.results.more', { count: results.length - 4 })}
                </Typography>
              ) : null}
            </Stack>
          ) : null}

          {safeRecordUrl ? (
            <Box>
              <Button
                size="small"
                variant="outlined"
                href={safeRecordUrl}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon fontSize="inherit" />}
                sx={{ fontSize: '0.75rem', borderRadius: 1.5 }}
              >
                {t('common:agentAssistant.results.openRecord')}
              </Button>
            </Box>
          ) : null}
        </Stack>
      ) : null}
    </Box>
  );
};
