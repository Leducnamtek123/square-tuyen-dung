'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import agentAssistantService, {
  type AgentMessageAttachment,
  type AgentMessage,
  type AgentPortal,
  type AgentThread,
} from '@/services/agentAssistantService';

const MAX_IMAGE_ATTACHMENTS = 5;
const MAX_IMAGE_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

export type PendingAgentAttachment = AgentMessageAttachment & {
  id: string;
};

export type ThreadGroupKey = 'today' | 'yesterday' | 'thisWeek' | 'earlier';

export type ThreadGroup = {
  key: ThreadGroupKey;
  threads: AgentThread[];
};

const threadGroupOrder: ThreadGroupKey[] = ['today', 'yesterday', 'thisWeek', 'earlier'];

export const getThreadGroupKey = (value?: string | null): ThreadGroupKey => {
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

export const groupThreads = (threads: AgentThread[]): ThreadGroup[] => {
  const groups = new Map<ThreadGroupKey, AgentThread[]>();
  threads.forEach((thread) => {
    const key = getThreadGroupKey(thread.lastMessageAt || thread.createAt);
    groups.set(key, [...(groups.get(key) || []), thread]);
  });

  return threadGroupOrder
    .map((key) => ({ key, threads: groups.get(key) || [] }))
    .filter((group) => group.threads.length > 0);
};

export const toMessageParts = (content: string, attachments: AgentMessageAttachment[] = []) => [
  ...(content ? [{ type: 'text', text: content }] : []),
  ...attachments,
];

export const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.readAsDataURL(file);
  });

export const createOptimisticMessage = (
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

export interface UseAgentStreamingEngineProps {
  portal: AgentPortal;
  t: (key: string, options?: any) => string;
}

export const useAgentStreamingEngine = ({ portal, t }: UseAgentStreamingEngineProps) => {
  const [threads, setThreads] = useState<AgentThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<PendingAgentAttachment[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deletingThreadId, setDeletingThreadId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load threads
  const loadThreads = useCallback(async () => {
    try {
      setIsLoadingThreads(true);
      const res = await agentAssistantService.listThreads();
      const threadList = res.threads || [];
      if (threadList.length === 0) {
        const created = await agentAssistantService.createThread(portal);
        setThreads([created]);
        setSelectedThreadId(created.id);
      } else {
        setThreads(threadList);
        setSelectedThreadId(threadList[0].id);
      }
    } catch {
      setErrorMessage(t('common:agentAssistant.loadError'));
    } finally {
      setIsLoadingThreads(false);
    }
  }, [portal, t]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Load messages for selected thread
  const loadMessages = useCallback(
    async (threadId: number) => {
      try {
        setIsLoadingMessages(true);
        const res = await agentAssistantService.listMessages(threadId);
        setMessages(res.messages || []);
      } catch {
        setErrorMessage(t('common:agentAssistant.loadError'));
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [t]
  );

  useEffect(() => {
    if (selectedThreadId) {
      loadMessages(selectedThreadId);
    } else {
      setMessages([]);
    }
  }, [selectedThreadId, loadMessages]);

  const handleSelectThread = useCallback((threadId: number) => {
    setSelectedThreadId(threadId);
    setErrorMessage('');
  }, []);

  const handleNewChat = useCallback(async () => {
    try {
      const created = await agentAssistantService.createThread(portal);
      setThreads((current) => [created, ...current]);
      setSelectedThreadId(created.id);
      setMessages([]);
      setInputMessage('');
      setPendingAttachments([]);
      setErrorMessage('');
    } catch {
      setErrorMessage(t('common:agentAssistant.loadError'));
    }
  }, [portal, t]);

  const handleDeleteThread = useCallback(
    async (threadId: number) => {
      if (deletingThreadId || isSending) return;
      try {
        setDeletingThreadId(threadId);
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
        setErrorMessage(t('common:agentAssistant.deleteError'));
      } finally {
        setDeletingThreadId(null);
      }
    },
    [deletingThreadId, isSending, loadMessages, portal, selectedThreadId, t, threads]
  );

  const handleAddAttachments = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const validFiles: PendingAgentAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (pendingAttachments.length + validFiles.length >= MAX_IMAGE_ATTACHMENTS) {
          setErrorMessage(t('common:agentAssistant.attachments.limit', { max: MAX_IMAGE_ATTACHMENTS }));
          break;
        }

        if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
          setErrorMessage(t('common:agentAssistant.attachments.unsupported'));
          continue;
        }

        if (file.size > MAX_IMAGE_ATTACHMENT_BYTES) {
          setErrorMessage(t('common:agentAssistant.attachments.tooLarge'));
          continue;
        }

        try {
          const dataUrl = await readFileAsDataUrl(file);
          validFiles.push({
            id: `${Date.now()}-${i}-${file.name}`,
            type: 'image',
            mimeType: file.type,
            dataUrl,
            name: file.name,
            size: file.size,
          });
        } catch {
          setErrorMessage(t('common:agentAssistant.attachments.readError'));
        }
      }

      if (validFiles.length) {
        setPendingAttachments((prev) => [...prev, ...validFiles]);
      }
    },
    [pendingAttachments.length, t]
  );

  const handleRemoveAttachment = useCallback((id: string) => {
    setPendingAttachments((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleSendMessage = useCallback(async () => {
    const text = inputMessage.trim();
    if ((!text && pendingAttachments.length === 0) || isSending || !selectedThreadId) return;

    const attachmentsToSend: AgentMessageAttachment[] = pendingAttachments.map(({ id: _, ...rest }) => rest);
    const optimisticUserMessage = createOptimisticMessage('user', text, 1, attachmentsToSend);
    const optimisticAssistantMessage = createOptimisticMessage('assistant', '', 0);

    setMessages((prev) => [...prev, optimisticUserMessage, optimisticAssistantMessage]);
    setInputMessage('');
    setPendingAttachments([]);
    setIsSending(true);
    setErrorMessage('');

    try {
      const res = await agentAssistantService.sendMessage(selectedThreadId, text, attachmentsToSend);
      setMessages((prev) => {
        const next = [...prev];
        const lastIdx = next.length - 1;
        if (lastIdx >= 0 && next[lastIdx].role === 'assistant') {
          next[lastIdx] = res.assistantMessage;
        }
        return next;
      });
    } catch {
      setErrorMessage(t('common:agentAssistant.sendError'));
      setMessages((prev) => prev.filter((msg) => !msg.metadata?.optimistic));
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, isSending, pendingAttachments, selectedThreadId, t]);

  const threadGroups = useMemo(() => groupThreads(threads), [threads]);

  return {
    threads,
    threadGroups,
    selectedThreadId,
    messages,
    inputMessage,
    setInputMessage,
    pendingAttachments,
    isLoadingThreads,
    isLoadingMessages,
    isSending,
    deletingThreadId,
    errorMessage,
    setErrorMessage,
    handleSelectThread,
    handleNewChat,
    handleDeleteThread,
    handleAddAttachments,
    handleRemoveAttachment,
    handleSendMessage,
  };
};

export default useAgentStreamingEngine;
