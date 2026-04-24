'use client';

import React, { useCallback, useMemo } from 'react';
import { Chip, Tooltip, Switch, Typography, Stack, Select, MenuItem, SelectChangeEvent, Avatar, Box } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { ROLES_NAME } from '../../../../configs/constants';
import { ColumnDef, SortingState, OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import DataTable from '../../../../components/Common/DataTable';
import { User as UserModel } from '../../../../types/models';
import { RoleName } from '../../../../types/auth';

interface UserTableProps {
    users: UserModel[];
    loading?: boolean;
    rowCount?: number;
    pagination?: { pageIndex: number; pageSize: number };
    onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    onToggleStatus: (user: UserModel) => void;
    onRoleChange: (user: UserModel, roleName: RoleName) => void;
    currentUserId: string | number;
    disableRoleActions?: boolean;
}

const UserTable = ({ 
    users, 
    loading, 
    rowCount, 
    pagination, 
    onPaginationChange, 
    sorting,
    onSortingChange,
    rowSelection,
    onRowSelectionChange,
    onToggleStatus, 
    onRoleChange, 
    currentUserId, 
    disableRoleActions 
}: UserTableProps) => {
    const { t } = useTranslation('admin');

    const getRoleLabel = useCallback((roleName: string) => {
        switch (roleName) {
            case ROLES_NAME.ADMIN:
                return t('pages.users.roles.admin');
            case ROLES_NAME.EMPLOYER:
                return t('pages.users.roles.employer');
            case ROLES_NAME.JOB_SEEKER:
                return t('pages.users.roles.jobSeeker');
            default:
                return t('common.na');
        }
    }, [t]);

    const getRoleColor = useCallback((roleName: string) => {
        if (roleName === ROLES_NAME.ADMIN) return 'error';
        if (roleName === ROLES_NAME.EMPLOYER) return 'primary';
        return 'default';
    }, []);

    const columns = useMemo<ColumnDef<UserModel>[]>(() => [
        {
            accessorKey: 'id',
            header: t('pages.users.table.id') as string,
            enableSorting: true,
        },
        {
            accessorKey: 'fullName',
            header: t('pages.users.table.fullName') as string,
            enableSorting: true,
            cell: (info) => {
                const user = info.row.original;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={user.avatarUrl || undefined} sx={{ width: 32, height: 32 }}>
                            {user.fullName?.charAt(0)}
                        </Avatar>
                        <Box>
                             <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.fullName || '—'}</Typography>
                             <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Box>
                    </Box>
                );
            }
        },
        {
            accessorKey: 'roleName',
            header: t('pages.users.table.role') as string,
            enableSorting: true,
            cell: (info) => (
                <Select
                    value={info.getValue() as string || ''}
                    size="small"
                    variant="standard"
                    disableUnderline
                    onChange={(event: SelectChangeEvent<string>) => onRoleChange(info.row.original, event.target.value as RoleName)}
                    disabled={disableRoleActions || info.row.original.id === currentUserId}
                    renderValue={(value) => (
                        <Chip
                            label={getRoleLabel(value)}
                            size="small"
                            color={getRoleColor(value)}
                            variant="outlined"
                        />
                    )}
                    sx={{ minWidth: 140 }}
                >
                    <MenuItem value={ROLES_NAME.ADMIN}>{getRoleLabel(ROLES_NAME.ADMIN)}</MenuItem>
                    <MenuItem value={ROLES_NAME.EMPLOYER}>{getRoleLabel(ROLES_NAME.EMPLOYER)}</MenuItem>
                    <MenuItem value={ROLES_NAME.JOB_SEEKER}>{getRoleLabel(ROLES_NAME.JOB_SEEKER)}</MenuItem>
                </Select>
            ),
        },
        {
            accessorKey: 'isVerifyEmail',
            header: t('pages.users.table.verification') as string,
            cell: (info) => info.getValue() ? (
                <Tooltip title={t('pages.users.table.verified')}>
                    <CheckCircleIcon color="success" sx={{ fontSize: '1.25rem' }} />
                </Tooltip>
            ) : (
                <Typography variant="caption" color="error">{t('pages.users.table.unverified')}</Typography>
            ),
        },
        {
            accessorKey: 'isActive',
            header: t('pages.users.table.status') as string,
            enableSorting: true,
            cell: (info) => (
                <Chip
                    label={info.getValue() ? t('pages.users.table.active') : t('pages.users.table.blocked')}
                    size="small"
                    color={info.getValue() ? 'success' : 'error'}
                    variant={info.getValue() ? 'filled' : 'outlined'}
                />
            ),
        },
        {
            id: 'actions',
            header: t('pages.users.table.actions') as string,
            meta: { align: 'right' },
            cell: (info) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                    <Tooltip title={info.row.original.isActive ? t('pages.users.table.blockAccount') : t('pages.users.table.unblockAccount')}>
                        <Switch
                            checked={!!info.row.original.isActive}
                            onChange={() => onToggleStatus(info.row.original)}
                            color="primary"
                            size="small"
                            disabled={disableRoleActions || info.row.original.id === currentUserId}
                        />
                    </Tooltip>
                </Stack>
            ),
        },
    ], [currentUserId, disableRoleActions, getRoleColor, getRoleLabel, onRoleChange, onToggleStatus, t]);

    return (
        <DataTable
            columns={columns}
            data={users || []}
            isLoading={loading}
            rowCount={rowCount}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            enableSorting
            sorting={sorting}
            onSortingChange={onSortingChange}
            enableRowSelection
            rowSelection={rowSelection}
            onRowSelectionChange={onRowSelectionChange}
            emptyMessage={t('pages.users.table.noUsers')}
        />
    );
};

export default UserTable;
