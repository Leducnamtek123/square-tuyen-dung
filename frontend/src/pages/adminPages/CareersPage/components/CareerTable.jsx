import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Avatar } from "@mui/material";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CareerTable = ({ data, onEdit, onDelete }) => {
    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell width={80}>ID</TableCell>
                        <TableCell width={80}>Symbol</TableCell>
                        <TableCell>Career Name</TableCell>
                        <TableCell>Icon (App)</TableCell>
                        <TableCell align="center">Total Posts</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>
                                <Avatar
                                    src={row.iconUrl}
                                    variant="rounded"
                                    sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}
                                >
                                    {row.name.charAt(0)}
                                </Avatar>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                            <TableCell>{row.appIconName || '---'}</TableCell>
                            <TableCell align="center">{row.jobPostTotal || 0}</TableCell>
                            <TableCell align="right">
                                <Tooltip title="Edit">
                                    <IconButton size="small" onClick={() => onEdit?.(row)} color="primary">
                                        <EditIcon fontSize="small" />
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
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                No data found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CareerTable;
