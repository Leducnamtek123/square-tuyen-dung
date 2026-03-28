import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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

const AdminChatPage = () => {
  const { t } = useTranslation('admin');
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      // Backend has no chat conversation endpoint yet (chatbot/urls.py is empty).
      // Set empty data so the page renders its empty state gracefully.
      setConversations([]);
    } catch (e) {
      console.error(e);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const filtered = conversations.filter((conv) => {
    const q = search.toLowerCase();
    const jobSeeker = conv.jobSeekerName || '';
    const employer = conv.employerName || conv.companyName || '';
    return (
      jobSeeker.toLowerCase().includes(q) ||
      employer.toLowerCase().includes(q)
    );
  });

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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {t('chat.title')}
        </Typography>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="/">
            {t('chat.breadcrumb')}
          </Link>
          <Typography color="text.primary">{t('chat.title')}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Stats Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {stats.map((s, i) => (
          <Paper
            key={i}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 320 } }}
          />
        </Box>

        <DataTable
          columns={[
            {
              header: '#',
              id: 'index',
              size: 50,
              cell: (info: any) => info.row.index + 1,
            },
            {
              header: t('chat.table.candidate'),
              accessorKey: 'jobSeekerName',
              cell: (info: any) => {
                const conv = info.row.original;
                const name = conv.jobSeekerName || conv.jobSeeker?.fullName || 'N/A';
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={conv.jobSeekerAvatar} sx={{ width: 32, height: 32, fontSize: 12 }}>
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
              cell: (info: any) => {
                const conv = info.row.original;
                const name = conv.employerName || conv.companyName || conv.employer?.companyName || 'N/A';
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={conv.employerLogo} variant="rounded" sx={{ width: 32, height: 32, fontSize: 12 }}>
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
              cell: (info: any) => {
                const msg = info.getValue();
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
              cell: (info: any) => (
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
              cell: (info: any) => (
                info.getValue() 
                  ? new Date(info.getValue() as string).toLocaleDateString('vi-VN') 
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
          ] as ColumnDef<any>[]}
          data={filtered}
          isLoading={isLoading}
          hidePagination
          emptyMessage={conversations.length === 0 ? t('chat.empty.noConversations') : t('chat.empty.noResults')}
        />
      </Paper>
    </Box>
  );
};

export default AdminChatPage;
