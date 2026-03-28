'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, Chip, IconButton, Stack, Divider, LinearProgress, CircularProgress } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { toast } from 'react-toastify';
import Link from 'next/link';
import interviewService from '../../../../services/interviewService';
import { transformInterviewSession } from '../../../../utils/transformers';
import { ROUTES } from '../../../../configs/constants';
import DataTable from '../../../../components/Common/DataTable';
import { useTranslation } from 'react-i18next';

interface InterviewListCardProps {
  title?: string;
}

const InterviewListCard = ({ title }: InterviewListCardProps) => {

    const { t } = useTranslation('interview');

    const displayTitle = title || t('interviewListCard.title');

    const [sessions, setSessions] = useState<any[]>([]);

    const [count, setCount] = useState(0);

    const [page, setPage] = useState(0);

    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [loading, setLoading] = useState(true);

    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, id: string | number | null }>({ open: false, id: null });
    const [cancelDialog, setCancelDialog] = useState<{ open: boolean, id: string | number | null, roomName: string | null }>({ open: false, id: null, roomName: null });
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchSessions = useCallback(async () => {

        setLoading(true);

        try {

            const res: any = await interviewService.getSessions({

                page: page + 1,

                pageSize: rowsPerPage

            });

            const data = res;

            const rawSessions = Array.isArray(data?.results)

                ? data.results

                : Array.isArray(data)

                    ? data

                    : [];

            setSessions(rawSessions.map(transformInterviewSession).filter(Boolean));

            setCount(typeof data?.count === 'number' ? data.count : rawSessions.length);

        } catch (error) {

            console.error('Error fetching sessions', error);

        } finally {

            setLoading(false);

        }

    }, [page, rowsPerPage]);

    useEffect(() => {

        fetchSessions();

    }, [fetchSessions]);

    useEffect(() => {

        const hasActiveSession = sessions.some((session: any) => ['in_progress', 'calibration', 'processing'].includes(session.status));

        if (!hasActiveSession) {

            return undefined;

        }

        const interval = setInterval(fetchSessions, 5000);

        return () => clearInterval(interval);

    }, [sessions, fetchSessions]);

    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {

        setPage(newPage);

    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {

        setPage(0);

    };

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        setIsProcessing(true);
        try {
            await interviewService.deleteSession(deleteDialog.id);
            toast.success(t('interviewListCard.messages.deleteSuccess'));
            setDeleteDialog({ open: false, id: null });
            fetchSessions();
        } catch (error) {
            console.error('Error deleting session', error);
            toast.error(t('interviewListCard.messages.deleteError'));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelDialog.roomName) return;
        setIsProcessing(true);
        try {
            await interviewService.updateSessionStatus(cancelDialog.roomName, 'cancelled');
            toast.success(t('interviewListCard.messages.cancelSuccess'));
            setCancelDialog({ open: false, id: null, roomName: null });
            fetchSessions();
        } catch (error) {
            console.error('Error cancelling session', error);
            toast.error(t('interviewListCard.messages.cancelError'));
        } finally {
            setIsProcessing(false);
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

    const getLink = (path: string) => {

        if (path.startsWith(ROUTES.EMPLOYER.DASHBOARD) || path.startsWith('employer/')) {
            return `/${path}`;
        }

        const base = ROUTES.EMPLOYER.DASHBOARD ? `/${ROUTES.EMPLOYER.DASHBOARD}/` : '/';

        return `${base}${path}`;

    };

    const columns = useMemo(() => [

        {

            header: t('interviewListCard.candidate'),

            accessorKey: 'candidateName',

            cell: ({ row }: { row: { original: any } }) => (

                <Box>

                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.original.candidateName}</Typography>

                    <Typography variant="caption" color="text.secondary">{row.original.candidateEmail || row.original.candidate_email || '---'}</Typography>

                </Box>

            ),

        },

        {

            header: t('interviewListCard.position'),

            accessorKey: 'jobName',

            cell: ({ getValue }: { getValue: () => any }) => <Typography variant="body2">{getValue() || 'N/A'}</Typography>,

        },

        {

            header: t('interviewListCard.time'),

            accessorKey: 'scheduledAt',

            cell: ({ getValue }: { getValue: () => any }) => (

                <Typography variant="body2">

                    {getValue() ? new Date(getValue()).toLocaleString() : 'N/A'}

                </Typography>

            ),

        },

        {

            header: t('interviewListCard.status'),

            accessorKey: 'status',

            cell: ({ getValue }: { getValue: () => any }) => (

                <Chip

                    label={t(`interviewListCard.statuses.${getValue()}`, { defaultValue: getValue()?.replaceAll('_', ' ')?.toUpperCase() })}

                    color={getStatusColor(getValue())}

                    size="small"

                    sx={{ fontWeight: 'bold' }}

                />

            ),

        },

        {

            header: t('interviewListCard.aiScore'),

            accessorKey: 'ai_overall_score',

            cell: ({ row }: { row: { original: any } }) => (

                row.original.ai_overall_score ? (

                    <Typography color="primary" sx={{ fontWeight: 'bold' }}>{row.original.ai_overall_score}/10</Typography>

                ) : (

                    <Typography variant="caption" color="text.secondary">

                        {row.original.status === 'completed' ? t('interviewListCard.grading') : '-'}

                    </Typography>

                )

            ),

        },

        {

            header: '',

            id: 'actions',

            cell: ({ row }: { row: { original: any } }) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton
                        component={Link}
                        href={getLink(ROUTES.EMPLOYER.INTERVIEW_DETAIL.replace(':id', row.original.id))}
                        {...({} as any)}
                        color="primary"
                        size="small"
                        title={t('common:view')}
                        sx={{ bgcolor: 'primary.background', '&:hover': { bgcolor: 'primary.backgroundHover' } }}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>

                    {/* Edit Option - Only if not completed/cancelled */}
                    {['draft', 'scheduled'].includes(row.original.status) && (
                        <IconButton
                            component={Link}
                            href={getLink(ROUTES.EMPLOYER.INTERVIEW_EDIT.replace(':id', row.original.id))}
                            {...({} as any)}
                            color="info"
                            size="small"
                            title={t('interviewListCard.editInterview')}
                            sx={{ bgcolor: 'info.background', '&:hover': { bgcolor: 'info.backgroundHover' } }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}

                    {/* Cancel Option - Only if scheduled */}
                    {row.original.status === 'scheduled' && (
                        <IconButton
                            onClick={() => setCancelDialog({ open: true, id: row.original.id, roomName: row.original.roomName })}
                            color="warning"
                            size="small"
                            title={t('interviewListCard.cancelInterview')}
                            sx={{ bgcolor: 'warning.background', '&:hover': { bgcolor: 'warning.backgroundHover' } }}
                        >
                            <BlockIcon fontSize="small" />
                        </IconButton>
                    )}

                    {/* Delete Option - Always allowed for now or based on status */}
                    <IconButton
                        onClick={() => setDeleteDialog({ open: true, id: row.original.id })}
                        color="error"
                        size="small"
                        title={t('interviewListCard.deleteInterview')}
                        sx={{ bgcolor: 'error.background', '&:hover': { bgcolor: 'error.backgroundHover' } }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            ),

        },

    ], [t]);

    return (

        <Box sx={{

            px: { xs: 1, sm: 2 },

            py: { xs: 2, sm: 2 },

            backgroundColor: 'background.paper',

            borderRadius: 2

        }}>

            {/* Header Section */}

            <Stack

                direction={{ xs: 'column', sm: 'row' }}

                alignItems={{ xs: 'flex-start', sm: 'center' }}

                justifyContent="space-between"

                spacing={{ xs: 2, sm: 0 }}

                mb={4}

            >

                <Typography

                    variant="h5"

                    sx={{

                        fontWeight: 600,

                        background: (theme: any) => theme.palette.primary.main || theme.palette.primary.main,

                        WebkitBackgroundClip: 'text',

                        WebkitTextFillColor: 'transparent',

                        fontSize: { xs: '1.25rem', sm: '1.5rem' }

                    }}

                >

                    {displayTitle}

                </Typography>

                <Button

                    variant="contained"

                    color="primary"

                    startIcon={<AddIcon />}

                    component={Link}

                    href={getLink(ROUTES.EMPLOYER.INTERVIEW_CREATE)}

                    {...({} as any)}

                    sx={{

                        borderRadius: 2,

                        px: 3,

                        background: (theme: any) => theme.palette.primary.main,

                        boxShadow: (theme: any) => theme.customShadows?.small || 1,

                        '&:hover': {

                            boxShadow: (theme: any) => theme.customShadows?.medium || 2

                        }

                    }}

                >

                    {t('interviewListCard.scheduleInterview')}

                </Button>

            </Stack>

            {/* Loading Progress */}

            {loading ? (

                <Box sx={{ width: '100%', mb: 2 }}>

                    <LinearProgress

                        color="primary"

                        sx={{

                            height: { xs: 4, sm: 6 },

                            borderRadius: 3,

                            backgroundColor: 'primary.background'

                        }}

                    />

                </Box>

            ) : (

                <Divider sx={{ mb: 2 }} />

            )}

            {/* Table Section */}

            <Box sx={{

                backgroundColor: 'background.paper',

                borderRadius: 2,

                boxShadow: (theme: any) => theme.customShadows?.card || 1,

                overflow: 'hidden',

                width: '100%',

                '& .MuiTableContainer-root': {

                    overflowX: 'auto'

                }

            }}>

                <DataTable

                    columns={columns}

                    data={sessions}

                    isLoading={loading}

                    count={count}

                    page={page}

                    rowsPerPage={rowsPerPage}

                    onPageChange={handleChangePage}

                    onRowsPerPageChange={handleChangeRowsPerPage}

                    emptyMessage={t('interviewListCard.noInterviews')}

                />

            </Box>

            {/* Confirmation Dialogs */}
            <Dialog open={deleteDialog.open} onClose={() => !isProcessing && setDeleteDialog({ open: false, id: null })}>
                <DialogTitle>{t('interviewListCard.confirmDeleteTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>{t('interviewListCard.confirmDeleteMessage')}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, id: null })} disabled={isProcessing}>
                        {t('common:cancel')}
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained" disabled={isProcessing}>
                        {isProcessing ? <CircularProgress size={24} /> : t('common:confirm')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={cancelDialog.open} onClose={() => !isProcessing && setCancelDialog({ open: false, id: null, roomName: null })}>
                <DialogTitle>{t('interviewListCard.confirmCancelTitle')}</DialogTitle>
                <DialogContent>
                    <Typography>{t('interviewListCard.confirmCancelMessage')}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialog({ open: false, id: null, roomName: null })} disabled={isProcessing}>
                        {t('common:cancel')}
                    </Button>
                    <Button onClick={handleCancel} color="warning" variant="contained" disabled={isProcessing}>
                        {isProcessing ? <CircularProgress size={24} /> : t('common:confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>

    );

};

export default InterviewListCard;
