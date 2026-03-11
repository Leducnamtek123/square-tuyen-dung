import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Chip, Typography } from "@mui/material";

import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from '../../../../configs/dayjs-config';

const ResumeTable = ({ data, onView, onDelete }) => {
    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell>Resume Title</TableCell>
                        <TableCell>Candidate</TableCell>
                        <TableCell>Resume Type</TableCell>
                        <TableCell>Experience</TableCell>
                        <TableCell>Last Update</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {row.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Slug: {row.slug}
                                </Typography>
                            </TableCell>
                            <TableCell>{row.userDict?.fullName || '---'}</TableCell>
                            <TableCell>
                                <Chip
                                    label={row.type === 'UPLOAD' ? 'Uploaded File' : 'Online Profile'}
                                    size="small"
                                    variant="outlined"
                                    color={row.type === 'UPLOAD' ? 'primary' : 'secondary'}
                                />
                            </TableCell>
                            <TableCell>{row.experience || '---'}</TableCell>
                            <TableCell>{dayjs(row.updateAt).format('DD/MM/YYYY HH:mm')}</TableCell>
                            <TableCell align="center">
                                <Chip
                                    label={row.isActive ? 'Active' : 'Inactive'}
                                    size="small"
                                    color={row.isActive ? 'success' : 'default'}
                                />
                            </TableCell>
                            <TableCell align="right">
                                <Tooltip title="View details">
                                    <IconButton size="small" onClick={() => onView?.(row)}>
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton size="small" onClick={() => onDelete?.(row)} color="error">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!data || data.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                No data found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ResumeTable;
