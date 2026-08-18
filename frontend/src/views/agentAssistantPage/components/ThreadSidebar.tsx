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
  const displayTitle = thread.title || t('common:agentAssistant.attachments.threadTitle');

  return (
    <Box
      sx={{
        borderRadius: '8px',
        bgcolor: selected ? '#EFF6FF' : 'transparent',
        border: '1px solid',
        borderColor: selected ? '#BFDBFE' : 'transparent',
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
            py: 0.85,
            px: 1.25,
            minWidth: 0,
            textTransform: 'none',
            borderRadius: '8px',
          }}
        >
          <Box sx={{ minWidth: 0, width: '100%' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: selected ? 700 : 500,
                color: selected ? '#1D4ED8' : '#1F2937',
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
                color: selected ? '#3B82F6' : '#9CA3AF',
                fontSize: '0.7rem',
                display: 'block',
                mt: 0.25,
              }}
            >
              {formatThreadTime(thread.lastMessageAt || thread.createAt, locale)}
            </Typography>
          </Box>
        </Button>
        <Tooltip title={t('common:agentAssistant.deleteHistory')}>
          <span>
            <IconButton
              className="delete-btn"
              aria-label={t('common:agentAssistant.deleteHistory')}
              size="small"
              disabled={deleting}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{
                opacity: selected ? 1 : 0,
                transition: 'opacity 0.15s ease',
                color: '#9CA3AF',
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

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: '56px minmax(0, 1fr) auto',
        borderRight: '1px solid #E5E7EB',
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
        sx={{ px: 2, height: 56, borderBottom: '1px solid #E5E7EB' }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F8FAFC',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
              border: '1px solid #DBEAFE',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <Image
              src={CHATBOT_ICONS.EMPLOYER}
              alt="AILA AI"
              width={32}
              height={32}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem', lineHeight: 1.2 }}
            >
              {t('common:agentAssistant.title')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
              {portal === 'admin'
                ? t('common:agentAssistant.portals.admin')
                : t('common:agentAssistant.portals.employer')}
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
          <HistoryRoundedIcon sx={{ fontSize: 16, color: '#6B7280' }} />
          <Typography
            variant="overline"
            sx={{ color: '#6B7280', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.05em' }}
          >
            {t('common:agentAssistant.recents')}
          </Typography>
        </Stack>

        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={26} sx={{ color: '#2563EB' }} />
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            {threadGroups.map((group) => (
              <Stack key={group.key} spacing={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#9CA3AF',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    px: 0.5,
                    textTransform: 'uppercase',
                  }}
                >
                  {t(threadGroupLabelKeys[group.key])}
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
      <Box sx={{ p: 1.5, borderTop: '1px solid #E5E7EB', bgcolor: '#FFFFFF' }}>
        <Button
          fullWidth
          startIcon={<AddRoundedIcon />}
          variant="contained"
          onClick={onCreateThread}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            py: 0.9,
            fontWeight: 600,
            fontSize: '0.875rem',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            '&:hover': {
              backgroundColor: '#1D4ED8',
            },
          }}
        >
          {t('common:agentAssistant.newChat')}
        </Button>
      </Box>
    </Box>
  );
};
