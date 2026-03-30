'use client';
import React, { useMemo, useState } from 'react';
import { Box, Typography, Button, Chip, IconButton, Stack, Divider, LinearProgress, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ROUTES } from '../../../../configs/constants';
import DataTable from '../../../../components/Common/DataTable';
import { formatRoute } from '../../../../utils/funcUtils';
import { useInterviewSessions, useInterviewMutations } from '../hooks/useEmployerQueries';
import { useDataTable } from '../../../../hooks';
import toastMessages from '../../../../utils/toastMessages';
import { InterviewSession } from '@/types/models';
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';

interface InterviewListCardProps {
  title?: string;
}

const InterviewListCard = ({ title }: InterviewListCardProps) => {
    const { t } = useTranslation(['interview', 'common']);
    const displayTitle = title || t('interview:interviewListCard.title');

    const {
        page,
        pageSize,
        onPaginationChange,
        pagination,
    } = useDataTable({ initialPageSize: 10 });

    const queryParams = useMemo(() => ({
        page: page + 1,
        pageSize: pageSize,
    }), [page, pageSize]);

    // Polling logic: Refetch every 10s if we have active sessions
    const { data: queryData, isLoading: isQueryLoading } = useInterviewSessions(queryParams, 10000);
    const { deleteSession, updateStatus, isMutating } = useInterviewMutations();

    const sessions = queryData?.results || [];
    const count = queryData?.count || 0;

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, id: string | number | null }>({ open: false, id: null });
    const [cancelDialog, setCancelDialog] = useState<{ open: boolean, id: string | number | null, roomName: string | null }>({ open: false, id: null, roomName: null });

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        try {
            await deleteSession(deleteDialog.id);
            toastMessages.success(t('interview:interviewListCard.messages.deleteSuccess'));
            setDeleteDialog({ open: false, id: null });
        } catch (error) {
            toastMessages.error(t('interview:interviewListCard.messages.deleteError'));
        }
    };

    const handleCancel = async () => {
        if (!cancelDialog.roomName) return;
        try {
            await updateStatus({ roomName: cancelDialog.roomName, status: 'cancelled' });
            toastMessages.success(t('interview:interviewListCard.messages.cancelSuccess'));
            setCancelDialog({ open: false, id: null, roomName: null });
        } catch (error) {
            toastMessages.error(t('interview:interviewListCard.messages.cancelError'));
        }
    };

    const getStatusColor = (status: string): "success" | "primary" | "info" | "error" | "default" => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'scheduled': return 'info';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const columns = useMemo<any>(() => [
        {
            header: t('interview:interviewListCard.candidate'),
            accessorKey: 'candidateName',
            cell: ({ row }: any) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.original.candidateName}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.original.candidateEmail || '---'}</Typography>
                </Box>
            ),
        },
        {
            header: t('interview:interviewListCard.position'),
            accessorKey: 'jobName',
            cell: ({ getValue }: any) => <Typography variant="body2">{String(getValue() || '---')}</Typography>,
        },
        {
            header: t('interview:interviewListCard.time'),
            accessorKey: 'scheduledAt',
            cell: ({ getValue }: any) => (
                <Typography variant="body2">
                    {getValue() ? new Date(getValue()).toLocaleString() : '---'}
                </Typography>
            ),
        },
        {
            header: t('interview:interviewListCard.status'),
            accessorKey: 'status',
            cell: ({ getValue }: any) => (
                <Chip
                    label={t(`interview:interviewListCard.statuses.${getValue()}`, { defaultValue: (getValue() as string)?.replaceAll('_', ' ')?.toUpperCase() })}
                    color={getStatusColor(getValue() as string)}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                />
            ),
        },
        {
            header: t('interview:interviewListCard.aiScore'),
            accessorKey: 'ai_overall_score',
            cell: ({ row }: any) => (
                row.original.ai_overall_score ? (
                    <Typography color="primary" sx={{ fontWeight: 'bold' }}>{row.original.ai_overall_score}/10</Typography>
                ) : (
                    <Typography variant="caption" color="text.secondary">
                        {row.original.status === 'completed' ? t('interview:interviewListCard.grading') : '-'}
                    </Typography>
                )
            ),
        },
        {
            header: '',
            id: 'actions',
            cell: ({ row }: any) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton
                        component={Link}
                        href={`/${formatRoute(ROUTES.EMPLOYER.INTERVIEW_DETAIL, String(row.original.id))}`}
                        color="primary"
                        size="small"
                        title={t('common:view')}
                        sx={{ bgcolor: 'primary.background', '&:hover': { bgcolor: 'primary.backgroundHover' } }}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>

                    {['draft', 'scheduled'].includes(row.original.status) && (
                        <IconButton
                            component={Link}
                            href={`/${formatRoute(ROUTES.EMPLOYER.INTERVIEW_EDIT, String(row.original.id))}`}
                            color="info"
                            size="small"
                            title={t('interview:interviewListCard.editInterview')}
                            sx={{ bgcolor: 'info.background', '&:hover': { bgcolor: 'info.backgroundHover' } }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}

                    {row.original.status === 'scheduled' && (
                        <IconButton
                            onClick={() => setCancelDialog({ open: true, id: row.original.id, roomName: row.original.roomName })}
                            color="warning"
                            size="small"
                            title={t('interview:interviewListCard.cancelInterview')}
                            sx={{ bgcolor: 'warning.background', '&:hover': { bgcolor: 'warning.backgroundHover' } }}
                        >
                            <BlockIcon fontSize="small" />
                        </IconButton>
                    )}

                    <IconButton
                        onClick={() => setDeleteDialog({ open: true, id: row.original.id })}
                        color="error"
                        size="small"
                        title={t('interview:interviewListCard.deleteInterview')}
                        sx={{ bgcolor: 'error.background', '&:hover': { bgcolor: 'error.backgroundHover' } }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            ),
        },
    ], [t]);

    return (
        <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 2 }, backgroundColor: 'background.paper', borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={{ xs: 2, sm: 0 }} mb={4}>
                <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {displayTitle}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    component={Link}
                    href={`/${ROUTES.EMPLOYER.INTERVIEW_CREATE}`}
                    sx={{ borderRadius: 2, px: 3, boxShadow: 'none' }}
                >
                    {t('interview:interviewListCard.scheduleInterview')}
                </Button>
            </Stack>

            {isQueryLoading ? (
                <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress />
                </Box>
            ) : (
                <Divider sx={{ mb: 2 }} />
            )}

            <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, overflow: 'hidden', width: '100%' }}>
                <DataTable
                    columns={columns}
                    data={sessions}
                    isLoading={isQueryLoading}
                    rowCount={count}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange as any}
                    emptyMessage={t('interview:interviewListCard.noInterviews')}
                />
            </Box>

            {/* Confirmation Dialogs */}
            <Dialog open={deleteDialog.open} onClose={() => !isMutating && setDeleteDialog({ open: false, id: null })}>
                <DialogTitle>{t('interview:interviewListCard.confirmDeleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>{t('interview:interviewListCard.confirmDeleteMessage')}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, id: null })} disabled={isMutating}>
                        {t('common:cancel')}
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disabled={isMutating}>
                        {isMutating ? <CircularProgress size={24} /> : t('common:confirm')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={cancelDialog.open} onClose={() => !isMutating && setCancelDialog({ open: false, id: null, roomName: null })}>
                <DialogTitle>{t('interview:interviewListCard.confirmCancelTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>{t('interview:interviewListCard.confirmCancelMessage')}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialog({ open: false, id: null, roomName: null })} disabled={isMutating}>
                        {t('common:cancel')}
                    </Button>
                    <Button onClick={handleCancel} color="warning" variant="contained" disabled={isMutating}>
                        {isMutating ? <CircularProgress size={24} /> : t('common:confirm')}
                    </Button>
                </DialogActions>
            </Dialog>

            {isMutating && <BackdropLoading />}
        </Box>
    );
};

export default InterviewListCard;
