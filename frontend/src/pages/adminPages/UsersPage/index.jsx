import React, { useState } from 'react';
import { Box, Typography, Paper, TablePagination } from '@mui/material';
import { useUsers, useToggleUserStatus } from './hooks/useUsers';
import UserTable from './components/UserTable';
import UserFilters from './components/UserFilters';
import ScheduleInterviewDialog from './components/ScheduleInterviewDialog';

const UsersPage = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { data: usersData, isLoading, isError } = useUsers({
        page: page + 1,
        pageSize: rowsPerPage,
        search: search || undefined
    });

    const toggleStatusMutation = useToggleUserStatus();
    const users = usersData?.results || [];
    const totalUsers = usersData?.count || 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(0);
    };

    const handleToggleStatus = (user) => {
        toggleStatusMutation.mutate(user);
    };

    const handleScheduleInterview = (user) => {
        setSelectedUser(user);
        setInterviewDialogOpen(true);
    };

    return (
        <>
            <Paper sx={{ p: 3, mb: 3 }}>
                <UserFilters search={search} onSearchChange={handleSearchChange} />

                <UserTable
                    users={users}
                    loading={isLoading}
                    onToggleStatus={handleToggleStatus}
                    onScheduleInterview={handleScheduleInterview}
                />

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalUsers}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số dòng mỗi trang"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
                />
            </Paper>

            <ScheduleInterviewDialog
                open={interviewDialogOpen}
                onClose={() => {
                    setInterviewDialogOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />
        </>
    );
};

export default UsersPage;
