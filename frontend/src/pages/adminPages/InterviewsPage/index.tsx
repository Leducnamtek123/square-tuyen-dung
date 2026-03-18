// @ts-nocheck
import React, { useState } from 'react';
import { Box, Card, CardHeader, CardContent, Typography, TablePagination } from "@mui/material";
import { useTranslation } from 'react-i18next';

import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { transformInterviewSession } from '../../../utils/transformers';
import InterviewTable from './components/InterviewTable';
import { useDeleteInterview, useUpdateInterviewStatus, useInterviews } from './hooks/useInterviews';

interface Props {
  [key: string]: any;
}



const InterviewsPage = () => {
    const { t } = useTranslation(['interview', 'admin']);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data: interviewsData, isLoading } = useInterviews({
        page: page + 1,
        pageSize: rowsPerPage,
    });

    const interviews = (interviewsData?.results || []).map(transformInterviewSession);
    const deleteMutation = useDeleteInterview();
    const updateStatusMutation = useUpdateInterviewStatus();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetail = (interview) => {
        console.log('View interview detail:', interview);
    };

    const handleDelete = (id) => {
        if (window.confirm(t('interviewAdminPage.confirmDelete', { ns: 'interview' }))) {
            deleteMutation.mutate(id);
        }
    };

    const handleUpdateStatus = (id, status) => {
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
                        count={interviewsData?.count || 0}
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
