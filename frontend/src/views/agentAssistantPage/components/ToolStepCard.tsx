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
    [businessRowLabelKeys.candidate, firstString(record.candidateName, record.fullName, record.name)],
    [businessRowLabelKeys.email, record.email],
    [businessRowLabelKeys.phone, record.phone],
    [businessRowLabelKeys.jobPost, record.jobPostName],
    [businessRowLabelKeys.company, record.companyName],
    [businessRowLabelKeys.status, record.statusLabel],
    [businessRowLabelKeys.question, firstString(record.questionText, record.text)],
    [businessRowLabelKeys.questionGroup, record.name],
    [businessRowLabelKeys.questionsCount, record.questionsCount],
    [businessRowLabelKeys.interviewId, record.interviewId],
    [businessRowLabelKeys.applicationId, record.applicationId],
    [businessRowLabelKeys.jobPostId, record.jobPostId],
  ]
    .map(([labelKey, value]) => ({ labelKey: String(labelKey), value: value == null ? '' : String(value) }))
    .filter((row) => row.value.trim());
};

const ToolStatusIcon = ({ status }: { status: AgentToolCall['status'] }) => {
  if (status === 'succeeded') return <CheckCircleOutlineIcon fontSize="small" />;
  if (status === 'failed') return <ErrorOutlineIcon fontSize="small" />;
  return <PlayCircleOutlineIcon fontSize="small" />;
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
  const [expanded, setExpanded] = useState(hasDetails && !isNotebookTool);
  const color =
    toolCall.status === 'succeeded'
      ? theme.palette.success.main
      : toolCall.status === 'failed'
        ? theme.palette.error.main
        : theme.palette.info.main;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: alpha(color, 0.28),
        borderRadius: 1.5,
        bgcolor: alpha(color, 0.035),
        overflow: 'hidden',
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
          py: 0.85,
          color: 'text.primary',
          textTransform: 'none',
          borderRadius: 0,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Box sx={{ color, display: 'flex' }}>
            <ToolStatusIcon status={toolCall.status} />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {toolDisplayNameKeys[toolCall.toolName]
              ? t(toolDisplayNameKeys[toolCall.toolName])
              : toolCall.displayName || toolCall.toolName}
          </Typography>
          <Chip
            size="small"
            label={statusLabelKeys[toolCall.status] ? t(statusLabelKeys[toolCall.status]) : toolCall.status}
            sx={{ height: 20, fontSize: '0.725rem', fontWeight: 600 }}
          />
        </Stack>
        {hasDetails ? (
          expanded ? (
            <KeyboardArrowUpRoundedIcon fontSize="small" />
          ) : (
            <KeyboardArrowDownRoundedIcon fontSize="small" />
          )
        ) : null}
      </Button>

      {message ? (
        <Typography variant="body2" sx={{ px: 1.5, pb: expanded && hasDetails ? 1 : 1.5, color: 'text.secondary' }}>
          {message}
        </Typography>
      ) : null}

      {expanded && hasDetails ? (
        <Stack spacing={1.25} sx={{ p: 1.5, pt: 0 }}>
          {toolCall.errorMessage ? (
            <Alert severity="error" sx={{ py: 0.5 }}>
              {toolCall.errorMessage}
            </Alert>
          ) : null}

          {rows.length ? (
            <Paper variant="outlined" sx={{ p: 1, borderRadius: 1.25, bgcolor: 'background.paper' }}>
              <Stack spacing={0.65}>
                {rows.map((row) => (
                  <Stack
                    key={`${row.labelKey}-${row.value}`}
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {t(row.labelKey)}:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, textAlign: 'right' }}>
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
                const title = resultTitle(item) || t('common:agentAssistant.results.fallback');
                const subtitle = resultSubtitle(item);
                const itemUrl = resultUrl(item);
                const safeUrl = getSafeExternalOpenUrl(itemUrl);

                return (
                  <Paper
                    key={`${title}-${index}`}
                    variant="outlined"
                    sx={{ p: 1, borderRadius: 1.25, bgcolor: 'background.paper' }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
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
                          {t('common:agentAssistant.openLink')}
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
                sx={{ fontSize: '0.75rem' }}
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
