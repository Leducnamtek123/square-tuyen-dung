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
import adminManagementService from '../../../services/adminManagementService';

const AdminChatPage = () => {
  const { t } = useTranslation('admin');
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: any = await adminManagementService.getConversations();
      const data = Array.isArray(res) ? res : (res?.results || res?.data || []);
      setConversations(data);
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
      label: 'Tổng cuộc hội thoại',
      value: conversations.length,
      icon: <ChatBubbleOutlineIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
      color: 'primary.main',
      bg: 'primary.50',
    },
    {
      label: 'Ứng viên tham gia',
      value: new Set(conversations.map((c) => c.jobSeekerId)).size,
      icon: <PeopleAltIcon sx={{ fontSize: 32, color: 'success.main' }} />,
      color: 'success.main',
      bg: 'success.50',
    },
    {
      label: 'Nhà tuyển dụng tham gia',
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
          Kết nối với nhà tuyển dụng
        </Typography>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="/">
            Quản trị
          </Link>
          <Typography color="text.primary">Kết nối với nhà tuyển dụng</Typography>
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
            placeholder="Tìm kiếm ứng viên hoặc nhà tuyển dụng..."
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

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Ứng viên</TableCell>
                <TableCell>Nhà tuyển dụng</TableCell>
                <TableCell>Tin nhắn gần nhất</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 4 }}>
                      <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">
                        {conversations.length === 0
                          ? 'Chưa có cuộc hội thoại nào'
                          : 'Không tìm thấy kết quả phù hợp'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((conv: any, index: number) => {
                  const jobSeekerName =
                    conv.jobSeekerName ||
                    conv.jobSeeker?.fullName ||
                    'N/A';
                  const employerName =
                    conv.employerName ||
                    conv.companyName ||
                    conv.employer?.companyName ||
                    'N/A';
                  const lastMessage =
                    conv.lastMessage ||
                    conv.latestMessage ||
                    '—';
                  const isActive = conv.isActive ?? true;
                  const createdAt =
                    conv.createAt ||
                    conv.createdAt ||
                    conv.updatedAt;

                  return (
                    <TableRow key={conv.id || index} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={conv.jobSeekerAvatar}
                            sx={{ width: 32, height: 32, fontSize: 12 }}
                          >
                            {jobSeekerName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {jobSeekerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {conv.jobSeekerEmail || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={conv.employerLogo}
                            variant="rounded"
                            sx={{ width: 32, height: 32, fontSize: 12 }}
                          >
                            {employerName.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {employerName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {typeof lastMessage === 'string'
                            ? lastMessage
                            : lastMessage?.content || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isActive ? 'Hoạt động' : 'Đã kết thúc'}
                          size="small"
                          color={isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {createdAt
                          ? new Date(createdAt).toLocaleDateString('vi-VN')
                          : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small" color="primary">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default AdminChatPage;
