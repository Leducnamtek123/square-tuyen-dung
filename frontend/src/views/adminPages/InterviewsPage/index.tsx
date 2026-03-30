import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Breadcrumbs, Link, Paper, IconButton,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Tooltip, Stack, FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '../../../components/Common/DataTable';
import { useDataTable } from '../../../hooks';
import { InterviewSession } from '../../../types/models';
import { useInterviews } from './hooks/useInterviews';
import dayjs from '../../../configs/dayjs-config';

const STATUS_CHIP_COLORS: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  'scheduled': 'info',
  'in_progress': 'warning',
  'completed': 'success',
  'cancelled': 'error',
  'calibration': 'secondary',
  'processing': 'warning',
  'expired': 'default',
};

const InterviewsPage = () => {
  const { t } = useTranslation('admin');
  const [openDelete, setOpenDelete] = useState(false);
  const [openEditStatus, setOpenEditStatus] = useState(false);
  const [current, setCurrent] = useState<InterviewSession | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const {
    page,
    pageSize,
    sorting,
    onSortingChange,
    ordering,
    pagination,
    onPaginationChange,
  } = useDataTable({ initialPageSize: 10 });

  const {
      data,
      isLoading,
      updateInterviewStatus,
      deleteInterview,
      isMutating
  } = useInterviews({
      page: page + 1,
      pageSize,
      ordering
  });

  const interviews = data?.results || [];

  const handleOpenEditStatus = (session: InterviewSession) => {
    setCurrent(session);
    setNewStatus(session.status || '');
    setOpenEditStatus(true);
  };

  const handleUpdateStatus = async () => {
    if (!current) return;
    try {
      await updateInterviewStatus({ id: current.id, status: newStatus });
      setOpenEditStatus(false);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!current) return;
    try {
      await deleteInterview(current.id);
      setOpenDelete(false);
    } catch (e) { console.error(e); }
  };

  const columns = useMemo<ColumnDef<InterviewSession>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: true,
    },
    {
      accessorKey: 'roomName',
      header: t('pages.interviews.table.room') as string,
      cell: (info) => (
        <Typography variant="body2" fontWeight={600}>
          {info.getValue() as string}
        </Typography>
      ),
    },
    {
      accessorKey: 'jobPostDict.jobName',
      header: t('pages.interviews.table.jobPost') as string,
      cell: (info) => info.getValue() as string || '—',
    },
    {
      accessorKey: 'jobSeekerDict.fullName',
      header: t('pages.interviews.table.candidate') as string,
      cell: (info) => info.getValue() as string || '—',
    },
    {
      accessorKey: 'status',
      header: t('pages.interviews.table.status') as string,
      enableSorting: true,
      cell: (info) => {
        const val = info.getValue() as string;
        return (
          <Chip
            label={t(`pages.interviews.status.${val}`)}
            size="small"
            color={STATUS_CHIP_COLORS[val] || 'default'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      accessorKey: 'scheduledAt',
      header: t('pages.interviews.table.scheduledAt') as string,
      enableSorting: true,
      cell: (info) => info.getValue() ? dayjs(info.getValue() as string).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      id: 'actions',
      header: t('pages.interviews.table.actions') as string,
      meta: { align: 'right' },
      cell: (info) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title={t('pages.interviews.table.editStatus')}>
            <IconButton size="small" color="primary" onClick={() => handleOpenEditStatus(info.row.original)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {info.row.original.status === 'in_progress' && (
             <IconButton size="small" color="success" component={Link} href={`/admin/interview-live/${info.row.original.roomName}`}>
                <PlayArrowIcon fontSize="small" />
             </IconButton>
          )}
          <Tooltip title={t('pages.interviews.table.delete')}>
            <IconButton size="small" color="error" onClick={() => { setCurrent(info.row.original); setOpenDelete(true); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [t]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{t('pages.interviews.title')}</Typography>
        <Breadcrumbs>
          <Link underline="hover" color="inherit" href="/admin">{t('pages.interviews.breadcrumbAdmin')}</Link>
          <Typography color="text.primary">{t('pages.interviews.breadcrumb')}</Typography>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ p: 0, borderRadius: '12px', overflow: 'hidden' }} elevation={0}>
        <DataTable
          columns={columns}
          data={interviews}
          isLoading={isLoading}
          rowCount={data?.count || 0}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          enableSorting
          sorting={sorting}
          onSortingChange={onSortingChange}
        />
      </Paper>

      {/* Edit Status Dialog */}
      <Dialog open={openEditStatus} onClose={() => setOpenEditStatus(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t('pages.interviews.editStatusTitle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>{t('pages.interviews.form.status')}</InputLabel>
              <Select
                value={newStatus}
                label={t('pages.interviews.form.status')}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {Object.keys(STATUS_CHIP_COLORS).map((st) => (
                   <MenuItem key={st} value={st}>{t(`pages.interviews.status.${st}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenEditStatus(false)} color="inherit">{t('pages.interviews.cancel')}</Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained"
            disabled={isMutating}
            startIcon={isMutating && <CircularProgress size={20} color="inherit" />}
          >
            {isMutating ? t('common.saving') : t('pages.interviews.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>{t('pages.interviews.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('pages.interviews.deleteConfirm', { id: current?.roomName })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} color="inherit">{t('pages.interviews.cancel')}</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={isMutating}
            startIcon={isMutating && <CircularProgress size={20} color="inherit" />}
          >
            {isMutating ? t('common.deleting') : t('pages.interviews.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewsPage;
