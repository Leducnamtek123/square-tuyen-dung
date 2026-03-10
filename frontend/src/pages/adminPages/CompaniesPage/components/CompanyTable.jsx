import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Avatar,
    Chip,
    Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

const CompanyTable = ({ data, onEdit, onView, onDelete }) => {
    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell width={100}>Logo</TableCell>
                        <TableCell>Tên Công ty</TableCell>
                        <TableCell>Quy mô</TableCell>
                        <TableCell>Lĩnh vực</TableCell>
                        <TableCell>Địa điểm</TableCell>
                        <TableCell align="center">Tin đăng</TableCell>
                        <TableCell align="center">Theo dõi</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell>
                                <Avatar
                                    src={row.companyImageUrl}
                                    variant="rounded"
                                    sx={{ width: 48, height: 48, border: '1px solid', borderColor: 'divider' }}
                                />
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {row.companyName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Slug: {row.slug}
                                </Typography>
                            </TableCell>
                            <TableCell>{row.employeeSize || '---'}</TableCell>
                            <TableCell>{row.fieldOperation || '---'}</TableCell>
                            <TableCell>{row.locationDict?.city || '---'}</TableCell>
                            <TableCell align="center">
                                <Chip label={row.jobPostNumber || 0} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell align="center">
                                <Chip label={row.followNumber || 0} size="small" />
                            </TableCell>
                            <TableCell align="right">
                                <Tooltip title="Xem chi tiết">
                                    <IconButton size="small" onClick={() => onView?.(row)}>
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Chỉnh sửa">
                                    <IconButton size="small" onClick={() => onEdit?.(row)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Xóa">
                                    <IconButton size="small" onClick={() => onDelete?.(row)} color="error">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CompanyTable;
