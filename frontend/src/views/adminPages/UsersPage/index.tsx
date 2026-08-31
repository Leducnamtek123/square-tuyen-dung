'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { Box, Paper, Typography, Button, Stack, Avatar, Chip, Divider } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useDataTable } from '@/hooks';
import { PAGINATION } from '@/configs/constants';
import { useUsers } from './hooks/useUsers';
import UserTable from './components/UserTable';
import UserFilters from './components/UserFilters';
import AdminConfirmDialog from '@/components/Common/AdminConfirmDialog';
import AdminDetailDrawer from '@/components/Common/AdminDetailDrawer';
import AdminStatusBadge from '@/components/Common/AdminStatusBadge';
import { User as UserModel } from '@/types/models';
import type { RoleName } from '@/types/auth';
import dayjs from '@/configs/dayjs-config';

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
    const [deleteTarget, setDeleteTarget] = useState<UserModel | null>(null);
    const [inspectingUser, setInspectingUser] = useState<UserModel | null>(null);
    const [bulkDisableOpen, setBulkDisableOpen] = useState(false);
    
    const currentUserId = useAppSelector((state) => state.user?.currentUser?.id);
    const resolvedPageSize = pageSize === -1 ? PAGINATION.ADMIN_MAX_PAGE_SIZE : pageSize;

    const { 
        data: usersData, 
        isLoading, 
        toggleUserStatus, 
        bulkDisableUsers,
        updateUserRole,
        deleteUser,
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
        onPaginationChange({ pageIndex: 0, pageSize });
    };

    const handleToggleStatus = async (user: UserModel) => {
        try {
            await toggleUserStatus(user);
            if (inspectingUser?.id === user.id) {
                setInspectingUser((prev) => prev ? { ...prev, isActive: !prev.isActive } : null);
            }
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
            if (inspectingUser?.id === user.id) {
                setInspectingUser((prev) => prev ? { ...prev, roleName } : null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteUser = (user: UserModel) => {
        setDeleteTarget(user);
    };

    const confirmDeleteUser = async () => {
        if (!deleteTarget) return;
        try {
            await deleteUser(deleteTarget.id);
            setDeleteTarget(null);
            if (inspectingUser?.id === deleteTarget.id) {
                setInspectingUser(null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const selectedUserIds = Object.keys(rowSelection)
        .map((rowIndex) => users[Number(rowIndex)]?.id)
        .filter((id): id is number => typeof id === 'number' && id !== currentUserId);

    const handleBulkDisable = async () => {
        if (selectedUserIds.length === 0) return;
        try {
            await bulkDisableUsers(selectedUserIds);
            onRowSelectionChange({});
            setBulkDisableOpen(false);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Box sx={{ width: '100%', pb: 6 }}>
            {/* Header Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.5rem', sm: '1.875rem' }, lineHeight: 1.2 }}>
                    {t('pages.users.title')}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                    Quản lý tài khoản, phân quyền vai trò và kiểm soát trạng thái hoạt động của người dùng toàn hệ thống.
                </Typography>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    mb: 3,
                    borderRadius: 3,
                    border: '1px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                }}
            >
                <UserFilters
                    search={search}
                    role={roleFilter}
                    onSearchChange={handleSearchChange}
                    onRoleChange={handleRoleFilterChange}
                />

                {Object.keys(rowSelection).length > 0 && (
                    <Box
                        sx={{
                            mb: 2,
                            p: 1.75,
                            bgcolor: '#EFF6FF',
                            borderRadius: 2,
                            border: '1px solid #DBEAFE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ color: '#1E40AF', fontWeight: 600 }}>
                            {t('pages.users.bulkSelect.selectedCount', { count: Object.keys(rowSelection).length })}
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="error" 
                            size="small"
                            disabled={isMutating || selectedUserIds.length === 0}
                            onClick={() => setBulkDisableOpen(true)}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
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
                    onDeleteUser={handleDeleteUser}
                    onRoleChange={handleRoleChange}
                    currentUserId={currentUserId || ''}
                    disableRoleActions={isMutating}
                />
            </Paper>

            {/* Delete Confirmation Dialog */}
            <AdminConfirmDialog
                open={Boolean(deleteTarget)}
                title={t('pages.users.deleteTitle')}
                message={t('pages.users.deleteConfirm', {
                    name: deleteTarget?.fullName || deleteTarget?.email || deleteTarget?.id || '',
                })}
                variant="danger"
                loading={isMutating}
                onConfirm={confirmDeleteUser}
                onClose={() => setDeleteTarget(null)}
            />

            {/* Bulk Disable Confirmation Dialog */}
            <AdminConfirmDialog
                open={bulkDisableOpen}
                title="Vô hiệu hóa hàng loạt"
                message={t('pages.users.bulkSelect.disableConfirm')}
                variant="warning"
                loading={isMutating}
                onConfirm={handleBulkDisable}
                onClose={() => setBulkDisableOpen(false)}
            />

            {/* User Detail Drawer */}
            <AdminDetailDrawer
                open={Boolean(inspectingUser)}
                onClose={() => setInspectingUser(null)}
                title={inspectingUser?.fullName || inspectingUser?.email || 'Chi tiết người dùng'}
                subtitle={`Mã người dùng: #${inspectingUser?.id}`}
                footerAction={
                    inspectingUser && (
                        <Stack direction="row" spacing={1}>
                            <Button
                                size="small"
                                variant={inspectingUser.isActive ? "outlined" : "contained"}
                                color={inspectingUser.isActive ? "error" : "success"}
                                onClick={() => handleToggleStatus(inspectingUser)}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                {inspectingUser.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                            </Button>
                        </Stack>
                    )
                }
            >
                {inspectingUser && (
                    <Stack spacing={2.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                            <Avatar
                                src={inspectingUser.avatarUrl || ''}
                                sx={{ width: 56, height: 56, bgcolor: '#2563EB', fontSize: '1.25rem', fontWeight: 700 }}
                            >
                                {(inspectingUser.fullName || inspectingUser.email || 'U').charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                    {inspectingUser.fullName || 'Chưa cập nhật tên'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748B' }}>
                                    {inspectingUser.email}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                                    <Chip
                                        size="small"
                                        label={inspectingUser.roleName || 'User'}
                                        sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB' }}
                                    />
                                    <AdminStatusBadge
                                        status={inspectingUser.isActive ? 'active' : 'inactive'}
                                        label={inspectingUser.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
                                    />
                                </Stack>
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                                Thông tin tài khoản
                            </Typography>
                            <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                                <Stack spacing={1.25}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ color: '#64748B' }}>Số điện thoại:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{inspectingUser.phone || inspectingUser.phoneNumber || 'Chưa cập nhật'}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ color: '#64748B' }}>Xác thực Email:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: inspectingUser.isVerifyEmail ? '#16A34A' : '#D97706' }}>
                                            {inspectingUser.isVerifyEmail ? 'Đã xác thực' : 'Chưa xác thực'}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ color: '#64748B' }}>Vai trò:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {inspectingUser.roleName || 'Người dùng'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                        </Box>
                    </Stack>
                )}
            </AdminDetailDrawer>
        </Box>
    );
};

export default UsersPage;
