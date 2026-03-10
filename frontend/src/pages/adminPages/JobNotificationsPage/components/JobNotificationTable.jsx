import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    IconButton,
    Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from '../../../../configs/dayjs-config';

const JobNotificationTable = ({ data, onEdit, onDelete }) => {
    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                        <TableCell width={200}>Tiêu đề</TableCell>
                        <TableCell>Nội dung</TableCell>
                        <TableCell width={250}>Đối tượng nhận</TableCell>
                        <TableCell width={180}>Ngày gửi</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data?.map((row) => (
                        <TableRow key={row.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{row.title}</TableCell>
                            <TableCell>{row.content}</TableCell>
                            <TableCell>
                                <Typography variant="body2">{row.userDict?.fullName || 'Hệ thống'}</Typography>
                                <Typography variant="caption" color="text.secondary">{row.userDict?.email}</Typography>
                            </TableCell>
                            <TableCell>{dayjs(row.createAt).format('DD/MM/YYYY HH:mm')}</TableCell>
                            <TableCell align="right">
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
                    {(!data || data.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                Không tìm thấy dữ liệu
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default JobNotificationTable;
