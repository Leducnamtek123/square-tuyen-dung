import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Tooltip, Switch, CircularProgress, Typography, IconButton, Stack } from "@mui/material";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';

const UserTable = ({ users, loading, onToggleStatus, onScheduleInterview }) => {
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
                <Typography color="textSecondary">No users found</Typography>
            </TableContainer>
        );
    }

    return (
        <TableContainer>
            <Table size="medium">
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>ID</TableCell>
                        <TableCell>Full Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Verification</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id} hover>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.fullName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Chip
                                    label={user.roleName}
                                    size="small"
                                    color={user.roleName === 'ADMIN' ? 'error' : user.roleName === 'EMPLOYER' ? 'primary' : 'default'}
                                />
                            </TableCell>
                            <TableCell>
                                {user.isVerifyEmail ? (
                                    <Tooltip title="Verified">
                                        <CheckCircleIcon color="success" size="small" />
                                    </Tooltip>
                                ) : (
                                    <Typography variant="caption" color="error">Unverified</Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={user.isActive ? 'Active' : 'Blocked'}
                                    size="small"
                                    color={user.isActive ? 'success' : 'error'}
                                    variant="outlined"
                                />
                            </TableCell>
                            <TableCell align="right">
                                <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                                    {user.roleName !== 'ADMIN' && (
                                        <Tooltip title="Schedule Interview">
                                            <IconButton
                                                size="small"
                                                color="info"
                                                onClick={() => onScheduleInterview(user)}
                                            >
                                                <VideocamOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title={user.isActive ? 'Block account' : 'Unblock account'}>
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
