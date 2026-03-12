/*
MyJob Recruitment System - Part of MyJob Platform

Author: Bui Khanh Huy
Email: khuy220@gmail.com
Copyright (c) 2023 Bui Khanh Huy

License: MIT License
See the LICENSE file in the project root for full license information.
*/

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, Chip, IconButton, Stack, Divider, LinearProgress } from "@mui/material";

import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';

import interviewService from '../../../../services/interviewService';
import { transformInterviewSession } from '../../../../utils/transformers';
import { ROUTES } from '../../../../configs/constants';
import DataTable from '../../../../components/DataTable';
import { useTranslation } from 'react-i18next';

const InterviewListCard = ({ title }) => {
    const { t } = useTranslation('interview');
    const displayTitle = title || t('interviewListCard.title');
    const [sessions, setSessions] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await interviewService.getSessions({
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
        const hasActiveSession = sessions.some((session) => ['in_progress', 'calibration', 'processing'].includes(session.status));
        if (!hasActiveSession) {
            return undefined;
        }

        const interval = setInterval(fetchSessions, 5000);
        return () => clearInterval(interval);
    }, [sessions, fetchSessions]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'scheduled': return 'info';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getLink = (path) => {
        const base = ROUTES.EMPLOYER.DASHBOARD ? `/${ROUTES.EMPLOYER.DASHBOARD}/` : '/';
        return `${base}${path}`;
    };

    const columns = useMemo(() => [
        {
            header: t('interviewListCard.candidate'),
            accessorKey: 'candidateName',
            cell: ({ row }) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.original.candidateName}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.original.candidateEmail || row.original.candidate_email || '---'}</Typography>
                </Box>
            ),
        },
        {
            header: t('interviewListCard.position'),
            accessorKey: 'jobName',
            cell: ({ getValue }) => <Typography variant="body2">{getValue() || 'N/A'}</Typography>,
        },
        {
            header: t('interviewListCard.time'),
            accessorKey: 'scheduledAt',
            cell: ({ getValue }) => (
                <Typography variant="body2">
                    {getValue() ? new Date(getValue()).toLocaleString('en-US') : 'N/A'}
                </Typography>
            ),
        },
        {
            header: t('interviewListCard.status'),
            accessorKey: 'status',
            cell: ({ getValue }) => (
                <Chip
                    label={getValue()?.replaceAll('_', ' ')?.toUpperCase()}
                    color={getStatusColor(getValue())}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                />
            ),
        },
        {
            header: t('interviewListCard.aiScore'),
            accessorKey: 'ai_overall_score',
            cell: ({ row }) => (
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
            cell: ({ row }) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                        component={Link}
                        to={getLink(ROUTES.EMPLOYER.INTERVIEW_DETAIL.replace(':id', row.original.id))}
                        color="primary"
                        size="small"
                        sx={{
                            bgcolor: 'primary.background',
                            '&:hover': { bgcolor: 'primary.backgroundHover' }
                        }}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Box>
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
                        background: (theme) => theme.palette.primary.gradient || theme.palette.primary.main,
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
                    to={getLink(ROUTES.EMPLOYER.INTERVIEW_CREATE)}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        background: (theme) => theme.palette.primary.gradient,
                        boxShadow: (theme) => theme.customShadows?.small || 1,
                        '&:hover': {
                            boxShadow: (theme) => theme.customShadows?.medium || 2
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
                boxShadow: (theme) => theme.customShadows?.card || 1,
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
        </Box>
    );
};

export default InterviewListCard;
