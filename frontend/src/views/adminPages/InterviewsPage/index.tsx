import React, { useState } from 'react';
import { Box, Card, CardHeader, CardContent, Typography, Button } from "@mui/material";
import { useTranslation } from 'react-i18next';

import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { transformInterviewSession } from '../../../utils/transformers';
import InterviewTable from './components/InterviewTable';
import { useDeleteInterview, useUpdateInterviewStatus, useInterviews } from './hooks/useInterviews';

import { SortingState, RowSelectionState } from '@tanstack/react-table';

const InterviewsPage = () => {
    const { t } = useTranslation(['interview', 'admin']);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const ordering = sorting.length > 0 
        ? `${sorting[0].desc ? '-' : ''}${sorting[0].id}`
        : undefined;

    const { data: interviewsData, isLoading } = useInterviews({
        page: page + 1,
        pageSize: rowsPerPage,
        ordering,
    }) as any;

    const interviews = ((interviewsData as any)?.results || []).map(transformInterviewSession);
    const deleteMutation = useDeleteInterview() as any;
    const updateStatusMutation = useUpdateInterviewStatus() as any;

    const handleChangePage = (event: any, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetail = (interview: any) => {
        // View interview detail
    };

    const handleDelete = (id: any) => {
        if (window.confirm(t('interviewAdminPage.confirmDelete', { ns: 'interview' }))) {
            deleteMutation.mutate(id);
        }
    };

    const handleUpdateStatus = (id: any, status: string) => {
        updateStatusMutation.mutate({ id, status });
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                <VideocamOutlinedIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> {t('interviewAdminPage.title', { ns: 'interview' })}
            </Typography>

            <Card>
                <CardHeader title={t('interviewAdminPage.cardTitle', { ns: 'interview' })} />
                <CardContent>
                    {Object.keys(rowSelection).length > 0 && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2" color="primary.contrastText">
                                {t('pages.interviews.bulkSelect.selectedCount', { ns: 'admin', count: Object.keys(rowSelection).length })}
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="error" 
                                size="small"
                                onClick={() => {
                                    if (window.confirm(t('pages.interviews.bulkSelect.deleteConfirm', { ns: 'admin' }))) {
                                        // Handle bulk delete here
                                        console.log('Bulk delete interviews:', Object.keys(rowSelection));
                                    }
                                }}
                            >
                                {t('pages.interviews.bulkSelect.deleteBtn', { ns: 'admin' })}
                            </Button>
                        </Box>
                    )}
                    <InterviewTable
                        interviews={interviews}
                        loading={isLoading}
                        rowCount={(interviewsData as any)?.count || 0}
                        pagination={{
                            pageIndex: page,
                            pageSize: rowsPerPage,
                        }}
                        onPaginationChange={(pagination) => {
                            setPage(pagination.pageIndex);
                            setRowsPerPage(pagination.pageSize);
                        }}
                        sorting={sorting}
                        onSortingChange={setSorting}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        onView={handleViewDetail}
                        onDelete={handleDelete}
                        onUpdateStatus={handleUpdateStatus}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default InterviewsPage;
