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
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const fromIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIndex = Math.min(page * pageSize, totalCount);

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <Box
      sx={{
        py: 1.5,
        px: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        borderTop: '1px solid #F1F5F9',
        bgcolor: '#FFFFFF',
      }}
    >
      {/* Left: Rows per page selector */}
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
          Số hàng mỗi trang:
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
                '& .MuiSelect-select': { py: 0.5, px: 1.5 },
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

      {/* Middle: Item range text */}
      <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem', fontWeight: 500 }}>
        {totalCount > 0 ? (
          <>
            Hiển thị <strong>{fromIndex}</strong> – <strong>{toIndex}</strong> của <strong>{totalCount}</strong> mục
          </>
        ) : (
          'Không có mục nào'
        )}
      </Typography>

      {/* Right: Page Navigation buttons */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        <IconButton
          size="small"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrev}
          sx={{ color: '#64748B', borderRadius: 1.5 }}
          title="Trang đầu"
        >
          <FirstPageIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrev}
          sx={{ color: '#64748B', borderRadius: 1.5 }}
          title="Trang trước"
        >
          <KeyboardArrowLeftIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: '#1E293B' }}>
            {page} / {totalPages}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
          sx={{ color: '#64748B', borderRadius: 1.5 }}
          title="Trang sau"
        >
          <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          sx={{ color: '#64748B', borderRadius: 1.5 }}
          title="Trang cuối"
        >
          <LastPageIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Stack>
    </Box>
  );
}
