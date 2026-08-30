'use client';

import React from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  IconButton,
  Stack,
  FormControl,
} from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import { useTranslation } from 'react-i18next';

interface TablePaginationProps {
  page: number; // 1-indexed
  pageSize: number;
  totalCount: number;
  pageSizeOptions?: number[];
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
}

export default function TablePagination({
  page = 1,
  pageSize = 10,
  totalCount = 0,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const { t } = useTranslation('common');
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const fromIndex = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const toIndex = Math.min(safePage * pageSize, totalCount);

  // Auto-correct page if current page is out of bounds
  React.useEffect(() => {
    if (totalCount > 0 && page > totalPages) {
      onPageChange(totalPages);
    }
  }, [page, totalPages, totalCount, onPageChange]);

  const canGoPrev = safePage > 1;
  const canGoNext = safePage < totalPages;

  return (
    <Box
      sx={{
        py: 1.5,
        px: { xs: 1.5, sm: 2.5 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        borderTop: '1px solid #F1F5F9',
        bgcolor: '#FFFFFF',
      }}
    >
      {/* Left + Middle on mobile: info row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          width: { xs: '100%', sm: 'auto' },
          gap: 1.5,
        }}
      >
        {/* Rows per page selector */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
            {t('pagination.rowsPerPage', 'Số hàng:')}
          </Typography>
          {onPageSizeChange && (
            <FormControl size="small">
              <Select
                value={pageSize}
                onChange={(e) => {
                  onPageSizeChange(Number(e.target.value));
                  onPageChange(1);
                }}
                sx={{
                  height: 32,
                  fontSize: '0.8125rem',
                  borderRadius: 1.5,
                  '& .MuiSelect-select': { py: 0.5, px: 1.25 },
                }}
              >
                {pageSizeOptions.map((size) => (
                  <MenuItem key={size} value={size} sx={{ fontSize: '0.8125rem' }}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>

        {/* Item range text */}
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem', fontWeight: 500 }}>
          {totalCount > 0 ? (
            <>
              <strong>{fromIndex}</strong>–<strong>{toIndex}</strong> / <strong>{totalCount}</strong>
            </>
          ) : (
            t('pagination.zeroItems', '0 mục')
          )}
        </Typography>
      </Box>

      {/* Right: Page Navigation buttons */}
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        justifyContent={{ xs: 'center', sm: 'flex-end' }}
        sx={{ width: { xs: '100%', sm: 'auto' } }}
      >
        <IconButton
          size="medium"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrev}
          sx={{ color: '#64748B', borderRadius: 1.5, minWidth: 36, minHeight: 36 }}
          title={t('pagination.firstPage', 'Trang đầu')}
          aria-label={t('pagination.firstPage', 'Trang đầu')}
        >
          <FirstPageIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton
          size="medium"
          onClick={() => onPageChange(safePage - 1)}
          disabled={!canGoPrev}
          sx={{ color: '#64748B', borderRadius: 1.5, minWidth: 36, minHeight: 36 }}
          title={t('pagination.prevPage', 'Trang trước')}
          aria-label={t('pagination.prevPage', 'Trang trước')}
        >
          <KeyboardArrowLeftIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0', minWidth: 48, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B' }}>
            {safePage} / {totalPages}
          </Typography>
        </Box>

        <IconButton
          size="medium"
          onClick={() => onPageChange(safePage + 1)}
          disabled={!canGoNext}
          sx={{ color: '#64748B', borderRadius: 1.5, minWidth: 36, minHeight: 36 }}
          title={t('pagination.nextPage', 'Trang sau')}
          aria-label={t('pagination.nextPage', 'Trang sau')}
        >
          <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton
          size="medium"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          sx={{ color: '#64748B', borderRadius: 1.5, minWidth: 36, minHeight: 36 }}
          title={t('pagination.lastPage', 'Trang cuối')}
          aria-label={t('pagination.lastPage', 'Trang cuối')}
        >
          <LastPageIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Stack>
    </Box>
  );
}
