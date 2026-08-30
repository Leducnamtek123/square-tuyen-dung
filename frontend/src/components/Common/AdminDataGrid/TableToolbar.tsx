'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Typography,
  Chip,
  Paper,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from 'react-i18next';
import type { FilterDef, BulkAction } from './types';

interface TableToolbarProps<T> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  onFilterChange?: (filterId: string, value: any) => void;
  onResetFilters?: () => void;
  selectedRows?: T[];
  onClearSelection?: () => void;
  bulkActions?: BulkAction<T>[];
  onExport?: (format: 'csv' | 'excel') => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function TableToolbar<T>({
  title,
  subtitle,
  headerAction,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder,
  filters = [],
  onFilterChange,
  onResetFilters,
  selectedRows = [],
  onClearSelection,
  bulkActions = [],
  onExport,
  onRefresh,
  loading = false,
}: TableToolbarProps<T>) {
  const { t } = useTranslation('common');
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const effectiveSearchPlaceholder = searchPlaceholder || t('common.searchPlaceholder', 'Tìm kiếm...');

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!onSearchChange) return;
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchQuery]);

  const handleClearSearch = () => {
    setLocalSearch('');
    if (onSearchChange) onSearchChange('');
  };

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExportSelect = (format: 'csv' | 'excel') => {
    handleExportClose();
    if (onExport) onExport(format);
  };

  const selectedCount = selectedRows.length;
  const hasActiveFilters = filters.some(
    (f) => f.value !== '' && f.value !== null && f.value !== undefined && f.value !== 'all'
  );

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Top row: Title and Header Action */}
      {(title || headerAction) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" sx={{ color: '#64748B', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {headerAction && <Box>{headerAction}</Box>}
        </Box>
      )}

      {/* Bulk Action Bar when items selected */}
      {selectedCount > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            px: 2,
            bgcolor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            transition: 'all 200ms ease-in-out',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircleOutlineIcon sx={{ color: '#2563EB', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1E40AF' }}>
              {t('common.selectedCount', 'Đã chọn {{count}} mục', { count: selectedCount })}
            </Typography>
            {onClearSelection && (
              <Button
                size="small"
                onClick={onClearSelection}
                sx={{
                  color: '#64748B',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  p: 0.5,
                  '&:hover': { color: '#0F172A', bgcolor: 'transparent' },
                }}
              >
                {t('common.actions.clear', 'Bỏ chọn')}
              </Button>
            )}
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {bulkActions.map((action) => (
              <Button
                key={action.id}
                size="small"
                variant={action.variant || 'outlined'}
                color={action.color || 'primary'}
                startIcon={action.icon}
                onClick={() => action.onClick(selectedRows)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  borderRadius: 1.5,
                }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Controls row: Search, Filters, Refresh, Export */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        {/* Left side: Search & Filter dropdowns */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ flexGrow: 1 }}>
          {onSearchChange && (
            <TextField
              size="small"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={effectiveSearchPlaceholder}
              sx={{
                width: { xs: '100%', sm: 260, md: 320 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  fontSize: '0.875rem',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: localSearch ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch} edge="end">
                      <ClearIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          )}

          {filters.map((filter) => (
            <FormControl
              key={filter.id}
              size="small"
              sx={{ minWidth: 140, bgcolor: '#FFFFFF', borderRadius: 2 }}
            >
              <InputLabel id={`filter-label-${filter.id}`} sx={{ fontSize: '0.875rem' }}>
                {filter.label}
              </InputLabel>
              <Select
                labelId={`filter-label-${filter.id}`}
                id={`filter-select-${filter.id}`}
                value={filter.value ?? ''}
                label={filter.label}
                onChange={(e) => onFilterChange && onFilterChange(filter.id, e.target.value)}
                sx={{ borderRadius: 2, fontSize: '0.875rem' }}
              >
                <MenuItem value="all">
                  <em>{t('common.all', 'Tất cả')} {filter.label.toLowerCase()}</em>
                </MenuItem>
                {filter.options?.map((option) => (
                  <MenuItem key={String(option.value)} value={option.value as string}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}

          {hasActiveFilters && onResetFilters && (
            <Tooltip title={t('common.actions.resetFilter', 'Đặt lại bộ lọc')}>
              <Button
                size="small"
                variant="text"
                color="inherit"
                startIcon={<RestartAltIcon sx={{ fontSize: 18 }} />}
                onClick={onResetFilters}
                sx={{
                  color: '#64748B',
                  textTransform: 'none',
                  fontSize: '0.8125rem',
                  borderRadius: 2,
                }}
              >
                {t('common.actions.reset', 'Đặt lại')}
              </Button>
            </Tooltip>
          )}
        </Stack>

        {/* Right side: Refresh & Export */}
        <Stack direction="row" spacing={1} alignItems="center">
          {onRefresh && (
            <Tooltip title={t('common.actions.refreshData', 'Làm mới dữ liệu')}>
              <span>
                <IconButton
                  size="small"
                  onClick={onRefresh}
                  disabled={loading}
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 2,
                    p: 1,
                    '&:hover': { bgcolor: '#F8FAFC' },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={18} thickness={5} />
                  ) : (
                    <RefreshIcon sx={{ fontSize: 18, color: '#475569' }} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}

          {onExport && (
            <>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={handleExportClick}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  borderRadius: 2,
                  borderColor: '#E2E8F0',
                  color: '#334155',
                  bgcolor: '#FFFFFF',
                  '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
                }}
              >
                {t('common.actions.export', 'Xuất file')}
              </Button>
              <Menu
                anchorEl={exportAnchorEl}
                open={Boolean(exportAnchorEl)}
                onClose={handleExportClose}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    minWidth: 150,
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <MenuItem onClick={() => handleExportSelect('excel')} sx={{ fontSize: '0.875rem' }}>
                  {t('common.export.excel', 'Xuất Microsoft Excel (.xlsx)')}
                </MenuItem>
                <MenuItem onClick={() => handleExportSelect('csv')} sx={{ fontSize: '0.875rem' }}>
                  {t('common.export.csv', 'Xuất CSV (.csv)')}
                </MenuItem>
              </Menu>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
