'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { Box, Paper, Typography, Button, Breadcrumbs, Link } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useDataTable } from '../../../hooks';
import { PAGINATION } from '../../../configs/constants';
import { useUsers } from './hooks/useUsers';
import UserTable from './components/UserTable';
import UserFilters from './components/UserFilters';
import { User as UserModel } from '../../../types/models';
import type { RoleName } from '../../../types/auth';

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
        debouncedSearchTerm,
        onSearchChange: handleSearchChange,
    } = useDataTable();
    
    const [roleFilter, setRoleFilter] = useState('');
    
    const currentUserId = useAppSelector((state) => state.user?.currentUser?.id);
    const resolvedPageSize = pageSize === -1 ? PAGINATION.ADMIN_MAX_PAGE_SIZE : pageSize;

    const { 
        data: usersData, 
        isLoading, 
        toggleUserStatus, 
        bulkDisableUsers,
        updateUserRole,
        isMutating 
    } = useUsers({
        page: page + 1,
        pageSize: resolvedPageSize,
        search: debouncedSearchTerm || undefined,
        roleName: roleFilter || undefined,
        ordering,
    });

    const users = usersData?.results || [];
    const totalUsers = usersData?.count || 0;

    const handleRoleFilterChange = (value: string) => {
        setRoleFilter(value);
    };

    const handleToggleStatus = async (user: UserModel) => {
        try {
            await toggleUserStatus(user);
        } catch (e) {
            console.error(e);
        }
    };

    const handleRoleChange = async (user: UserModel, roleName: RoleName) => {
        if (!user || user.roleName === roleName || user.id === currentUserId) {
            return;
        }
        try {
            await updateUserRole({ userId: user.id, roleName });
        } catch (e) {
            console.error(e);
        }
    };

    const selectedUserIds = Object.keys(rowSelection)
        .map((rowIndex) => users[Number(rowIndex)]?.id)
        .filter((id): id is number => typeof id === 'number' && id !== currentUserId);

    const handleBulkDisable = async () => {
        if (selectedUserIds.length === 0) return;
        if (!window.confirm(t('pages.users.bulkSelect.disableConfirm'))) return;
        try {
            await bulkDisableUsers(selectedUserIds);
            onRowSelectionChange({});
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                    {t('pages.users.title')}
                </Typography>
                <Breadcrumbs>
                    <Link underline="hover" color="inherit" href="/admin">{t('pages.users.breadcrumbAdmin')}</Link>
                    <Typography color="text.primary">{t('pages.users.breadcrumbList')}</Typography>
                </Breadcrumbs>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }} elevation={0}>
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
                            disabled={isMutating || selectedUserIds.length === 0}
                            onClick={handleBulkDisable}
                        >
                            {t('pages.users.bulkSelect.disableBtn')}
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
                    disableRoleActions={isMutating}
                />
            </Paper>
        </Box>
    );
};

export default UsersPage;
