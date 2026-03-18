// @ts-nocheck
import React, { useState } from 'react';
import { Box, Paper, TablePagination } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { PAGINATION } from '../../../configs/constants';
import { useUsers, useToggleUserStatus, useUpdateUserRole } from './hooks/useUsers';
import UserTable from './components/UserTable';
import UserFilters from './components/UserFilters';

interface Props {
  [key: string]: any;
}



const UsersPage = () => {
    const { t } = useTranslation('admin');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(-1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const currentUserId = useSelector((state) => state.user?.currentUser?.id);
    const resolvedPageSize = rowsPerPage === -1 ? PAGINATION.ADMIN_MAX_PAGE_SIZE : rowsPerPage;

    const { data: usersData, isLoading } = useUsers({
        page: page + 1,
        pageSize: resolvedPageSize,
        search: search || undefined,
        roleName: roleFilter || undefined,
    });

    const toggleStatusMutation = useToggleUserStatus();
    const updateRoleMutation = useUpdateUserRole();
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

    const handleRoleFilterChange = (value) => {
        setRoleFilter(value);
        setPage(0);
    };

    const handleToggleStatus = (user) => {
        toggleStatusMutation.mutate(user);
    };

    const handleRoleChange = (user, roleName) => {
        if (!user || user.roleName === roleName || user.id === currentUserId) {
            return;
        }
        updateRoleMutation.mutate({ userId: user.id, roleName });
    };

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <UserFilters
                    search={search}
                    role={roleFilter}
                    onSearchChange={handleSearchChange}
                    onRoleChange={handleRoleFilterChange}
                />

                <UserTable
                    users={users}
                    loading={isLoading}
                    onToggleStatus={handleToggleStatus}
                    onRoleChange={handleRoleChange}
                    currentUserId={currentUserId}
                    disableRoleActions={updateRoleMutation.isLoading}
                />

                <TablePagination
                    rowsPerPageOptions={[
                        5,
                        10,
                        25,
                        { label: t('common.pagination.all'), value: -1 }
                    ]}
                    component="div"
                    count={totalUsers}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage={t('common.pagination.rowsPerPage')}
                    labelDisplayedRows={({ from, to, count }) => 
                        t('common.pagination.displayedRows', { from, to, count })
                    }
                />
            </Paper>
        </Box>
    );
};

export default UsersPage;
