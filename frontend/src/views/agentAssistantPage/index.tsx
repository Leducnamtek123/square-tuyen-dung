'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useTranslation } from 'react-i18next';

import agentAssistantService, {
  type AgentMessageAttachment,
  type AgentMessage,
  type AgentPortal,
  type AgentThread,
} from '@/services/agentAssistantService';
import { TabTitle } from '@/utils/generalFunction';
import { ThreadSidebar, type ThreadGroup, type ThreadGroupKey } from './components/ThreadSidebar';
import { MessageItem } from './components/MessageItem';

type AgentAssistantPageProps = {
  portal: AgentPortal;
};

const DEFAULT_AGENT_THREAD_TITLE = 'AILA';
const MAX_IMAGE_ATTACHMENTS = 5;
const MAX_IMAGE_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

type PendingAgentAttachment = AgentMessageAttachment & {
  id: string;
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

export default function AgentAssistantPage({ portal }: AgentAssistantPageProps) {
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
      } catch {
        setError(t('common:agentAssistant.deleteError'));
      } finally {
        setDeletingThreadId(null);
      }
    },
    [deletingThreadId, isSending, loadMessages, portal, selectedThreadId, t, threads],
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    agentAssistantService.listThreads()
      .then((threadsResponse) => {
        if (cancelled) return null;
        const nextThreads = threadsResponse.threads || [];
        if (nextThreads.length === 0) {
          return agentAssistantService.createThread(portal).then((created) => ({ nextThreads: [created] }));
        }
        return { nextThreads };
      })
      .then((data) => {
        if (!data || cancelled) return null;
        const { nextThreads } = data;
        const firstThreadId = nextThreads[0]?.id ?? null;
        if (firstThreadId) {
          return agentAssistantService.listMessages(firstThreadId).then((res) => ({
            nextThreads,
            firstThreadId,
            initialMessages: res.messages || [],
          }));
        }
        return { nextThreads, firstThreadId, initialMessages: [] };
      })
      .then((data) => {
        if (!data || cancelled) return;
        setThreads(data.nextThreads);
        setSelectedThreadId(data.firstThreadId);
        setMessages(data.initialMessages);
      })
      .catch(() => {
        if (!cancelled) {
          setError(t('common:agentAssistant.loadError'));
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [portal, t]);

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
    } catch {
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
    } catch {
      setError(t('common:agentAssistant.sendError'));
      setMessages((current) =>
        current.filter((message) => message.id !== optimisticUser?.id && message.id !== optimisticAssistant?.id),
      );
      setInput(content);
      setAttachments(attachmentSnapshot);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '280px minmax(0, 1fr)' },
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
      }}
    >
      {/* Left Sidebar */}
      <ThreadSidebar
        portal={portal}
        threadGroups={threadGroups}
        selectedThreadId={selectedThreadId}
        deletingThreadId={deletingThreadId}
        isLoading={isLoading}
        locale={locale}
        onSelectThread={selectThread}
        onDeleteThread={handleDeleteThread}
        onCreateThread={createThread}
      />

      {/* Right Chat Panel */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: '56px minmax(0, 1fr) auto',
          minWidth: 0,
          minHeight: 0,
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.5, height: 56, minWidth: 0, borderBottom: '1px solid #E5E7EB' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#111827',
                fontSize: '0.9375rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedThread?.title && selectedThread.title !== DEFAULT_AGENT_THREAD_TITLE
                ? selectedThread.title
                : t('common:agentAssistant.title')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
              {selectedThread ? formatTime(selectedThread.lastMessageAt || selectedThread.createAt, locale) : ''}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
            {selectedThread ? (
              <Tooltip title={t('common:agentAssistant.deleteHistory')}>
                <span>
                  <IconButton
                    aria-label={t('common:agentAssistant.deleteCurrentHistory')}
                    size="small"
                    disabled={deletingThreadId === selectedThread.id || isSending}
                    onClick={() => void handleDeleteThread(selectedThread.id)}
                    sx={{
                      borderRadius: '8px',
                      color: '#6B7280',
                      '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' },
                    }}
                  >
                    {deletingThreadId === selectedThread.id ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.35,
                borderRadius: '20px',
                bgcolor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22C55E' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#15803D', fontSize: '0.75rem' }}>
                Online
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {/* Message Stream */}
        <Box sx={{ minHeight: 0, overflowY: 'auto', px: { xs: 2, md: 3 }, py: 2.5, bgcolor: '#FAFAFA' }}>
          {isLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
              <CircularProgress sx={{ color: '#2563EB' }} />
            </Stack>
          ) : messages.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', py: 4, px: 2, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                  color: '#FFFFFF',
                  display: 'grid',
                  placeItems: 'center',
                  mb: 1.5,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
                }}
              >
                <SmartToyOutlinedIcon sx={{ fontSize: 26 }} />
              </Box>
              <Typography variant="h3" sx={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', mb: 0.5 }}>
                {t('common:agentAssistant.ready')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280', maxWidth: 420, fontSize: '0.875rem' }}>
                {t('common:agentAssistant.empty')}
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
              <div ref={scrollRef} />
            </Stack>
          )}
        </Box>

        {/* Bottom Input Area */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(226, 232, 240, 0.85)', bgcolor: '#FFFFFF' }}>
          <Stack spacing={1.5}>
            {attachments.length ? (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {attachments.map((attachment) => (
                  <Box
                    key={attachment.id}
                    sx={{
                      position: 'relative',
                      width: 64,
                      aspectRatio: '1 / 1',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #E5E7EB',
                      bgcolor: '#F8FAFC',
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
                          top: 2,
                          right: 2,
                          width: 18,
                          height: 18,
                          borderRadius: '4px',
                          bgcolor: 'rgba(0, 0, 0, 0.65)',
                          color: '#FFFFFF',
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.85)' },
                        }}
                      >
                        <CloseRoundedIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Stack>
            ) : null}

            <Stack direction="row" spacing={1.25} alignItems="flex-end">
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
                    aria-label="Thao tác"
                    disabled={isSending || Boolean(deletingThreadId)}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      color: '#64748B',
                      backgroundColor: '#F8FAFC',
                      transition: 'all 150ms ease',
                      '&:hover': { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' },
                    }}
                  >
                    {attachments.length ? <ImageOutlinedIcon fontSize="small" /> : <AttachFileRoundedIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
              <TextField
                fullWidth
                multiline
                maxRows={6}
                value={input}
                disabled={isSending || Boolean(deletingThreadId)}
                placeholder={t('common:agentAssistant.placeholder')}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.9375rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1.5px' },
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
                      borderRadius: '12px',
                      bgcolor: '#2563EB',
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: '#1D4ED8' },
                      '&.Mui-disabled': { bgcolor: '#F1F5F9', color: '#94A3B8' },
                    }}
                  >
                    {isSending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            {error ? (
              <Alert severity="error" sx={{ mt: 1, py: 0.5, borderRadius: '8px' }}>
                {error}
              </Alert>
            ) : null}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
