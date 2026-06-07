'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useTranslation } from 'react-i18next';

import agentAssistantService, {
  type AgentMessageAttachment,
  type AgentMessage,
  type AgentPortal,
  type AgentThread,
  type AgentToolCall,
} from '@/services/agentAssistantService';
import { TabTitle } from '@/utils/generalFunction';
import { getSafeExternalOpenUrl } from '@/utils/safeExternalUrl';

type AgentAssistantPageProps = {
  portal: AgentPortal;
};

type ThreadGroup = {
  key: ThreadGroupKey;
  threads: AgentThread[];
};

type ThreadGroupKey = 'today' | 'yesterday' | 'thisWeek' | 'earlier';

const DEFAULT_AGENT_THREAD_TITLE = 'Agent Assistants';
const MAX_IMAGE_ATTACHMENTS = 5;
const MAX_IMAGE_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

type PendingAgentAttachment = AgentMessageAttachment & {
  id: string;
};

const statusLabelKeys: Record<string, string> = {
  pending: 'common:agentAssistant.status.pending',
  running: 'common:agentAssistant.status.running',
  succeeded: 'common:agentAssistant.status.succeeded',
  failed: 'common:agentAssistant.status.failed',
};

const threadGroupLabelKeys: Record<ThreadGroupKey, string> = {
  today: 'common:agentAssistant.threadGroups.today',
  yesterday: 'common:agentAssistant.threadGroups.yesterday',
  thisWeek: 'common:agentAssistant.threadGroups.thisWeek',
  earlier: 'common:agentAssistant.threadGroups.earlier',
};

const threadGroupOrder: ThreadGroupKey[] = ['today', 'yesterday', 'thisWeek', 'earlier'];

const formatTime = (value?: string | null, locale = 'vi-VN') => {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '';
  }
};

const formatThreadTime = (value?: string | null, locale = 'vi-VN') => {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '';
  }
};

const getThreadGroupKey = (value?: string | null): ThreadGroupKey => {
  if (!value) return 'earlier';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'earlier';

  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startToday - startDate) / 86400000);

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return 'thisWeek';
  return 'earlier';
};

const groupThreads = (threads: AgentThread[]): ThreadGroup[] => {
  const groups = new Map<ThreadGroupKey, AgentThread[]>();
  threads.forEach((thread) => {
    const key = getThreadGroupKey(thread.lastMessageAt || thread.createAt);
    groups.set(key, [...(groups.get(key) || []), thread]);
  });

  return threadGroupOrder
    .map((key) => ({ key, threads: groups.get(key) || [] }))
    .filter((group) => group.threads.length > 0);
};

const isImagePart = (value: unknown): value is AgentMessageAttachment => {
  if (!value || typeof value !== 'object') return false;
  const part = value as Partial<AgentMessageAttachment>;
  return part.type === 'image' && typeof part.dataUrl === 'string' && typeof part.mimeType === 'string';
};

const toMessageParts = (content: string, attachments: AgentMessageAttachment[] = []) => [
  ...(content ? [{ type: 'text', text: content }] : []),
  ...attachments,
];

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.readAsDataURL(file);
  });

const createOptimisticMessage = (
  role: AgentMessage['role'],
  content: string,
  offset: number,
  attachments: AgentMessageAttachment[] = [],
): AgentMessage => {
  const now = new Date().toISOString();
  return {
    id: -Date.now() - offset,
    role,
    content,
    parts: toMessageParts(content, attachments),
    metadata: { optimistic: true },
    toolCalls: [],
    createAt: now,
    updateAt: now,
  };
};

const toolDisplayNameKeys: Record<string, string> = {
  create_manual_candidate: 'common:agentAssistant.tools.create_manual_candidate',
  search_candidates: 'common:agentAssistant.tools.search_candidates',
  update_application_status: 'common:agentAssistant.tools.update_application_status',
  list_job_posts: 'common:agentAssistant.tools.list_job_posts',
  list_applications: 'common:agentAssistant.tools.list_applications',
  list_companies: 'common:agentAssistant.tools.list_companies',
  review_job_post: 'common:agentAssistant.tools.review_job_post',
  create_question: 'common:agentAssistant.tools.create_question',
  list_questions: 'common:agentAssistant.tools.list_questions',
  create_question_group: 'common:agentAssistant.tools.create_question_group',
  list_question_groups: 'common:agentAssistant.tools.list_question_groups',
  list_interviews: 'common:agentAssistant.tools.list_interviews',
};

const businessRowLabelKeys = {
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

const ToolStepCard = ({ toolCall }: { toolCall: AgentToolCall }) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const output = asRecord(toolCall.output);
  const record = asRecord(output.record);
  const recordUrl = typeof record.url === 'string' ? record.url : '';
  const safeRecordUrl = getSafeExternalOpenUrl(recordUrl);
  const message = asString(output.message) || toolCall.errorMessage;
  const rows = businessRows(toolCall);
  const results = Array.isArray(output.results) ? output.results : [];
  const hasDetails = Boolean(toolCall.errorMessage || safeRecordUrl || rows.length || results.length);
  const [expanded, setExpanded] = useState(hasDetails);
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
        borderRadius: 1,
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
          py: 1,
          color: 'text.primary',
          textTransform: 'none',
          borderRadius: 0,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Box sx={{ color, display: 'flex' }}>
            <ToolStatusIcon status={toolCall.status} />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {toolDisplayNameKeys[toolCall.toolName]
              ? t(toolDisplayNameKeys[toolCall.toolName])
              : toolCall.displayName || toolCall.toolName}
          </Typography>
          <Chip
            size="small"
            label={statusLabelKeys[toolCall.status] ? t(statusLabelKeys[toolCall.status]) : toolCall.status}
            sx={{ height: 22 }}
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
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              {rows.map((row) => (
                <Box
                  key={row.labelKey}
                  sx={{
                    minWidth: 0,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.text.primary, 0.035),
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                    {t(row.labelKey)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                    {row.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : null}

          {results.length ? (
            <Stack spacing={0.75}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                {t('common:agentAssistant.results.title')}
              </Typography>
              {results.slice(0, 4).map((item, index) => {
                const safeResultUrl = getSafeExternalOpenUrl(resultUrl(item));
                return (
                  <Box
                    key={`${resultTitle(item)}-${index}`}
                    component={safeResultUrl ? 'a' : 'div'}
                    {...(safeResultUrl ? { href: safeResultUrl } : {})}
                    sx={{
                      minWidth: 0,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.text.primary, 0.035),
                      color: 'text.primary',
                      cursor: safeResultUrl ? 'pointer' : 'default',
                      display: 'block',
                      textDecoration: 'none',
                      ...(safeResultUrl
                        ? {
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                            },
                          }
                        : {}),
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 750, overflowWrap: 'anywhere' }}>
                      {resultTitle(item) || t('common:agentAssistant.results.fallback', { index: index + 1 })}
                    </Typography>
                    {resultSubtitle(item) ? (
                      <Typography variant="caption" sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}>
                        {resultSubtitle(item)}
                      </Typography>
                    ) : null}
                  </Box>
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
            <Button
              size="small"
              variant="outlined"
              endIcon={<OpenInNewIcon fontSize="small" />}
              href={safeRecordUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ alignSelf: 'flex-start', textTransform: 'none', borderRadius: 1 }}
            >
              {t('common:agentAssistant.results.openRecord')}
            </Button>
          ) : null}
        </Stack>
      ) : null}
    </Box>
  );
};

const MessageBubble = ({ message }: { message: AgentMessage }) => {
  const isUser = message.role === 'user';
  const isOptimistic = Boolean(message.metadata?.optimistic);
  const imageParts = (message.parts || []).filter(isImagePart);

  return (
    <Box sx={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <Stack
        spacing={1}
        sx={{
          maxWidth: { xs: '94%', md: '74%' },
          minWidth: isUser ? 0 : { xs: 'min(94%, 320px)', md: 'min(74%, 420px)' },
          px: isUser ? 1.75 : 0,
          py: isUser ? 1.1 : 0,
          borderRadius: 1,
          bgcolor: isUser ? 'primary.main' : 'transparent',
          color: isUser ? 'primary.contrastText' : 'text.primary',
          opacity: isOptimistic ? 0.82 : 1,
        }}
      >
        {message.toolCalls?.map((toolCall) => (
          <ToolStepCard key={toolCall.id} toolCall={toolCall} />
        ))}
        {imageParts.length ? (
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            {imageParts.map((part, index) => (
              <Box
                key={`${part.name}-${index}`}
                component="img"
                src={part.dataUrl}
                alt={part.name || `attachment-${index + 1}`}
                sx={{
                  width: 144,
                  maxWidth: '100%',
                  aspectRatio: '4 / 3',
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: isUser ? alpha('#fff', 0.3) : 'divider',
                  bgcolor: isUser ? alpha('#fff', 0.08) : 'action.hover',
                }}
              />
            ))}
          </Stack>
        ) : null}
        {message.content ? (
          <Stack direction="row" spacing={1} alignItems="flex-start">
            {!isUser && isOptimistic ? <CircularProgress size={15} sx={{ mt: 0.4 }} /> : null}
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
              {message.content}
            </Typography>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
};

const ThreadItem = ({
  thread,
  selected,
  deleting,
  locale,
  onClick,
  onDelete,
}: {
  thread: AgentThread;
  selected: boolean;
  deleting: boolean;
  locale: string;
  onClick: () => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation('common');
  const title = thread.title && thread.title !== DEFAULT_AGENT_THREAD_TITLE
    ? thread.title
    : t('common:agentAssistant.title');

  return (
    <Box
      sx={{
        borderRadius: 1,
        bgcolor: selected ? 'background.paper' : 'transparent',
        border: '1px solid',
        borderColor: selected ? 'divider' : 'transparent',
        boxShadow: selected ? '0 1px 3px rgba(15, 23, 42, 0.06)' : 'none',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 32px',
        alignItems: 'center',
        '&:hover': {
          bgcolor: selected ? 'background.paper' : 'action.hover',
          '& .agent-thread-delete': { opacity: 1 },
        },
      }}
    >
      <Button
        fullWidth
        onClick={onClick}
        sx={{
          justifyContent: 'flex-start',
          textAlign: 'left',
          textTransform: 'none',
          borderRadius: 1,
          px: 1.25,
          py: 1,
          color: 'text.primary',
          minWidth: 0,
          '&:hover': { bgcolor: 'transparent' },
        }}
      >
        <Stack spacing={0.25} sx={{ minWidth: 0, width: '100%' }}>
          <Typography variant="body2" sx={{ fontWeight: 750, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formatThreadTime(thread.lastMessageAt || thread.createAt, locale)}
          </Typography>
        </Stack>
      </Button>

      <Tooltip title={t('common:agentAssistant.deleteHistory')}>
        <span>
          <IconButton
            className="agent-thread-delete"
            aria-label={t('common:agentAssistant.deleteHistory')}
            size="small"
            disabled={deleting}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            sx={{
              width: 28,
              height: 28,
              mr: 0.5,
              borderRadius: 1,
              color: 'text.secondary',
              opacity: { xs: 1, lg: selected ? 1 : 0 },
              transition: 'opacity 120ms ease',
              '&:hover': { color: 'error.main', bgcolor: 'rgba(239, 68, 68, 0.08)' },
            }}
          >
            {deleting ? <CircularProgress size={14} /> : <DeleteOutlineRoundedIcon fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default function AgentAssistantPage({ portal }: AgentAssistantPageProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation('common');
  const [threads, setThreads] = useState<AgentThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<PendingAgentAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [deletingThreadId, setDeletingThreadId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';

  TabTitle(t('common:agentAssistant.title'));

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [selectedThreadId, threads],
  );
  const threadGroups = useMemo(() => groupThreads(threads), [threads]);

  const loadMessages = useCallback(async (threadId: number) => {
    const response = await agentAssistantService.listMessages(threadId);
    setMessages(response.messages || []);
  }, []);

  const selectThread = useCallback(
    async (threadId: number) => {
      if (threadId === selectedThreadId) return;
      setSelectedThreadId(threadId);
      setError('');
      await loadMessages(threadId);
    },
    [loadMessages, selectedThreadId],
  );

  const createThread = useCallback(async () => {
    const created = await agentAssistantService.createThread(portal);
    setThreads((current) => [created, ...current]);
    setSelectedThreadId(created.id);
    setMessages([]);
    return created;
  }, [portal]);

  const handleDeleteThread = useCallback(
    async (threadId: number) => {
      if (deletingThreadId || isSending) return;

      setDeletingThreadId(threadId);
      setError('');
      try {
        await agentAssistantService.deleteThread(threadId);
        const remainingThreads = threads.filter((thread) => thread.id !== threadId);
        setThreads(remainingThreads);

        if (selectedThreadId === threadId) {
          const nextThread = remainingThreads[0];
          if (nextThread) {
            setSelectedThreadId(nextThread.id);
            await loadMessages(nextThread.id);
          } else {
            const created = await agentAssistantService.createThread(portal);
            setThreads([created]);
            setSelectedThreadId(created.id);
            setMessages([]);
          }
        }
      } catch (err) {
        setError(t('common:agentAssistant.deleteError'));
      } finally {
        setDeletingThreadId(null);
      }
    },
    [deletingThreadId, isSending, loadMessages, portal, selectedThreadId, t, threads],
  );

  useEffect(() => {
    let cancelled = false;

    const loadInitial = async () => {
      setIsLoading(true);
      setError('');
      try {
        const threadsResponse = await agentAssistantService.listThreads();
        if (cancelled) return;

        let nextThreads = threadsResponse.threads || [];
        if (nextThreads.length === 0) {
          const created = await agentAssistantService.createThread(portal);
          nextThreads = [created];
        }
        if (cancelled) return;

        setThreads(nextThreads);
        const firstThread = nextThreads[0];
        setSelectedThreadId(firstThread?.id ?? null);
        if (firstThread) {
          await loadMessages(firstThread.id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(t('common:agentAssistant.loadError'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [loadMessages, portal, t]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleSelectAttachments = async (files: FileList | null) => {
    if (!files?.length) return;

    const selectedFiles = Array.from(files);
    const remainingSlots = MAX_IMAGE_ATTACHMENTS - attachments.length;
    if (remainingSlots <= 0 || selectedFiles.length > remainingSlots) {
      setError(t('common:agentAssistant.attachments.limit', { count: MAX_IMAGE_ATTACHMENTS }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const nextAttachments: PendingAgentAttachment[] = [];
    try {
      for (const file of selectedFiles) {
        if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
          setError(t('common:agentAssistant.attachments.unsupported'));
          continue;
        }
        if (file.size > MAX_IMAGE_ATTACHMENT_BYTES) {
          setError(t('common:agentAssistant.attachments.tooLarge'));
          continue;
        }

        nextAttachments.push({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          type: 'image',
          name: file.name,
          mimeType: file.type,
          size: file.size,
          dataUrl: await readFileAsDataUrl(file),
        });
      }
    } catch (err) {
      setError(t('common:agentAssistant.attachments.readError'));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

    if (nextAttachments.length) {
      setError('');
      setAttachments((current) => [...current, ...nextAttachments]);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  };

  const handleSend = async () => {
    const content = input.trim();
    const attachmentSnapshot = attachments;
    const attachmentPayload = attachmentSnapshot.map(({ id, ...attachment }) => attachment);
    if ((!content && attachmentPayload.length === 0) || isSending) return;

    setIsSending(true);
    setError('');
    setInput('');
    setAttachments([]);

    let optimisticUser: AgentMessage | null = null;
    let optimisticAssistant: AgentMessage | null = null;

    try {
      const thread = selectedThread ?? (await createThread());
      optimisticUser = createOptimisticMessage('user', content, 1, attachmentPayload);
      optimisticAssistant = createOptimisticMessage('assistant', t('common:agentAssistant.thinking'), 2);

      setMessages((current) => [...current, optimisticUser as AgentMessage, optimisticAssistant as AgentMessage]);
      setThreads((current) => {
        const optimisticThread = {
          ...thread,
          title: thread.title === DEFAULT_AGENT_THREAD_TITLE
            ? (content || t('common:agentAssistant.attachments.threadTitle')).slice(0, 90)
            : thread.title,
          lastMessageAt: new Date().toISOString(),
        };
        const withoutUpdated = current.filter((item) => item.id !== thread.id);
        return [optimisticThread, ...withoutUpdated];
      });
      setSelectedThreadId(thread.id);

      const response = await agentAssistantService.sendMessage(thread.id, content, attachmentPayload);
      setMessages((current) => [
        ...current.filter((message) => message.id !== optimisticUser?.id && message.id !== optimisticAssistant?.id),
        response.userMessage,
        response.assistantMessage,
      ]);
      setThreads((current) => {
        const withoutUpdated = current.filter((item) => item.id !== response.thread.id);
        return [response.thread, ...withoutUpdated];
      });
      setSelectedThreadId(response.thread.id);
    } catch (err) {
      setInput(content);
      setAttachments(attachmentSnapshot);
      setMessages((current) =>
        current.filter((message) => message.id !== optimisticUser?.id && message.id !== optimisticAssistant?.id),
      );
      setError(t('common:agentAssistant.sendError'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 120px)', minWidth: 0 }}>
      {error ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      ) : null}

      <Paper
        elevation={0}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '304px minmax(0, 1fr)' },
          gridTemplateRows: { xs: 'minmax(280px, 34dvh) minmax(0, 1fr)', lg: '1fr' },
          height: { xs: 'calc(100dvh - 126px)', lg: 'calc(100vh - 132px)' },
          minHeight: { xs: 560, lg: 620 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: 'auto minmax(0, 1fr) auto',
            borderRight: { xs: 0, lg: '1px solid' },
            borderBottom: { xs: '1px solid', lg: 0 },
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.text.primary, 0.025),
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <Stack spacing={1.25} sx={{ p: 1.5, pb: 1 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <SmartToyOutlinedIcon fontSize="small" />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                  {t('common:agentAssistant.title')}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {portal === 'admin'
                    ? t('common:agentAssistant.portals.admin')
                    : t('common:agentAssistant.portals.employer')}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Box sx={{ minHeight: 0, overflowY: 'auto', px: 1.25, pb: 1.25 }}>
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ position: 'sticky', top: 0, zIndex: 1, px: 0.25, py: 0.75, bgcolor: 'inherit' }}
            >
              <HistoryRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 900 }}>
                {t('common:agentAssistant.recents')}
              </Typography>
            </Stack>

            {isLoading ? (
              <Stack alignItems="center" sx={{ py: 4 }}>
                <CircularProgress size={26} />
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                {threadGroups.map((group) => (
                  <Stack key={group.key} spacing={0.75}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, px: 0.25 }}>
                      {t(threadGroupLabelKeys[group.key])}
                    </Typography>
                    {group.threads.map((thread) => (
                      <ThreadItem
                        key={thread.id}
                        thread={thread}
                        selected={thread.id === selectedThreadId}
                        deleting={thread.id === deletingThreadId}
                        locale={locale}
                        onClick={() => void selectThread(thread.id)}
                        onDelete={() => void handleDeleteThread(thread.id)}
                      />
                    ))}
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>

          <Box sx={{ p: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              fullWidth
              startIcon={<AddRoundedIcon />}
              variant="contained"
              onClick={() => void createThread()}
              sx={{ textTransform: 'none', borderRadius: 1, justifyContent: 'flex-start' }}
            >
              {t('common:agentAssistant.newChat')}
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', minWidth: 0, minHeight: 0 }}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.25, minWidth: 0 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedThread?.title && selectedThread.title !== DEFAULT_AGENT_THREAD_TITLE
                  ? selectedThread.title
                  : t('common:agentAssistant.title')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {selectedThread ? formatTime(selectedThread.lastMessageAt || selectedThread.createAt, locale) : ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
              {selectedThread ? (
                <Tooltip title={t('common:agentAssistant.deleteHistory')}>
                  <span>
                    <IconButton
                      aria-label={t('common:agentAssistant.deleteCurrentHistory')}
                      size="small"
                      disabled={deletingThreadId === selectedThread.id || isSending}
                      onClick={() => void handleDeleteThread(selectedThread.id)}
                      sx={{ borderRadius: 1 }}
                    >
                      {deletingThreadId === selectedThread.id ? (
                        <CircularProgress size={16} />
                      ) : (
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                {t('common:agentAssistant.ready')}
              </Typography>
            </Stack>
          </Stack>
          <Divider />

          <Box sx={{ minHeight: 0, overflowY: 'auto', px: { xs: 1.5, md: 4 }, py: 2.5 }}>
            {isLoading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                <CircularProgress />
              </Stack>
            ) : messages.length === 0 ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', color: 'text.secondary' }}>
                <SmartToyOutlinedIcon sx={{ fontSize: 42, mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 750 }}>
                  {t('common:agentAssistant.empty')}
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={2.25}>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={scrollRef} />
              </Stack>
            )}
          </Box>

          <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack spacing={1}>
              {attachments.length ? (
                <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                  {attachments.map((attachment) => (
                    <Box
                      key={attachment.id}
                      sx={{
                        position: 'relative',
                        width: 74,
                        aspectRatio: '1 / 1',
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Box
                        component="img"
                        src={attachment.dataUrl}
                        alt={attachment.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <Tooltip title={t('common:agentAssistant.attachments.remove')}>
                        <IconButton
                          size="small"
                          aria-label={t('common:agentAssistant.attachments.remove')}
                          disabled={isSending}
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          sx={{
                            position: 'absolute',
                            top: 3,
                            right: 3,
                            width: 22,
                            height: 22,
                            borderRadius: 1,
                            bgcolor: alpha('#000', 0.62),
                            color: '#fff',
                            '&:hover': { bgcolor: alpha('#000', 0.76) },
                          }}
                        >
                          <CloseRoundedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Stack>
              ) : null}

              <Stack direction="row" spacing={1} alignItems="flex-end">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  hidden
                  onChange={(event) => void handleSelectAttachments(event.target.files)}
                />
                <Tooltip title={t('common:agentAssistant.attachments.addImage')}>
                  <span>
                    <IconButton
                      disabled={isSending || Boolean(deletingThreadId)}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        color: 'text.secondary',
                      }}
                    >
                      {attachments.length ? <ImageOutlinedIcon fontSize="small" /> : <AttachFileRoundedIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
                <TextField
                  fullWidth
                  multiline
                  maxRows={5}
                  value={input}
                  disabled={isSending || Boolean(deletingThreadId)}
                  placeholder={t('common:agentAssistant.placeholder')}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.text.primary, 0.015),
                    },
                  }}
                />
                <Tooltip title={t('common:agentAssistant.send')}>
                  <span>
                    <IconButton
                      color="primary"
                      disabled={(!input.trim() && attachments.length === 0) || isSending || Boolean(deletingThreadId)}
                      onClick={() => void handleSend()}
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 1,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&.Mui-disabled': {
                          bgcolor: 'action.disabledBackground',
                          color: 'action.disabled',
                        },
                      }}
                    >
                      {isSending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
