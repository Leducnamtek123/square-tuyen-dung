'use client';
import React, { useCallback, useMemo } from 'react';
import { Box, Typography, Button, Stack, Paper, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ROUTES } from '@/configs/constants';
import DataTable from '@/components/Common/DataTable';
import { useInterviewSessions, useInterviewMutations } from '../hooks/useEmployerQueries';
import { useDataTable } from '@/hooks';
import toastMessages from '@/utils/toastMessages';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import { confirmModal } from '@/utils/sweetalert2Modal';
import { OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import { useInterviewListCardColumns } from './useInterviewListCardColumns';
import { localizeRoutePath } from '@/configs/routeLocalization';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { ExportModal } from '@/components/Common/ExportModal';

interface InterviewListCardProps {
  title?: string;
}

const InterviewListCard = ({ title }: InterviewListCardProps) => {
  const { t, i18n } = useTranslation(['interview', 'common', 'employer']);
  const displayTitle = title || t('interview:interviewListCard.title');
  const createHref = localizeRoutePath(`/${ROUTES.EMPLOYER.INTERVIEW_CREATE}`, i18n.language);

  const {
    page,
    pageSize,
    onPaginationChange,
    pagination,
    sorting,
    onSortingChange,
    ordering,
  } = useDataTable({
    initialSorting: [{ id: 'scheduledAt', desc: true }],
    initialPageSize: 10,
  });

  const [exportModalOpen, setExportModalOpen] = React.useState(false);

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      ordering,
    }),
    [page, pageSize, ordering]
  );

  const { data: queryData, isLoading: isQueryLoading } = useInterviewSessions(queryParams, 10000);
  const { deleteSession, updateStatus, isMutating } = useInterviewMutations();

  const sessions = queryData?.results || [];
  const count = queryData?.count || 0;

  const handleDelete = useCallback(
    (id: string | number) => {
      confirmModal(
        async () => {
          try {
            await deleteSession(id);
            toastMessages.success(t('interview:interviewListCard.messages.deleteSuccess'));
          } catch {
            // Error handled by mutation hook
          }
        },
        t('interview:interviewListCard.confirmDeleteTitle'),
        t('interview:interviewListCard.confirmDeleteMessage'),
        'warning'
      );
    },
    [deleteSession, t]
  );

  const handleCancel = useCallback(
    (roomName: string) => {
      confirmModal(
        async () => {
          try {
            await updateStatus({ roomName, status: 'cancelled' });
            toastMessages.success(t('interview:interviewListCard.messages.cancelSuccess'));
          } catch {
            // Error handled by mutation hook
          }
        },
        t('interview:interviewListCard.confirmCancelTitle'),
        t('interview:interviewListCard.confirmCancelMessage'),
        'warning'
      );
    },
    [t, updateStatus]
  );

  const columns = useInterviewListCardColumns({
    count,
    onDelete: handleDelete,
    onCancel: handleCancel,
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 5 },
        backgroundColor: 'background.paper',
        borderRadius: 4,
        boxShadow: (theme) => theme.customShadows?.z1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2.5}
        mb={3}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
            {displayTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
            {t('interview:interviewListCard.description', { count })}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={() => setExportModalOpen(true)}
            sx={{
              px: 2.5,
              py: 1.25,
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Xuất lịch phỏng vấn
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            href={createHref}
            sx={{
              px: 3.5,
              py: 1.25,
              boxShadow: (theme) => theme.customShadows?.primary,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.9rem',
            }}
          >
            {t('interview:interviewListCard.scheduleInterview')}
          </Button>
        </Stack>
      </Stack>

      <Alert
        severity="info"
        icon={<AutoAwesomeIcon sx={{ color: '#2563eb', mt: { xs: 0.25, sm: 0 } }} />}
        action={
          <Button
            component={Link}
            href={localizeRoutePath(`/${ROUTES.EMPLOYER.JOB_POST}`, i18n.language)}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2,
              py: 0.75,
              whiteSpace: 'nowrap',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {t('interview:interviewListCard.autoInterviewBanner.action')}
          </Button>
        }
        sx={{
          mb: 3,
          borderRadius: '12px',
          bgcolor: 'rgba(37, 99, 235, 0.05)',
          border: '1px solid rgba(37, 99, 235, 0.15)',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 0 },
          '& .MuiAlert-icon': {
            mr: { xs: 1.5, sm: 2 },
            p: 0,
          },
          '& .MuiAlert-message': {
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 0.5, sm: 1 },
            p: 0,
            width: '100%',
          },
          '& .MuiAlert-action': {
            m: 0,
            p: 0,
            pt: { xs: 1, sm: 0 },
            width: { xs: '100%', sm: 'auto' },
            display: 'flex',
            justifyContent: { xs: 'stretch', sm: 'flex-end' },
          },
        }}
      >
        <Typography variant="body2" component="span" sx={{ color: '#1e3a8a', fontWeight: 700, lineHeight: 1.5 }}>
          {t('interview:interviewListCard.autoInterviewBanner.title')}:
        </Typography>
        <Typography variant="body2" component="span" sx={{ color: '#334155', lineHeight: 1.5 }}>
          {t('interview:interviewListCard.autoInterviewBanner.description')}
        </Typography>
      </Alert>

      <DataTable
        columns={columns}
        data={sessions}
        isLoading={isQueryLoading}
        rowCount={count}
        pagination={pagination}
        onPaginationChange={onPaginationChange as OnChangeFn<PaginationState>}
        enableSorting
        sorting={sorting}
        onSortingChange={onSortingChange as OnChangeFn<SortingState>}
        emptyMessage={t('interview:interviewListCard.noInterviews')}
        stickyHeader
        maxHeight="calc(100dvh - 280px)"
      />

      {isMutating && <BackdropLoading />}

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        defaultFileName="DanhSachLichPhongVan"
        columns={[]}
        entity="interview"
        totalRecords={{
          all: count || 0,
          filtered: count || 0,
          selected: 0,
        }}
      />
    </Paper>
  );
};

export default InterviewListCard;
