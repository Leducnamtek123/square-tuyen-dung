import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    IconButton,
    Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from '../../../../configs/dayjs-config';

const JobActivityTable = ({ data, onEdit, onDelete }) => {
    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell>Ứng viên</TableCell>
                        <TableCell>Tin tuyển dụng</TableCell>
                        <TableCell>Công ty</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Ngày cập nhật</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {row.userDict?.fullName || '---'}
                                </Typography>
                            </TableCell>
                            <TableCell>{row.jobPostDict?.jobName || '---'}</TableCell>
                            <TableCell>{row.companyDict?.companyName || '---'}</TableCell>
                            <TableCell>
                                <Chip
                                    label={row.status || '---'}
                                    size="small"
                                    color={
                                        row.status === 'APPLIED' ? 'primary' :
                                            row.status === 'ACCEPTED' ? 'success' :
                                                row.status === 'REJECTED' ? 'error' : 'default'
                                    }
                                />
                            </TableCell>
                            <TableCell>{dayjs(row.updateAt).format('DD/MM/YYYY HH:mm')}</TableCell>
                            <TableCell align="right">
                                <Tooltip title="Cập nhật trạng thái">
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
                    {(!data || data.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                Không tìm thấy dữ liệu
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default JobActivityTable;
