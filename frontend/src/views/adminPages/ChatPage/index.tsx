'use client';

import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import { ChatConversation } from '../../../types/models';
import { useDataTable } from '../../../hooks';
import { useChat, useChatMessages } from './hooks/useChat';
import dayjs from '../../../configs/dayjs-config';
import FilterBar from '@/components/Common/FilterBar';

const AdminChatPage = () => {
  const { t } = useTranslation('admin');
  const [selectedConversation, setSelectedConversation] = React.useState<ChatConversation | null>(null);
  const {
      searchTerm: search,
      debouncedSearchTerm: debouncedSearch,
      onSearchChange: setSearch
  } = useDataTable();

  const {
      data,
      isLoading
  } = useChat({ kw: debouncedSearch });

  const conversations = data?.results || [];
  const { data: messages = [], isLoading: isLoadingMessages } = useChatMessages(selectedConversation?.id);

  const stats = [
    {
      label: t('chat.stats.totalConversations'),
      value: conversations.length,
      icon: <ChatBubbleOutlineIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      color: 'primary.main',
      bg: 'primary.50',
    },
    {
      label: t('chat.stats.candidatesJoined'),
      value: new Set(conversations.map((c) => c.jobSeekerId)).size,
      icon: <PeopleAltIcon sx={{ fontSize: 32, color: 'success.main' }} />,
      color: 'success.main',
      bg: 'success.50',
    },
    {
      label: t('chat.stats.employersJoined'),
      value: new Set(conversations.map((c) => c.employerId || c.companyId)).size,
      icon: <BusinessCenterIcon sx={{ fontSize: 32, color: 'warning.main' }} />,
      color: 'warning.main',
      bg: 'warning.50',
    },
  ];

  const columns: ColumnDef<ChatConversation>[] = [
    {
      header: '#',
      id: 'index',
      size: 50,
      cell: (info) => info.row.index + 1,
    },
    {
      header: t('chat.table.candidate'),
      accessorKey: 'jobSeekerName',
      cell: (info) => {
        const conv = info.row.original;
        const name = conv.jobSeekerName || conv.jobSeeker?.fullName || 'N/A';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={conv.jobSeekerAvatar || undefined} sx={{ width: 32, height: 32, fontSize: 12 }}>
              {name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>{name}</Typography>
              <Typography variant="caption" color="text.secondary">{conv.jobSeekerEmail || ''}</Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      header: t('chat.table.employer'),
      accessorKey: 'employerName',
      cell: (info) => {
        const conv = info.row.original;
        const name = conv.employerName || conv.companyName || conv.employer?.companyName || 'N/A';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={conv.employerLogo || undefined} variant="rounded" sx={{ width: 32, height: 32, fontSize: 12 }}>
              {name.charAt(0)}
            </Avatar>
            <Typography variant="body2" fontWeight={600}>{name}</Typography>
          </Box>
        );
      },
    },
    {
      header: t('chat.table.lastMessage'),
      accessorKey: 'lastMessage',
      cell: (info) => {
        const msg = info.getValue() as string | { content: string };
        const content = typeof msg === 'string' ? msg : msg?.content || '—';
        return (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {content}
          </Typography>
        );
      },
    },
    {
      header: t('chat.table.status'),
      accessorKey: 'isActive',
      cell: (info) => (
        <Chip
          label={info.getValue() !== false ? t('chat.status.active') : t('chat.status.ended')}
          size="small"
          color={info.getValue() !== false ? 'success' : 'default'}
        />
      ),
    },
    {
      header: t('chat.table.time'),
      accessorKey: 'createAt',
      cell: (info) => (
        info.getValue() 
          ? dayjs(info.getValue() as string).format('DD/MM/YYYY') 
          : '—'
      ),
    },
    {
      header: '',
      id: 'actions',
      meta: { align: 'right' },
      cell: (info) => (
        <Tooltip title={t('chat.tooltip.viewDetail')}>
          <IconButton size="small" color="primary" onClick={() => setSelectedConversation(info.row.original)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {t('chat.title')}
        </Typography>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="/admin">
            {t('chat.breadcrumb')}
          </Link>
          <Typography color="text.primary">{t('chat.title')}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Stats Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Paper
            key={s.label}
            elevation={0}
            sx={{
              flex: 1,
              p: 2.5,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '12px',
                bgcolor: s.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {s.icon}
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color={s.color}>
                {isLoading ? '—' : s.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {s.label}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Stack>

      {/* Table */}
      <Paper sx={{ p: 2, borderRadius: '12px' }} elevation={0}>
        <FilterBar
          title={t('chat.search.title', 'Bộ lọc hội thoại')}
          searchValue={search}
          searchPlaceholder={t('chat.search.placeholder')}
          onSearchChange={setSearch}
          onReset={() => setSearch('')}
          resetDisabled={!search}
          resetLabel={t('common.clearFilters', 'Xóa lọc')}
        />

        <DataTable
          columns={columns}
          data={conversations}
          isLoading={isLoading}
          paginationMode="hidden"
          emptyMessage={conversations.length === 0 ? t('chat.empty.noConversations') : t('chat.empty.noResults')}
        />
      </Paper>

      <Dialog open={!!selectedConversation} onClose={() => setSelectedConversation(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t('chat.detail.title', 'Conversation detail')}</DialogTitle>
        <DialogContent dividers>
          {selectedConversation && (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">{t('chat.table.candidate')}</Typography>
                  <Typography variant="body2" fontWeight={700}>{selectedConversation.jobSeekerName || 'N/A'}</Typography>
                  <Typography variant="caption">{selectedConversation.jobSeekerEmail || ''}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">{t('chat.table.employer')}</Typography>
                  <Typography variant="body2" fontWeight={700}>{selectedConversation.companyName || selectedConversation.employerName || 'N/A'}</Typography>
                </Box>
              </Stack>

              <Divider />

              {isLoadingMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : messages.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {t('chat.detail.noMessages', 'No messages found.')}
                </Typography>
              ) : (
                <Stack spacing={1.5} sx={{ maxHeight: 420, overflowY: 'auto' }}>
                  {messages.map((message) => {
                    const isCandidate = String(message.senderId) === String(selectedConversation.jobSeekerId);
                    return (
                      <Box
                        key={message.id}
                        sx={{
                          alignSelf: isCandidate ? 'flex-start' : 'flex-end',
                          maxWidth: '80%',
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: isCandidate ? 'action.hover' : 'primary.main',
                          color: isCandidate ? 'text.primary' : 'primary.contrastText',
                        }}
                      >
                        <Typography variant="caption" sx={{ opacity: 0.75 }}>
                          {isCandidate ? selectedConversation.jobSeekerName : (selectedConversation.companyName || selectedConversation.employerName || 'Employer')}
                          {message.createAt ? ` · ${dayjs(message.createAt).format('DD/MM/YYYY HH:mm')}` : ''}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                          {message.text || message.fileName || '—'}
                        </Typography>
                        {message.attachmentUrl && (
                          <Link href={message.attachmentUrl} target="_blank" rel="noreferrer" color="inherit" underline="always">
                            {message.fileName || t('chat.detail.openAttachment', 'Open attachment')}
                          </Link>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedConversation(null)}>{t('common.close', 'Close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminChatPage;
