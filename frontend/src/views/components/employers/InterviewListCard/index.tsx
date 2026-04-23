'use client';
import React, { useCallback, useMemo } from 'react';
import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ROUTES } from '../../../../configs/constants';
import DataTable from '../../../../components/Common/DataTable';
import { useInterviewSessions, useInterviewMutations } from '../hooks/useEmployerQueries';
import { useDataTable } from '../../../../hooks';
import toastMessages from '../../../../utils/toastMessages';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import { OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import { useInterviewListCardColumns } from './useInterviewListCardColumns';

interface InterviewListCardProps {
  title?: string;
}

const InterviewListCard = ({ title }: InterviewListCardProps) => {
  const { t } = useTranslation(['interview', 'common', 'employer']);
  const displayTitle = title || t('interview:interviewListCard.title');

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
        spacing={3}
        mb={6}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-1px' }}>
            {displayTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5, opacity: 0.8 }}>
            {t('interview:interviewListCard.description', { count })}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          href={`/${ROUTES.EMPLOYER.INTERVIEW_CREATE}`}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            boxShadow: (theme) => theme.customShadows?.primary,
            fontWeight: 900,
            textTransform: 'none',
            fontSize: '0.95rem',
          }}
        >
          {t('interview:interviewListCard.scheduleInterview')}
        </Button>
      </Stack>

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
      />

      {isMutating && <BackdropLoading />}
    </Paper>
  );
};

export default InterviewListCard;
