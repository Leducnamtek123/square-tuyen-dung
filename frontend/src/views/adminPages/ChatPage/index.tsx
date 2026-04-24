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
  TextField,
  InputAdornment,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import { ChatConversation } from '../../../types/models';
import { useDataTable } from '../../../hooks';
import { useChat } from './hooks/useChat';
import dayjs from '../../../configs/dayjs-config';

const AdminChatPage = () => {
  const { t } = useTranslation('admin');
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
      cell: () => (
        <Tooltip title={t('chat.tooltip.viewDetail')}>
          <IconButton size="small" color="primary">
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
        {/* Search */}
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder={t('chat.search.placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }
            }}
            sx={{ width: { xs: '100%', sm: 320 } }}
          />
        </Box>

        <DataTable
          columns={columns}
          data={conversations}
          isLoading={isLoading}
          hidePagination
          emptyMessage={conversations.length === 0 ? t('chat.empty.noConversations') : t('chat.empty.noResults')}
        />
      </Paper>
    </Box>
  );
};

export default AdminChatPage;
