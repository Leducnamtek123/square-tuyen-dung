'use client';

import React from 'react';
import { Paper, Stack, Box, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TextFieldCustom from '../Controls/TextFieldCustom';
import SingleSelectCustom from '../Controls/SingleSelectCustom';
import type { useForm } from 'react-hook-form';
import type { SxProps, Theme } from '@mui/material/styles';

const searchControlSx = {
  '& .MuiOutlinedInput-root': {
    height: 42,
    fontSize: '0.875rem',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
  },
} as SxProps<Theme>;

export interface GlobalFilterBarProps {
  control: ReturnType<typeof useForm<any>>['control'];
  handleSubmit: ReturnType<typeof useForm<any>>['handleSubmit'];
  handleSearchSubmit: (data: any) => void;
  // Primary inline filter field (context-aware: cityId, statusId, jobPostId, etc.)
  primaryFieldName?: string;
  primaryFieldOptions?: any[];
  primaryFieldPlaceholder?: string;
  // Legacy alias support
  cityOptions?: any[];
  cityPlaceholder?: string;
  searchPlaceholder?: string;
  searchFieldName?: string;
  onOpenFilterDrawer: () => void;
  activeFilterCount: number;
  extraActions?: React.ReactNode;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  control,
  handleSubmit,
  handleSearchSubmit,
  primaryFieldName = 'cityId',
  primaryFieldOptions,
  primaryFieldPlaceholder,
  cityOptions = [],
  cityPlaceholder = 'Chọn tỉnh thành',
  searchPlaceholder = 'Nhập từ khóa...',
  searchFieldName = 'kw',
  onOpenFilterDrawer,
  activeFilterCount,
  extraActions,
}) => {
  const options = primaryFieldOptions || cityOptions;
  const placeholder = primaryFieldPlaceholder || cityPlaceholder;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        borderRadius: '10px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        width: '100%',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        component="form"
        onSubmit={handleSubmit(handleSearchSubmit)}
        alignItems="center"
        flexWrap="wrap"
        sx={{ width: '100%' }}
      >
        {/* Keyword Input */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: 1 }, minWidth: { xs: '100%', sm: 180 }, width: { xs: '100%', sm: 'auto' } }}>
          <TextFieldCustom
            name={searchFieldName}
            placeholder={searchPlaceholder}
            control={control}
            icon={<SearchIcon sx={{ color: 'primary.main', fontSize: 20 }} />}
            sx={searchControlSx}
          />
        </Box>

        {/* Context-aware Primary Select (City / Status / Job Post) */}
        {options && options.length > 0 && (
          <Box sx={{ width: { xs: '100%', sm: 180, md: 220 }, flexShrink: 0 }}>
            <SingleSelectCustom
              name={primaryFieldName}
              control={control}
              options={options}
              placeholder={placeholder}
              sx={searchControlSx}
            />
          </Box>
        )}

        {/* Advanced Filter Drawer Trigger Button */}
        <Box sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}>
          <Button
            variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
            color={activeFilterCount > 0 ? 'primary' : 'inherit'}
            startIcon={<FilterAltIcon sx={{ fontSize: 18 }} />}
            onClick={onOpenFilterDrawer}
            fullWidth
            sx={{
              height: 42,
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'none',
              px: 2,
              borderColor: activeFilterCount > 0 ? 'primary.main' : '#CBD5E1',
              bgcolor: activeFilterCount > 0 ? undefined : '#F8FAFC',
              color: activeFilterCount > 0 ? '#FFFFFF' : '#334155',
              '&:hover': {
                bgcolor: activeFilterCount > 0 ? undefined : '#F1F5F9',
                borderColor: activeFilterCount > 0 ? undefined : '#94A3B8',
              },
            }}
          >
            Bộ lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Button>
        </Box>

        {/* Primary Search Button */}
        <Box sx={{ width: { xs: '100%', sm: 'auto', md: 130 }, flexShrink: 0 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            type="submit"
            fullWidth
            sx={{
              height: 42,
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'none',
              px: 2.5,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
              },
            }}
          >
            Tìm kiếm
          </Button>
        </Box>

        {/* Extra Actions Slot (e.g. View switches, Create button, Export) */}
        {extraActions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { sm: 'auto' }, width: { xs: '100%', sm: 'auto' } }}>
            {extraActions}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default GlobalFilterBar;

