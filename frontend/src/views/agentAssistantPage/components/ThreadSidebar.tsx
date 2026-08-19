'use client';

import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { CHATBOT_ICONS } from '@/configs/images';
import { type AgentPortal, type AgentThread } from '@/services/agentAssistantService';

export type ThreadGroupKey = 'today' | 'yesterday' | 'thisWeek' | 'earlier';

export type ThreadGroup = {
  key: ThreadGroupKey;
  threads: AgentThread[];
};

export const threadGroupFriendlyLabels: Record<ThreadGroupKey, string> = {
  today: 'Hôm nay',
  yesterday: 'Hôm qua',
  thisWeek: 'Tuần này',
  earlier: 'Trước đó',
};

export const threadGroupLabelKeys: Record<ThreadGroupKey, string> = {
  today: 'common:agentAssistant.threadGroups.today',
  yesterday: 'common:agentAssistant.threadGroups.yesterday',
  thisWeek: 'common:agentAssistant.threadGroups.thisWeek',
  earlier: 'common:agentAssistant.threadGroups.earlier',
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

type ThreadItemProps = {
  thread: AgentThread;
  selected: boolean;
  deleting: boolean;
  locale: string;
  onClick: () => void;
  onDelete: () => void;
};

const ThreadItem = ({
  thread,
  selected,
  deleting,
  locale,
  onClick,
  onDelete,
}: ThreadItemProps) => {
  const { t } = useTranslation('common');
  const displayTitle = thread.title || 'Đoạn chat mới';

  return (
    <Box
      sx={{
        borderRadius: '10px',
        bgcolor: selected ? '#EFF6FF' : 'transparent',
        border: '1px solid',
        borderColor: selected ? '#BAE6FD' : 'transparent',
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: selected ? '#EFF6FF' : '#F1F5F9',
          '& .delete-btn': { opacity: 1 },
        },
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ pr: 0.5 }}>
        <Button
          fullWidth
          onClick={onClick}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'left',
            py: 1,
            px: 1.5,
            minWidth: 0,
            textTransform: 'none',
            borderRadius: '10px',
          }}
        >
          <Box sx={{ minWidth: 0, width: '100%' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: selected ? 700 : 500,
                color: selected ? '#0284C7' : '#1E293B',
                fontSize: '0.8125rem',
                lineHeight: 1.35,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayTitle}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: selected ? '#0284C7' : '#94A3B8',
                fontSize: '0.7rem',
                display: 'block',
                mt: 0.25,
              }}
            >
              {formatThreadTime(thread.lastMessageAt || thread.createAt, locale)}
            </Typography>
          </Box>
        </Button>
        <Tooltip title={t('common:agentAssistant.deleteHistory') || 'Xóa lịch sử'}>
          <span>
            <IconButton
              className="delete-btn"
              aria-label="Xóa đoạn chat"
              size="small"
              disabled={deleting}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{
                opacity: selected ? 1 : 0,
                transition: 'opacity 0.15s ease',
                color: '#94A3B8',
                p: 0.5,
                borderRadius: '6px',
                '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' },
              }}
            >
              {deleting ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
};

type ThreadSidebarProps = {
  portal: AgentPortal;
  threadGroups: ThreadGroup[];
  selectedThreadId: number | null;
  deletingThreadId: number | null;
  isLoading: boolean;
  locale: string;
  onSelectThread: (threadId: number) => void;
  onDeleteThread: (threadId: number) => void;
  onCreateThread: () => void;
};

export const ThreadSidebar = ({
  portal,
  threadGroups,
  selectedThreadId,
  deletingThreadId,
  isLoading,
  locale,
  onSelectThread,
  onDeleteThread,
  onCreateThread,
}: ThreadSidebarProps) => {
  const { t } = useTranslation('common');

  const getGroupTitle = (key: ThreadGroupKey) => {
    const i18nKey = threadGroupLabelKeys[key];
    if (i18nKey) {
      const translated = t(i18nKey);
      if (translated && !translated.startsWith('agentAssistant.threadGroups.')) {
        return translated;
      }
    }
    return threadGroupFriendlyLabels[key] || key;
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: '60px minmax(0, 1fr) auto',
        borderRight: '1px solid #E2E8F0',
        minHeight: 0,
        bgcolor: '#F8FAFC',
      }}
    >
      {/* Brand Header */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, height: 60, borderBottom: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F0F9FF',
              boxShadow: '0 2px 6px rgba(14, 165, 233, 0.15)',
              border: '1px solid #BAE6FD',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <Image
              src={CHATBOT_ICONS.EMPLOYER}
              alt="AILA AI"
              width={28}
              height={28}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9375rem', lineHeight: 1.2 }}
            >
              AILA AI
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.75rem' }}>
              {portal === 'admin' ? 'Kênh Quản trị viên' : 'Kênh Nhà tuyển dụng'}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {/* History List */}
      <Box sx={{ minHeight: 0, overflowY: 'auto', p: 1.5 }}>
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          sx={{ position: 'sticky', top: 0, zIndex: 1, px: 0.5, py: 1, bgcolor: '#F8FAFC' }}
        >
          <HistoryRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
          <Typography
            variant="overline"
            sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}
          >
            GẦN ĐÂY
          </Typography>
        </Stack>

        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#0284C7' }} />
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            {threadGroups.map((group) => (
              <Stack key={group.key} spacing={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94A3B8',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    px: 0.5,
                    textTransform: 'uppercase',
                  }}
                >
                  {getGroupTitle(group.key)}
                </Typography>
                {group.threads.map((thread) => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    selected={thread.id === selectedThreadId}
                    deleting={thread.id === deletingThreadId}
                    locale={locale}
                    onClick={() => onSelectThread(thread.id)}
                    onDelete={() => onDeleteThread(thread.id)}
                  />
                ))}
              </Stack>
            ))}
          </Stack>
        )}
      </Box>

      {/* New Chat Button */}
      <Box sx={{ p: 1.5, borderTop: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Button
          fullWidth
          startIcon={<AddRoundedIcon />}
          variant="contained"
          onClick={onCreateThread}
          sx={{
            textTransform: 'none',
            borderRadius: '10px',
            py: 1,
            fontWeight: 700,
            fontSize: '0.875rem',
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
            '&:hover': {
              backgroundColor: '#0369A1',
            },
          }}
        >
          Đoạn chat mới
        </Button>
      </Box>
    </Box>
  );
};
