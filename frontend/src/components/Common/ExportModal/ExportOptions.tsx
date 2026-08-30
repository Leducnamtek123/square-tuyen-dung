import React from 'react';
import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Button,
  Stack,
  Chip,
  Paper,
  InputAdornment,
} from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import { useTranslation } from 'react-i18next';
import type { ExportColumn, ExportFormat, ExportScope, ScopeCount } from './types';

interface ExportOptionsProps {
  fileName: string;
  onFileNameChange: (val: string) => void;
  format: ExportFormat;
  onFormatChange: (fmt: ExportFormat) => void;
  scope: ExportScope;
  onScopeChange: (scope: ExportScope) => void;
  columns: ExportColumn[];
  onToggleColumn: (colId: string) => void;
  onSelectAllColumns: () => void;
  onClearAllColumns: () => void;
  totalRecords?: ScopeCount;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({
  fileName,
  onFileNameChange,
  format,
  onFormatChange,
  scope,
  onScopeChange,
  columns,
  onToggleColumn,
  onSelectAllColumns,
  onClearAllColumns,
  totalRecords,
}) => {
  const { t } = useTranslation('common');
  const selectedCount = columns.filter((c) => c.checked).length;

  return (
    <Stack spacing={3} sx={{ height: '100%' }}>
      {/* File Name Section */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: 'text.primary', mb: 1, fontSize: '0.875rem' }}
        >
          {t('export.fileName', 'Tên file xuất')}
        </Typography>
        <TextField
          fullWidth
          size="small"
          value={fileName}
          onChange={(e) => onFileNameChange(e.target.value)}
          placeholder={t('export.fileNamePlaceholder', 'Nhập tên file...')}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <InsertDriveFileOutlinedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Chip
                    label={format === 'xlsx' ? '.xlsx' : '.csv'}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'action.hover',
                      color: 'text.secondary',
                      borderRadius: '6px',
                    }}
                  />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: '#9CA3AF',
              },
              '&.Mui-focused': {
                borderColor: '#2563EB',
              },
            },
          }}
        />
      </Box>

      {/* Format Selection */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: 'text.primary', mb: 1, fontSize: '0.875rem' }}
        >
          {t('export.format', 'Định dạng file')}
        </Typography>
        <Stack direction="row" spacing={1.5}>
          {[
            { id: 'xlsx', label: t('export.excel', 'Excel (.xlsx)'), desc: t('export.excelDesc', 'Phổ biến & giữ nguyên định dạng') },
            { id: 'csv', label: t('export.csv', 'CSV (.csv)'), desc: t('export.csvDesc', 'Gọn nhẹ, dùng cho dữ liệu lớn') },
          ].map((fmt) => {
            const isSelected = format === fmt.id;
            return (
              <Paper
                key={fmt.id}
                onClick={() => onFormatChange(fmt.id as ExportFormat)}
                elevation={0}
                sx={{
                  flex: 1,
                  p: 1.5,
                  borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: isSelected ? '#2563EB' : '#E5E7EB',
                  backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.04)' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 150ms ease-in-out',
                  '&:hover': {
                    borderColor: isSelected ? '#2563EB' : '#9CA3AF',
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.06)' : '#F9FAFB',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Radio
                    checked={isSelected}
                    size="small"
                    sx={{ p: 0, color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', fontSize: '0.8125rem' }}>
                      {fmt.label}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Box>

      {/* Data Scope Section */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: 'text.primary', mb: 1, fontSize: '0.875rem' }}
        >
          {t('export.dataScope', 'Phạm vi dữ liệu')}
        </Typography>
        <RadioGroup value={scope} onChange={(e) => onScopeChange(e.target.value as ExportScope)}>
          <Stack spacing={0.75}>
            <Paper
              elevation={0}
              onClick={() => onScopeChange('all')}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: scope === 'all' ? '#2563EB' : '#E5E7EB',
                backgroundColor: scope === 'all' ? 'rgba(37, 99, 235, 0.03)' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <FormControlLabel
                value="all"
                control={<Radio size="small" sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }} />}
                label={
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', pr: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      {t('export.allData', 'Toàn bộ dữ liệu')}
                    </Typography>
                    {totalRecords?.all !== undefined && (
                      <Chip label={`${totalRecords.all} ${t('export.rows', 'dòng')}`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                  </Stack>
                }
                sx={{ width: '100%', margin: 0 }}
              />
            </Paper>

            <Paper
              elevation={0}
              onClick={() => onScopeChange('filtered')}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: scope === 'filtered' ? '#2563EB' : '#E5E7EB',
                backgroundColor: scope === 'filtered' ? 'rgba(37, 99, 235, 0.03)' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <FormControlLabel
                value="filtered"
                control={<Radio size="small" sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }} />}
                label={
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', pr: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563EB' }}>
                      {t('export.filteredData', 'Theo bộ lọc hiện tại')}
                    </Typography>
                    {totalRecords?.filtered !== undefined && (
                      <Chip label={`${totalRecords.filtered} ${t('export.rows', 'dòng')}`} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                  </Stack>
                }
                sx={{ width: '100%', margin: 0 }}
              />
            </Paper>

            <Paper
              elevation={0}
              onClick={() => totalRecords?.selected && totalRecords.selected > 0 && onScopeChange('selected')}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: scope === 'selected' ? '#2563EB' : '#E5E7EB',
                backgroundColor: scope === 'selected' ? 'rgba(37, 99, 235, 0.03)' : '#FFFFFF',
                opacity: totalRecords?.selected ? 1 : 0.6,
                cursor: totalRecords?.selected ? 'pointer' : 'not-allowed',
              }}
            >
              <FormControlLabel
                value="selected"
                disabled={!totalRecords?.selected}
                control={<Radio size="small" sx={{ color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }} />}
                label={
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', pr: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      {t('export.selectedData', 'Các dòng đã chọn')}
                    </Typography>
                    <Chip
                      label={totalRecords?.selected ? `${totalRecords.selected} ${t('export.rows', 'dòng')}` : `0 ${t('export.rows', 'dòng')}`}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Stack>
                }
                sx={{ width: '100%', margin: 0 }}
              />
            </Paper>
          </Stack>
        </RadioGroup>
      </Box>

      {/* Columns Checkbox Selection */}
      <Box flex={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}>
            {t('export.exportColumns', 'Các cột xuất')} ({selectedCount}/{columns.length})
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<SelectAllIcon sx={{ fontSize: 14 }} />}
              onClick={onSelectAllColumns}
              sx={{ fontSize: '0.75rem', py: 0.25, px: 1, textTransform: 'none', borderRadius: '6px' }}
            >
              {t('export.selectAll', 'Chọn tất cả')}
            </Button>
            <Button
              size="small"
              color="inherit"
              startIcon={<DeselectIcon sx={{ fontSize: 14 }} />}
              onClick={onClearAllColumns}
              sx={{ fontSize: '0.75rem', py: 0.25, px: 1, textTransform: 'none', borderRadius: '6px', color: 'text.secondary' }}
            >
              {t('export.deselectAll', 'Bỏ chọn tất cả')}
            </Button>
          </Stack>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: 1,
            maxHeight: 180,
            overflowY: 'auto',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            backgroundColor: '#FAFAFA',
          }}
        >
          <Stack spacing={0.5}>
            {columns.map((col) => (
              <Stack
                key={col.id}
                direction="row"
                alignItems="center"
                onClick={() => onToggleColumn(col.id)}
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 100ms ease',
                  '&:hover': {
                    backgroundColor: '#F3F4F6',
                  },
                }}
              >
                <Checkbox
                  checked={col.checked}
                  size="small"
                  sx={{ p: 0.5, color: '#9CA3AF', '&.Mui-checked': { color: '#2563EB' } }}
                />
                <Typography variant="body2" sx={{ ml: 1, fontSize: '0.8125rem', color: '#374151' }}>
                  {col.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
};
