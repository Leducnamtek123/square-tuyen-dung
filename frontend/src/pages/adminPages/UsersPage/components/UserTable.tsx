import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tooltip, Switch, CircularProgress, Typography, Stack, Select, MenuItem, SelectChangeEvent } from "@mui/material";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';
import { ROLES_NAME } from '../../../../configs/constants';

interface UserTableProps {
    users: any[];
    loading?: boolean;
    onToggleStatus: (user: any) => void;
    onRoleChange: (user: any, roleName: string) => void;
    currentUserId: string | number;
    disableRoleActions?: boolean;
}

const UserTable = ({ users, loading, onToggleStatus, onRoleChange, currentUserId, disableRoleActions }: UserTableProps) => {
    const { t } = useTranslation('admin');
    const getRoleLabel = (roleName: string) => {
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
    };

    const getRoleColor = (roleName: string) => {
        if (roleName === ROLES_NAME.ADMIN) {
            return 'error';
        }
        if (roleName === ROLES_NAME.EMPLOYER) {
            return 'primary';
        }
        return 'default';
    };

    if (loading && users.length === 0) {
        return (
            <TableContainer sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress size={40} />
            </TableContainer>
        );
    }

    if (users.length === 0) {
        return (
            <TableContainer sx={{ py: 5, textAlign: 'center' }}>
                <Typography color="textSecondary">{t('pages.users.table.noUsers')}</Typography>
            </TableContainer>
        );
    }

    return (
        <TableContainer>
            <Table size="medium">
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>{t('pages.users.table.id')}</TableCell>
                        <TableCell>{t('pages.users.table.fullName')}</TableCell>
                        <TableCell>{t('pages.users.table.email')}</TableCell>
                        <TableCell>{t('pages.users.table.role')}</TableCell>
                        <TableCell>{t('pages.users.table.verification')}</TableCell>
                        <TableCell>{t('pages.users.table.status')}</TableCell>
                        <TableCell align="right">{t('pages.users.table.actions')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id} hover>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.fullName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Select
                                    value={user.roleName || ''}
                                    size="small"
                                    onChange={(event: SelectChangeEvent<string>) => onRoleChange(user, event.target.value)}
                                    disabled={disableRoleActions || user.id === currentUserId}
                                    renderValue={(value) => (
                                        <Chip
                                            label={getRoleLabel(value)}
                                            size="small"
                                            color={getRoleColor(value)}
                                        />
                                    )}
                                    sx={{ minWidth: 160 }}
                                >
                                    <MenuItem value={ROLES_NAME.ADMIN}>{getRoleLabel(ROLES_NAME.ADMIN)}</MenuItem>
                                    <MenuItem value={ROLES_NAME.EMPLOYER}>{getRoleLabel(ROLES_NAME.EMPLOYER)}</MenuItem>
                                    <MenuItem value={ROLES_NAME.JOB_SEEKER}>{getRoleLabel(ROLES_NAME.JOB_SEEKER)}</MenuItem>
                                </Select>
                            </TableCell>
                            <TableCell>
                                {user.isVerifyEmail ? (
                                    <Tooltip title={t('pages.users.table.verified')}>
                                        <CheckCircleIcon color="success" sx={{ fontSize: '1.25rem' }} />
                                    </Tooltip>
                                ) : (
                                    <Typography variant="caption" color="error">{t('pages.users.table.unverified')}</Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={user.isActive ? t('pages.users.table.active') : t('pages.users.table.blocked')}
                                    size="small"
                                    color={user.isActive ? 'success' : 'error'}
                                    variant="outlined"
                                />
                            </TableCell>
                            <TableCell align="right">
                                <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                                    <Tooltip title={user.isActive ? t('pages.users.table.blockAccount') : t('pages.users.table.unblockAccount')}>
                                        <Switch
                                            checked={user.isActive}
                                            onChange={() => onToggleStatus(user)}
                                            color="primary"
                                            size="small"
                                        />
                                    </Tooltip>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UserTable;
