'use client';
import React, { useMemo } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Chip, 
    IconButton, 
    Stack, 
    Tooltip,
    Paper,
    alpha,
    useTheme
} from "@mui/material";
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
import BackdropLoading from '../../../../components/Common/Loading/BackdropLoading';
import { confirmModal } from '../../../../utils/sweetalert2Modal';
import { ColumnDef, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import { InterviewSession } from '@/types/models';

interface InterviewListCardProps {
  title?: string;
}

const InterviewListCard = ({ title }: InterviewListCardProps) => {
    const { t } = useTranslation(['interview', 'common', 'employer']);
    const theme = useTheme();
    const displayTitle = title || t('interview:interviewListCard.title');

    const {
        page,
        pageSize,
        onPaginationChange,
        pagination,
        sorting,
        onSortingChange,
        ordering
    } = useDataTable({ 
        initialSorting: [{ id: 'scheduledAt', desc: true }],
        initialPageSize: 10 
    });

    const queryParams = useMemo(() => ({
        page: page + 1,
        pageSize: pageSize,
        ordering: ordering
    }), [page, pageSize, ordering]);

    // Polling logic: Refetch every 10s to keep session statuses updated
    const { data: queryData, isLoading: isQueryLoading } = useInterviewSessions(queryParams, 10000);
    const { deleteSession, updateStatus, isMutating } = useInterviewMutations();

    const sessions = queryData?.results || [];
    const count = queryData?.count || 0;

    const handleDelete = (id: string | number) => {
        confirmModal(
            async () => {
                try {
                    await deleteSession(id);
                    toastMessages.success(t('interview:interviewListCard.messages.deleteSuccess'));
                } catch (error) {
                    // Error handled by mutation hook
                }
            },
            t('interview:interviewListCard.confirmDeleteTitle'),
            t('interview:interviewListCard.confirmDeleteMessage'),
            'warning'
        );
    };

    const handleCancel = (roomName: string) => {
        confirmModal(
            async () => {
                try {
                    await updateStatus({ roomName, status: 'cancelled' });
                    toastMessages.success(t('interview:interviewListCard.messages.cancelSuccess'));
                } catch (error) {
                    // Error handled by mutation hook
                }
            },
            t('interview:interviewListCard.confirmCancelTitle'),
            t('interview:interviewListCard.confirmCancelMessage'),
            'warning'
        );
    };

    const getStatusColor = (status: string): "success" | "primary" | "info" | "error" | "warning" | "default" => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'scheduled': return 'info';
            case 'cancelled': return 'error';
            case 'processing': return 'warning';
            default: return 'default';
        }
    };

    const columns = useMemo<ColumnDef<InterviewSession>[]>(() => [
        {
            header: t('interview:interviewListCard.candidate'),
            accessorKey: 'candidateName',
            enableSorting: true,
            cell: ({ row }) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.25 }}>
                        {row.original.candidateName || '---'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, opacity: 0.8 }}>
                        {row.original.candidateEmail || '---'}
                    </Typography>
                </Box>
            ),
        },
        {
            header: t('interview:interviewListCard.position'),
            accessorKey: 'jobName',
            enableSorting: true,
            cell: ({ getValue }) => (
                <Typography variant="body2" noWrap sx={{ fontWeight: 800, color: 'primary.main', maxWidth: 200 }}>
                    {String(getValue() || '---')}
                </Typography>
            ),
        },
        {
            header: t('interview:interviewListCard.time'),
            accessorKey: 'scheduledAt',
            enableSorting: true,
            cell: ({ getValue }) => (
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {getValue() ? new Date(getValue() as string).toLocaleString('vi-VN', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : '---'}
                </Typography>
            ),
        },
        {
            header: t('interview:interviewListCard.status'),
            accessorKey: 'status',
            cell: ({ getValue }) => {
                const status = getValue() as string;
                const statusColor = getStatusColor(status);
                return (
                    <Chip
                        label={t(`interview:interviewListCard.statuses.${status}`, { 
                            defaultValue: status?.replaceAll('_', ' ')?.toUpperCase() || '---' 
                        })}
                        size="small"
                        sx={{ 
                            fontWeight: 900, 
                            borderRadius: 1.5, 
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                            letterSpacing: '0.5px',
                            bgcolor: statusColor === 'default' ? alpha(theme.palette.action.disabled, 0.08) : alpha(theme.palette[statusColor].main, 0.08),
                            color: statusColor === 'default' ? 'text.secondary' : `${statusColor}.main`,
                            border: '1px solid',
                            borderColor: statusColor === 'default' ? alpha(theme.palette.action.disabled, 0.1) : alpha(theme.palette[statusColor].main, 0.1),
                        }}
                    />
                );
            },
        },
        {
            header: t('interview:interviewListCard.aiScore'),
            accessorKey: 'aiOverallScore',
            meta: { align: 'center' },
            cell: ({ row }) => {
                const score = row.original.ai_overall_score || row.original.aiOverallScore;
                if (score) {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography color="secondary" sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
                                {score}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontWeight: 800 }}>
                                /10
                            </Typography>
                        </Box>
                    );
                }
                return (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', fontWeight: 700 }}>
                        {row.original.status === 'completed' ? t('interview:interviewListCard.grading') : '---'}
                    </Typography>
                );
            },
        },
        {
            header: t('common:actions'),
            id: 'actions',
            meta: { align: 'right' },
            cell: ({ row }) => {
                const session = row.original;
                const canEdit = ['draft', 'scheduled'].includes(session.status);
                const canCancel = session.status === 'scheduled';

                return (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title={t('common:view')} arrow>
                            <IconButton
                                component={Link}
                                href={`/${formatRoute(ROUTES.EMPLOYER.INTERVIEW_DETAIL, String(session.id))}`}
                                color="primary"
                                size="small"
                                sx={{ 
                                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                                    borderRadius: 1.5,
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }
                                }}
                            >
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        {canEdit && (
                            <Tooltip title={t('interview:interviewListCard.editInterview')} arrow>
                                <IconButton
                                    component={Link}
                                    href={`/${formatRoute(ROUTES.EMPLOYER.INTERVIEW_EDIT, String(session.id))}`}
                                    color="info"
                                    size="small"
                                    sx={{ 
                                        bgcolor: alpha(theme.palette.info.main, 0.06),
                                        borderRadius: 1.5,
                                        '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.12) }
                                    }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}

                        {canCancel && (
                            <Tooltip title={t('interview:interviewListCard.cancelInterview')} arrow>
                                <IconButton
                                    onClick={() => handleCancel(session.roomName)}
                                    color="warning"
                                    size="small"
                                    sx={{ 
                                        bgcolor: alpha(theme.palette.warning.main, 0.06),
                                        borderRadius: 1.5,
                                        '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.12) }
                                    }}
                                >
                                    <BlockIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}

                        <Tooltip title={t('interview:interviewListCard.deleteInterview')} arrow>
                            <IconButton
                                onClick={() => handleDelete(session.id)}
                                color="error"
                                size="small"
                                sx={{ 
                                    bgcolor: alpha(theme.palette.error.main, 0.06),
                                    borderRadius: 1.5,
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.12) }
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            },
        },
    ], [t, theme.palette]);

    return (
        <Paper 
            elevation={0}
            sx={{ 
                p: { xs: 3, sm: 5 }, 
                backgroundColor: 'background.paper', 
                borderRadius: 4, 
                boxShadow: (theme) => theme.customShadows?.z1,
                border: '1px solid',
                borderColor: 'divider'
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
                        fontSize: '0.95rem'
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
