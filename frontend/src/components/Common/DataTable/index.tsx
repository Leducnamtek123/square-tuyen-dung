import React from 'react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    ColumnDef,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Box, Typography, CircularProgress } from "@mui/material";
import { useTranslation } from 'react-i18next';

interface Props<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  count?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  emptyMessage?: string;
}



const DataTable = <TData,>({
    columns,
    data,
    isLoading = false,
    count = 0,
    page = 0,
    rowsPerPage = 10,
    onPageChange,
    onRowsPerPageChange,
    emptyMessage,
}: Props<TData>) => {
    const { t } = useTranslation('admin');
    
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    const displayEmptyMessage = emptyMessage || t('common.table.noData');

    return (
        <Box sx={{ width: '100%' }}>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableCell
                                        key={header.id}
                                        sx={{ fontWeight: 'bold', color: 'text.secondary', py: 2 }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={40} />
                                </TableCell>
                            </TableRow>
                        ) : data.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} hover>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} sx={{ py: 1.5 }}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">{displayEmptyMessage}</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={onPageChange || (() => { })}
                onRowsPerPageChange={onRowsPerPageChange}
                labelRowsPerPage={t('common.pagination.rowsPerPage')}
                labelDisplayedRows={({ from, to, count }) => 
                    t('common.pagination.displayedRows', { from, to, count })
                }
            />
        </Box>
    );
};

export default DataTable;
