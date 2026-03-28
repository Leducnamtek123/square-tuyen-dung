import React, { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { Box, Paper, Typography, Button } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useDataTable } from '../../../hooks';
import { PAGINATION } from '../../../configs/constants';
import { useUsers, useToggleUserStatus, useUpdateUserRole } from './hooks/useUsers';
import UserTable from './components/UserTable';
import UserFilters from './components/UserFilters';

const UsersPage = () => {
    const { t } = useTranslation('admin');
    const {
        page,
        pageSize,
        sorting,
        onSortingChange,
        ordering,
        pagination,
        onPaginationChange,
        rowSelection,
        onRowSelectionChange,
        searchTerm: search,
        onSearchChange: handleSearchChange,
    } = useDataTable();
    
    const [roleFilter, setRoleFilter] = useState('');
    
    const currentUserId = useAppSelector((state) => state.user?.currentUser?.id);
    const resolvedPageSize = pageSize === -1 ? PAGINATION.ADMIN_MAX_PAGE_SIZE : pageSize;

    const { data: usersData, isLoading } = useUsers({
        page: page + 1,
        pageSize: resolvedPageSize,
        search: search || undefined,
        roleName: roleFilter || undefined,
        ordering,
    }) as any;

    const toggleStatusMutation = useToggleUserStatus() as any;
    const updateRoleMutation = useUpdateUserRole() as any;
    const users = (usersData?.results || []) as any[];
    const totalUsers = (usersData?.count || 0) as number;

    const handleRoleFilterChange = (value: string) => {
        setRoleFilter(value);
        // Reset page is not handled by useDataTable for custom filters
        // but we can manually reset it if needed, or update useDataTable to support it
    };

    const handleToggleStatus = (user: any) => {
        toggleStatusMutation.mutate(user);
    };

    const handleRoleChange = (user: any, roleName: string) => {
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

                {Object.keys(rowSelection).length > 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" color="primary.contrastText">
                            {t('pages.users.bulkSelect.selectedCount', { count: Object.keys(rowSelection).length })}
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="error" 
                            size="small"
                            onClick={() => {
                                if (window.confirm(t('pages.users.bulkSelect.deleteConfirm'))) {
                                    // Handle bulk delete here
                                    console.log('Bulk delete:', Object.keys(rowSelection));
                                }
                            }}
                        >
                            {t('pages.users.bulkSelect.deleteBtn')}
                        </Button>
                    </Box>
                )}

                <UserTable
                    users={users}
                    loading={isLoading}
                    rowCount={totalUsers}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange}
                    sorting={sorting}
                    onSortingChange={onSortingChange}
                    rowSelection={rowSelection}
                    onRowSelectionChange={onRowSelectionChange}
                    onToggleStatus={handleToggleStatus}
                    onRoleChange={handleRoleChange}
                    currentUserId={currentUserId || ''}
                    disableRoleActions={updateRoleMutation.isLoading}
                />
            </Paper>
        </Box>
    );
};

export default UsersPage;
