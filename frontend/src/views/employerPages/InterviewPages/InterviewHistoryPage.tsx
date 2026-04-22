'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Chip, Stack, Divider, Button, IconButton,
  Paper, Avatar, alpha, useTheme, type Theme, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Tooltip,
  Grid2 as Grid,
} from "@mui/material";
import { useTranslation } from 'react-i18next';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import RefreshIcon from '@mui/icons-material/Refresh';
import Link from 'next/link';
import interviewService from '../../../services/interviewService';
import { type InterviewSession } from '../../../types/models';
import { ROUTES } from '../../../configs/constants';
import DataTable from '../../../components/Common/DataTable';
import BackdropLoading from '../../../components/Common/Loading/BackdropLoading';
import type { CellContext as ReactTableCellContext } from '@tanstack/react-table';

const InterviewHistoryPage = () => {
  const { t } = useTranslation(['employer', 'interview', 'common']);
  const theme = useTheme();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await interviewService.getSessions({
        page: page + 1,
        pageSize: rowsPerPage,
        status: 'completed',
        search: searchTerm,
      });
      setSessions(data.results || []);
      setCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching interview history', error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const columns = useMemo(
    () => [
      {
        header: t('interviewLive.table.candidate'),
        accessorKey: 'candidateName',
        cell: ({ row }: ReactTableCellContext<InterviewSession, unknown>) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {row.original.candidateName || '---'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {row.original.candidateEmail || '---'}
            </Typography>
          </Box>
        ),
      },
      {
        header: t('interviewLive.table.position'),
        accessorKey: 'jobName',
        cell: ({ getValue }: ReactTableCellContext<InterviewSession, unknown>) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {(getValue() as string) || '---'}
          </Typography>
        ),
      },
      {
        header: t('interviewLive.table.time'),
        accessorKey: 'endTime',
        cell: ({ getValue }: ReactTableCellContext<InterviewSession, unknown>) => (
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {(getValue() as string) ? new Date(getValue() as string).toLocaleString('vi-VN') : '---'}
          </Typography>
        ),
      },
      {
        header: t('interview:interviewDetail.subtitle.recording'),
        accessorKey: 'recordingUrl',
        cell: ({ row }: ReactTableCellContext<InterviewSession, unknown>) => {
          const url = row.original.recordingUrl || row.original.recording_url;
          if (!url) return <Typography variant="caption" color="text.disabled">No Recording</Typography>;
          return (
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              component="a"
              href={url}
              target="_blank"
              rel="noreferrer"
              sx={{ fontWeight: 800, textTransform: 'none' }}
            >
              Download
            </Button>
          );
        },
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }: ReactTableCellContext<InterviewSession, unknown>) => (
          <Tooltip title={t('common:actions.details')}>
            <IconButton
              component={Link}
              href={`/${ROUTES.EMPLOYER.INTERVIEW_DETAIL.replace(':id', row.original.id.toString())}`}
              color="primary"
              size="small"
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [t, theme.palette.primary.main]
  );

  const VideoCard = ({ session }: { session: InterviewSession }) => {
    const recordingUrl = session.recordingUrl || session.recording_url;
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.customShadows?.z12,
            borderColor: 'primary.main',
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            aspectRatio: '16/9',
            bgcolor: 'common.black',
            borderRadius: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {recordingUrl ? (
            <Box
              component="video"
              src={recordingUrl}
              preload="metadata"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
            />
          ) : (
            <VideoLibraryIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.1)' }} />
          )}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.3)',
            }}
            component={Link}
            href={`/${ROUTES.EMPLOYER.INTERVIEW_DETAIL.replace(':id', session.id.toString())}`}
          >
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <VisibilityIcon />
            </Avatar>
          </Box>
        </Box>

        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 900, mb: 0.5 }}>
          {session.candidateName || '---'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
          <WorkIcon sx={{ fontSize: 12 }} /> {session.jobName || '---'}
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>
            {session.endTime ? new Date(session.endTime).toLocaleDateString('vi-VN') : '---'}
          </Typography>
          {recordingUrl && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              component="a"
              href={recordingUrl}
              download
              sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
            >
              Tải về
            </Button>
          )}
        </Stack>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={3} mb={5}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1.5px' }}>
            {t('sidebar.interviewHistory', { defaultValue: 'Thư viện Video' })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Xem lại và tải về các buổi phỏng vấn đã hoàn thành.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={fetchSessions}
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: 2.5, fontWeight: 800 }}
          >
            Làm mới
          </Button>
        </Stack>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.background.default, 0.5),
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm ứng viên, vị trí..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'grid' | 'table')}
              sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            >
              <MenuItem value="grid">Dạng lưới</MenuItem>
              <MenuItem value="table">Dạng bảng</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {loading && sessions.length === 0 ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 4, height: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ flex: 1, bgcolor: 'action.hover', borderRadius: 2 }} />
                <Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1, width: '60%' }} />
                <Box sx={{ height: 16, bgcolor: 'action.hover', borderRadius: 1, width: '40%' }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : sessions.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 10,
            textAlign: 'center',
            borderRadius: 4,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'transparent',
          }}
        >
          <VideoLibraryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 800 }}>
            Chưa có video nào
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ fontWeight: 600 }}>
            Các buổi phỏng vấn sau khi hoàn thành sẽ xuất hiện tại đây.
          </Typography>
        </Paper>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {sessions.map((session) => (
            <Grid key={session.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <VideoCard session={session} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <DataTable
          columns={columns}
          data={sessions}
          isLoading={loading}
          rowCount={count}
          pagination={{ pageIndex: page, pageSize: rowsPerPage }}
          onPaginationChange={(newState) => {
            setPage(newState.pageIndex);
            setRowsPerPage(newState.pageSize);
          }}
        />
      )}

      {loading && <BackdropLoading />}
    </Box>
  );
};

export default InterviewHistoryPage;
