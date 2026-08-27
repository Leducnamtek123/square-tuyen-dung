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
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';

  const [threads, setThreads] = useState<AgentThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<PendingAgentAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingThreadId, setDeletingThreadId] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  TabTitle('AILA AI - InfoHR');

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) || null,
    [selectedThreadId, threads],
  );

  const threadGroups = useMemo(() => groupThreads(threads), [threads]);

  const loadMessages = useCallback(
    async (threadId: number) => {
      try {
        const res = await agentAssistantService.listMessages(threadId);
        setMessages(res.messages || []);
      } catch {
        setError(t('common:agentAssistant.loadError'));
      }
    },
    [t],
  );

  const selectThread = useCallback(
    (threadId: number) => {
      setSelectedThreadId(threadId);
      setError(null);
      void loadMessages(threadId);
    },
    [loadMessages],
  );

  const createThread = useCallback(async () => {
    try {
      setIsLoading(true);
      const newThread = await agentAssistantService.createThread(portal);
      setThreads((current) => [newThread, ...current]);
      setSelectedThreadId(newThread.id);
      setMessages([]);
      setError(null);
    } catch {
      setError(t('common:agentAssistant.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [portal, t]);

  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const threadListRes = await agentAssistantService.listThreads();
      const threadList = threadListRes.threads || [];
      setThreads(threadList);

      if (threadList.length > 0) {
        setSelectedThreadId(threadList[0].id);
        await loadMessages(threadList[0].id);
      } else {
        await createThread();
      }
    } catch {
      setError(t('common:agentAssistant.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [createThread, loadMessages, t]);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleDeleteThread = async (threadId: number) => {
    try {
      setDeletingThreadId(threadId);
      await agentAssistantService.deleteThread(threadId);

      const nextThreads = threads.filter((item) => item.id !== threadId);
      setThreads(nextThreads);

      if (selectedThreadId === threadId) {
        if (nextThreads.length > 0) {
          selectThread(nextThreads[0].id);
        } else {
          await createThread();
        }
      }
    } catch {
      setError(t('common:agentAssistant.deleteError'));
    } finally {
      setDeletingThreadId(null);
    }
  };

  const handleSelectAttachments = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const availableSlots = MAX_IMAGE_ATTACHMENTS - attachments.length;
    if (availableSlots <= 0) {
      setError(t('common:agentAssistant.attachments.limit', { count: MAX_IMAGE_ATTACHMENTS }));
      return;
    }

    const selectedFiles = Array.from(files).slice(0, availableSlots);
    const nextAttachments: PendingAgentAttachment[] = [];

    for (const file of selectedFiles) {
      if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
        setError(t('common:agentAssistant.attachments.unsupported'));
        continue;
      }
      if (file.size > MAX_IMAGE_ATTACHMENT_BYTES) {
        setError(t('common:agentAssistant.attachments.tooLarge'));
        continue;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        nextAttachments.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'image',
          mimeType: file.type,
          dataUrl,
          name: file.name,
          size: file.size,
        });
      } catch {
        setError(t('common:agentAssistant.attachments.readError'));
      }
    }

    if (nextAttachments.length) {
      setAttachments((current) => [...current, ...nextAttachments]);
      setError(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  };

  const handleSend = async () => {
    const content = input.trim();
    if ((!content && attachments.length === 0) || !selectedThreadId || isSending) return;

    let optimisticUser: AgentMessage | null = null;
    let optimisticAssistant: AgentMessage | null = null;
    const attachmentSnapshot = [...attachments];
    const cleanAttachments: AgentMessageAttachment[] = attachments.map((item) => ({
      type: 'image',
      mimeType: item.mimeType,
      dataUrl: item.dataUrl,
      name: item.name,
      size: item.size,
    }));

    try {
      setIsSending(true);
      setError(null);

      const fallbackTitle = content || t('common:agentAssistant.attachments.threadTitle');
      optimisticUser = createOptimisticMessage('user', fallbackTitle, 0, cleanAttachments);
      optimisticAssistant = createOptimisticMessage('assistant', t('common:agentAssistant.thinking'), 1);

      setMessages((current) => [...current, optimisticUser!, optimisticAssistant!]);
      setInput('');
      setAttachments([]);

      const response = await agentAssistantService.sendMessage(
        selectedThreadId,
        content,
        cleanAttachments,
      );

      setMessages((current) =>
        current.map((message) => {
          if (message.id === optimisticUser?.id) return response.userMessage;
          if (message.id === optimisticAssistant?.id) return response.assistantMessage;
          return message;
        }),
      );

      const threadListRes = await agentAssistantService.listThreads();
      setThreads(threadListRes.threads || []);
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
        height: { xs: 'calc(100dvh - 120px)', sm: 'calc(100dvh - 130px)', md: 'calc(100dvh - 140px)' },
        maxHeight: '920px',
        minHeight: { xs: '540px', md: '640px' },
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '280px minmax(0, 1fr)' },
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        borderRadius: { xs: 2, md: 3 },
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.06)',
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
          gridTemplateRows: '60px minmax(0, 1fr) auto',
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
          sx={{ px: 2.5, height: 60, minWidth: 0, borderBottom: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#0F172A',
                fontSize: '0.9375rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedThread?.title || t('common:agentAssistant.title')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem' }}>
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
                      color: '#64748B',
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
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#15803D', fontSize: '0.75rem' }}>
                {t('common:agentAssistant.ready')}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {/* Message Stream */}
        <Box sx={{ minHeight: 0, overflowY: 'auto', px: { xs: 2, md: 3.5 }, py: 3, bgcolor: '#F8FAFC' }}>
          {isLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
              <CircularProgress sx={{ color: '#0284C7' }} />
            </Stack>
          ) : messages.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', py: 6, px: 2, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  color: '#FFFFFF',
                  display: 'grid',
                  placeItems: 'center',
                  mb: 2,
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                }}
              >
                <SmartToyOutlinedIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h3" sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', mb: 0.75 }}>
                {t('common:agentAssistant.empty')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 460, fontSize: '0.875rem', lineHeight: 1.6 }}>
                Đặt câu hỏi về tiêu chuẩn tuyển dụng, tìm kiếm ứng viên tiềm năng, tạo câu hỏi phỏng vấn hoặc đánh giá hồ sơ CV.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
              <div ref={scrollRef} />
            </Stack>
          )}
        </Box>

        {/* Bottom Input Area */}
        <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Stack spacing={1.25}>
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
                      border: '1px solid #E2E8F0',
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
                    aria-label={t('common:agentAssistant.attachments.addImage')}
                    disabled={isSending || Boolean(deletingThreadId)}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
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
                    '&.Mui-focused fieldset': { borderColor: '#0284C7', borderWidth: '1.5px' },
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
                      bgcolor: '#0284C7',
                      color: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                      '&:hover': { bgcolor: '#0369A1' },
                      '&.Mui-disabled': { bgcolor: '#F1F5F9', color: '#94A3B8', boxShadow: 'none' },
                    }}
                  >
                    {isSending ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            {error ? (
              <Alert severity="error" sx={{ mt: 1, py: 0.5, borderRadius: '8px', fontSize: '0.8125rem' }}>
                {error}
              </Alert>
            ) : null}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
