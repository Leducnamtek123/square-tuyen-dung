import React, { useState } from 'react';
import { Box, Card, CardHeader, CardContent, Typography, TablePagination } from "@mui/material";
import { useTranslation } from 'react-i18next';

import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { transformInterviewSession } from '../../../utils/transformers';
import InterviewTable from './components/InterviewTable';
import { useDeleteInterview, useUpdateInterviewStatus, useInterviews } from './hooks/useInterviews';

const InterviewsPage = () => {
    const { t } = useTranslation(['interview', 'admin']);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data: interviewsData, isLoading } = useInterviews({
        page: page + 1,
        pageSize: rowsPerPage,
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
                    <InterviewTable
                        interviews={interviews}
                        loading={isLoading}
                        onView={handleViewDetail}
                        onDelete={handleDelete}
                        onUpdateStatus={handleUpdateStatus}
                    />
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={(interviewsData as any)?.count || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage={t('common.pagination.rowsPerPage', { ns: 'admin' })}
                        labelDisplayedRows={({ from, to, count }) => 
                            t('common.pagination.displayedRows', { ns: 'admin', from, to, count })
                        }
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default InterviewsPage;
