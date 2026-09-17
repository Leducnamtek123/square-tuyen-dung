import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import type { ImportPreviewResponse, ExchangeDefinition } from '@/types/exchange';

interface ImportPreviewStepProps {
  previewData: ImportPreviewResponse;
  definition: ExchangeDefinition | null;
  filter: 'all' | 'valid' | 'invalid';
  onFilterChange: (filter: 'all' | 'valid' | 'invalid') => void;
  onDownloadErrorReport: () => void;
}

export const ImportPreviewStep: React.FC<ImportPreviewStepProps> = ({
  previewData,
  definition,
  filter,
  onFilterChange,
  onDownloadErrorReport,
}) => {
  const { totalRows, validRows, invalidRows, warningRows, preview = [] } = previewData;

  const filteredRows = preview.filter((row) => {
    const hasErr = row.errors && row.errors.some((e) => e.severity === 'error');
    if (filter === 'valid') return !hasErr;
    if (filter === 'invalid') return hasErr;
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return (
          <Chip
            label="Thêm mới"
            size="small"
            sx={{
              backgroundColor: '#ECFDF5',
              color: '#059669',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
      case 'update':
        return (
          <Chip
            label="Cập nhật"
            size="small"
            sx={{
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
      default:
        return (
          <Chip
            label="Bỏ qua"
            size="small"
            sx={{
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
    }
  };

  // Derive preview table column keys from preview rows
  const dataKeys = Array.from(
    new Set(
      preview.flatMap((r) => Object.keys(r.data || {})).filter((k) => !k.startsWith('_'))
    )
  ).slice(0, 6);

  return (
    <Stack spacing={2.5}>
      {/* Stat Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2,
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: '#E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LayersOutlinedIcon sx={{ color: '#475569', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                Tổng số dòng
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
                {totalRows}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2,
            borderRadius: '12px',
            border: '1px solid #BBF7D0',
            backgroundColor: '#F0FDF4',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircleOutlineIcon sx={{ color: '#16A34A', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                Hợp lệ sẵn sàng lưu
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#16A34A', lineHeight: 1.2 }}>
                {validRows}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2,
            borderRadius: '12px',
            border: `1px solid ${invalidRows > 0 ? '#FECACA' : '#E2E8F0'}`,
            backgroundColor: invalidRows > 0 ? '#FEF2F2' : '#F8FAFC',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: invalidRows > 0 ? '#FEE2E2' : '#E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HighlightOffIcon sx={{ color: invalidRows > 0 ? '#DC2626' : '#94A3B8', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{ color: invalidRows > 0 ? '#991B1B' : '#64748B', fontWeight: 600 }}
              >
                Dòng có lỗi
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: invalidRows > 0 ? '#DC2626' : '#64748B',
                  lineHeight: 1.2,
                }}
              >
                {invalidRows}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>

      {/* Error alert & Download Error Report CTA */}
      {invalidRows > 0 && (
        <Alert
          severity={definition?.atomicImport ? 'error' : 'warning'}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={onDownloadErrorReport}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              Tải file báo cáo lỗi (.xlsx)
            </Button>
          }
          sx={{ borderRadius: '10px' }}
        >
          {definition?.atomicImport ? (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Yêu cầu nhập toàn vẹn: Phát hiện {invalidRows} dòng lỗi. Bạn phải tải file báo cáo lỗi để chỉnh sửa và tải lại, hệ thống không cho phép nhập dữ liệu lỗi một phần.
            </Typography>
          ) : (
            <Typography variant="body2">
              Phát hiện {invalidRows} dòng dữ liệu không hợp lệ. Nếu tiếp tục, hệ thống sẽ chỉ lưu {validRows} dòng hợp lệ.
            </Typography>
          )}
        </Alert>
      )}

      {/* Filter Tabs & Preview Controls */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ borderBottom: '1px solid #E2E8F0' }}>
        <Tabs
          value={filter}
          onChange={(_, val) => onFilterChange(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ minHeight: 40 }}
        >
          <Tab
            label={`Tất cả (${preview.length})`}
            value="all"
            sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 1 }}
          />
          <Tab
            label={`Hợp lệ (${validRows})`}
            value="valid"
            sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 1 }}
          />
          {invalidRows > 0 && (
            <Tab
              label={`Có lỗi (${invalidRows})`}
              value="invalid"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 40,
                py: 1,
                color: '#DC2626',
                '&.Mui-selected': { color: '#DC2626' },
              }}
            />
          )}
        </Tabs>
        <Typography variant="caption" sx={{ color: '#64748B', display: { xs: 'none', sm: 'block' } }}>
          Hiển thị tối đa 50 dòng mẫu
        </Typography>
      </Stack>

      {/* Preview Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          maxHeight: 320,
          overflowY: 'auto',
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { backgroundColor: '#F8FAFC', fontWeight: 700, color: '#334155' } }}>
              <TableCell sx={{ width: 70 }}>Dòng</TableCell>
              <TableCell sx={{ width: 110 }}>Thao tác</TableCell>
              <TableCell sx={{ width: 180 }}>Trạng thái</TableCell>
              {dataKeys.map((k) => (
                <TableCell key={k}>{k}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3 + dataKeys.length} align="center" sx={{ py: 4, color: '#64748B' }}>
                  Không có dòng dữ liệu nào phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => {
                const errors = row.errors?.filter((e) => e.severity === 'error') || [];
                const warnings = row.errors?.filter((e) => e.severity === 'warning') || [];
                const hasError = errors.length > 0;

                return (
                  <TableRow
                    key={row.rowNumber}
                    sx={{
                      backgroundColor: hasError ? 'rgba(254, 242, 242, 0.4)' : 'inherit',
                      '&:hover': { backgroundColor: '#F1F5F9' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#64748B' }}>
                      #{row.rowNumber}
                    </TableCell>
                    <TableCell>{getActionBadge(row.action)}</TableCell>
                    <TableCell>
                      {hasError ? (
                        <Tooltip
                          title={errors.map((e) => `[${e.field}] ${e.message}`).join('; ')}
                          arrow
                        >
                          <Chip
                            icon={<HighlightOffIcon sx={{ fontSize: '14px !important', color: '#DC2626 !important' }} />}
                            label={`${errors.length} lỗi: ${errors[0].message}`}
                            size="small"
                            sx={{
                              backgroundColor: '#FEE2E2',
                              color: '#991B1B',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              maxWidth: 200,
                            }}
                          />
                        </Tooltip>
                      ) : warnings.length > 0 ? (
                        <Tooltip
                          title={warnings.map((w) => `[${w.field}] ${w.message}`).join('; ')}
                          arrow
                        >
                          <Chip
                            icon={<WarningAmberOutlinedIcon sx={{ fontSize: '14px !important', color: '#D97706 !important' }} />}
                            label={`${warnings.length} cảnh báo`}
                            size="small"
                            sx={{
                              backgroundColor: '#FEF3C7',
                              color: '#92400E',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Chip
                          icon={<CheckCircleOutlineIcon sx={{ fontSize: '14px !important', color: '#16A34A !important' }} />}
                          label="Hợp lệ"
                          size="small"
                          sx={{
                            backgroundColor: '#DCFCE7',
                            color: '#166534',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </TableCell>
                    {dataKeys.map((k) => (
                      <TableCell key={k} sx={{ color: '#1E293B', fontSize: '0.8125rem' }}>
                        {String(row.data?.[k] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
export default ImportPreviewStep;
