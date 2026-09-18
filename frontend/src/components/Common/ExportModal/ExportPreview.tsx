import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Skeleton,
  Chip,
  Stack,
} from '@mui/material';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import { useTranslation } from 'react-i18next';
import type { ExportColumn } from './types';

interface ExportPreviewProps {
  columns: ExportColumn[];
  rows: Record<string, any>[];
  isLoading: boolean;
  totalRecords?: number;
}

export const ExportPreview: React.FC<ExportPreviewProps> = ({
  columns,
  rows,
  isLoading,
  totalRecords,
}) => {
  const { t } = useTranslation('common');
  const checkedColumns = columns.filter((c) => c.checked);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F8FAFC',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        p: 2,
      }}
    >
      {/* Header Info */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TableViewOutlinedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem' }}>
            {t('export.previewTitle', 'Xem trước dữ liệu (Preview)')}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={t('export.previewFirst10', 'Hiển thị 10 dòng đầu')}
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: '0.725rem', borderColor: '#CBD5E1', color: '#475569', fontWeight: 500 }}
          />
          {totalRecords !== undefined && (
            <Chip
              label={t('export.totalRecords', 'Tổng số: {{count}} bản ghi', { count: totalRecords })}
              size="small"
              sx={{ height: 22, fontSize: '0.725rem', backgroundColor: '#E0E7FF', color: '#3730A3', fontWeight: 600 }}
            />
          )}
        </Stack>
      </Stack>

      {/* Spreadsheet Preview Container */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          flex: 1,
          maxHeight: 380,
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          overflow: 'auto',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Table stickyHeader size="small" sx={{ minWidth: 450 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: '#F1F5F9',
                  fontWeight: 700,
                  color: '#475569',
                  fontSize: '0.75rem',
                  borderBottom: '2px solid #CBD5E1',
                  py: 1,
                  px: 1.5,
                  width: 40,
                  textAlign: 'center',
                }}
              >
                #
              </TableCell>
              {checkedColumns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    backgroundColor: '#F1F5F9',
                    fontWeight: 700,
                    color: '#334155',
                    fontSize: '0.75rem',
                    borderBottom: '2px solid #CBD5E1',
                    borderLeft: '1px solid #E2E8F0',
                    py: 1,
                    px: 1.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={`export-skel-${idx}`}>
                  <TableCell align="center">
                    <Skeleton variant="text" width={15} />
                  </TableCell>
                  {checkedColumns.map((col) => (
                    <TableCell key={col.id} sx={{ borderLeft: '1px solid #F1F5F9' }}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : checkedColumns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={checkedColumns.length + 1} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8125rem' }}>
                    {t('export.noColumnsSelected', 'Chưa chọn cột nào để xem trước.')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={checkedColumns.length + 1} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8125rem' }}>
                    {t('export.noPreviewData', 'Không có dữ liệu xem trước.')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIdx) => (
                <TableRow
                  key={row.id != null ? String(row.id) : `preview-row-${rowIdx}`}
                  sx={{
                    '&:nth-of-type(even)': { backgroundColor: '#F8FAFC' },
                    '&:hover': { backgroundColor: '#F1F5F9' },
                  }}
                >
                  <TableCell
                    sx={{
                      fontSize: '0.725rem',
                      color: '#94A3B8',
                      py: 0.75,
                      px: 1.5,
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    {rowIdx + 1}
                  </TableCell>
                  {checkedColumns.map((col) => {
                    let cellVal = '';
                    if (col.getValue) {
                      cellVal = col.getValue(row);
                    } else if (col.accessorKey && row[col.accessorKey] !== undefined) {
                      cellVal = row[col.accessorKey];
                    } else {
                      cellVal = row[col.id] ?? '';
                    }

                    return (
                      <TableCell
                        key={col.id}
                        sx={{
                          fontSize: '0.775rem',
                          color: '#1E293B',
                          py: 0.75,
                          px: 1.5,
                          borderLeft: '1px solid #E2E8F0',
                          whiteSpace: 'nowrap',
                          maxWidth: 200,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}
                      >
                        {String(cellVal ?? '-')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
